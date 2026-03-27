import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import { sendEmail } from "../utils/email.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, lang: user.language },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

const safeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  phone: user.phone,
  email: user.email || null,
  language: user.language,
  role: user.role,
  isVerified: user.isVerified,
  biometricEnabled: user.biometricEnabled,
});

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { fullName, phone, password, language, role, email } = req.body;

  const existing = await User.findOne({ phone });
  if (existing)
    throw new ConflictError("An account with this phone number already exists");

  const user = await User.create({
    fullName,
    phone,
    email,
    passwordHash: password, // pre-save hook will hash it
    language,
    role,
  });

  // Auto-create a minimal Volunteer document so the profile always exists
  if (role === "volunteer") {
    await Volunteer.create({
      user: user._id,
      languages: [language || "english"],
      availability: [],
      location: { type: "Point", coordinates: [0, 0], address: "" },
    });
  }

  logger.info({ userId: user._id, role, event: "user_registered" });

  res.status(201).json({
    data: { token: signToken(user), user: safeUser(user) },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  // Explicitly select passwordHash since it's select: false in schema
  const user = await User.findOne({ phone, isActive: true }).select(
    "+passwordHash",
  );
  if (!user) throw new UnauthorizedError("Invalid phone number or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError("Invalid phone number or password");

  logger.info({ userId: user._id, event: "user_login" });

  res.json({ data: { token: signToken(user), user: safeUser(user) } });
});

/**
 * POST /api/auth/biometric/register
 */
export const registerBiometric = asyncHandler(async (req, res) => {
  const { biometricToken } = req.body;
  if (!biometricToken) throw new BadRequestError("Biometric token is required");

  const tokenHash = await bcrypt.hash(biometricToken, 10);
  await User.findByIdAndUpdate(req.user.id, {
    biometricTokenHash: tokenHash,
    biometricEnabled: true,
  });

  res.json({ data: { message: "Biometric registered successfully" } });
});

/**
 * POST /api/auth/biometric/login
 */
export const biometricLogin = asyncHandler(async (req, res) => {
  const { userId, biometricToken } = req.body;

  const user = await User.findById(userId).select("+biometricTokenHash");
  if (!user || !user.biometricEnabled) {
    throw new UnauthorizedError(
      "Biometric login not available for this account",
    );
  }

  const isMatch = await user.compareBiometric(biometricToken);
  if (!isMatch) throw new UnauthorizedError("Biometric verification failed");

  res.json({ data: { token: signToken(user), user: safeUser(user) } });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new NotFoundError("User", req.user.id);
  res.json({ data: safeUser(user) });
});

/**
 * POST /api/auth/forgot-password
 * Generates a 6-digit OTP, hashes + stores it, returns it in dev mode.
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone, isActive: true });
  if (!user) throw new NotFoundError("Account", phone);

  // Generate a 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetOtpHash = otpHash;
  user.resetOtpExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  logger.info({ userId: user._id, event: "password_reset_requested" });

  const response = { message: "OTP sent successfully" };

  if (user.email) {
    const emailSent = await sendEmail(
      user.email,
      "VisionConnect – Password Reset OTP",
      `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb">
        <h2 style="color:#2563eb;margin-bottom:8px">Password Reset</h2>
        <p style="color:#374151">Hi <strong>${user.fullName}</strong>,</p>
        <p style="color:#374151">Use the OTP below to reset your VisionConnect password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:24px;background:#eff6ff;border-radius:8px;color:#1d4ed8;margin:24px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:13px">If you did not request this, please ignore this email.</p>
      </div>
      `
    );
    if (!emailSent && process.env.NODE_ENV !== "production") {
      response.devOtp = otp;
    }
    response.hint = `OTP sent to ${user.email.replace(/(.{2}).+(@.+)/, "$1***$2")}`;
  } else {
    // No email registered — fall back to dev OTP
    if (process.env.NODE_ENV !== "production") {
      response.devOtp = otp;
      response.hint = "No email on account — OTP shown in dev mode only";
    } else {
      throw new BadRequestError("No email address registered. Please contact support.");
    }
  }

  res.json({ data: response });
});

/**
 * POST /api/auth/reset-password
 * Validates OTP and sets a new password.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { phone, otp, newPassword } = req.body;

  const user = await User.findOne({ phone, isActive: true }).select(
    "+resetOtpHash +resetOtpExpiry",
  );
  if (!user || !user.resetOtpHash) {
    throw new BadRequestError("No password reset was requested for this account");
  }

  if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
    throw new BadRequestError("OTP has expired. Please request a new one");
  }

  const isOtpValid = await bcrypt.compare(otp, user.resetOtpHash);
  if (!isOtpValid) throw new BadRequestError("Invalid OTP");

  // Set new password (pre-save hook will hash it)
  user.passwordHash = newPassword;
  user.resetOtpHash = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  logger.info({ userId: user._id, event: "password_reset_success" });

  res.json({ data: { message: "Password reset successfully" } });
});

import asyncHandler from "../utils/asyncHandler.js";
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, lang: user.language },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

/**
 * POST /api/admin/register
 * One-time endpoint to create an admin account.
 * Requires ADMIN_SECRET in request body matching .env value.
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, phone, password, adminSecret } = req.body;

  // Guard: must provide the correct admin secret
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    throw new UnauthorizedError("Invalid admin secret.");
  }

  // Guard: only one admin allowed
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    throw new ConflictError("An admin account already exists.");
  }

  const user = await User.create({
    fullName,
    phone,
    passwordHash: password, // pre-save hook hashes it
    role: "admin",
    language: "english",
  });

  const token = signToken(user);
  res.status(201).json({ data: { token, user: user.toJSON() } });
});

/**
 * POST /api/admin/login
 * Admin login with phone + password.
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone, role: "admin" }).select(
    "+passwordHash",
  );
  if (!user) throw new UnauthorizedError("Invalid credentials.");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new UnauthorizedError("Invalid credentials.");

  const token = signToken(user);
  res.json({ data: { token, user: user.toJSON() } });
});

/**
 * GET /api/admin/volunteers
 * List all volunteers with optional filter: ?verified=false
 */
export const listVolunteers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.verified === "false") filter.isVerified = false;
  if (req.query.verified === "true") filter.isVerified = true;

  const volunteers = await Volunteer.find(filter)
    .populate("user", "fullName phone language createdAt")
    .sort({ createdAt: -1 });

  res.json({ data: volunteers, count: volunteers.length });
});

/**
 * PATCH /api/admin/volunteers/:id/verify
 * Verify or unverify a volunteer.
 * Body: { isVerified: true | false }
 */
export const verifyVolunteer = asyncHandler(async (req, res) => {
  const { isVerified } = req.body;

  if (typeof isVerified !== "boolean") {
    throw new UnauthorizedError("isVerified must be a boolean.");
  }

  const volunteer = await Volunteer.findByIdAndUpdate(
    req.params.id,
    { isVerified },
    { new: true },
  ).populate("user", "fullName phone");

  if (!volunteer) throw new NotFoundError("Volunteer", req.params.id);

  res.json({ data: volunteer });
});

/**
 * GET /api/admin/users
 * List all users (role: user).
 */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
  res.json({ data: users, count: users.length });
});

/**
 * PATCH /api/admin/users/:id/toggle
 * Activate or deactivate a user account.
 */
export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User", req.params.id);

  user.isActive = !user.isActive;
  await user.save();

  res.json({ data: { id: user._id, isActive: user.isActive } });
});

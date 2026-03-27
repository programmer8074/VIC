import { body, validationResult } from "express-validator";
import { ValidationError } from "../utils/errors.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fields = {};
    errors.array().forEach(({ path, msg }) => {
      fields[path] = msg;
    });
    throw new ValidationError(fields);
  }
  next();
};

const phoneValidator = body("phone")
  .trim()
  .matches(/^[6-9]\d{9}$/)
  .withMessage("Must be a valid 10-digit Indian mobile number");

const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Must contain at least one uppercase letter")
  .matches(/[0-9]/)
  .withMessage("Must contain at least one number");

const nameValidator = (field = "name") =>
  body(field)
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Must be 2–60 characters");

export const registerUserRules = [
  nameValidator("fullName"),
  phoneValidator,
  passwordValidator,
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("language")
    .isIn(["english", "hindi", "tamil", "telugu", "bengali"])
    .withMessage("Unsupported language"),
  body("role")
    .isIn(["user", "volunteer"])
    .withMessage("Role must be user or volunteer"),
];

export const loginRules = [
  phoneValidator,
  body("password").notEmpty().withMessage("Password is required"),
];

export const biometricLoginRules = [
  body("biometricToken").notEmpty().withMessage("Biometric token is required"),
  body("userId").notEmpty().withMessage("User ID is required"),
];

export const volunteerProfileRules = [
  body("availability")
    .isArray({ min: 1 })
    .withMessage("At least one availability slot required"),
  body("languages")
    .isArray({ min: 1 })
    .withMessage("At least one language required"),
  body("location.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("location.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

export const createRequestRules = [
  body("origin.address")
    .trim()
    .notEmpty()
    .withMessage("Origin address is required"),
  body("destination.address")
    .trim()
    .notEmpty()
    .withMessage("Destination address is required"),
  body("origin.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid origin latitude"),
  body("origin.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid origin longitude"),
  body("destination.lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid destination latitude"),
  body("destination.lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid destination longitude"),
  body("scheduledAt")
    .optional()
    .isISO8601()
    .withMessage("Must be a valid ISO date"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be under 500 characters"),
];

export const requestPasswordResetRules = [
  phoneValidator,
];

export const resetPasswordRules = [
  phoneValidator,
  body("otp")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be a 6-digit number"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain at least one number"),
];

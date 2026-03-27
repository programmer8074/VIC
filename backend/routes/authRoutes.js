import { Router } from "express";
import {
  register,
  login,
  registerBiometric,
  biometricLogin,
  getMe,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validate,
  registerUserRules,
  loginRules,
  biometricLoginRules,
  requestPasswordResetRules,
  resetPasswordRules,
} from "../middleware/validate.js";

const router = Router();

router.post("/register", registerUserRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/biometric/login", biometricLoginRules, validate, biometricLogin);
router.get("/me", protect, getMe);
router.post("/biometric/register", protect, registerBiometric);
router.post("/forgot-password", requestPasswordResetRules, validate, requestPasswordReset);
router.post("/reset-password", resetPasswordRules, validate, resetPassword);

export default router;

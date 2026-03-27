import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  listVolunteers,
  verifyVolunteer,
  listUsers,
  toggleUserActive,
} from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();

// ── Public (one-time setup) ───────────────────────────────────────────
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// ── Protected: admin only ─────────────────────────────────────────────
router.use(protect, restrictTo("admin"));

router.get("/volunteers", listVolunteers);
router.patch("/volunteers/:id/verify", verifyVolunteer);
router.get("/users", listUsers);
router.patch("/users/:id/toggle", toggleUserActive);

export default router;

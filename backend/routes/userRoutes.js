import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getTripHistory,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/:id/history", getTripHistory);

export default router;

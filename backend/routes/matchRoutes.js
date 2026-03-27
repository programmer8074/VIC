import { Router } from "express";
import { findMatches, acceptMatch } from "../controllers/matchController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.post("/find", findMatches);
router.post("/accept", restrictTo("volunteer"), acceptMatch);

export default router;

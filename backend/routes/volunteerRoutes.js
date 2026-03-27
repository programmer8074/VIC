import { Router } from "express";
import {
  listVolunteers,
  getVolunteer,
  upsertProfile,
  setAvailability,
  rateVolunteer,
} from "../controllers/volunteerController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate, volunteerProfileRules } from "../middleware/validate.js";

const router = Router();

router.get("/", listVolunteers);
router.get("/:id", getVolunteer);
router.put(
  "/profile",
  protect,
  restrictTo("volunteer"),
  volunteerProfileRules,
  validate,
  upsertProfile,
);
router.patch(
  "/availability",
  protect,
  restrictTo("volunteer"),
  setAvailability,
);
router.post("/:id/rate", protect, restrictTo("user"), rateVolunteer);

export default router;

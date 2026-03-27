import { Router } from "express";
import {
  createRequest,
  listRequests,
  getRequest,
  updateStatus,
  deleteRequest,
} from "../controllers/requestController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate, createRequestRules } from "../middleware/validate.js";

const router = Router();
router.use(protect);

router.post(
  "/",
  restrictTo("user"),
  createRequestRules,
  validate,
  createRequest,
);
router.get("/", listRequests);
router.get("/:id", getRequest);
router.patch("/:id/status", updateStatus);
router.delete("/:id", restrictTo("user"), deleteRequest);

export default router;

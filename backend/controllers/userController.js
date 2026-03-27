import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import User from "../models/User.js";
import AssistanceRequest from "../models/AssistanceRequest.js";

/**
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new NotFoundError("User", req.user.id);
  res.json({ data: user });
});

/**
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["language", "accessibilitySettings", "emergencyContact"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new NotFoundError("User", req.user.id);
  res.json({ data: user });
});

/**
 * GET /api/users/:id/history
 */
export const getTripHistory = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id)
    throw new ForbiddenError("view another user's history");

  const history = await AssistanceRequest.find({
    user: req.params.id,
    status: "completed",
  })
    .populate({
      path: "volunteer",
      populate: { path: "user", select: "fullName phone" },
    })
    .sort({ completedAt: -1 });

  res.json({ data: history, count: history.length });
});

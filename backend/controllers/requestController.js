import asyncHandler from "../utils/asyncHandler.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import AssistanceRequest from "../models/AssistanceRequest.js";
import Volunteer from "../models/Volunteer.js";
import {
  emitNewRequest,
  emitRequestStarted,
  emitRequestCompleted,
} from "../socket.js";

const VALID_STATUSES = [
  "pending",
  "matched",
  "in_progress",
  "completed",
  "cancelled",
];

/**
 * POST /api/requests
 */
export const createRequest = asyncHandler(async (req, res) => {
  const { origin, destination, scheduledAt, notes } = req.body;

  const request = await AssistanceRequest.create({
    user: req.user.id,
    origin,
    destination,
    scheduledAt: scheduledAt || null,
    notes: notes || "",
    statusHistory: [{ status: "pending", changedBy: req.user.id }],
  });

  // 🔔 Notify all volunteers of the new request
  try {
    emitNewRequest(request);
  } catch (_) {}

  logger.info({
    userId: req.user.id,
    requestId: request._id,
    event: "request_created",
  });
  res.status(201).json({ data: request });
});

/**
 * GET /api/requests
 */
export const listRequests = asyncHandler(async (req, res) => {
  const { id: userId, role } = req.user;
  const { status } = req.query;

  const filter = {};
  if (role === "user") filter.user = userId;
  if (role === "volunteer") {
    const volunteerProfile = await Volunteer.findOne({ user: userId });
    const volunteerProfileId = volunteerProfile?._id;
    filter.$or = [
      { status: "pending" },
      {
        volunteer: volunteerProfileId,
        status: { $in: ["matched", "in_progress"] },
      },
    ];
  }
  if (status && VALID_STATUSES.includes(status)) filter.status = status;

  const requests = await AssistanceRequest.find(filter)
    .populate("user", "fullName phone language")
    .populate({
      path: "volunteer",
      populate: { path: "user", select: "fullName phone" },
    })
    .sort({ createdAt: -1 });

  res.json({ data: requests, count: requests.length });
});

/**
 * GET /api/requests/:id
 */
export const getRequest = asyncHandler(async (req, res) => {
  const request = await AssistanceRequest.findById(req.params.id)
    .populate("user", "fullName phone language")
    .populate({
      path: "volunteer",
      populate: { path: "user", select: "fullName phone" },
    });

  if (!request) throw new NotFoundError("Request", req.params.id);

  const { id: userId, role } = req.user;
  const canView =
    request.user._id.toString() === userId ||
    (role === "volunteer" &&
      request.volunteer?.user?._id.toString() === userId) ||
    (role === "volunteer" && request.status === "pending");

  if (!canView) throw new ForbiddenError("view this request");
  res.json({ data: request });
});

/**
 * PATCH /api/requests/:id/status
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const { id: userId, role } = req.user;

  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  const request = await AssistanceRequest.findById(req.params.id);
  if (!request) throw new NotFoundError("Request", req.params.id);

  if (
    status === "completed" &&
    role !== "volunteer" &&
    request.user.toString() !== userId
  ) {
    throw new ForbiddenError("complete this request");
  }
  if (status === "cancelled" && request.user.toString() !== userId) {
    throw new ForbiddenError("cancel this request");
  }
  if (["matched", "in_progress"].includes(status) && role !== "volunteer") {
    throw new ForbiddenError("update this request");
  }

  if (status === "matched") {
    const volunteerProfile = await Volunteer.findOne({ user: userId });
    if (!volunteerProfile) throw new NotFoundError("Volunteer profile", userId);
    request.volunteer = volunteerProfile._id;
  }

  request.status = status;
  request.statusHistory.push({ status, changedBy: userId, note: note || "" });
  await request.save();

  // 🔔 Emit socket events based on new status
  // Note: request.volunteer is the Volunteer profile ID — we need the User ID for socket rooms
  const requestUserId = request.user.toString();
  let volunteerUserId = null;
  if (request.volunteer) {
    const vProfile = await Volunteer.findById(request.volunteer).select("user");
    volunteerUserId = vProfile?.user?.toString();
  }
  try {
    if (status === "in_progress") emitRequestStarted(request, requestUserId);
    if (status === "completed")
      emitRequestCompleted(request, requestUserId, volunteerUserId);
  } catch (_) {}

  logger.info({
    requestId: request._id,
    status,
    updatedBy: userId,
    event: "request_status_changed",
  });
  res.json({ data: request });
});

/**
 * DELETE /api/requests/:id
 */
export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await AssistanceRequest.findById(req.params.id);
  if (!request) throw new NotFoundError("Request", req.params.id);
  if (request.user.toString() !== req.user.id)
    throw new ForbiddenError("delete this request");
  if (request.status !== "pending")
    throw new BadRequestError("Only pending requests can be deleted");

  await request.deleteOne();
  res.status(204).send();
});

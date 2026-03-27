import asyncHandler from "../utils/asyncHandler.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";
import AssistanceRequest from "../models/AssistanceRequest.js";
import Volunteer from "../models/Volunteer.js";
import { emitRequestMatched } from "../socket.js";

/**
 * POST /api/matches/find
 */
export const findMatches = asyncHandler(async (req, res) => {
  const { requestId, maxRadiusKm = 5 } = req.body;
  if (!requestId) throw new BadRequestError("requestId is required");

  const request = await AssistanceRequest.findById(requestId);
  if (!request) throw new NotFoundError("Request", requestId);

  const { lat, lng } = request.origin;
  const volunteers = await Volunteer.findNearby(lat, lng, maxRadiusKm);

  if (volunteers.length === 0)
    logger.warn({ requestId, event: "no_volunteers_found" });

  res.json({ data: volunteers, count: volunteers.length });
});

/**
 * POST /api/matches/accept
 * Volunteer atomically accepts a pending request.
 * Rejects if the volunteer already has an active (matched/in_progress) request.
 */
export const acceptMatch = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) throw new BadRequestError("requestId is required");

  let volunteer = await Volunteer.findOne({ user: req.user.id });
  if (!volunteer) {
    // Auto-create a minimal profile for accounts registered before this fix
    volunteer = await Volunteer.create({
      user: req.user.id,
      languages: [req.user.lang || "english"],
      availability: [],
      location: { type: "Point", coordinates: [0, 0], address: "" },
    });
    logger.info({ userId: req.user.id, event: "volunteer_profile_auto_created" });
  }

  // ── Guard: volunteer cannot accept if already handling a request ──
  const activeRequest = await AssistanceRequest.findOne({
    volunteer: volunteer._id,
    status: { $in: ["matched", "in_progress"] },
  });

  if (activeRequest) {
    throw new ConflictError(
      "You already have an active request in progress. Please complete it before accepting a new one.",
    );
  }

  // Atomic update — only succeeds if status is still 'pending'
  const request = await AssistanceRequest.acceptByVolunteer(
    requestId,
    volunteer._id,
  );

  if (!request) {
    throw new ConflictError(
      "This request was already accepted by another volunteer",
    );
  }

  // 🔔 Notify the user that their request was matched
  try {
    const requestUserId = request.user.toString();
    emitRequestMatched(request, requestUserId);
  } catch (_) {}

  logger.info({
    requestId,
    volunteerId: volunteer._id,
    event: "match_accepted",
  });
  res.json({ data: request });
});

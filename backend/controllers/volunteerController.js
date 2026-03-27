import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import Volunteer from "../models/Volunteer.js";

/**
 * GET /api/volunteers
 */
export const listVolunteers = asyncHandler(async (req, res) => {
  const { language, lat, lng, radius = 5 } = req.query;

  let volunteers;

  if (lat && lng) {
    // Geo-filtered search using the static helper
    volunteers = await Volunteer.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      language || null,
    );
  } else {
    const filter = { isAvailable: true };
    if (language) filter.languages = language;
    volunteers = await Volunteer.find(filter).populate(
      "user",
      "fullName phone language",
    );
  }

  res.json({ data: volunteers, count: volunteers.length });
});

/**
 * GET /api/volunteers/:id
 */
export const getVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id).populate(
    "user",
    "fullName phone language",
  );
  if (!volunteer) throw new NotFoundError("Volunteer", req.params.id);
  res.json({ data: volunteer });
});

/**
 * PUT /api/volunteers/profile
 */
export const upsertProfile = asyncHandler(async (req, res) => {
  const { languages, availability, location, bio } = req.body;

  const profile = await Volunteer.findOneAndUpdate(
    { user: req.user.id },
    {
      languages,
      availability,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        address: location.address || "",
      },
      bio: bio || "",
    },
    { new: true, upsert: true, runValidators: true },
  ).populate("user", "fullName phone language");

  logger.info({ userId: req.user.id, event: "volunteer_profile_updated" });
  res.json({ data: profile });
});

/**
 * PATCH /api/volunteers/availability
 */
export const setAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const profile = await Volunteer.findOneAndUpdate(
    { user: req.user.id },
    { isAvailable: Boolean(isAvailable) },
    { new: true },
  );

  if (!profile) throw new NotFoundError("Volunteer profile", req.user.id);
  res.json({ data: { isAvailable: profile.isAvailable } });
});

/**
 * POST /api/volunteers/:id/rate
 */
export const rateVolunteer = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  if (rating < 1 || rating > 5)
    throw new BadRequestError("Rating must be between 1 and 5");

  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) throw new NotFoundError("Volunteer", req.params.id);

  await volunteer.addRating(rating);
  logger.info({ volunteerId: req.params.id, rating, event: "volunteer_rated" });
  res.json({ data: { rating: volunteer.rating } });
});

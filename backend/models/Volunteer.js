import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, trim: true },
  },
  { _id: false },
);

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true }, // e.g. "17:00"
  },
  { _id: false },
);

const ratingSchema = new mongoose.Schema(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const volunteerSchema = new mongoose.Schema(
  {
    // One-to-one link to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    languages: {
      type: [String],
      enum: ["english", "hindi", "tamil", "telugu", "bengali"],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one language is required",
      },
    },

    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },

    // GeoJSON point for $geoNear queries
    location: {
      type: locationSchema,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: ratingSchema,
      default: () => ({ average: 0, count: 0 }),
    },

    // Verification badge (admin-set)
    isVerified: { type: Boolean, default: false },

    // Total trips completed
    tripsCompleted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────

// Geospatial index — required for $geoNear queries
volunteerSchema.index({ location: "2dsphere" });
volunteerSchema.index({ isAvailable: 1 });
volunteerSchema.index({ languages: 1 });
// Note: user index is already created by unique:true above

// ── Static Methods ─────────────────────────────────────────────────────

/**
 * Find available volunteers within a given radius.
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @param {string} language - Optional language filter
 */
volunteerSchema.statics.findNearby = function (
  lat,
  lng,
  radiusKm = 5,
  language = null,
) {
  const filter = {
    isAvailable: true,
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusKm / 6378.1], // radius in radians
      },
    },
  };

  if (language) filter.languages = language;

  return this.find(filter)
    .populate("user", "fullName phone language")
    .sort({ "rating.average": -1 });
};

/**
 * Recalculate and update a volunteer's rating after a new review.
 * Uses an incremental average to avoid reloading all reviews.
 */
volunteerSchema.methods.addRating = async function (newRating) {
  const { average, count } = this.rating;
  this.rating = {
    average: (average * count + newRating) / (count + 1),
    count: count + 1,
  };
  return this.save();
};

const Volunteer = mongoose.model("Volunteer", volunteerSchema);
export default Volunteer;

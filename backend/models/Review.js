import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // The user who wrote the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The volunteer being reviewed
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },

    // The completed trip this review is for
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssistanceRequest",
      required: true,
      unique: true, // one review per trip
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
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
reviewSchema.index({ volunteer: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ request: 1 }, { unique: true });

// ── Post-save Hook ─────────────────────────────────────────────────────

/**
 * After a review is saved, update the volunteer's aggregate rating.
 * Uses Volunteer.addRating() which does an incremental average update.
 */
reviewSchema.post("save", async function () {
  try {
    const Volunteer = mongoose.model("Volunteer");
    const volunteer = await Volunteer.findById(this.volunteer);
    if (volunteer) await volunteer.addRating(this.rating);
  } catch (err) {
    console.error("Failed to update volunteer rating after review:", err);
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;

import mongoose from "mongoose";

const coordinatesSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: false },
);

const requestSchema = new mongoose.Schema(
  {
    // The visually impaired user making the request
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The volunteer who accepted (null until matched)
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
    },

    origin: { type: coordinatesSchema, required: true },
    destination: { type: coordinatesSchema, required: true },

    status: {
      type: String,
      enum: ["pending", "matched", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Optional: schedule for a future time (null = immediate)
    scheduledAt: { type: Date, default: null },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Full audit trail of status changes
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    // Timestamps for key milestones
    matchedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Rating given by user after completion
    userRating: {
      score: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, trim: true, maxlength: 300, default: "" },
      givenAt: { type: Date, default: null },
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
requestSchema.index({ user: 1, status: 1 });
requestSchema.index({ volunteer: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ scheduledAt: 1 });

// ── Pre-save Hook ──────────────────────────────────────────────────────

/** Automatically record milestone timestamps and push to statusHistory */
requestSchema.pre("save", function () {
  if (this.isModified("status")) {
    const now = new Date();
    if (this.status === "matched") this.matchedAt = now;
    if (this.status === "in_progress") this.startedAt = now;
    if (this.status === "completed") this.completedAt = now;
    if (this.status === "cancelled") this.cancelledAt = now;
  }
});

// ── Static Methods ─────────────────────────────────────────────────────

/**
 * Atomically accept a request — prevents two volunteers claiming the same request.
 */
requestSchema.statics.acceptByVolunteer = function (requestId, volunteerId) {
  return this.findOneAndUpdate(
    { _id: requestId, status: "pending" }, // atomic guard
    {
      status: "matched",
      volunteer: volunteerId,
      matchedAt: new Date(),
      $push: {
        statusHistory: {
          status: "matched",
          changedBy: volunteerId,
          changedAt: new Date(),
        },
      },
    },
    { new: true },
  );
};

const AssistanceRequest = mongoose.model("AssistanceRequest", requestSchema);
export default AssistanceRequest;

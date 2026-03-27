import mongoose from "mongoose";
import bcrypt from "bcrypt";

const accessibilitySettingsSchema = new mongoose.Schema(
  {
    voiceEnabled: { type: Boolean, default: true },
    highContrast: { type: Boolean, default: false },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    screenReaderHints: { type: Boolean, default: true },
  },
  { _id: false },
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows multiple docs without email (null)
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Must be a valid email address"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      required: true,
    },
    language: {
      type: String,
      enum: ["english", "hindi", "tamil", "telugu", "bengali"],
      default: "english",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Biometric
    biometricEnabled: { type: Boolean, default: false },
    biometricTokenHash: { type: String, select: false },

    // Password reset OTP
    resetOtpHash: { type: String, select: false },
    resetOtpExpiry: { type: Date, select: false },

    // Accessibility & preferences
    accessibilitySettings: {
      type: accessibilitySettingsSchema,
      default: () => ({}),
    },
    emergencyContact: {
      type: emergencyContactSchema,
      default: null,
    },

    // Soft delete
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.biometricTokenHash;
      },
    },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────
// Note: phone index is already created by unique:true above
userSchema.index({ role: 1 });

// ── Instance Methods ───────────────────────────────────────────────────

/** Compare a plain password to the stored hash */
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

/** Compare a plain biometric token to the stored hash */
userSchema.methods.compareBiometric = async function (token) {
  return bcrypt.compare(token, this.biometricTokenHash);
};

// ── Pre-save Hook ──────────────────────────────────────────────────────

/** Hash password before saving if modified */
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

const User = mongoose.model("User", userSchema);
export default User;

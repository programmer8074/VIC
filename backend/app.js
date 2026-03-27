import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import {
  notFoundHandler,
  globalErrorHandler,
} from "./middleware/errorHandler.js";
import requestIdMiddleware from "./middleware/requestId.js";

const app = express();

// ── Security & Utilities ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

// ── Rate Limiting ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later.",
    },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many login attempts, please try again later.",
    },
  },
});

app.use("/api/", globalLimiter);
app.use("/api/auth/", authLimiter);

// ── Health Check ─────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "VisionConnect API",
  });
});

// ── API Routes ───────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);

// ── Error Handling ───────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

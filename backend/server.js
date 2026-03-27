import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { initSocket } from "./socket.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // ── Create HTTP server manually so Socket.io can attach to it ──
    const httpServer = http.createServer(app);

    // ── Initialize Socket.io ────────────────────────────────────────
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 VisionConnect API running on port ${PORT}`);
      logger.info(`🔌 Socket.io enabled`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();

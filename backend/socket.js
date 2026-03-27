import { Server } from "socket.io";
import logger from "./utils/logger.js";

let io;

/**
 * Initialize Socket.io on the HTTP server.
 * Call this once from server.js after creating the HTTP server.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id, event: "socket_connected" });

    // ── Join a personal room by userId ──────────────────────────────
    // Client emits: socket.emit('join', userId)
    // This lets us send targeted notifications to specific users/volunteers
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        logger.info({
          socketId: socket.id,
          userId,
          event: "socket_joined_room",
        });
      }
    });

    // ── Join the volunteers broadcast room ──────────────────────────
    // Client emits: socket.emit('join:volunteers')
    // All volunteers join this room to receive new request notifications
    socket.on("join:volunteers", () => {
      socket.join("volunteers");
      logger.info({
        socketId: socket.id,
        event: "socket_joined_volunteers_room",
      });
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id, event: "socket_disconnected" });
    });
  });

  return io;
};

/**
 * Get the Socket.io instance.
 * Use this in controllers to emit events.
 */
export const getIO = () => {
  if (!io)
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  return io;
};

// ── Emit Helpers ──────────────────────────────────────────────────────

/**
 * Notify all volunteers of a new pending request.
 */
export const emitNewRequest = (request) => {
  getIO().to("volunteers").emit("request:new", {
    requestId: request._id,
    origin: request.origin,
    destination: request.destination,
    notes: request.notes,
    createdAt: request.createdAt,
    user: request.user,
  });
};

/**
 * Notify the user that a volunteer accepted their request.
 */
export const emitRequestMatched = (request, userId) => {
  getIO().to(userId.toString()).emit("request:matched", {
    requestId: request._id,
    volunteer: request.volunteer,
    matchedAt: request.matchedAt,
  });
};

/**
 * Notify the user that the volunteer has started the trip.
 */
export const emitRequestStarted = (request, userId) => {
  getIO().to(userId.toString()).emit("request:started", {
    requestId: request._id,
    startedAt: request.startedAt,
  });
};

/**
 * Notify both parties that the trip is completed.
 */
export const emitRequestCompleted = (request, userId, volunteerId) => {
  const payload = { requestId: request._id, completedAt: request.completedAt };
  getIO().to(userId.toString()).emit("request:completed", payload);
  if (volunteerId)
    getIO().to(volunteerId.toString()).emit("request:completed", payload);
};

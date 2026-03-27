import { useEffect, useState } from "react";
import socket from "../socket.js";

/**
 * Hook to manage Socket.io connection and incoming notifications.
 *
 * @param {string} userId   - The logged-in user's ID (to join personal room)
 * @param {string} role     - 'user' or 'volunteer'
 *
 * Usage:
 *   const { notification, clearNotification } = useSocket(user.id, user.role);
 */
const useSocket = (userId, role) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Connect and join rooms
    socket.connect();
    socket.emit("join", userId); // personal room for targeted events
    if (role === "volunteer") {
      socket.emit("join:volunteers"); // broadcast room for new requests
    }

    // ── Event Listeners ───────────────────────────────────────────

    // Volunteer: new request available
    socket.on("request:new", (data) => {
      setNotification({
        type: "new_request",
        title: "🆕 New Request",
        message: `${data.origin?.address} → ${data.destination?.address}`,
        data,
      });
    });

    // User: volunteer accepted their request
    socket.on("request:matched", (data) => {
      setNotification({
        type: "matched",
        title: "✅ Volunteer Matched!",
        message: "A volunteer has accepted your request and is on the way.",
        data,
      });
    });

    // User: volunteer started the trip
    socket.on("request:started", (data) => {
      setNotification({
        type: "started",
        title: "🚶 Trip Started",
        message: "Your volunteer has started the trip.",
        data,
      });
    });

    // Both: trip completed
    socket.on("request:completed", (data) => {
      setNotification({
        type: "completed",
        title: "🎉 Trip Completed",
        message: "The trip has been marked as complete.",
        data,
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off("request:new");
      socket.off("request:matched");
      socket.off("request:started");
      socket.off("request:completed");
      socket.disconnect();
    };
  }, [userId, role]);

  const clearNotification = () => setNotification(null);

  return { notification, clearNotification };
};

export default useSocket;

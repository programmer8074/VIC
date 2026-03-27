import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/api", "")
  : "http://localhost:5000";

// Singleton — same socket instance reused across the app
const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually after login
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;

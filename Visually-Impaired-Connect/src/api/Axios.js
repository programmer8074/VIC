import axios from "axios";

// ── Base Instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ────────────────────────────────────────────────
// Automatically attach JWT token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ───────────────────────────────────────────────
// Normalize errors so every component gets the same shape:
// { message, code, details }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = error.response?.data?.error;

    // Token expired — clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Re-throw a clean error object
    return Promise.reject({
      message: err?.message || "Something went wrong. Please try again.",
      code: err?.code || "UNKNOWN_ERROR",
      details: err?.details || {},
      status: error.response?.status,
    });
  },
);

export default api;

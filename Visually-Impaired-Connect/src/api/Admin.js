import axios from "axios";

// Separate axios instance that uses adminToken instead of regular user token
const adminAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = error.response?.data?.error;
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin";
    }
    return Promise.reject({
      message: err?.message || "Something went wrong.",
      code: err?.code || "UNKNOWN_ERROR",
      status: error.response?.status,
    });
  },
);

const api = adminAxios;

const adminAPI = {
  /**
   * One-time admin registration.
   * @param {{ fullName, phone, password, adminSecret }} data
   */
  register: async (data) => {
    const res = await api.post("/admin/register", data);
    return res.data.data;
  },

  /**
   * Admin login.
   * @param {{ phone, password }} data
   */
  login: async (data) => {
    const res = await api.post("/admin/login", data);
    return res.data.data; // { token, user }
  },

  /**
   * List all volunteers. Pass { verified: false } to get only unverified.
   */
  listVolunteers: async (params = {}) => {
    const res = await api.get("/admin/volunteers", { params });
    return res.data; // { data, count }
  },

  /**
   * Verify or unverify a volunteer.
   * @param {string} id - Volunteer profile ID
   * @param {boolean} isVerified
   */
  verifyVolunteer: async (id, isVerified) => {
    const res = await api.patch(`/admin/volunteers/${id}/verify`, {
      isVerified,
    });
    return res.data.data;
  },

  /**
   * List all users.
   */
  listUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data; // { data, count }
  },

  /**
   * Toggle a user's active status.
   * @param {string} id - User ID
   */
  toggleUserActive: async (id) => {
    const res = await api.patch(`/admin/users/${id}/toggle`);
    return res.data.data;
  },
};

export default adminAPI;

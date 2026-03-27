import api from "./Axios.js";

const requestsAPI = {
  /**
   * Create a new assistance request.
   * @param {{ origin, destination, scheduledAt?, notes? }} data
   */
  create: async (data) => {
    const res = await api.post("/requests", data);
    return res.data.data;
  },

  /**
   * List requests for the current user.
   * - Visually impaired user: their own requests
   * - Volunteer: all open/matched requests
   * @param {{ status? }} params
   */
  list: async (params = {}) => {
    const res = await api.get("/requests", { params });
    return res.data; // { data, count }
  },

  /**
   * Get a single request by ID.
   * @param {string} id
   */
  getById: async (id) => {
    const res = await api.get(`/requests/${id}`);
    return res.data.data;
  },

  /**
   * Update the status of a request.
   * @param {string} id
   * @param {{ status, note? }} data
   */
  updateStatus: async (id, data) => {
    const res = await api.patch(`/requests/${id}/status`, data);
    return res.data.data;
  },

  /**
   * Cancel (delete) a pending request.
   * @param {string} id
   */
  cancel: async (id) => {
    await api.delete(`/requests/${id}`);
  },
};

export default requestsAPI;

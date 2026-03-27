import api from "./Axios.js";

const volunteersAPI = {
  /**
   * List available volunteers.
   * @param {{ language?, lat?, lng?, radius? }} params
   */
  list: async (params = {}) => {
    const res = await api.get("/volunteers", { params });
    return res.data; // { data, count }
  },

  /**
   * Get a single volunteer's public profile.
   * @param {string} id
   */
  getById: async (id) => {
    const res = await api.get(`/volunteers/${id}`);
    return res.data.data;
  },

  /**
   * Volunteer: create or update their profile.
   * @param {{ languages, availability, location, bio }} data
   */
  upsertProfile: async (data) => {
    const res = await api.put("/volunteers/profile", data);
    return res.data.data;
  },

  /**
   * Volunteer: toggle availability on/off.
   * @param {boolean} isAvailable
   */
  setAvailability: async (isAvailable) => {
    const res = await api.patch("/volunteers/availability", { isAvailable });
    return res.data.data;
  },

  /**
   * Rate a volunteer after a completed trip.
   * @param {string} id
   * @param {{ rating, comment? }} data
   */
  rate: async (id, data) => {
    const res = await api.post(`/volunteers/${id}/rate`, data);
    return res.data.data;
  },
};

const matchAPI = {
  /**
   * Find nearby volunteers for a request.
   * @param {{ requestId, maxRadiusKm? }} data
   */
  find: async (data) => {
    const res = await api.post("/matches/find", data);
    return res.data; // { data, count }
  },

  /**
   * Volunteer accepts a request (atomic).
   * @param {{ requestId }} data
   */
  accept: async (data) => {
    const res = await api.post("/matches/accept", data);
    return res.data.data;
  },
};

export { volunteersAPI, matchAPI };

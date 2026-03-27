import api from "./Axios.js";

const authAPI = {
  /**
   * Register a new user or volunteer.
   * @param {{ fullName, phone, password, language, role }} data
   */
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data.data; // { token, user }
  },

  /**
   * Login with phone + password.
   * @param {{ phone, password }} data
   */
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data.data; // { token, user }
  },

  /**
   * Login using a biometric token (Face ID / Fingerprint).
   * @param {{ userId, biometricToken }} data
   */
  biometricLogin: async (data) => {
    const res = await api.post("/auth/biometric/login", data);
    return res.data.data; // { token, user }
  },

  /**
   * Register a biometric token for the current user.
   * @param {{ biometricToken }} data
   */
  registerBiometric: async (data) => {
    const res = await api.post("/auth/biometric/register", data);
    return res.data.data;
  },

  /**
   * Get the currently authenticated user.
   */
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data.data; // user object
  },

  /**
   * Request a password-reset OTP for a phone number.
   * @param {{ phone }} data
   */
  requestPasswordReset: async (data) => {
    const res = await api.post("/auth/forgot-password", data);
    return res.data.data; // { message, devOtp? }
  },

  /**
   * Reset password using the OTP received.
   * @param {{ phone, otp, newPassword }} data
   */
  resetPassword: async (data) => {
    const res = await api.post("/auth/reset-password", data);
    return res.data.data; // { message }
  },
};

export default authAPI;

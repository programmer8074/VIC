import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authAPI from "../api/Auth.js";

const AuthContext = createContext(null);

/**
 * Wrap your app in <AuthProvider> to give all components
 * access to auth state and actions via useAuth().
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // ── On mount: restore session from localStorage ──────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await authAPI.getMe();
        setUser(me);
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────

  const register = useCallback(async (formData) => {
    const { token, user } = await authAPI.register(formData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const login = useCallback(async (formData) => {
    const { token, user } = await authAPI.login(formData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const biometricLogin = useCallback(async (formData) => {
    const { token, user } = await authAPI.biometricLogin(formData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isUser: user?.role === "user",
    isVolunteer: user?.role === "volunteer",
    register,
    login,
    biometricLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth state and actions anywhere in the app.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

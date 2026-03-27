import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const useLogin = () => {
  const { login, biometricLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectAfterLogin = (user) => {
    if (user.role === "volunteer") navigate("/volunteer-dashboard");
    else navigate("/user-dashboard");
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(formData);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async ({ userId, biometricToken }) => {
    setLoading(true);
    setError(null);
    try {
      const user = await biometricLogin({ userId, biometricToken });
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.message || "Biometric verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleBiometricLogin, loading, error };
};

export default useLogin;

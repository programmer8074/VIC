import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const useRegister = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await register(formData);
      if (user.role === "volunteer") navigate("/volunteer-dashboard");
      else navigate("/user-dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};

export default useRegister;

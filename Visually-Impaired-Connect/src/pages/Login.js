import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Fingerprint, Eye } from "lucide-react";
import useLogin from "../hooks/useLogin";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin, handleBiometricLogin, loading, error } = useLogin();
  const { user } = useAuth();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Biometric: in a real app you'd get userId from a stored device token.
  // For now, user enters their phone and we look up their stored userId.
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const onPhoneLogin = async () => {
    await handleLogin({ phone, password });
  };

  const onBiometricLogin = async () => {
    if (!storedUser) {
      alert(
        "No stored session found. Please log in with phone first to enable biometric.",
      );
      return;
    }
    // In production this token comes from device biometric hardware.
    const biometricToken =
      localStorage.getItem("biometricToken") || "test-biometric-token-12345";
    await handleBiometricLogin({ userId: storedUser.id, biometricToken });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Eye className="text-white" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Login to VisionConnect
          </p>

          {/* Login method toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                loginMethod === "phone"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => setLoginMethod("biometric")}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                loginMethod === "biometric"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Biometric
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {loginMethod === "phone" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={onPhoneLogin}
                disabled={loading || !phone || !password}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="text-right">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={onBiometricLogin}
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-xl transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Camera size={28} />
                <span className="text-lg font-bold">
                  {loading ? "Verifying..." : "Login with Face ID"}
                </span>
              </button>
              <button
                onClick={onBiometricLogin}
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Fingerprint size={28} />
                <span className="text-lg font-bold">
                  {loading ? "Verifying..." : "Login with Fingerprint"}
                </span>
              </button>
              {!storedUser && (
                <p className="text-center text-sm text-gray-500">
                  Log in with phone first to enable biometric login on this
                  device.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/role-selection")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

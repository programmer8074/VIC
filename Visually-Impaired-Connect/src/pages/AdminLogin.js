import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye } from "lucide-react";
import adminAPI from "../api/Admin.js";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    adminSecret: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await adminAPI.login({
        phone: form.phone,
        password: form.password,
      });
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await adminAPI.register(form);
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-1">
            Admin Panel
          </h2>
          <p className="text-center text-gray-500 mb-6">
            VisionConnect Administration
          </p>

          {/* Tab toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${tab === "login" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${tab === "register" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              First-time Setup
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 outline-none"
                  placeholder="Admin name"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 outline-none"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 outline-none"
                placeholder="Password"
              />
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Admin Secret
                </label>
                <input
                  type="password"
                  value={form.adminSecret}
                  onChange={(e) =>
                    setForm({ ...form, adminSecret: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 outline-none"
                  placeholder="Secret key from .env"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This is the ADMIN_SECRET value from your backend .env file.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full mt-6 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Login"
                : "Create Admin Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

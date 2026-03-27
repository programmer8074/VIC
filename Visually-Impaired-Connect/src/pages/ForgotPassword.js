import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, KeyRound, Phone, ShieldCheck, Lock } from "lucide-react";
import authAPI from "../api/Auth.js";

const STEPS = {
  PHONE: 1,
  OTP: 2,
  NEW_PASSWORD: 3,
  SUCCESS: 4,
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [emailHint, setEmailHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.requestPasswordReset({ phone });
      if (data.devOtp) setDevOtp(data.devOtp);
      if (data.hint) setEmailHint(data.hint);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    setError("");
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setStep(STEPS.NEW_PASSWORD);
  };

  const handleResetPassword = async () => {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must be at least 8 characters with one uppercase letter and one number.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ phone, otp, newPassword });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = {
    [STEPS.PHONE]: <Phone className="text-white" size={32} />,
    [STEPS.OTP]: <ShieldCheck className="text-white" size={32} />,
    [STEPS.NEW_PASSWORD]: <Lock className="text-white" size={32} />,
    [STEPS.SUCCESS]: <KeyRound className="text-white" size={32} />,
  };

  const stepTitles = {
    [STEPS.PHONE]: "Forgot Password?",
    [STEPS.OTP]: "Enter OTP",
    [STEPS.NEW_PASSWORD]: "Set New Password",
    [STEPS.SUCCESS]: "Password Reset!",
  };

  const stepSubtitles = {
    [STEPS.PHONE]: "Enter your phone number to receive an OTP",
    [STEPS.OTP]: `We sent a 6-digit OTP to ${phone}`,
    [STEPS.NEW_PASSWORD]: "Create a strong new password",
    [STEPS.SUCCESS]: "Your password has been updated successfully",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate("/login")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back to Login
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              {stepIcons[step]}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {stepTitles[step]}
          </h2>
          <p className="text-center text-gray-600 mb-6">{stepSubtitles[step]}</p>

          {/* Step progress dots */}
          {step !== STEPS.SUCCESS && (
            <div className="flex justify-center gap-2 mb-8">
              {[STEPS.PHONE, STEPS.OTP, STEPS.NEW_PASSWORD].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-blue-600"
                      : s < step
                      ? "w-2 bg-blue-400"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* ── Step 1: Phone ── */}
          {step === STEPS.PHONE && (
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
                  placeholder="Enter your registered phone number"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleRequestOtp}
                disabled={loading || phone.length < 10}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === STEPS.OTP && (
            <div className="space-y-4">
              {/* Email hint */}
              {emailHint && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">
                  📧 {emailHint}
                </div>
              )}
              {/* Dev mode fallback */}
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-sm">
                  <span className="font-bold">Dev mode OTP:</span>{" "}
                  <span className="font-mono text-base tracking-widest">{devOtp}</span>
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg tracking-[0.5em] text-center font-mono"
                  placeholder="──────"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                Verify OTP
              </button>
              <button
                onClick={() => { setStep(STEPS.PHONE); setOtp(""); setError(""); setDevOtp(null); }}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* ── Step 3: New Password ── */}
          {step === STEPS.NEW_PASSWORD && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Re-enter new password"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === STEPS.SUCCESS && (
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

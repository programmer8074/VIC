import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Camera, MapPin, User, Image } from "lucide-react";
import useRegister from "../hooks/useRegister";

const LANGUAGES = ["english", "hindi", "tamil", "telugu", "bengali"];

const SignUpUser = () => {
  const navigate = useNavigate();
  const { handleRegister, loading, error } = useRegister();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    language: "english",
    consent: false,
  });
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(null);

  const handleVoiceInput = (field) => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    setIsListening(field);
    rec.onresult = (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.results[0][0].transcript }));
      setIsListening(null);
    };
    rec.onerror = () => setIsListening(null);
    rec.onend = () => setIsListening(null);
    rec.start();
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Step 3: submit registration
      await handleRegister({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        language: formData.language,
        role: "user",
      });
    }
  };

  const isStep1Valid = formData.fullName && formData.phone && formData.password;
  const isStep3Valid = formData.consent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/role-selection")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            User Sign Up
          </h2>
          <p className="text-gray-600 mb-8">Step {step} of 3</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Full Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={() => handleVoiceInput("fullName")}
                    className={`px-4 py-3 rounded-xl transition ${isListening === "fullName" ? "bg-red-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                    placeholder="Enter phone number"
                  />
                  <button
                    onClick={() => handleVoiceInput("phone")}
                    className={`px-4 py-3 rounded-xl transition ${isListening === "phone" ? "bg-red-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address <span className="text-gray-400 font-normal text-sm">(for password reset)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Enter your email (optional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                  placeholder="Create a password"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Preferred Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg capitalize"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="capitalize">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Profile Picture
                </label>
                <button className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition flex items-center justify-center gap-2 text-gray-600">
                  <Image size={24} />
                  Upload Photo (optional)
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">
                  Biometric Setup
                </h3>
                <p className="text-gray-700 mb-2">
                  After signing up, you can set up biometric login from your
                  profile.
                </p>
                <p className="text-sm text-gray-500">
                  Biometric tokens are registered after your first phone login.
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="py-6 bg-white border-2 border-blue-200 rounded-xl flex flex-col items-center gap-2 text-gray-400">
                    <Camera size={32} />
                    <span className="font-semibold text-sm">
                      Face ID (post login)
                    </span>
                  </div>
                  <div className="py-6 bg-white border-2 border-blue-200 rounded-xl flex flex-col items-center gap-2 text-gray-400">
                    <User size={32} />
                    <span className="font-semibold text-sm">
                      Fingerprint (post login)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Account Summary
                </p>
                <p className="text-gray-600 text-sm">
                  Name:{" "}
                  <span className="font-bold text-gray-900">
                    {formData.fullName}
                  </span>
                </p>
                <p className="text-gray-600 text-sm">
                  Phone:{" "}
                  <span className="font-bold text-gray-900">
                    {formData.phone}
                  </span>
                </p>
                <p className="text-gray-600 text-sm">
                  Language:{" "}
                  <span className="font-bold text-gray-900 capitalize">
                    {formData.language}
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) =>
                    setFormData({ ...formData, consent: e.target.checked })
                  }
                  className="mt-1 w-5 h-5"
                />
                <label className="text-gray-700">
                  I consent to share my information and agree to the terms and
                  conditions of VisionConnect
                </label>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 3 && !isStep3Valid) ||
              loading
            }
            className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : step === 3
                ? "Complete Sign Up"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpUser;

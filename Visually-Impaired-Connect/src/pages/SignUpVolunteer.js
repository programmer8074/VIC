import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, User, Image } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { volunteersAPI } from "../api/Volunteers.js";

const LANGUAGES = ["english", "hindi", "tamil", "telugu", "bengali"];

const SignUpVolunteer = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    language: "english",
    bio: "",
    languages: ["english"],
    consent: false,
  });
  const [step, setStep] = useState(1);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const toggleLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Step 3: register → create volunteer profile → navigate
    setLoading(true);
    setError(null);
    try {
      await register({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        language: formData.language,
        role: "volunteer",
      });

      // Token is now in localStorage — create volunteer profile
      await volunteersAPI.upsertProfile({
        languages: formData.languages,
        bio: formData.bio,
        availability: [],
        location: { lat: 0, lng: 0, address: "To be updated" },
      });

      navigate("/volunteer-dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.fullName && formData.phone && formData.password;
  const isStep3Valid = formData.consent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/role-selection")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Volunteer Sign Up
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
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
                  placeholder="Enter phone number"
                />
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
                  placeholder="Create a password"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Primary Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
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
                  Languages You Can Assist In
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-full font-semibold capitalize transition ${
                        formData.languages.includes(lang)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Bio (optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none text-lg"
                  placeholder="Tell users a bit about yourself..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-xl">
                  Almost There!
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Your account will be created and you can set up your
                  availability and location from the volunteer dashboard.
                </p>

                <div className="bg-white rounded-lg p-4 space-y-1">
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
                  <p className="text-gray-600 text-sm">
                    Can assist in:{" "}
                    <span className="font-bold text-gray-900 capitalize">
                      {formData.languages.join(", ")}
                    </span>
                  </p>
                </div>
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
                  I consent to volunteer verification and agree to
                  VisionConnect's volunteer guidelines
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
            className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
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

export default SignUpVolunteer;

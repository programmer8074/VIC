import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MapPin,
  FileText,
  Send,
  Eye,
  LogOut,
  Share2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import useRequests from "../hooks/useRequests";
import useSocket from "../hooks/useSocket";
import NotificationToast from "../components/NotificationToast";
import MapPicker from "../components/MapPicker";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    createRequest,
    updateStatus,
    refetch,
    requests,
    loading: reqLoading,
  } = useRequests();
  const { notification, clearNotification } = useSocket(user?.id, "user");

  const emptyForm = {
    originAddress: "",
    originLat: "",
    originLng: "",
    destinationAddress: "",
    destinationLat: "",
    destinationLng: "",
    notes: "",
  };

  const [originPin, setOriginPin] = useState(null);
  const [destinationPin, setDestinationPin] = useState(null);

  const handleOriginChange = (pin) => {
    setOriginPin(pin);
    if (pin) {
      setFormData((prev) => ({
        ...prev,
        originLat: pin.lat,
        originLng: pin.lng,
        originAddress: pin.address || prev.originAddress,
      }));
    } else {
      setFormData((prev) => ({ ...prev, originLat: "", originLng: "", originAddress: "" }));
    }
  };

  const handleDestinationChange = (pin) => {
    setDestinationPin(pin);
    if (pin) {
      setFormData((prev) => ({
        ...prev,
        destinationLat: pin.lat,
        destinationLng: pin.lng,
        destinationAddress: pin.address || prev.destinationAddress,
      }));
    } else {
      setFormData((prev) => ({ ...prev, destinationLat: "", destinationLng: "", destinationAddress: "" }));
    }
  };

  // Auto-refetch on status changes + reset form when trip is completed
  React.useEffect(() => {
    if (["completed", "matched", "started"].includes(notification?.type)) {
      refetch();
    }
    if (notification?.type === "completed") {
      setSubmitted(false);
      setCreatedRequest(null);
      setFormData(emptyForm);
      setOriginPin(null);
      setDestinationPin(null);
    }
  }, [notification]);

  const [formData, setFormData] = useState({
    originAddress: "",
    originLat: "",
    originLng: "",
    destinationAddress: "",
    destinationLat: "",
    destinationLng: "",
    notes: "",
  });
  const [isListening, setIsListening] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [completing, setCompleting] = useState(null); // requestId being completed

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

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const req = await createRequest({
        origin: {
          address: formData.originAddress,
          lat: parseFloat(formData.originLat) || 0,
          lng: parseFloat(formData.originLng) || 0,
        },
        destination: {
          address: formData.destinationAddress,
          lat: parseFloat(formData.destinationLat) || 0,
          lng: parseFloat(formData.destinationLng) || 0,
        },
        notes: formData.notes,
      });
      setCreatedRequest(req);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err.message || "Failed to submit request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTrip = async (requestId) => {
    setCompleting(requestId);
    try {
      await updateStatus(requestId, "completed", "Trip completed by user");
      // Reset form so user can submit a new request
      setSubmitted(false);
      setCreatedRequest(null);
      setFormData(emptyForm);
      setOriginPin(null);
      setDestinationPin(null);
    } catch (err) {
      alert(err.message || "Failed to complete trip.");
    } finally {
      setCompleting(null);
    }
  };

  const handleShareDetails = () => {
    const message = `Travel Request Details:\n\nFrom: ${formData.originAddress}\nTo: ${formData.destinationAddress}\nNotes: ${formData.notes}\n\nShared via VisionConnect`;
    if (navigator.share) {
      navigator.share({ title: "VisionConnect Travel Request", text: message });
    } else {
      alert(message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const micBtn = (field) => (
    <button
      onClick={() => handleVoiceInput(field)}
      className={`px-6 py-4 rounded-xl transition ${
        isListening === field
          ? "bg-red-500 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      <Mic size={24} />
    </button>
  );

  // Split requests into active (matched/in_progress) and history (completed/cancelled)
  const activeRequests = requests.filter((r) =>
    ["matched", "in_progress"].includes(r.status),
  );
  const historyRequests = requests.filter((r) =>
    ["completed", "cancelled"].includes(r.status),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Eye className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              {user && (
                <p className="text-sm text-gray-500">
                  Welcome, {user.fullName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* ── Active Requests ── */}
        {activeRequests.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Active Requests
            </h3>
            <div className="space-y-4">
              {activeRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {req.origin?.address}
                      </p>
                      <p className="text-gray-500 text-sm">
                        → {req.destination?.address}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === "in_progress"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {req.status === "in_progress"
                        ? "🚶 In Progress"
                        : "✅ Matched"}
                    </span>
                  </div>

                  {req.status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteTrip(req.id)}
                      disabled={completing === req.id}
                      className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={20} />
                      {completing === req.id
                        ? "Completing..."
                        : "Mark Trip as Complete"}
                    </button>
                  )}

                  {req.status === "matched" && (
                    <p className="text-blue-700 text-sm font-semibold mt-2">
                      🙌 A volunteer has accepted your request and is on the
                      way!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Raise a Request ── */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">
            Raise a Request
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Fill in your travel details to connect with a volunteer
          </p>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
              {submitError}
            </div>
          )}

          <div className="space-y-6">
            {/* Map Picker */}
            <div>
              <label className="flex items-center gap-2 text-gray-900 font-bold mb-3 text-xl">
                <MapPin size={28} className="text-blue-600" /> Pick Locations on Map
              </label>
              <MapPicker
                originPin={originPin}
                destinationPin={destinationPin}
                onOriginChange={handleOriginChange}
                onDestinationChange={handleDestinationChange}
              />
            </div>

            {/* Origin address override */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-base">
                <MapPin size={20} className="text-blue-500" /> Pickup Address
                <span className="text-gray-400 font-normal text-sm">(auto-filled from map, or type manually)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.originAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, originAddress: e.target.value })
                  }
                  placeholder="e.g. SVU College, Tirupati"
                  className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-base"
                />
                {micBtn("originAddress")}
              </div>
            </div>

            {/* Destination address override */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-base">
                <MapPin size={20} className="text-purple-500" /> Destination Address
                <span className="text-gray-400 font-normal text-sm">(auto-filled from map, or type manually)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.destinationAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, destinationAddress: e.target.value })
                  }
                  placeholder="e.g. Tirupati Railway Station"
                  className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-base"
                />
                {micBtn("destinationAddress")}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-gray-900 font-bold mb-3 text-xl">
                <FileText size={28} className="text-blue-600" /> Notes
              </label>
              <div className="flex gap-2">
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Describe your travel purpose (e.g., Examination, Hospital visit)"
                  rows="3"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none text-lg"
                />
                {micBtn("notes")}
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="mt-8 space-y-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                <p className="text-green-700 font-bold text-xl">
                  ✓ Request Submitted Successfully!
                </p>
                <p className="text-green-600 mt-2">
                  Request ID:{" "}
                  <span className="font-mono text-sm">
                    {createdRequest?.id}
                  </span>
                </p>
                <p className="text-green-600 mt-1">
                  Please wait while we connect you with a volunteer...
                </p>
              </div>
              <button
                onClick={handleShareDetails}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl rounded-xl hover:shadow-2xl transition flex items-center justify-center gap-3"
              >
                <Share2 size={24} /> Share Details with Relatives
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCreatedRequest(null);
                  setFormData(emptyForm);
                  setOriginPin(null);
                  setDestinationPin(null);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.originAddress ||
                !formData.destinationAddress
              }
              className="w-full mt-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-2xl transition disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Send size={24} />
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>

        {/* ── Trip History ── */}
        {historyRequests.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trip History
            </h3>
            <div className="space-y-3">
              {historyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {req.origin?.address} → {req.destination?.address}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <NotificationToast
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

export default UserDashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  FileText,
  Check,
  X,
  LogOut,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import useRequests from "../hooks/useRequests";
import useVolunteerMatch from "../hooks/useVolunteerMatch";
import useSocket from "../hooks/useSocket";
import NotificationToast from "../components/NotificationToast";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { requests, loading, error, refetch, updateStatus } = useRequests();
  const {
    acceptMatch,
    loading: matchLoading,
    error: matchError,
  } = useVolunteerMatch();
  const [actionError, setActionError] = useState(null);
  const { notification, clearNotification } = useSocket(user?.id, "volunteer");

  // Auto-refresh when a new request arrives OR when trip is completed from user's side
  React.useEffect(() => {
    if (["new_request", "completed"].includes(notification?.type)) refetch();
  }, [notification]);

  // Volunteers see pending + their own active requests
  const myRequests = requests.filter(
    (r) => r.status === "matched" || r.status === "in_progress",
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const hasActiveRequest = myRequests.length > 0;

  const handleAccept = async (requestId) => {
    setActionError(null);
    try {
      await acceptMatch(requestId);
      await refetch();
    } catch (err) {
      setActionError(err.message || "Failed to accept request.");
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setActionError(null);
    try {
      await updateStatus(
        requestId,
        newStatus,
        `Status updated to ${newStatus}`,
      );
    } catch (err) {
      setActionError(err.message || "Failed to update status.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      matched: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return `inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${map[status] || "bg-gray-100 text-gray-700"}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Volunteer Dashboard
              </h1>
              {user && (
                <p className="text-sm text-gray-500">
                  Welcome, {user.fullName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {(actionError || matchError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
            {actionError || matchError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">
            Loading requests...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-xl">{error}</div>
        ) : (
          <>
            {/* My Active Requests */}
            {myRequests.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  My Active Requests
                </h2>
                <div className="space-y-4">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {req.user?.fullName || "User"}
                          </p>
                          <span className={statusBadge(req.status)}>
                            {req.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={20}
                            className="text-purple-600 mt-1 shrink-0"
                          />
                          <div>
                            <p className="text-gray-500 text-xs font-semibold">
                              FROM
                            </p>
                            <p className="text-gray-900 font-bold">
                              {req.origin?.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={20}
                            className="text-blue-600 mt-1 shrink-0"
                          />
                          <div>
                            <p className="text-gray-500 text-xs font-semibold">
                              TO
                            </p>
                            <p className="text-gray-900 font-bold">
                              {req.destination?.address}
                            </p>
                          </div>
                        </div>
                        {req.notes && (
                          <div className="flex items-start gap-3">
                            <FileText
                              size={20}
                              className="text-purple-600 mt-1 shrink-0"
                            />
                            <div>
                              <p className="text-gray-500 text-xs font-semibold">
                                NOTES
                              </p>
                              <p className="text-gray-900">{req.notes}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Clock
                            size={20}
                            className="text-purple-600 mt-1 shrink-0"
                          />
                          <div>
                            <p className="text-gray-500 text-xs font-semibold">
                              REQUESTED AT
                            </p>
                            <p className="text-gray-900">
                              {new Date(req.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {req.status === "matched" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(req.id, "in_progress")
                            }
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                          >
                            <Check size={20} />
                            Start Trip
                          </button>
                        )}
                        {req.status === "in_progress" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(req.id, "completed")
                            }
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                          >
                            <Check size={20} />
                            Complete Trip
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Requests to Accept */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
                <Heart size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-xl font-semibold">
                  No pending requests right now
                </p>
                <p className="text-sm mt-2">Check back soon or click Refresh</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {req.user?.fullName || "User"}
                        </h3>
                        {req.user?.phone && (
                          <p className="text-gray-500 text-sm">
                            {req.user.phone}
                          </p>
                        )}
                        <span className={statusBadge(req.status)}>
                          ⏳ Pending
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="text-purple-600 mt-1 shrink-0"
                        />
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            FROM
                          </p>
                          <p className="text-gray-900 font-bold">
                            {req.origin?.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="text-blue-600 mt-1 shrink-0"
                        />
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            TO
                          </p>
                          <p className="text-gray-900 font-bold">
                            {req.destination?.address}
                          </p>
                        </div>
                      </div>
                      {req.notes && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <FileText
                            size={20}
                            className="text-purple-600 mt-1 shrink-0"
                          />
                          <div>
                            <p className="text-gray-500 text-xs font-semibold">
                              NOTES
                            </p>
                            <p className="text-gray-900">{req.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={matchLoading || hasActiveRequest}
                        className={`flex-1 py-3 font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 ${
                          hasActiveRequest
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <Check size={20} />
                        {matchLoading
                          ? "Accepting..."
                          : hasActiveRequest
                            ? "Finish active request first"
                            : "Accept Request"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <NotificationToast
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

export default VolunteerDashboard;

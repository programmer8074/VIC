import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Check,
  X,
  Users,
  UserCheck,
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import adminAPI from "../api/Admin.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  })();

  const [tab, setTab] = useState("volunteers");
  const [volunteers, setVolunteers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null); // ID being actioned
  const [filter, setFilter] = useState("all"); // 'all' | 'unverified' | 'verified'
  const [expanded, setExpanded] = useState(null); // expanded volunteer ID

  // ── Guard: redirect if not logged in ──────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) navigate("/admin");
  }, [navigate]);

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params =
        filter === "unverified"
          ? { verified: false }
          : filter === "verified"
            ? { verified: true }
            : {};
      const res = await adminAPI.listVolunteers(params);
      setVolunteers(res.data);
    } catch (err) {
      setError(err.message || "Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.listUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "volunteers") fetchVolunteers();
    else fetchUsers();
  }, [tab, fetchVolunteers, fetchUsers]);

  // ── Actions ───────────────────────────────────────────────────────
  const handleVerify = async (volunteerId, isVerified) => {
    setActionId(volunteerId);
    try {
      await adminAPI.verifyVolunteer(volunteerId, isVerified);
      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteerId ? { ...v, isVerified } : v)),
      );
    } catch (err) {
      alert(err.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleToggleUser = async (userId) => {
    setActionId(userId);
    try {
      const res = await adminAPI.toggleUserActive(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: res.isActive } : u,
        ),
      );
    } catch (err) {
      alert(err.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const unverifiedCount = volunteers.filter((v) => !v.isVerified).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-white" />
            <div>
              <h1 className="text-xl font-bold">VisionConnect Admin</h1>
              {adminUser && (
                <p className="text-gray-400 text-sm">
                  {adminUser.fullName || adminUser.phone}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {volunteers.length}
            </p>
            <p className="text-gray-500 text-sm">Total Volunteers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {unverifiedCount}
            </p>
            <p className="text-gray-500 text-sm">Pending Verification</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {volunteers.length - unverifiedCount}
            </p>
            <p className="text-gray-500 text-sm">Verified Volunteers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            <p className="text-gray-500 text-sm">Total Users</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab("volunteers")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${tab === "volunteers" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"}`}
          >
            <UserCheck size={18} />
            Volunteers
            {unverifiedCount > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unverifiedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${tab === "users" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"}`}
          >
            <Users size={18} />
            Users
          </button>
          <button
            onClick={() =>
              tab === "volunteers" ? fetchVolunteers() : fetchUsers()
            }
            className="ml-auto flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm font-semibold transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* ── Volunteers Tab ── */}
        {tab === "volunteers" && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {["all", "unverified", "verified"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading...</div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow text-gray-400">
                <UserCheck size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-xl font-semibold">No volunteers found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Main row */}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {vol.user?.fullName?.[0] || "V"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {vol.user?.fullName}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {vol.user?.phone}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${vol.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {vol.isVerified ? "✓ Verified" : "⏳ Unverified"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${vol.isAvailable ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
                            >
                              {vol.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Verify / Revoke button */}
                        {vol.isVerified ? (
                          <button
                            onClick={() => handleVerify(vol.id, false)}
                            disabled={actionId === vol.id}
                            className="flex items-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition disabled:opacity-50 text-sm"
                          >
                            <X size={16} /> Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(vol.id, true)}
                            disabled={actionId === vol.id}
                            className="flex items-center gap-1 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl transition disabled:opacity-50 text-sm"
                          >
                            <Check size={16} />{" "}
                            {actionId === vol.id ? "Verifying..." : "Verify"}
                          </button>
                        )}

                        {/* Expand toggle */}
                        <button
                          onClick={() =>
                            setExpanded(expanded === vol.id ? null : vol.id)
                          }
                          className="p-2 text-gray-400 hover:text-gray-700 transition"
                        >
                          {expanded === vol.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expanded === vol.id && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Languages
                          </p>
                          <p className="text-gray-900 capitalize">
                            {vol.languages?.join(", ") || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Rating
                          </p>
                          <p className="text-gray-900">
                            ⭐ {vol.rating?.average?.toFixed(1) || "0.0"} (
                            {vol.rating?.count || 0} reviews)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Trips Completed
                          </p>
                          <p className="text-gray-900">
                            {vol.tripsCompleted || 0}
                          </p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-gray-500 font-semibold mb-1">
                            Bio
                          </p>
                          <p className="text-gray-900">{vol.bio || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Location
                          </p>
                          <p className="text-gray-900">
                            {vol.location?.address || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Joined
                          </p>
                          <p className="text-gray-900">
                            {new Date(vol.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Users Tab ── */}
        {tab === "users" &&
          (loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.fullName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.fullName}</p>
                      <p className="text-gray-500 text-sm">
                        {user.phone} · {user.language}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.isActive ? "Active" : "Deactivated"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleUser(user.id)}
                    disabled={actionId === user.id}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
                      user.isActive
                        ? "bg-red-50 hover:bg-red-100 text-red-700"
                        : "bg-green-50 hover:bg-green-100 text-green-700"
                    }`}
                  >
                    {actionId === user.id
                      ? "Updating..."
                      : user.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

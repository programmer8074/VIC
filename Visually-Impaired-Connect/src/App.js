import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage";
import RoleSelection from "./pages/RoleSelection";
import SignUpUser from "./pages/SignUpUser";
import SignUpVolunteer from "./pages/SignUpVolunteer";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup-user" element={<SignUpUser />} />
          <Route path="/signup-volunteer" element={<SignUpVolunteer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

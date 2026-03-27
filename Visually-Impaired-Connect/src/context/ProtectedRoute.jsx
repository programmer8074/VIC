import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/**
 * Wraps routes that require authentication.
 * Optionally restricts to specific roles.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute allowedRoles={['volunteer']}>
 *     <VolunteerDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Still restoring session from localStorage — don't redirect yet
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  // Not logged in — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — send to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <Navigate
        to={
          user?.role === "volunteer"
            ? "/volunteer-dashboard"
            : "/user-dashboard"
        }
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;

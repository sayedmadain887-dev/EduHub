import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wraps a route and blocks access unless the user is logged in.
 * If "adminOnly" is true, it also blocks access unless the
 * logged-in user's role is "admin".
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, user, isLoading } = useAuth();

  // Wait until we know the real auth status before deciding anything,
  // otherwise we might redirect a logged-in user by mistake while
  // their session is still being verified.
  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// route guard component to restrict access based on authentication and user roles
export default function ProtectedRoute({ children, allowedRoles }) {
  // retrieve current authenticated user and loading state from auth context
  const { user, loading } = useAuth();

  // display loading indicator while verifying user session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // redirect unauthenticated visitors to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // redirect users whose role is not permitted for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // render protected child component if all checks pass
  return children;
}

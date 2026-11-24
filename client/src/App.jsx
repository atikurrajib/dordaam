import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// root application component configuring authentication context and client-side routing
export default function App() {
  return (
    // wrap entire application with global authentication state provider
    <AuthProvider>
      {/* enable html5 history-based routing */}
      <BrowserRouter>
        <Routes>
          {/* public landing page route */}
          <Route path="/" element={<Home />} />

          {/* public authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected role-based workspace route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* fallback route redirecting unknown urls to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

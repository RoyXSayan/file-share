// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // 👈 stored after login

  if (!token) {
    // If no token → redirect to login/signup
    return <Navigate to="/auth" replace />;
  }

  return children; // ✅ Allow access if token exists
}

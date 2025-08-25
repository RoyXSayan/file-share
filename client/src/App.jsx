// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import FileUpload from "./pages/FileUpload";
import { Toaster } from "sonner";
import LoginSignup from "./auth/LoginSignup";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Home /> : <LandingPage />} />
        <Route path="/auth" element={<LoginSignup />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <FileUpload />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

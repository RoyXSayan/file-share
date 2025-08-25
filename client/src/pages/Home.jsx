import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, FolderOpen, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 opacity-30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 opacity-30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 opacity-20 rounded-full blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="text-2xl font-extrabold tracking-tight ml-5">
          <span className="text-white">File</span>
          <span className="text-blue-600">Share</span>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-200 font-medium">
                Hi, {user.username}
              </span>
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 cursor-pointer"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <img
                    src={
                      user.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-black  border border-white/10 rounded-lg shadow-lg">
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-t-lg"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:scale-105 transition"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center lg:mt-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Welcome to <span className="text-white">File</span> <span className="text-blue-600">Share</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            The easiest way to upload, manage, and share your files securely
            with anyone, anywhere.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          <Link
            to="/upload"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg"
          >
            <Upload className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Upload File</h3>
            <p className="text-sm text-gray-400">Share instantly with a link</p>
          </Link>

          <Link
            to="/dashboard"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg"
          >
            <FolderOpen className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">My Dashboard</h3>
            <p className="text-sm text-gray-400">Manage all your files</p>
          </Link>

          <Link
            to="/recent"
            className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg"
          >
            <Clock className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Recent Files</h3>
            <p className="text-sm text-gray-400">Quick access to uploads</p>
          </Link>
        </motion.div>

        {/* Illustration */}
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/875/875646.png"
          alt="file sharing"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-72 mt-16 drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Home;

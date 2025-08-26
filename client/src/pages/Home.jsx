import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Upload, FolderOpen, Clock, ShieldCheck, Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-950 text-white overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 opacity-30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 opacity-30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-gradient-to-r from-pink-400 via-red-500 to-orange-400 opacity-20 rounded-full blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
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
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-black border border-white/10 rounded-lg shadow-lg">
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
                        navigate("/settings");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10"
                    >
                      Settings
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
      <section className="flex flex-col items-center justify-center px-6 text-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Share Files <span className="text-blue-600">Securely</span>, <br /> Anytime, Anywhere.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            Upload, protect, and share your files with futuristic simplicity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          <Link to="/upload" className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg">
            <Upload className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Upload File</h3>
            <p className="text-sm text-gray-400">Share instantly with a link</p>
          </Link>

          <Link to="/dashboard" className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg">
            <FolderOpen className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">My Dashboard</h3>
            <p className="text-sm text-gray-400">Manage all your files</p>
          </Link>

          <Link to="/dashboard" className="flex flex-col items-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition transform hover:-translate-y-1 shadow-lg">
            <Clock className="w-10 h-10 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold">Recent Files</h3>
            <p className="text-sm text-gray-400">Quick access to uploads</p>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <h2 className="text-3xl font-bold text-center mb-12">Why FileShare?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { icon: ShieldCheck, title: "Secure & Encrypted", desc: "Your files are protected with top-grade security." },
            { icon: Share2, title: "Instant Sharing", desc: "Generate links and share them in seconds." },
            { icon: Sparkles, title: "Futuristic UI", desc: "Smooth, modern, and easy to use interface." },
          ].map((feature, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-lg text-center">
              <feature.icon className="w-12 h-12 mx-auto text-blue-500" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 text-center bg-black/30 backdrop-blur-lg">
        <h2 className="text-3xl font-bold mb-10">Trusted Worldwide 🌍</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <h3 className="text-4xl font-extrabold text-blue-500">1M+</h3>
            <p className="text-gray-400">Files Shared</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-pink-500">50k+</h3>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-yellow-400">99.9%</h3>
            <p className="text-gray-400">Uptime Guarantee</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 bg-black/50 border-t border-white/10 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} FileShare. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;

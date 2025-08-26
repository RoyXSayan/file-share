import { useEffect, useState } from "react";
import { loginUser, signupUser } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  // ✅ password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!isLogin) {
      if (!formData.username.trim()) {
        toast.error("Username is required");
        return false;
      }
      if (!passwordRegex.test(formData.password)) {
        toast.error(
          "Password must be at least 6 chars, include uppercase, lowercase, number & symbol"
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        login(res.data.user, res.data.token);
        toast.success("Login Successful");
        navigate("/");
      } else {
        const res = await signupUser(formData);
        if (res.data.user && res.data.token) {
          login(res.data.user, res.data.token);
          toast.success("Signup Successful Please login");
          navigate("/");
        } else {
          toast.error("Signup Failed, try again");
          setIsLogin(true);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="w-full bg-black/50 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-white">File</span>
            <span className="text-blue-600">Share</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex space-x-6 text-gray-400 text-sm">
            <a href="/" className="hover:text-white transition">
              Home
            </a>
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
            <a href="#contact" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Content Section */}
      <div className="flex flex-1 pt-20">
        {/* Left Panel - Auth Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-black/40 backdrop-blur-xl">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500 flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-3xl font-bold mt-4">
                {isLogin ? "Login" : "Sign Up"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {isLogin
                  ? "Welcome back! Please login."
                  : "Create a new account."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-2 rounded-lg font-semibold shadow-lg hover:opacity-90 transition"
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-gray-400 mt-4 text-sm">
              {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 font-semibold hover:underline"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
          {/* Dark Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-800 to-gray-900 opacity-40 blur-3xl animate-pulse"></div>
          <div className="relative z-10 text-center max-w-lg px-6">
            <h1 className="text-5xl font-extrabold mb-4">Welcome.</h1>
            <p className="text-gray-300 text-lg">
              Secure, fast and modern way to share files with anyone, anywhere.
              Login or create an account to start sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/LandingPage.jsx
import React from "react";
import { ArrowRight, Upload, Shield, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700">
        <div className="text-2xl font-extrabold tracking-tight ml-5">
          <span className="text-white">File</span>
          <span className="text-blue-600">Share</span>
        </div>
        <nav className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-blue-400 transition">
            Features
          </a>
          <a href="#how" className="hover:text-blue-400 transition">
            How It Works
          </a>
          <a href="#faq" className="hover:text-blue-400 transition">
            FAQ
          </a>
        </nav>
        <RouterLink
          to="/auth"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition"
        >
          Get Started
        </RouterLink>
      </header>

      {/* Hero Section */}
      <section className=" mt-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Share Files <span className="text-blue-400">Securely</span> <br /> in
          Seconds
        </h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          Upload, share, and access your files anytime, anywhere. Fast,
          reliable, and completely secure.
        </p>
        <div className="mt-6 flex gap-4">
          <RouterLink
            to="/auth"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-lg font-semibold flex items-center gap-2 shadow-lg transition"
          >
            Start Sharing <ArrowRight size={20} />
          </RouterLink>
          <RouterLink
            to="/auth"
            className="px-6 py-3 border border-gray-500 hover:bg-gray-800 rounded-xl text-lg font-semibold transition"
          >
            Create Account
          </RouterLink>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-900 px-6 mt-4">
        <h3 className="text-3xl font-bold text-center mb-12">
          Why Choose <span className="text-blue-400">FileShare</span>?
        </h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition">
            <Upload className="text-blue-400 mb-4" size={40} />
            <h4 className="text-xl font-semibold mb-2">Instant Uploads</h4>
            <p className="text-gray-400">
              Upload files in just a few clicks with blazing-fast speed.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition">
            <Shield className="text-blue-400 mb-4" size={40} />
            <h4 className="text-xl font-semibold mb-2">Secure Sharing</h4>
            <p className="text-gray-400">
              Your files are encrypted and only accessible via secure links.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:scale-105 transition">
            <Link className="text-blue-400 mb-4" size={40} />
            <h4 className="text-xl font-semibold mb-2">Easy Links</h4>
            <p className="text-gray-400">
              Share unique links with anyone – no signup required for
              recipients.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-700 text-center text-gray-400">
        <p>© {new Date().getFullYear()} FileShare. Built with ❤️ by Sayan.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

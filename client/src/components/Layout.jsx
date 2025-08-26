import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      {/* Fixed navbar at the very top  and always visible */}
      <Navbar onMenu={() => setOpen(true)} />

      {/* Sidebar */}
      {isAuthenticated && <Sidebar open={open} setOpen={setOpen} />}
      {/* Overlays for mobile (click outside to close) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Page content area: leave room for navbar (pt-14) and the fixed sidebar on lg (lg:pl-72). */}
      <main className={`pt-14 ${isAuthenticated ? "lg:pl-72" : ""}`}>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

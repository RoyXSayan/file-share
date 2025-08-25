import { useEffect, useState } from "react";
import { FileInput, LogOut, Menu, Moon, Sun, User } from "lucide-react";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// shadcn/ui imports
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ProfileDialog from "./ProfileDialog";

export default function Navbar({ onMenu }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.documentElement;
    if (dark) {
      el.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      el.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/");
    navigate("/", { replace: true });
    window.location.href = "/";
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-14 bg-slate-900/90 backdrop-blur border-b border-white/10">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Mobile Menu Button*/}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
          onClick={onMenu}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-tight ml-9">
          <span className="text-slate-900 dark:text-white">File</span>
          <span className="text-blue-600">Share</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDark((v) => !v)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            // Avatar Dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="mr-1 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
                  aria-label="User menu"
                >
                  {/* Profile Picture or initials */}
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "FS"}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                className="w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-lg p-1 mt-2"
              >
                <ProfileDialog />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // If not logged in → show Login + Signup
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/auth")}
                className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-3 py-1 text-sm rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

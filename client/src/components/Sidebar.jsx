// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUpload,
  FaTachometerAlt,
  FaCog,
  FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const { user } = useAuth(); // subscribe to context

  if (!user) return null;

  const links = [
    { to: "/", label: "Home", icon: <FaHome /> },
    { to: "/upload", label: "Upload", icon: <FaUpload /> },
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/friends", label: "Friends", icon: <FaUserFriends /> },
    { to: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <aside
      className={`fixed z-50 left-0 h-full w-72 bg-white dark:bg-slate-950
      border-r border-slate-200/60 dark:border-slate-800/60
      transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:top-14 lg:h-[calc(100vh-3.5rem)]`}
    >
      <div className="p-6 space-y-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-lg font-medium transition-colors ${
                isActive
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <span className="text-xl transition-transform duration-200 ease-in-out hover:scale-110">
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

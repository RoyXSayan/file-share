// src/pages/Settings.jsx
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import API_BASE_URL from "@/config";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || null);
  const [loading, setLoading] = useState(false);
  const [username] = useState(user?.username || "");
  const [email] = useState(user?.email || "");
  const fileInputRef = useRef();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/upload-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAvatarPreview(data.user.profilePic);
      }
    } catch (err) {
      console.error("Error uploading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account permanently?"))
      return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        logout();
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full p-6 bg-base-200 overflow-y-auto">
      {/* Profile Card */}
      <div className="card shadow-lg bg-base-100 p-6 mb-6 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border border-gray-300 dark:border-slate-700 shadow"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 shadow"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Editable Info */}
        <div className="w-full space-y-3">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <div className="input input-bordered w-full">{username}</div>
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="input input-bordered w-full">{email}</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card shadow-lg bg-base-100 p-6">
        <h2 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h2>
        <Button
          variant="destructive"
          className="w-full mb-2"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
          disabled={loading}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

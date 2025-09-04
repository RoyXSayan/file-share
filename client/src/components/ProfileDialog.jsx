import { useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import API_BASE_URL from "@/config";

export default function ProfileDialog() {
  const { user, setUser, logout } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file)); // temporary preview
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
      } else {
        console.error("Upload failed:", data.message || data.error);
      }
    } catch (err) {
      console.error("Error uploading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account?"))
      return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        logout(); // clear context + localStorage
        window.location.href = "/"; // redirect home
      } else {
        const err = await res.json();
        alert("Failed to delete account: " + err.message);
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
          <User className="h-4 w-4" />
          Profile
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 z-[9999] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Your Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 mt-4">
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

          {/* Info */}
          <div className="text-center">
            <p className="font-semibold text-lg">
              {user?.username || "User Name"}
            </p>
            <p className="text-sm text-gray-500">
              {user?.email || "user@example.com"}
            </p>
            <p className="text-sm text-gray-500">
              Joined:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "NA"}
            </p>
          </div>

          {loading && <p className="text-sm text-gray-500">Processing...</p>}
        </div>

        <DialogFooter className="flex justify-between mt-6">
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
          </Button>
          <Button variant="outline" onClick={logout} disabled={loading}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

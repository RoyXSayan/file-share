// src/pages/Dashboard.jsx
import { motion } from "framer-motion";
import {
  File,
  Link as LinkIcon,
  HardDrive,
  Activity,
  Pencil,
  Trash2,
  Lock,
  Download,
  QrCode
} from "lucide-react";
import { FaWhatsapp, FaTelegram, FaEnvelope } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCodeModern from "@/components/QRCodeModern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy } from "lucide-react"; // 👈 add this at the top

export default function Dashboard() {
  const [stats, setStats] = useState({
    files: 0,
    totalStorage: 0,
    users: 0,
    activeUsers: 0,
  });

  const [recentUploads, setRecentUploads] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [fileDetails, setFileDetails] = useState(null); // after password check
  const [password, setPassword] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const token = localStorage.getItem("token");

  // fetch stats from the server
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/files/user-stats", {
          headers: {
            Authorization: `Bearer ${token}`, // attach token here
          },
        });
        const userData = await res.json();
        // fetch global stats for users + active users
        const resGlobal = await fetch("http://localhost:5000/api/stats");
        const globalData = await resGlobal.json();

        if (userData.success && globalData.success) {
          setStats({
            files: userData.files, //individual user files
            totalStorage: userData.totalStorage, //individual user storage
            users: globalData.users, // global total users
            activeUsers: globalData.activeUsers, // global active users
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    if (token) fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // fetch files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // const res = await fetch("http://localhost:5000/files/uploads");
        const res = await fetch("http://localhost:5000/files/uploads", {
          headers: {
            Authorization: `Bearer ${token}`, // attach token here
          },
        });

        const data = await res.json();
        if (data.success) {
          setRecentUploads(data.files);
        }
      } catch (error) {
        console.log("Error fetching Files:", error);
      }
    };
    if (token) fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔐 check password + fetch file
  const handleAccessFile = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/files/download/${selectedFile._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setFileDetails(data.file); // ✅ unlocked file
        toast.success("Unlocked successfully!");
      } else {
        toast.error(data.message || "Wrong password");
      }
    } catch (err) {
      toast.error("Error verifying password", err);
    }
  };

  // delete handler
  const handleDelete = async () => {
    if (!selectedFile) return;

    try {
      // const res = await fetch(
      //   `http://localhost:5000/files/${selectedFile._id}`,
      //   { method: "DELETE" }
      // );
      const res = await fetch(
        `http://localhost:5000/files/${selectedFile._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // add this
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setRecentUploads((prev) =>
          prev.filter((f) => f._id !== selectedFile._id)
        );
        setSelectedFile(null);
        toast.success("🗑️ File deleted successfully");
      } else {
        toast.error(data.message || "🚨 Delete failed");
      }
    } catch (err) {
      toast.error(err.message || "🚨 Delete failed");
    }
  };

  // rename handler
  const handleRename = async () => {
    if (!selectedFile || !newName.trim()) return;

    try {
      // const res = await fetch(
      //   `http://localhost:5000/files/${selectedFile._id}/rename`,
      //   {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ newName }),
      //   }
      // );

      const res = await fetch(
        `http://localhost:5000/files/${selectedFile._id}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // add this
          },
          body: JSON.stringify({ newName }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ File renamed successfully");
        setRecentUploads((prev) =>
          prev.map((f) =>
            f._id === selectedFile._id
              ? { ...f, filename: data.file.filename, url: data.file.url }
              : f
          )
        );
        setSelectedFile(data.file);
        setRenaming(false);
        setNewName("");
      } else {
        toast.error(data.message || "🚨 Rename failed");
      }
    } catch (err) {
      toast.error(err.message || "🚨 Rename failed");
    }
  };

  // convert storage from bytes to MB/GB
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 MB";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const cards = [
    {
      label: "Files Uploaded by You",
      value: stats.files,
      icon: <File className="w-5 h-5 text-indigo-500" />,
    },
    {
      label: "Storage Used",
      value: formatBytes(stats.totalStorage),
      icon: <HardDrive className="w-5 h-5 text-pink-500" />,
    },
    {
      label: "Global Users",
      value: stats.users,
      icon: <LinkIcon className="w-5 h-5 text-green-500" />,
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: <Activity className="w-5 h-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <motion.div
            key={c.label}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 
                   bg-white/80 dark:bg-slate-950/80 p-5 shadow-sm backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
                {c.icon}
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {c.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{c.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Welcome Section */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-2">Welcome 👋</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Use the sidebar to upload a file, then you’ll get a shareable link and
          QR code. Your recent uploads and links will appear here soon.
        </p>
      </motion.div>

      {/* Recent Uploads */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 p-6 shadow-sm backdrop-blur-md"
      >
        <h3 className="text-lg font-semibold mb-4">Recent Uploads </h3>
        <div className="space-y-4">
          {recentUploads.length > 0 ? (
            recentUploads.map((file) => (
              <button
                key={file._id}
                onClick={() => {
                  setSelectedFile(file);
                  setFileDetails(null);
                  setPassword("");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition text-left"
              >
                {/* left side */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    <File className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {file.filename}
                      {file.hasPassword && (
                        <Lock className="w-4 h-4 text-red-500" />
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {/* Right side: downloads + time */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                    <Download className="w-4 h-4" /> {file.downloads || 0}
                  </div>
                  <span className="text-sm text-slate-400">
                    {new Date(file.createdAt).toLocaleString()}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No uploads yet.</p>
          )}
        </div>
      </motion.div>

      {/* File Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-md">
          {selectedFile && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between w-full">
                  {/* Left side: filename OR input box */}
                  {!renaming ? (
                    <DialogTitle className="text-white">
                      {selectedFile.filename}
                    </DialogTitle>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        className="h-8 text-sm flex-1"
                        autoFocus
                      />
                      <Button
                        onClick={handleRename}
                        className="bg-green-600 text-white h-8 px-3 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setRenaming(false);
                          setNewName("");
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Right side: action icons */}
                  {!renaming && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setRenaming(true);
                          setNewName(selectedFile.filename.split(".")[0]);
                        }}
                        className="p-2 rounded hover:bg-slate-700 transition"
                      >
                        <Pencil className="w-5 h-5 text-slate-200" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2 rounded hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* 🔐 If file locked and not unlocked */}
              {selectedFile.hasPassword && !fileDetails && (
                <div className="flex flex-col gap-4">
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button onClick={handleAccessFile} className="w-full">
                    Unlock File
                  </Button>
                </div>
              )}

              {/* 📄 If file unlocked OR no password required */}
              {(!selectedFile.hasPassword || fileDetails) && (
                <div className="flex flex-col items-center space-y-4">
                  {/* 🔥 Preview block */}
                  <div className="w-full border rounded-lg p-3 flex justify-center items-center bg-slate-50 dark:bg-slate-900">
                    {selectedFile.filename.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i
                    ) ? (
                      <img
                        src={fileDetails?.url || selectedFile.url}
                        alt="Preview"
                        className="max-h-48 object-contain rounded"
                      />
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        📄 {selectedFile.filename}
                      </div>
                    )}
                  </div>

                  {/* Show QR button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setQrOpen(true)}
                  >
                    Show QR Code <QrCode className="mt-0.5"/>
                  </Button>

                  <div className="text-center w-full">
                    <p className="text-sm text-slate-500 mb-1">Share Link:</p>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-900 mb-4">
                      <span className="flex-1 text-sm truncate">
                        {fileDetails?.url || selectedFile.url}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            fileDetails?.url || selectedFile.url
                          );
                          toast.success("Link copied!");
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>

                    {/* Download button */}
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `http://localhost:5000/files/download/${selectedFile._id}`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: selectedFile.hasPassword
                                ? JSON.stringify({ password })
                                : null,
                            }
                          );
                          const data = await res.json();
                          if (data.success) {
                            window.open(data.file.url, "_blank");
                            setRecentUploads((prev) =>
                              prev.map((f) =>
                                f._id === selectedFile._id
                                  ? { ...f, downloads: (f.downloads || 0) + 1 }
                                  : f
                              )
                            );
                            setSelectedFile((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    downloads: (prev.downloads || 0) + 1,
                                  }
                                : prev
                            );
                          } else {
                            toast.error(data.message || "Download Failed");
                          }
                        } catch (error) {
                          toast.error("Download Failed", error);
                        }
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>

                    {/* Social Share */}
                    <div className="mt-4 w-full text-center">
                      <p className="text-sm text-slate-500 mb-2">Share with:</p>
                      <div className="flex justify-center gap-4">
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            fileDetails?.url || selectedFile.url
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-green-500 text-white hover:scale-110 transition"
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </a>

                        {/* Telegram */}
                        <a
                          href={`https://t.me/share/url?url=${encodeURIComponent(
                            fileDetails?.url || selectedFile.url
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-sky-500 text-white hover:scale-110 transition"
                        >
                          <FaTelegram className="w-5 h-5" />
                        </a>

                        {/* Email */}
                        <a
                          href={`mailto:?subject=Shared File&body=Here is the file link: ${
                            fileDetails?.url || selectedFile.url
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-red-500 text-white hover:scale-110 transition"
                        >
                          <FaEnvelope className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share via QR</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <QRCodeModern fileLink={fileDetails?.url || selectedFile?.url} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

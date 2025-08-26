import { useState } from "react";
import {
  Upload,
  File,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
  Lock,
} from "lucide-react";
import { FaWhatsapp, FaTelegramPlane, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fileLink, setFileLink] = useState("");
  const [password, setPassword] = useState(""); // <-- NEW
  const [email, setEmail] = useState("");

  const handleSendEmail = async () => {
    if (!email) return toast.error("Enter an email address");

    try {
      const res = await fetch("http://localhost:5000/files/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fileLink }),
      });
      const data = await res.json();
      if (data.success) toast.success("Email sent successfully!");
      else toast.error("Failed to send email");
    } catch (err) {
      toast.error("Error sending email", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      setFile(null);
      return;
    }
    setFile(selected);
    setProgress(0);
    setError("");
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setError("");
    setSuccess(false);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    if (password.trim()) {
      formData.append("password", password); // ✅ attach password
    }

    try {
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem("token"); //grab the save token
      xhr.open("POST", "http://localhost:5000/files/upload", true);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);

          toast.loading(`Uploading... ${percent}%`, {
            id: "upload-progress",
          });
        }
      };

      xhr.onload = () => {
        toast.dismiss("upload-progress");
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setSuccess(true);
            setFileLink(response.file.url);
            setUploadedFile(response.file);
            toast.success("File uploaded successfully!");
          } else {
            setError("Upload failed. Try again.");
            toast.error("Upload failed. Try again.");
          }
        } else {
          setError("Server error. Please try again.");
          toast.error("Server error. Please try again.");
        }
      };

      xhr.onerror = () => {
        toast.dismiss("upload-progress");
        setError("Network error. Please check your connection.");
        toast.error("Network error. Please check your connection.");
      };

      xhr.send(formData);
    } catch (err) {
      toast.dismiss("upload-progress");
      setError("Something went wrong.", err);
      toast.error("Something went wrong.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileLink);
    toast.success("Copied to clipboard!");
  };

  const humanFileSize = (size) => {
    if (!size) return "0 B";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      " " +
      ["B", "KB", "MB", "GB", "TB"][i]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {file || uploadedFile ? "Your Uploaded File" : "Upload Your File"}
        
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-400 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        

        {/* Upload Box */}
        {!file && !uploadedFile && !success && (
          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-400 transition-colors rounded-xl py-10 px-6 bg-gray-800/50 hover:bg-gray-800/70"
          >
            <Upload className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-gray-300">
              Drag & drop or{" "}
              <span className="text-blue-400 font-semibold">browse</span>
            </p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {/* File Preview */}
        {file && !success && (
          <>
            {/* Password Input */}
            {!success && (
              <div className="mb-4 mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Optional Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for no password"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none"
                />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-gray-900/60 border border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-blue-400" />
                <span className="text-sm text-gray-200">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-red-400" />
              </button>
            </motion.div>
          </>
        )}

        {/* Progress Bar */}
        {progress > 0 && progress < 100 && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="h-3 bg-blue-500 rounded-full"
              />
            </div>
            <p className="mt-2 text-sm text-gray-300 text-center">
              {progress}%
            </p>
          </div>
        )}

        {/* Upload Button */}
        {!success && (
          <button
            onClick={handleUpload}
            disabled={!file || progress > 0}
            className={`relative mt-6 w-full py-3 rounded-xl overflow-hidden font-semibold shadow-lg transition-colors ${
              !file || progress > 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="absolute top-0 left-0 h-full bg-blue-600"
            />
            <span className="relative z-10 text-white">
              {progress === 0
                ? "Upload"
                : progress < 100
                ? `Uploading... ${progress}%`
                : "Processing..."}
            </span>
          </button>
        )}

        {/* Success UI */}
        {success && uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-4"
          >
            <div className="p-4 rounded-xl bg-gray-900/70 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">File Details:</p>
              <p className="text-gray-200 text-sm">📄 {file?.name}</p>
              <p className="text-gray-400 text-sm">
                Size: {humanFileSize(file?.size)}
              </p>
              <p className="text-gray-400 text-sm">Expires: 24 hours</p>
              {uploadedFile.hasPassword && (
                <p className="text-red-400 text-sm">🔒 Password Protected</p>
              )}
            </div>

            {/* Share link */}
            <div className="p-4 rounded-xl bg-blue-600/20 border border-blue-500">
              <p className="text-sm text-blue-300 mb-2">Share Link:</p>
              <div className="flex items-center justify-between gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="truncate text-sm">{fileLink}</span>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <Copy className="w-4 h-4 text-blue-400" />
                  </button>
                  <a
                    href={fileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-green-400" />
                  </a>
                  {/* Modern Share Icons */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(fileLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded-lg text-green-500"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      fileLink
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded-lg text-blue-400"
                  >
                    <FaTelegramPlane className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      fileLink
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded-lg text-blue-600"
                  >
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Email Share */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700 space-y-2">
              <p className="text-sm text-gray-400 mb-2">Send via Email:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter recipient email"
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Social Share */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Share on:</p>
              <div className="flex gap-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(fileLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-green-500 rounded-lg"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    fileLink
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-400 rounded-lg"
                >
                  Telegram
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    fileLink
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-700 rounded-lg"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { User, Loader2, UserPlus, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import API_BASE_URL from "@/config";

const Friends = () => {
  const { user } = useAuth();

  // ----- Friends state -----
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]); // incoming requests
  const [sentRequests, setSentRequests] = useState([]); // outgoing requests
  const [loading, setLoading] = useState(true);

  // ----- Connections state -----
  const [connectionRequests, setConnectionRequests] = useState([]); // pending QR connections
  const [currentConnectToken, setCurrentConnectToken] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const webcamRef = useRef(null);

  // --------------------------
  // Fetch Friends + Connections
  // --------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ---- Fetch all users ----
        const resUsers = await fetch(`${API_BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const users = await resUsers.json();

        const me = users.find((u) => u._id === user?.id);
        if (!me) return;

        const incoming = me.friendRequests || [];
        const outgoing = me.sentRequests || [];
        const myFriends = users.filter((u) => me.friends?.includes(u._id));

        setRequests(incoming);
        setSentRequests(outgoing);
        setFriends(myFriends);

        // filter "find friends" list
        const filtered = users.filter(
          (u) =>
            u._id !== user?.id &&
            !me.friends?.includes(u._id) &&
            !incoming.includes(u._id) &&
            !outgoing.includes(u._id)
        );
        setAllUsers(filtered);

        // ---- Fetch pending connection requests ----
        const resConnections = await fetch(
          `${API_BASE_URL}/api/connections/pending`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (resConnections.ok) {
          const conns = await resConnections.json();
          setConnectionRequests(
            Array.isArray(conns.pending) ? conns.pending : []
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // --------------------------
  // Friend Handlers
  // --------------------------
  const handleAddFriend = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/friends/request/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSentRequests((prev) => [...prev, id]);
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  const handleAccept = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/friends/accept/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFriends((prev) => [...prev, allUsers.find((u) => u._id === id)]);
      setRequests((prev) => prev.filter((rid) => rid !== id));
    } catch (err) {
      console.error("Error accepting:", err);
    }
  };

  const handleDecline = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/friends/decline/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests((prev) => prev.filter((rid) => rid !== id));
    } catch (err) {
      console.error("Error declining:", err);
    }
  };

  // --------------------------
  // Connection Handlers
  // --------------------------
  const handleConnect = async (friendId) => {
    const token = `${friendId}-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ from: user.id, to: friendId, token }),
      });
      if (res.ok) {
        setCurrentConnectToken(token);
        setShowQRModal(true);
      }
    } catch (err) {
      console.error("Error creating connection:", err);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/connections/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ token: data }),
          }
        );
        if (res.ok) {
          const resp = await res.json();
          window.location.href = `/connection/${resp.connectionId}`;
        }
      } catch (err) {
        console.error("Error verifying:", err);
      } finally {
        setShowScanner(false);
      }
    }
  };

  // --------------------------
  // QR Scanner Effect (Webcam + jsQR)
  // --------------------------
  useEffect(() => {
    if (!showScanner) return;
    const interval = setInterval(() => {
      const video = webcamRef.current?.video;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        handleScan(code.data);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [showScanner]);

  // --------------------------
  // UI
  // --------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white space-y-12 max-w-3xl mx-auto">
      {/* -------- Friends Section -------- */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold">Friends</h2>

        {/* Friend Requests */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500 italic">No pending requests.</p>
          ) : (
            requests.map((id) => {
              const u = allUsers.find((usr) => usr._id === id);
              if (!u) return null;
              return (
                <div
                  key={u._id}
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700 mb-2"
                >
                  <span>{u.username}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(u._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center gap-1"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleDecline(u._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg flex items-center gap-1"
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Current Friends */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Friends</h3>
          {friends.length === 0 ? (
            <p className="text-gray-500 italic">You have no friends yet.</p>
          ) : (
            friends.map((f) => (
              <div
                key={f._id}
                className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700 mb-2"
              >
                <span>{f.username}</span>
                <button
                  onClick={() => handleConnect(f._id)}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg"
                >
                  Connect
                </button>
              </div>
            ))
          )}
        </div>

        {/* Find Friends */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Find Friends</h3>
          {allUsers.length === 0 ? (
            <p className="text-gray-500 italic">No other users found.</p>
          ) : (
            allUsers.map((u) => (
              <div
                key={u._id}
                className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700 mb-2"
              >
                <span>{u.username}</span>
                {sentRequests.includes(u._id) ? (
                  <button
                    disabled
                    className="px-3 py-1 bg-gray-400 text-white rounded-lg opacity-70"
                  >
                    Pending
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddFriend(u._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center gap-1"
                  >
                    <UserPlus size={16} /> Add
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* -------- Connections Section -------- */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold">Connections</h2>

        {/* Pending Connection Requests */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Pending</h3>
          {connectionRequests.length === 0 ? (
            <p className="text-gray-500 italic">No pending connections.</p>
          ) : (
            connectionRequests.map((req) => (
              <div
                key={req._id}
                className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700 mb-2"
              >
                <span>{req.from.username} wants to connect</span>
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg"
                >
                  Open Scanner
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold text-center mb-4">
                Scan to Connect
              </h2>
              <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <QRCode value={currentConnectToken} size={200} />
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Modal (react-webcam + jsQR) */}
      <AnimatePresence>
        {showScanner && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[360px]">
              <h2 className="text-xl font-bold text-center mb-4">Scan QR</h2>
              <div className="flex justify-center">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/png"
                  style={{
                    width: "320px",
                    height: "320px",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <button
                onClick={() => setShowScanner(false)}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;

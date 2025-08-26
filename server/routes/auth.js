import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import cloudinary from "cloudinary";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (buffer storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    // remove password before sending
    const { password: _, ...userData } = newUser.toObject();

    res
      .status(201)
      .json({ message: "User created successfully", user: userData });
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
});

// 🔹 Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// 🔹 Upload Profile Picture
router.post(
  "/upload-profile",
  auth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: "profile_pics" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ message: "Upload failed", error });
          }

          const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: result.secure_url },
            { new: true }
          ).select("-password");

          res.json({ success: true, user });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);


// ✅ Get current logged-in user (with createdAt)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user); // <--- send plain user, not { user }
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});



// 🔹 Delete Account
router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: err.message });
  }
});

export default router;

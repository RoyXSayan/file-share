import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import fileRoutes from "./routes/fileRoutes.js";
import statsRouter from "./routes/stats.js";
import authRoutes from "./routes/auth.js";
import auth from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", statsRouter);
app.use("/api/auth", authRoutes);

app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "This is a Protected route", userId: req.user });
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/files", fileRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);

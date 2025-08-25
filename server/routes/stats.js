// routes/stats.js
import express from "express";
import User from "../models/User.js";
import File from "../models/File.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const files = await File.countDocuments();
    const totalStorage = await File.aggregate([
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);

    const activeUsers = await User.countDocuments({ status: "active" });

    res.json({
      success: true,
      users,
      files,
      totalStorage: totalStorage[0]?.total || 0,
      activeUsers,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

export default router;

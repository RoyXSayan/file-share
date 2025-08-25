import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import bcrypt from "bcryptjs";
import FileModel from "../models/File.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    let folder = "file-share-app/others";
    let resource_type = "raw";

    // check file mimetype and categorize accordingly
    if (file.mimetype.startsWith("image/")) {
      folder = "file-share-app/images";
      resource_type = "image";
    } else if (file.mimetype === "application/pdf") {
      folder = "file-share-app/pdfs";
      resource_type = "raw"; // pdfs are raw resources
    } else if (file.mimetype.startsWith("audio/")) {
      folder = "file-share-app/music";
      resource_type = "video";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "file-share-app/videos";
      resource_type = "video";
    } else {
      folder = "file-share-app/others";
      resource_type = "raw";
    }

    return {
      folder,
      resource_type,
      public_id: file.originalname.split(".")[0],
      overwrite: true,
    };
  },
});
const upload = multer({ storage });

/** Upload (optional password) */
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    console.log("🔑 req.user:", req.user);


    // normalize password input
    const rawPassword = (req.body?.password ?? "").toString();
    const passwordHash =
      rawPassword.trim().length > 0 ? await bcrypt.hash(rawPassword, 10) : null;

    const url = req.file.path || req.file.secure_url; // cloudinary url
    const publicId = req.file.filename || req.file.public_id; // cloudinary public_id

    const file = await FileModel.create({
      filename: req.file.originalname,
      size: req.file.size,
      url,
      public_id: publicId,
      passwordHash,
      user: req.user.id,
    });

    // return safe payload
    res.json({
      success: true,
      file: {
        _id: file._id,
        filename: file.filename,
        size: file.size,
        url: file.url, // kept for compatibility with your UI
        createdAt: file.createdAt,
        hasPassword: !!file.passwordHash,
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Upload Route
// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No file uploaded" });
//     }

//     const file = await FileModel.create({
//       filename: req.file.originalname,
//       size: req.file.size,
//       url: req.file.path || req.file.secure_url,
//       public_id: req.file.filename || req.file.public_id,
//     });

//     res.json({ success: true, file });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({ success: false, message: "Upload failed" });
//   }
// });

// Recent Uploads (safe response)
router.get("/uploads", auth, async (req, res) => {
  try {
    const files = await FileModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // const safeFiles = files.map((file) => ({
    //   _id: file._id,
    //   filename: file.filename,
    //   url: file.url,
    //   size: file.size,
    //   createdAt: file.createdAt,
    // }));

    const safeFiles = files.map((file) => ({
      _id: file._id,
      filename: file.filename,
      size: file.size,
      createdAt: file.createdAt,
      downloads: file.downloads || 0,
      url: file.passwordHash ? null : file.url, // hide if locked
      hasPassword: !!file.passwordHash,
    }));

    res.json({ success: true, files: safeFiles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch uploads" });
  }
});

// Delete a file
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileModel.findById(id);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    if (file.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    console.log("🗑️ Deleting from Cloudinary:", file.public_id);
    await cloudinary.v2.uploader.destroy(file.public_id);

    await FileModel.findByIdAndDelete(id);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res
      .status(500)
      .json({ success: false, message: "Delete failed", error: error.message });
  }
});

// Rename file
router.put("/:id/rename", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    console.log("🟢 Rename request:", { id, newName });

    const file = await FileModel.findById(id);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    if (file.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const ext = file.filename.split(".").pop();
    const finalName = `${newName}.${ext}`;

    console.log("✏️ Renaming Cloudinary:", file.public_id, "➡️", newName);

    const renamed = await cloudinary.v2.uploader.rename(
      file.public_id,
      newName,
      { overwrite: true }
    );

    file.filename = finalName;
    file.url = renamed.secure_url;
    file.public_id = renamed.public_id;
    await file.save();

    res.json({ success: true, file });
  } catch (err) {
    console.error("❌ Rename error (server):", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// Public download route (no password required)
// router.post("/:id/download", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { password } = req.body;

//     const file = await FileModel.findById(id);
//     if (!file) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     if (file.passwordHash) {
//       const isMatch = await bcrypt.compare(password || "", file.passwordHash);
//       if (!isMatch) {
//         return res
//           .status(401)
//           .json({ success: false, message: "Invalid password" });
//       }
//     }

//     file.downloads += 1;
//     await file.save();

//     res.json({ success: true, url: file.url });
//   } catch (err) {
//     console.error("❌ Download error:", err);
//     res.status(500).json({ success: false, message: "Download failed" });
//   }
// });

// ✅ Download route (password protected if needed)
router.post("/download/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const file = await FileModel.findById(id);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // If file has a password, validate
    if (file.passwordHash) {
      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Password required" });
      }

      const isMatch = await bcrypt.compare(password, file.passwordHash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }
    }

    // increment downloads
    file.downloads = (file.downloads || 0) + 1;
    await file.save();

    return res.json({
      success: true,
      file: {
        filename: file.filename,
        size: file.size,
        url: file.url,
      },
    });
  } catch (error) {
    console.error("❌ Download error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /files/user-stats - Get individual user stats (number of files and total storage used)
router.get("/user-stats", auth, async (req, res) => {
  try {
    const files = await FileModel.find({ user: req.user.id });

    const fileCount = files.length;
    const totalStorage = files.reduce((acc, file) => acc + file.size, 0);

    res.json({
      success: true,
      files: fileCount,
      totalStorage,
    });
  } catch (error) {
    console.error("❌ User stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user stats" });
  }
});




export default router;

import express from "express";
import multer from "multer";
import cors from "cors";
import { compareImages } from "./calc_threshold_phash.js";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

// POST route for image comparison
app.post("/compare", upload.single("file"), async (req, res) => {
  try {
    console.log("📩 Incoming file:", req.file?.path);

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Path to reference/original image (update this to your reference)
    const originalPath = "backend/verified_originals/Original1.jpg";
    const uploadedPath = req.file.path;

    const result = await compareImages(originalPath, uploadedPath);

    console.log("✅ Comparison result:", result);
    res.json(result);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

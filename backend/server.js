// ---------- IMPORTS ----------
import express from "express";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data"; // ⬅️ NEW IMPORT: For better FormData handling

// ---------- SETUP ----------
const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

// ---------- MULTER CONFIG ----------
// Use disk storage to ensure the file is saved before reading and sending
const upload = multer({ dest: "uploads/" });

// ---------- ROUTE ----------
app.post("/compare", upload.single("file"), async (req, res) => {
  let filePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    filePath = req.file.path; // Store the path for cleanup

    // 📤 Re-create FormData correctly using the 'form-data' package
    const formData = new FormData();
    // 💡 FIX: Append the file using fs.createReadStream and specify the filename.
    // This correctly simulates a browser file upload for Flask.
    formData.append("file", fs.createReadStream(filePath), {
      filename: req.file.originalname, 
      contentType: req.file.mimetype,
    });

    const flaskResponse = await fetch("http://127.0.0.1:5001/compare", {
      method: "POST",
      // 💡 FIX: Use formData.getHeaders() to correctly set the multipart/form-data boundary
      headers: formData.getHeaders(), 
      body: formData,
    });
    
    // Check for non-OK status from Flask
    if (!flaskResponse.ok) {
        // Read the error message from Flask if available
        const errorText = await flaskResponse.text(); 
        console.error("❌ Flask returned an error:", flaskResponse.status, errorText);
        // Forward the error status to the frontend
        return res.status(flaskResponse.status).json({ 
            error: `Flask processing failed with status ${flaskResponse.status}`,
            details: errorText.substring(0, 100) + '...',
        }); 
    }

    const result = await flaskResponse.json();

    console.log("\n========= 🔁 Flask Response =========");
    console.log(result);
    console.log("=====================================\n");

    res.json(result);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  } finally {
     // Clean up the temporary file created by multer
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Temporary file ${filePath} removed.`);
    }
  }
});

// ---------- START SERVER ----------
app.listen(port, () => {
  console.log(`🚀 Node server running on http://localhost:${port}`);
});
// src/Counterfeit/ScanProduct.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Make sure this CSS import is at the top!
import "./ScanProduct.css";

function ScanProduct() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Function to handle the new back button
  const handleBack = () => {
    navigate(-1); // Navigates one page back in history
  };

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/compare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from backend");
      }

      const data = await response.json();
      navigate("/scan-results", { state: data });
    } catch (error) {
      console.error("Error uploading or analyzing file:", error);
      alert("Error uploading or analyzing file! Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX: Using the ID and class structure from your CSS file
    <div id="app-container">
      
      {/* ✅ NEW: Header with Back button and Title, using your CSS classes */}
      <div className="ocr-header">
        <button onClick={handleBack} className="back-btn">
          Back
        </button>
        <h1 id="main-title">Upload Product Image</h1>
      </div>

      <p id="main-subtitle">Upload an image of the product for analysis.</p>

      {/* ✅ FIX: Using "upload-area" class for the label */}
      <label htmlFor="file-upload" className="upload-area">
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }} // Input is hidden, label is clickable
          accept="image/*"
        />
        <span id="upload-text">
          {selectedFile ? selectedFile.name : "Click or drag file to upload"}
        </span>
        <span id="upload-subtext">PNG, JPG, GIF up to 10MB</span>
      </label>

      {/* ✅ FIX: Using "preview-container" for the image */}
      {selectedFile && (
        <div className="preview-container">
          <img
            id="image-preview"
            src={URL.createObjectURL(selectedFile)}
            alt="Product preview"
          />
        </div>
      )}

      {/* ✅ FIX: Using "verify-button" ID for the analyze button */}
      <button
        id="verify-button"
        onClick={handleAnalyze}
        disabled={loading || !selectedFile}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}

export default ScanProduct;
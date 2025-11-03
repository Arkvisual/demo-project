// src/Counterfeit/ScanProduct.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ScanProduct.css";

function ScanProduct() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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

      const data = await response.json(); // data is { confidence: 100, match: 'Genuine' }

      // 🛑 ORIGINAL MISTAKE: navigate("/scan-results", { state: { data } });

      // ✅ FIX: Pass the 'data' object directly as the navigation state
      navigate("/scan-results", { state: data });
    } catch (error) {
      console.error("Error uploading or analyzing file:", error);
      alert("Error uploading or analyzing file! Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#eef3ff", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "2rem" }}>Upload Product Image</h2>

      <input type="file" onChange={handleFileChange} />
      <br />
      <br />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#3b82f6",
          color: "white",
          padding: "0.6rem 1.5rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}

export default ScanProduct;

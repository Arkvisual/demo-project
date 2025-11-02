import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import { ArrowLeft, Upload, Info } from 'lucide-react';
import "./OCRPage.css"; 

const OCRPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // --- Removed redundant cleanOCRText function ---

  const handleAnalyzeProduct = async () => {
    if (!selectedFile) return alert("Please upload an image first!");
    
    setLoading(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(selectedFile, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      // Pass the *true* raw text to the results page
      const rawText = result.data.text || "No text found.";

      navigate("/ingredient-results", {
        state: {
          image: imagePreview,
          rawText: rawText, // Send original text
        },
      });

    } catch (err) {
      console.error(err);
      alert("OCR failed, try again.");
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="counterfeit-container">
      <div className="header-bar">
        <button className="header-back-btn" onClick={handleBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="header-title">Ingredient Scanner</h1>
      </div>

      <p className="upload-subtitle">
        Upload a clear photo of the product packaging for analysis.
      </p>

      <div className="main-content-card">
        <div className="upload-box">
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {!imagePreview && (
              <>
                <Upload size={48} className="upload-icon" />
                <p className="upload-tap-text">Tap to Upload or Capture Image</p>
                <p className="upload-file-types">PNG, JPG up to 5MB</p>
              </>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product preview"
                className="uploaded-image-preview"
              />
            )}
          </label>
        </div>

        <button
          onClick={handleAnalyzeProduct}
          disabled={loading || !selectedFile}
          className="analyze-product-btn"
        >
          {loading ? `Analyzing... ${progress}%` : "Analyze Product"}
        </button>

        {loading && (
          <div className="progress-section">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRPage;
// src/Counterfeit/ScanResults.js

import { useLocation, useNavigate } from "react-router-dom";
// This import was already correct
import "./ScanResults.css"; 

export default function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  // Helper function to get the right class based on the result
  const getStatusClass = () => {
    if (!result || !result.match) return "uncertain";
    const match = result.match.toLowerCase();
    if (match === "genuine") {
      return "genuine";
    }
    if (match === "fake") {
      return "fake";
    }
    return "uncertain";
  };

  // This "no data" block is still using inline styles.
  // You can create a CSS class for this if you want.
  if (!result) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>No scan data found.</h2>
        <p>Please go back and upload a product image.</p>
        <button
          onClick={() => navigate("/scan-product")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // ✅ FIX: Replaced all inline styles with classes from ScanResults.css
  return (
    <div className="result-page-container">
      <div className="result-card">
        <h1>Scan Result</h1>
        
        <div className={`result-status ${getStatusClass()}`}>
          {result.match}
        </div>

        <div className="result-info">
          <p>
            Product Match: <span>{result.match}</span>
          </p>
          <p>
            Confidence: <span>{(result.confidence).toFixed(2)}%</span>
          </p>
        </div>

        <button
          onClick={() => navigate("/scan-product")}
          className="action-button"
        >
          Scan Another Product
        </button>
      </div>
    </div>
  );
}
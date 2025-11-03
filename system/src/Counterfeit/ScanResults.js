import { useLocation, useNavigate } from "react-router-dom";
import "./ScanResults.css";
export default function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

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

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Scan Result</h2>
      <p><strong>Match:</strong> {result.match}</p>
      {/* ✅ FIX: Remove the redundant * 100 */}
      <p><strong>Confidence:</strong> {(result.confidence).toFixed(2)}%</p> 

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
        Scan Another Product
      </button>
    </div>
  );
}
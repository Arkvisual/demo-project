// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Homepage from "./homepage";
import Login from "./login";
import Dashboard from "./Dashboard";
import HealthCommunityPage from "./HealthCommunity/HealthCommunityPage";

import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

// Ingredient Scanner Components
import OCRPage from "./IngredientScanner/OCRPage";
import IngredientResults from "./IngredientScanner/Results/IngredientResults";

// Counterfeit Product Detection
import ScanProduct from "./Counterfeit/ScanProduct";
import ScanResults from "./Counterfeit/ScanResults"; // ✅ new route added

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ingredient Scanner */}
        <Route path="/ocr" element={<OCRPage />} />
        <Route path="/ingredient-results" element={<IngredientResults />} />

        {/* Counterfeit Product Detection */}
        <Route path="/scan-product" element={<ScanProduct />} />  {/* upload page */}
        <Route path="/scan-results" element={<ScanResults />} />  {/* result page */}

        {/* Health / Community */}
        <Route path="/health-community" element={<HealthCommunityPage />} />

        {/* Authentication */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

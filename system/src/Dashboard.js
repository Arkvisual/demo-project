import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
      } else {
        setUser(user); // store user object
        setLoading(false);
      }
    };

    checkUser();

    // Initialize Lucide icons
    if (window.lucide) window.lucide.createIcons();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-container loading-state">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  // Extract name from user metadata
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "User";

  return (
    <div className="dashboard-container">

      {/* Top Navigation/Header */}
      <nav className="top-nav">
        <h1 className="brand-logo">AuthentiScan</h1>
        <div className="nav-actions">
          <span className="user-greeting">Welcome, {displayName}</span>
          <button className="nav-button settings-button" title="Settings">
            <i data-lucide="settings" className="nav-icon"></i>
          </button>
          <button onClick={handleLogout} className="logout-box-button">
            <i data-lucide="log-out" className="logout-icon"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content-area">
        <header className="main-header">
          <h2 className="greeting-title">Your Cosmetic Security Hub</h2>
          <p className="greeting-subtitle">
            Three key features to ensure product authenticity and safety.
          </p>
        </header>

        {/* Features Section */}
        <section className="features-section mt-8">
          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <Link to="/ocr" className="feature-card feature-1 group relative block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-violet-600">
              <div className="icon-badge w-12 h-12 flex items-center justify-center rounded-full bg-violet-100 mb-4">
                <i data-lucide="scan" className="feature-icon w-6 h-6 text-violet-600"></i>
              </div>
              <h3 className="card-title text-lg font-bold text-gray-800 mb-2">Ingredient Scanner</h3>
              <p className="card-description text-gray-600 mb-3">
                 Smart OCR Analysis: Quickly extract and analyze ingredients to ensure product safety and quality.
              </p>
              <ul className="info-list text-sm text-gray-500 mb-4 space-y-1">
                <li>Detect potentially harmful chemicals or allergens.</li>
                <li>Check ingredients against safety and regulatory standards.</li>
                <li>Get clear insights for safer choices.</li>
              </ul>
              <div className="card-action flex items-center text-violet-600 font-semibold">
                Scan Now <i data-lucide="arrow-right" className="ml-2 w-4 h-4"></i>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link to="/scan-product" className="feature-card feature-2 group relative block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-teal-500">
              <div className="icon-badge w-12 h-12 flex items-center justify-center rounded-full bg-teal-100 mb-4">
                <i data-lucide="package-check" className="feature-icon w-6 h-6 text-teal-500"></i>
              </div>
              <h3 className="card-title text-lg font-bold text-gray-800 mb-2">Counterfeit Detector</h3>
              <p className="card-description text-gray-600 mb-3">
                AI Visual Analysis: Use image recognition to spot subtle packaging flaws indicative of fake products.
              </p>
              <ul className="info-list text-sm text-gray-500 mb-4 space-y-1">
                <li>Spot packaging inconsistencies.</li>
                <li>Check security seals integrity.</li>
              </ul>
              <div className="card-action flex items-center text-teal-500 font-semibold">
                Verify Product <i data-lucide="arrow-right" className="ml-2 w-4 h-4"></i>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link to="/health-community" className="feature-card feature-3 group relative block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-orange-500">
              <div className="icon-badge w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mb-4">
                <i data-lucide="heart-pulse" className="feature-icon w-6 h-6 text-orange-500"></i>
              </div>
              <h3 className="card-title text-lg font-bold text-gray-800 mb-2">Health & Review Log</h3>
              <p className="card-description text-gray-600 mb-3">
                Personalized tracking log for recording usage, side effects, and contributing to community reviews.
              </p>
              <ul className="info-list text-sm text-gray-500 mb-4 space-y-1">
                <li>Log personal side effects.</li>
                <li>Contribute to community data.</li>
              </ul>
              <div className="card-action flex items-center text-orange-500 font-semibold">
                View Log <i data-lucide="arrow-right" className="ml-2 w-4 h-4"></i>
              </div>
            </Link>

          </div>
        </section>

        <footer className="main-area-footer mt-8">
          <p>&copy; 2025 AuthentiScan. Empowering safe beauty choices.</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      title: "OCR Ingredient Analysis",
      icon: "🔬",
      description: "Quickly decode complex ingredient lists.",
      details: ["Photo scanning", "Safety ratings", "Allergy warnings"],
      path: "/analysis",
    },
    {
      title: "Product Verification",
      icon: "✅",
      description: "Ensure your cosmetics are 100% genuine.",
      details: ["Scan Products", "Report suspicious or fake products", "Detect counterfeit packaging"],
      path: "/verification",
    },
    {
      title: "Community Insights",
      icon: "👥",
      description: "Share and discover trusted product reviews.",
      details: ["Verified reviews only", "Global community", "Product discussions"],
      path: "/community",
    },
  ];

  return (
    <div className="animated-bg">
        
      <nav className="top-nav">
          <h1 className="nav-brand-title">AuthentiScan</h1>
          <div className="nav-links">
            <span className="footer-link nav-link" onClick={() => setShowAboutModal(true)}>About</span>
            <span className="footer-link nav-link" onClick={() => setShowEmailModal(true)}>Contact Us</span>
          </div>
      </nav>

      <div className="content-wrapper">
        <header className="dashboard-header hero-content">
          <h1 className="hero-heading">Verify Your Beauty, Scan for Safety</h1>
          <p className="sub-text hero-sub-text">
            AuthentiScan empowers you with trust and transparency in cosmetics.
          </p>
          <button className="start-button" onClick={() => navigate("/login")}>
            Get Started <span className="arrow">→</span>
          </button>
        </header>

        <section className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
            >
              <div className="icon-bg">
                <span className="icon">{feature.icon}</span>
              </div>
              <h2 className="feature-title">{feature.title}</h2>
              <p className="feature-desc-intro">{feature.description}</p>
              <ul className="bullet-list">
                {feature.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; 2025 AuthentiScan. All rights reserved.</p>
      </footer>

      {showAboutModal && (
        <div className="modal about-modal">
          <div className="modal-content">
            <button onClick={() => setShowAboutModal(false)}>X</button>
            <h3>About AuthentiScan</h3>
            <p>
              AuthentiScan is a smart cosmetic authentication and safety app
              that helps users verify product authenticity, analyze ingredients
              with OCR, and share experiences within a trusted community.
            </p>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal email-modal">
          <div className="modal-content">
            <button onClick={() => setShowEmailModal(false)}>X</button>
            <h3>Contact Us</h3>
            <p>📧 authentiscan@gmail.com</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
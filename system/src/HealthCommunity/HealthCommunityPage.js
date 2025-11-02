import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HealthCommunityPage.css';
import HealthLogTab from './HealthLogTab';
import CommunityReviewsTab from './CommunityReviewsTab';

const HealthCommunityPage = () => {
  const [activeTab, setActiveTab] = useState('logs'); 
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="health-community-container">
      {/* Header */}
      <div className="hc-header">
        <button className="back-btn" onClick={handleGoBack}>
          &larr; Back
        </button>
        <h1 className="hc-main-title">Health & Reviews</h1>
      </div>
      
      {/* Tabs */}
      <nav className="hc-tabs">
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          My Private Health Logs
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Community Reviews & Posts
        </button>
      </nav>

      {/* Content */}
      <main className="hc-content">
        {activeTab === 'logs' && <HealthLogTab />}
        {activeTab === 'reviews' && <CommunityReviewsTab />}
      </main>
    </div>
  );
};

export default HealthCommunityPage;

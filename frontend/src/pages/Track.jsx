import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRight } from 'lucide-react';
import './Track.css';

const Track = () => {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/track/${orderId.trim()}`);
    }
  };

  return (
    <div className="track-search-page container">
      <div className="track-search-card card">
        <div className="track-icon">
          <Package size={48} color="var(--accent)" />
        </div>
        <h1>Track Your Order</h1>
        <p>Enter your Order ID (e.g., NP-1713500000000) to see the real-time status of your delivery.</p>
        
        <form onSubmit={handleTrack} className="track-form">
          <div className="search-input-group">
            <Search className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Enter Order ID" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary full-width">
            Track Now <ArrowRight size={18} />
          </button>
        </form>

        <div className="track-help">
          <p>Don't have your Order ID? Check your email or SMS confirmation.</p>
        </div>
      </div>
    </div>
  );
};

export default Track;

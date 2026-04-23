import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, MapPin, Calendar, Check, X, Briefcase, Star, User, Phone, FileText, Activity } from 'lucide-react';
import './PainterDashboard.css';

const PainterDashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/painters/requests');
      setRequests(data);
    } catch (error) {
      console.error('Fetch Requests Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (reqId, status) => {
    try {
      await api.put(`/painters/requests/${reqId}`, { status });
      toast.success(`Request marked as ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  const filteredRequests = activeTab === 'all' ? requests : requests.filter(r => r.status === activeTab);

  if (loading) {
    return (
      <div className="pd-loading-screen">
        <div className="pd-spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="pd-wrapper">
      {/* Sidebar */}
      <aside className="pd-sidebar">
        <div className="pd-sidebar-brand">
          <div className="pd-brand-icon">🎨</div>
          <div>
            <h3>ColorNest Pro</h3>
            <span>Painter Portal</span>
          </div>
        </div>

        <div className="pd-painter-profile">
          <img
            src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt={user?.name}
            className="pd-avatar"
          />
          <h4>{user?.name}</h4>
          <span className="pd-verified-badge">✓ Verified Painter</span>
        </div>

        <nav className="pd-nav">
          <button className={`pd-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <Activity size={18} /> All Requests <span className="pd-nav-count">{stats.total}</span>
          </button>
          <button className={`pd-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            <Clock size={18} /> Pending <span className="pd-nav-count">{stats.pending}</span>
          </button>
          <button className={`pd-nav-item ${activeTab === 'accepted' ? 'active' : ''}`} onClick={() => setActiveTab('accepted')}>
            <Briefcase size={18} /> Active Jobs <span className="pd-nav-count">{stats.accepted}</span>
          </button>
          <button className={`pd-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
            <CheckCircle size={18} /> Completed <span className="pd-nav-count">{stats.completed}</span>
          </button>
        </nav>

        <div className="pd-sidebar-footer">
          <p>© 2025 ColorNest Nepal</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pd-main">
        {/* Top Header */}
        <header className="pd-top-header">
          <div>
            <h1>Good day, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <div className="pd-header-date">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="pd-stats-row">
          <div className="pd-stat-card pd-stat-blue">
            <div className="pd-stat-icon"><Briefcase size={22} /></div>
            <div className="pd-stat-info">
              <h2>{stats.total}</h2>
              <p>Total Requests</p>
            </div>
            <div className="pd-stat-glow"></div>
          </div>
          <div className="pd-stat-card pd-stat-amber">
            <div className="pd-stat-icon"><Clock size={22} /></div>
            <div className="pd-stat-info">
              <h2>{stats.pending}</h2>
              <p>Awaiting Response</p>
            </div>
            <div className="pd-stat-glow"></div>
          </div>
          <div className="pd-stat-card pd-stat-violet">
            <div className="pd-stat-icon"><Activity size={22} /></div>
            <div className="pd-stat-info">
              <h2>{stats.accepted}</h2>
              <p>Active Jobs</p>
            </div>
            <div className="pd-stat-glow"></div>
          </div>
          <div className="pd-stat-card pd-stat-green">
            <div className="pd-stat-icon"><CheckCircle size={22} /></div>
            <div className="pd-stat-info">
              <h2>{stats.completed}</h2>
              <p>Jobs Completed</p>
            </div>
            <div className="pd-stat-glow"></div>
          </div>
        </div>

        {/* Requests Panel */}
        <section className="pd-requests-panel">
          <div className="pd-panel-header">
            <h2>
              {activeTab === 'all' ? 'All Requests' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Requests'}
            </h2>
            <span className="pd-panel-count">{filteredRequests.length} records</span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="pd-empty-state">
              <div className="pd-empty-icon">📋</div>
              <h3>No {activeTab === 'all' ? '' : activeTab} requests yet</h3>
              <p>When clients book your services, their requests will appear here. Keep your profile active to attract more clients!</p>
            </div>
          ) : (
            <div className="pd-cards-grid">
              {filteredRequests.map((request) => (
                <div key={request._id} className={`pd-request-card pd-status-${request.status}`}>
                  <div className="pd-request-top">
                    <div className="pd-client-row">
                      <img
                        src={request.user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt="Client"
                        className="pd-client-avatar"
                      />
                      <div className="pd-client-details">
                        <h4><User size={13} /> {request.user?.name || 'Unknown Client'}</h4>
                        <p><Phone size={13} /> {request.user?.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <span className={`pd-badge pd-badge-${request.status}`}>
                      {request.status === 'pending' && '🕐'}
                      {request.status === 'accepted' && '🔵'}
                      {request.status === 'completed' && '✅'}
                      {request.status === 'rejected' && '❌'}
                      {' '}{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="pd-request-meta">
                    {request.address && (
                      <div className="pd-meta-item">
                        <MapPin size={14} />
                        <span>{request.address}</span>
                      </div>
                    )}
                    <div className="pd-meta-item">
                      <Calendar size={14} />
                      <span>{new Date(request.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {request.details && (
                    <div className="pd-request-note">
                      <FileText size={14} />
                      <p>"{request.details}"</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="pd-request-actions">
                      <button className="pd-btn-accept" onClick={() => updateRequestStatus(request._id, 'accepted')}>
                        <Check size={15} /> Accept Job
                      </button>
                      <button className="pd-btn-decline" onClick={() => updateRequestStatus(request._id, 'rejected')}>
                        <X size={15} /> Decline
                      </button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="pd-request-actions">
                      <button className="pd-btn-complete" onClick={() => updateRequestStatus(request._id, 'completed')}>
                        <CheckCircle size={15} /> Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PainterDashboard;

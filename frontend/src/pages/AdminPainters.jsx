import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Trash2, CheckCircle, XCircle, Search, Filter, 
  UserCheck, ShieldCheck, Clock, MapPin, 
  Briefcase, Star, Mail, Phone, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminPainters = () => {
  const [painters, setPainters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function fetchPainters() {
    try {
      setLoading(true);
      const { data } = await api.get('/painters?isAdmin=true');
      setPainters(data);
    } catch (error) {
      toast.error('Failed to load professional directory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPainters();
  }, []);

  const handleVerify = async (id) => {
    const loadToast = toast.loading('Updating verification status...');
    try {
      await api.put(`/painters/${id}/verify`);
      toast.success('Status updated successfully', { id: loadToast });
      fetchPainters();
    } catch (error) {
      toast.error('Failed to update status', { id: loadToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this professional from the directory?')) {
      const loadToast = toast.loading('Removing entry...');
      try {
        await api.delete(`/painters/${id}`);
        toast.success('Professional removed', { id: loadToast });
        fetchPainters();
      } catch (error) {
        toast.error('Delete failed', { id: loadToast });
      }
    }
  };

  const filteredPainters = painters.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && p.verified) || 
                         (statusFilter === 'pending' && !p.verified);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: painters.length,
    verified: painters.filter(p => p.verified).length,
    pending: painters.filter(p => !p.verified).length,
    avgExp: painters.length > 0 
      ? Math.round(painters.reduce((acc, p) => acc + parseInt(p.experience || 0), 0) / painters.length) 
      : 0
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Verifying Professional Credentials...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="admin-header-premium">
          <div className="header-info">
            <h1>Professional Directory</h1>
            <p>Manage the network of verified painters and review new applications.</p>
          </div>
        </div>

        <div className="orders-stats-grid">
          <div className="stat-mini-card card">
            <div className="icon-box blue"><Briefcase size={20} /></div>
            <div className="stat-val">
              <h3>{stats.total}</h3>
              <span>Total Professionals</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box green"><ShieldCheck size={20} /></div>
            <div className="stat-val">
              <h3>{stats.verified}</h3>
              <span>Verified Experts</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box orange"><Clock size={20} /></div>
            <div className="stat-val">
              <h3>{stats.pending}</h3>
              <span>Pending Review</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box purple"><Star size={20} /></div>
            <div className="stat-val">
              <h3>{stats.avgExp} Yrs</h3>
              <span>Avg. Experience</span>
            </div>
          </div>
        </div>

        <div className="table-controls card">
          <div className="search-box-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Professionals</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper card">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Expertise & Experience</th>
                <th>Contact & Location</th>
                <th>Validation Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPainters.map(p => (
                <tr key={p._id}>
                  <td className="user-cell">
                    <div className="avatar-box-premium">
                      <img src={p.image} alt={p.name} />
                      {p.verified && <div className="verified-badge-mini"><ShieldCheck size={10} /></div>}
                    </div>
                    <div className="user-info">
                      <strong>{p.name}</strong>
                      <span>Expert Application</span>
                    </div>
                  </td>
                  <td>
                    <div className="expertise-cell">
                      <div className="tags-row-mini">
                        {p.specialties.slice(0, 2).map((s, i) => (
                          <span key={i} className="mini-tag">{s}</span>
                        ))}
                      </div>
                      <span className="exp-text"><Clock size={12} /> {p.experience} Experience</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell-premium">
                      <div className="contact-row"><Mail size={12} /> {p.email}</div>
                      <div className="contact-row text-muted"><MapPin size={12} /> {p.location}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${p.verified ? 'delivered' : 'pending'}`}>
                      {p.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button 
                        className={`view-btn-circle ${p.verified ? 'warning' : 'success'}`} 
                        onClick={() => handleVerify(p._id)}
                        title={p.verified ? "Revoke Verification" : "Verify Expert"}
                      >
                        {p.verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button 
                        className="view-btn-circle delete" 
                        onClick={() => handleDelete(p._id)}
                        title="Remove Directory Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPainters.length === 0 && (
            <div className="empty-table">
              <Briefcase size={48} />
              <p>No professionals match your current search parameters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPainters;

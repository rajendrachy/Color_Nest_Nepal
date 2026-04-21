import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  User as UserIcon, Mail, Phone, Calendar, Shield, 
  Search, Filter, Users, UserCheck, ShieldAlert, ShieldCheck,
  Loader2, MoreVertical, Edit2, Trash2, ExternalLink,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminUsersAdvanced.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data || []);
    } catch (error) {
      toast.error('Identity database synchronization failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRole(id, newRole) {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Identity access updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Privilege escalation failed');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you absolutely certain you want to revoke this identity? This action is IRREVERSIBLE.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Identity purged from central registry');
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to revoke access';
      toast.error(errorMsg);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = (users || []).filter(u => {
    const name = u.name || '';
    const email = u.email || '';
    const role = u.role || 'user'; // Default to user if missing
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => (u.role || 'user') === 'user').length,
    activeToday: users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length
  };

  if (loading) return (
    <div className="users-advanced-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Decrypting User Profiles...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="users-advanced-layout">
      <Sidebar />
      <main className="admin-content" style={{ padding: 0 }}>
        <section className="users-hero-section">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Customer Intelligence</h1>
              <p>Relationship management and administrative access orchestration.</p>
            </div>
            <button className="btn-glass" onClick={fetchUsers}>
              <RefreshCw size={18} /> Sync Registry
            </button>
          </div>
        </section>

        <div className="users-stats-container container">
          <div className="user-stat-card">
            <div className="stat-icon-box blue"><Users size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.total}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Registered Minds</span>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-box purple"><ShieldCheck size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.admins}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>System Guardians</span>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-box green"><UserCheck size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.customers}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Active Consumers</span>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-box orange"><ShieldAlert size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.activeToday}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>New Recruits</span>
            </div>
          </div>
        </div>

        <div className="user-table-premium container">
          <div className="table-controls" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="search-box-premium" style={{ maxWidth: '400px', flex: 1, marginRight: '20px' }}>
              <Search size={18} />
              <input placeholder="Query name, email, or identity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-group">
              <Filter size={18} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Global Access</option>
                <option value="user">Customers Only</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="users-display-box">
            {isMobile ? (
              <div className="mobile-users-list">
                {filteredUsers.map(u => (
                  <div key={u._id} className="mobile-user-card">
                    <div className="card-top">
                      <div className="user-profile-flex">
                        <div className="user-avatar-lg">{u.name?.charAt(0) || '?'}</div>
                        <div>
                          <strong style={{ display: 'block' }}>{u.name || 'Anonymous'}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</span>
                        </div>
                      </div>
                      <span className={`role-badge-pro ${u.role || 'user'}`}>{u.role}</span>
                    </div>
                    <div className="card-mid">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                        <Calendar size={14} /> Joined {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="card-actions" style={{ display: 'flex', gap: '10px' }}>
                       <select 
                         value={u.role || 'user'} 
                         onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                         className="action-btn-pro"
                         style={{ flex: 1 }}
                       >
                         <option value="user">Promote/Demote</option>
                         <option value="user">User</option>
                         <option value="admin">Admin</option>
                       </select>
                       <button className="action-btn-pro" onClick={() => handleDelete(u._id)} style={{ background: '#fef2f2', color: '#dc2626' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-user-table">
                  <thead>
                    <tr>
                      <th>Individual Profile</th>
                      <th>Communication</th>
                      <th>Enrollment Date</th>
                      <th>Access Level</th>
                      <th>Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u._id} className="user-row-premium">
                        <td>
                          <div className="user-profile-flex">
                            <div className="user-avatar-lg">{u.name?.charAt(0) || '?'}</div>
                            <div>
                              <strong>{u.name || 'Unknown Entity'}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>ID: {u._id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}><Mail size={14} /> {u.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}><Phone size={14} /> {u.phone || 'No direct dial'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </td>
                        <td>
                          <select 
                            value={u.role || 'user'} 
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                            className={`role-badge-pro ${u.role || 'user'}`}
                            style={{ border: 'none', cursor: 'pointer', appearance: 'none' }}
                          >
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn-pro" title="View Detail Profile"><UserIcon size={16} /></button>
                            <button className="action-btn-pro" title="View Orders History"><ExternalLink size={16} /></button>
                            <button className="action-btn-pro" onClick={() => handleDelete(u._id)} style={{ background: '#fef2f2', color: '#dc2626' }} title="Revoke Identity Access"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>
                          <Users size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No matching identities found in the central registry.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Settings, Bell, Lock, Globe, Database, Save, Loader2, 
  DollarSign, Truck, Shield, Mail, Share2, Terminal,
  RefreshCw, Layout, AppWindow
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    vatRate: 0.13,
    deliveryCharge: 150,
    lowStockThreshold: 10,
    emailNotifications: true,
    lowStockAlerts: true,
    currency: 'NPR',
    maintenanceMode: false,
    socialLinks: { facebook: '', instagram: '', twitter: '' },
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
    allowedLoginAttempts: 5
  });

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      toast.success('System configuration updated');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Initializing Control Panel...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="settings-header-premium">
          <div className="header-title">
            <h1>System Configuration</h1>
            <p>Manage global preferences and application environment settings.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={fetchSettings}>
              <RefreshCw size={18} /> Sync
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Applying...' : 'Apply Changes'}
            </button>
          </div>
        </div>

        <div className="settings-container-premium card">
          <div className="settings-sidebar">
            <button className={`tab-link ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <Globe size={18} /> General
            </button>
            <button className={`tab-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              <DollarSign size={18} /> Payments & Tax
            </button>
            <button className={`tab-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} /> Notifications
            </button>
            <button className={`tab-link ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
              <Share2 size={18} /> Social Links
            </button>
            <button className={`tab-link ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={18} /> Security
            </button>
            <button className={`tab-link ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>
              <Terminal size={18} /> Advanced
            </button>
          </div>

          <div className="settings-main-content">
            {activeTab === 'general' && (
              <div className="settings-pane animate-fade">
                <h3>General Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Store Name</label>
                    <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Support Email</label>
                    <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Default Currency</label>
                    <select name="currency" value={settings.currency} onChange={handleChange}>
                      <option value="NPR">Nepalese Rupee (NPR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="INR">Indian Rupee (INR)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="settings-pane animate-fade">
                <h3>Payments & Regional Tax</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>VAT Rate (%)</label>
                    <div className="input-with-icon">
                      <input type="number" step="0.01" name="vatRate" value={settings.vatRate} onChange={handleChange} />
                      <span className="unit-tag">%</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Base Delivery Charge</label>
                    <div className="input-with-icon">
                      <span className="prefix-tag">Rs.</span>
                      <input type="number" name="deliveryCharge" value={settings.deliveryCharge} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-pane animate-fade">
                <h3>Notification Preferences</h3>
                <div className="toggle-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Order Confirmations</strong>
                      <p>Send automated emails to customers upon purchase.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Low Stock Warnings</strong>
                      <p>Alert admins when inventory falls below threshold.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" name="lowStockAlerts" checked={settings.lowStockAlerts} onChange={handleChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="form-group mt-20" style={{ maxWidth: '200px' }}>
                  <label>Low Stock Threshold</label>
                  <input type="number" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="settings-pane animate-fade">
                <h3>Social Media Integration</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input type="text" name="socialLinks.facebook" value={settings.socialLinks?.facebook} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input type="text" name="socialLinks.instagram" value={settings.socialLinks?.instagram} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-pane animate-fade">
                <h3>System Security</h3>
                <div className="toggle-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Two-Factor Authentication</strong>
                      <p>Require a secondary code for all administrative logins.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="form-grid mt-30">
                  <div className="form-group">
                    <label>Session Timeout</label>
                    <div className="input-with-icon">
                      <input type="number" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} />
                      <span className="unit-tag">min</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password Expiry</label>
                    <div className="input-with-icon">
                      <input type="number" name="passwordExpiry" value={settings.passwordExpiry} onChange={handleChange} />
                      <span className="unit-tag">days</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Login Attempts</label>
                    <div className="input-with-icon">
                      <input type="number" name="allowedLoginAttempts" value={settings.allowedLoginAttempts} onChange={handleChange} />
                      <span className="unit-tag">tries</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="settings-pane animate-fade">
                <h3>System Environment</h3>
                <div className="danger-zone">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong className="text-primary">Maintenance Mode</strong>
                      <p>Restrict public access to the store while updating.</p>
                    </div>
                    <label className="switch danger">
                      <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="system-logs mt-30">
                  <div className="log-header">
                    <Database size={16} /> Connection Status
                  </div>
                  <div className="log-body">
                    <div className="log-row"><span>MongoDB Atlas</span> <span className="status-dot online"></span> Online</div>
                    <div className="log-row"><span>Redis Cache</span> <span className="status-dot offline"></span> Disabled</div>
                    <div className="log-row"><span>Socket.io</span> <span className="status-dot online"></span> Port 5000 Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Warehouse, MapPin, Phone, User, Plus, Info, 
  Truck, Shield, X, Loader2, Search, Map, Trash2, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    province: 'Province No. 1',
    district: '',
    manager: '',
    contact: '',
    deliveryZones: []
  });

  async function fetchWarehouses() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/warehouses');
      setWarehouses(data);
    } catch (error) {
      toast.error('Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      province: 'Province No. 1',
      district: '',
      manager: '',
      contact: '',
      deliveryZones: []
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleEdit = (w) => {
    setFormData({
      name: w.name,
      province: w.province,
      district: w.district,
      manager: w.manager,
      contact: w.contact,
      deliveryZones: w.deliveryZones || []
    });
    setIsEditing(true);
    setSelectedId(w._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      const loadToast = toast.loading('Deleting facility...');
      try {
        await api.delete(`/admin/warehouses/${id}`);
        toast.success('Facility deleted successfully', { id: loadToast });
        fetchWarehouses();
      } catch (error) {
        toast.error('Failed to delete facility', { id: loadToast });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditing ? 'Updating' : 'Registering';
    const loadToast = toast.loading(`${action} facility...`);
    try {
      if (isEditing) {
        await api.put(`/admin/warehouses/${selectedId}`, formData);
      } else {
        await api.post('/admin/warehouses', formData);
      }
      toast.success(`Facility ${isEditing ? 'updated' : 'registered'} successfully`, { id: loadToast });
      setShowModal(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'register'} facility`, { id: loadToast });
    }
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Mapping Logistics Network...</p>
        </div>
      </main>
    </div>
  );

  const stats = {
    total: warehouses.length,
    provinces: [...new Set(warehouses.map(w => w.province))].length,
    zones: warehouses.reduce((acc, w) => acc + w.deliveryZones.length, 0),
    coverage: 'Nepal Nationwide'
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="admin-header-premium">
          <div className="header-info">
            <h1>Logistics & Warehousing</h1>
            <p>Manage regional distribution centers and localized delivery zones.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={20} /> Register Facility
          </button>
        </div>

        <div className="orders-stats-grid">
          <div className="stat-mini-card card">
            <div className="icon-box blue"><Warehouse size={20} /></div>
            <div className="stat-val">
              <h3>{stats.total}</h3>
              <span>Active Hubs</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box purple"><Map size={20} /></div>
            <div className="stat-val">
              <h3>{stats.provinces}</h3>
              <span>Provinces Covered</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box green"><Truck size={20} /></div>
            <div className="stat-val">
              <h3>{stats.zones}</h3>
              <span>Delivery Zones</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box orange"><Shield size={20} /></div>
            <div className="stat-val">
              <h3>{stats.coverage}</h3>
              <span>Operational Status</span>
            </div>
          </div>
        </div>

        <div className="warehouse-premium-grid">
          {warehouses.map(w => (
            <div key={w._id} className="warehouse-hub-card card animate-fade">
              <div className="hub-header">
                <div className="hub-icon">
                  <Warehouse size={24} />
                </div>
                <div className="hub-title">
                  <h3>{w.name}</h3>
                  <span className="hub-tag">Primary Hub</span>
                </div>
              </div>
              
              <div className="hub-details">
                <div className="detail-row">
                  <MapPin size={16} />
                  <span>{w.district}, {w.province}</span>
                </div>
                <div className="detail-row">
                  <User size={16} />
                  <span><strong>{w.manager}</strong> (Facility Manager)</span>
                </div>
                <div className="detail-row">
                  <Phone size={16} />
                  <span>{w.contact}</span>
                </div>
              </div>

              <div className="hub-zones">
                <div className="zones-header">
                  <Truck size={16} />
                  <h4>Logistics Coverage</h4>
                </div>
                <div className="zones-pills">
                  {w.deliveryZones.map((zone, idx) => (
                    <div key={idx} className="zone-pill-premium">
                      <div className="zone-meta">
                        <strong>{zone.province}</strong>
                        <span>{zone.districts.length} Districts</span>
                      </div>
                      <div className="zone-price">
                        Rs. {zone.deliveryCharge}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hub-footer">
                <div className="hub-actions">
                  <button className="btn-icon-text edit" onClick={() => handleEdit(w)}>
                    <Edit size={16} /> Edit
                  </button>
                  <button className="btn-icon-text delete" onClick={() => handleDelete(w._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
                <div className="status-indicator online">System Online</div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay-premium">
            <div className="modal-content-premium card animate-fade">
              <div className="modal-header">
                <h2>{isEditing ? 'Update Facility' : 'Register New Facility'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                  <label>Warehouse Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Kathmandu Central Hub" />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Province</label>
                    <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                      {['Province No. 1', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>District</label>
                    <input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} placeholder="e.g. Kathmandu" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Manager Name</label>
                    <input required value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} placeholder="Full Name" />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="98XXXXXXXX" />
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-save">
                    {isEditing ? 'Update Hub' : 'Register Hub'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminWarehouses;

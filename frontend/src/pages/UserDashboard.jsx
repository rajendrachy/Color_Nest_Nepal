import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  ShoppingBag, Box, Clock, MapPin, Search, 
  ChevronRight, Package, Truck, CheckCircle, 
  CreditCard, X, Trash2, User, Palette, 
  HelpCircle, Settings, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'dispatched': return '#8b5cf6';
      case 'out_for_delivery': return '#ec4899';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Box size={16} />;
      case 'dispatched': return <Package size={16} />;
      case 'out_for_delivery': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;
    if (!finalReason.trim()) return toast.error('Please provide a reason');
    setCancelling(true);
    try {
      await api.put(`/orders/${selectedOrderId}/cancel`, { reason: finalReason });
      toast.success('Order cancelled successfully');
      setOrders(prev => prev.map(o => o._id === selectedOrderId ? { ...o, orderStatus: 'cancelled' } : o));
      setShowCancelModal(false);
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="user-dashboard-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: '#64748b', fontWeight: '600' }}>Assembling Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="user-dashboard-premium container">
      {/* Premium Hero */}
      <div className="dashboard-hero animate-fade">
        <div className="hero-content">
          <h1>Namaste <span className="waving-hand">👋</span>, <span className="text-gradient">{user?.name}</span></h1>
          <p>Welcome to your ColorNest Nepal command center. Track your premium paints, manage deliveries, and view your purchase history with ease.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <ShoppingBag size={28} color="var(--primary)" />
            <div>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Orders Column */}
        <div className="orders-premium-container">
          <div className="section-title-bar">
            <div className="title-left">
              <Package size={28} color="var(--primary)" />
              <h2>Your Order History</h2>
            </div>
            
            <div className="dashboard-controls" style={{ display: 'flex', gap: '15px' }}>
              <div className="search-box" style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search Order ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '12px 20px 12px 45px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', width: '220px' }}
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600' }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders-premium" style={{ background: '#f8fafc', borderRadius: '24px', padding: '60px' }}>
              <Box size={48} color="#cbd5e1" style={{ marginBottom: '20px' }} />
              <h3>No shipments found</h3>
              <p>Your history is currently empty or matches no filters.</p>
              <Link to="/products" className="btn btn-primary mt-4" style={{ borderRadius: '12px' }}>Start Shopping</Link>
            </div>
          ) : (
            <div className="premium-orders-list">
              {filteredOrders.map(order => (
                <div key={order._id} className="premium-order-card">
                  <div className="order-card-header">
                    <div className="order-id-group">
                      <span className="order-label">Tracking Number</span>
                      <span className="order-id-val">#{order.orderId}</span>
                    </div>
                    <div className="order-status-pill" style={{ background: `${getStatusColor(order.orderStatus)}15`, color: getStatusColor(order.orderStatus) }}>
                      {getStatusIcon(order.orderStatus)}
                      <span>{order.orderStatus.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-detail-row">
                      <Clock size={18} color="#64748b" />
                      <span>Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="order-detail-row">
                      <MapPin size={18} color="#64748b" />
                      <span>Deliver to {order.deliveryAddress?.district}, {order.deliveryAddress?.province}</span>
                    </div>
                    <div className="order-detail-row">
                      <CreditCard size={18} color="#64748b" />
                      <span style={{ textTransform: 'capitalize' }}>Payment: {order.paymentMethod?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total-group">
                      <span className="total-label">Total Investment</span>
                      <span className="total-val">Rs. {order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="order-actions" style={{ display: 'flex', gap: '15px' }}>
                      {['pending', 'payment_pending'].includes(order.orderStatus) && (
                        <button onClick={() => handleCancelClick(order._id)} className="btn-cancel" style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                      )}
                      <Link to={`/track/${order._id}`} className="btn-track-premium">
                        Track Journey <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Quick Access */}
        <div className="dashboard-sidebar">
          <div className="sidebar-card">
            <h3>Quick Actions</h3>
            <div className="quick-links-group">
              <Link to="/products" className="quick-link-btn">
                <Palette size={20} /> Our Paint Collection
              </Link>
              <Link to="/profile" className="quick-link-btn">
                <User size={20} /> Account Profile
              </Link>
              <Link to="/track" className="quick-link-btn">
                <Search size={20} /> Track Any Shipment
              </Link>
              <Link to="/faq" className="quick-link-btn">
                <HelpCircle size={20} /> Support & FAQ
              </Link>
            </div>
          </div>

          <div className="sidebar-card" style={{ background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
            <h3>Account Settings</h3>
            <div className="quick-links-group">
              <Link to="/settings" className="quick-link-btn" style={{ background: 'transparent' }}>
                <Settings size={20} /> Preferences
              </Link>
              <button onClick={() => { logout(); toast.success('Securely logged out'); }} className="quick-link-btn" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
                <LogOut size={20} /> Secure Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div className="modal-content" style={{ background: 'white', padding: '40px', borderRadius: '32px', maxWidth: '450px', width: '90%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px' }}>Cancel Shipment?</h3>
            <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>Are you sure you want to cancel this order? This action will release the reserved stocks for other customers.</p>
            
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>Reason for cancellation</label>
              <select onChange={(e) => setCancelReason(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <option value="">Select a reason</option>
                <option value="Mistake">Ordered by mistake</option>
                <option value="Late">Delivery taking too long</option>
                <option value="Price">Found better price</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700' }}>Keep Order</button>
              <button onClick={handleConfirmCancel} disabled={cancelling} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700' }}>
                {cancelling ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

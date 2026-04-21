import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Eye, Truck, Loader2, Search, Filter, 
  ShoppingBag, Clock, CheckCircle, XCircle,
  CreditCard, Calendar, User, MoreHorizontal, 
  Trash2, Package, ArrowRight, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminOrdersAdvanced.css';

// Custom icons for the advanced dashboard
const TrendingUp = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/orders');
      setOrders(data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const loadingToast = toast.loading(`Transitioning to ${status}...`);
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order synchronized successfully', { id: loadingToast });
      fetchOrders();
    } catch (error) {
      toast.error('Synchronization failed', { id: loadingToast });
    }
  };

  const filteredOrders = (orders || []).filter(o => {
    const orderId = o?.orderId || '';
    const userName = o?.user?.name || '';
    const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o?.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: (orders || []).length,
    pending: (orders || []).filter(o => o?.orderStatus === 'pending').length,
    active: (orders || []).filter(o => ['processing', 'dispatched', 'out_for_delivery'].includes(o?.orderStatus)).length,
    revenue: (orders || []).reduce((acc, curr) => acc + (curr?.paymentStatus === 'completed' ? Number(curr?.totalAmount || 0) : 0), 0)
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ['pending', 'processing', 'dispatched', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus || 'pending');
    return steps.map((step, index) => ({
      name: step,
      active: index <= currentIndex || currentStatus === 'delivered'
    }));
  };

  if (loading) return (
    <div className="orders-advanced-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Orchestrating Order Data...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="orders-advanced-layout">
      <Sidebar />
      <main className="admin-content" style={{ padding: 0 }}>
        <section className="orders-hero-section">
          <div className="container">
            <h1>Logistics & Fulfillment</h1>
            <p>Real-time order orchestration and lifecycle management.</p>
          </div>
        </section>

        <div className="orders-stats-container container">
          <div className="order-stat-card">
            <div className="stat-icon-circle pending"><Clock size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.pending}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Awaiting Action</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle processing"><Package size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{stats.active}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>In Pipeline</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle delivered"><CheckCircle size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>{orders.filter(o => o.orderStatus === 'delivered').length}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Successfully Fulfilled</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle revenue"><TrendingUp size={24} /></div>
            <div>
              <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Rs. {Number(stats.revenue || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Settled Revenue</span>
            </div>
          </div>
        </div>

        <div className="order-table-premium container">
          <div className="table-controls" style={{ marginBottom: '30px', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div className="search-box-premium" style={{ maxWidth: '400px' }}>
              <Search size={18} />
              <input placeholder="Search orders, customers, IDs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-group">
              <Filter size={18} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Lifecycle Stages</option>
                <option value="pending">Awaiting Approval</option>
                <option value="processing">Production/Packing</option>
                <option value="dispatched">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="orders-data-container">
            {isMobile ? (
              <div className="mobile-orders-list">
                {filteredOrders.length > 0 ? filteredOrders.map(o => (
                  <div key={o._id} className="order-mobile-card">
                    <div className="card-header">
                      <strong>#{o.orderId || 'N/A'}</strong>
                      <span className={`status-pill-pro ${o.orderStatus || 'pending'}`}>
                        {(o.orderStatus || 'pending').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="card-client">
                      <div className="user-avatar-text mini">{o.user?.name ? o.user.name.charAt(0) : '?'}</div>
                      <span>{o.user?.name || 'Guest Customer'}</span>
                    </div>
                    <div className="card-items-preview">
                       {o.items?.slice(0, 4).map((item, idx) => (
                         <img key={idx} src={item.paint?.images?.[0] || 'https://images.unsplash.com/photo-1562184552-997c461abbe6?auto=format&fit=crop&q=80&w=100'} className="thumb-mini-mobile" alt="" />
                       ))}
                    </div>
                    <div className="card-footer-flex">
                      <div className="card-amount">Rs. {Number(o.totalAmount || 0).toLocaleString()}</div>
                      <div className="card-actions">
                        <select 
                          value={o.orderStatus || 'pending'} 
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                          className="action-btn-pro"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Process</option>
                          <option value="dispatched">Dispatch</option>
                          <option value="delivered">Deliver</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state-mobile">No orders found.</div>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Order Information</th>
                      <th>Client Details</th>
                      <th>Progress Pipeline</th>
                      <th>Financials</th>
                      <th>Orchestration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(o => (
                      <tr key={o._id} className="order-row-advanced">
                        <td>
                          <div className="order-main-info">
                            <div>
                              <strong style={{ display: 'block', fontSize: '1.05rem' }}>#{o.orderId || 'N/A'}</strong>
                              <div className="order-thumbs-preview">
                                {o.items?.slice(0, 3).map((item, idx) => (
                                  <img key={idx} src={item.paint?.images?.[0] || 'https://images.unsplash.com/photo-1562184552-997c461abbe6?auto=format&fit=crop&q=80&w=100'} className="thumb-mini" alt="" />
                                ))}
                                {(o.items?.length || 0) > 3 && <span className="more-count">+{(o.items?.length || 0) - 3}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-mini">
                            <div className="user-avatar-text" style={{ background: '#334155' }}>{o.user?.name ? o.user.name.charAt(0) : '?'}</div>
                            <div>
                              <strong>{o.user?.name || 'Guest Customer'}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{o.user?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="status-flow-indicator">
                            {getStatusSteps(o.orderStatus).map((step, idx) => {
                              const steps = getStatusSteps(o.orderStatus);
                              const nextStep = steps[idx + 1];
                              return (
                                <React.Fragment key={idx}>
                                  <div className={`flow-step ${step.active ? 'active' : ''}`} title={step.name}></div>
                                  {idx < 3 && <div className={`flow-line ${step.active && nextStep?.active ? 'active' : ''}`}></div>}
                                </React.Fragment>
                              );
                            })}
                          </div>
                          <span className={`status-pill-pro ${o.orderStatus || 'pending'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                            {(o.orderStatus || 'pending').replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <strong style={{ display: 'block' }}>Rs. {Number(o.totalAmount || 0).toLocaleString()}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Electronic'}</span>
                        </td>
                        <td>
                          <div className="action-menu-premium">
                            <select 
                              value={o.orderStatus || 'pending'} 
                              onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                              className="action-btn-pro"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Process</option>
                              <option value="dispatched">Dispatch</option>
                              <option value="delivered">Deliver</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                            <button className="action-btn-pro" style={{ background: '#f8fafc' }}>
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
                          <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                          <p style={{ color: 'var(--text-muted)' }}>No orders found matching your criteria.</p>
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

export default AdminOrders;

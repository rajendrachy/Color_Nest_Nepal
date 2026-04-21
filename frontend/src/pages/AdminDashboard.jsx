import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  DollarSign, ShoppingBag, Users, AlertTriangle, 
  TrendingUp, ArrowUpRight, Clock, Calendar
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Analyzing Business Intelligence...</p>
        </div>
      </main>
    </div>
  );

  const barData = {
    labels: data?.salesByRegion.map(r => r._id) || [],
    datasets: [{
      label: 'Orders by Province',
      data: data?.salesByRegion.map(r => r.count) || [],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderRadius: 12,
      borderWidth: 0,
      hoverBackgroundColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(244, 63, 94, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(34, 197, 94, 1)'
      ]
    }]
  };

  const pieData = {
    labels: data?.salesByRegion.map(r => r._id) || [],
    datasets: [{
      data: data?.salesByRegion.map(r => r.revenue) || [],
      backgroundColor: [
        '#6366f1', 
        '#a855f7', 
        '#ec4899', 
        '#f43f5e', 
        '#f97316', 
        '#eab308', 
        '#22c55e'
      ],
      hoverOffset: 20,
      borderWidth: 4,
      borderColor: '#ffffff'
    }]
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="admin-header-premium">
          <div className="header-info">
            <h1>Business Overview</h1>
            <p>Real-time analytics and performance metrics for Nippo Paints Nepal.</p>
          </div>
        </div>
        
        <div className="orders-stats-grid">
          <div className="stat-mini-card card">
            <div className="icon-box green"><DollarSign size={20} /></div>
            <div className="stat-val">
              <h3>Rs. {data?.stats.revenue.toLocaleString()}</h3>
              <span>Total Revenue</span>
            </div>
            <div className="trend-tag positive"><ArrowUpRight size={12} /> 12%</div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box blue"><ShoppingBag size={20} /></div>
            <div className="stat-val">
              <h3>{data?.stats.orders}</h3>
              <span>Total Orders</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box purple"><Users size={20} /></div>
            <div className="stat-val">
              <h3>{data?.stats.users}</h3>
              <span>Active Users</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box orange"><AlertTriangle size={20} /></div>
            <div className="stat-val">
              <h3>{data?.stats.lowStock}</h3>
              <span>Inventory Alerts</span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card card">
            <div className="chart-header">
              <h3>Regional Order Distribution</h3>
              <TrendingUp size={18} className="text-muted" />
            </div>
            <div className="chart-wrapper-inner">
              <Bar 
                data={barData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                      ticks: { color: '#64748b', font: { weight: '600' } }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#64748b', font: { weight: '600' } }
                    }
                  }
                }} 
              />
            </div>
          </div>
          <div className="chart-card card">
            <div className="chart-header">
              <h3>Revenue Share by Province</h3>
            </div>
            <div className="chart-wrapper-inner">
              <Pie 
                data={pieData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { weight: '600', size: 12 }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper card mt-30">
          <div className="table-header-premium">
            <h3>Recent Activity</h3>
            <span className="badge approved">Live Feed</span>
          </div>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-id-cell">
                    <strong>{order.orderId}</strong>
                  </td>
                  <td className="user-cell">
                    <div className="avatar">{order.user?.name.charAt(0)}</div>
                    <div className="user-info">
                      <strong>{order.user?.name}</strong>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="amount-cell">
                    <strong>Rs. {order.totalAmount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${order.orderStatus}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Warehouse, Settings, LogOut, ShieldCheck,
  UserCheck, Bell, MessageSquare, Landmark,
  History
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const links = [
    { name: 'Analytics', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Inventory', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <Landmark size={20} /> },
    { name: 'Customers', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Painters', path: '/admin/painters', icon: <UserCheck size={20} /> },
    { name: 'Logistics', path: '/admin/warehouses', icon: <Warehouse size={20} /> },
    { name: 'Audit Logs', path: '/admin/report-logs', icon: <History size={20} /> },
    { name: 'Config', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="admin-sidebar-premium">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <ShieldCheck size={28} />
        </div>
        <div className="brand-text">
          <strong>ColorNest</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <span className="nav-label">Main Menu</span>
        {links.map(link => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`sidebar-nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer-premium">
        <div className="user-profile-mini">
          <div className="user-avatar-premium">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="user-details-mini">
            <strong>{user?.name || 'Administrator'}</strong>
            <span>System Manager</span>
          </div>
        </div>
        <button className="logout-btn-premium" onClick={logout} title="Sign Out">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

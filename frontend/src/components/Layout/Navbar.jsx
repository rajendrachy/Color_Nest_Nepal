import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Search, Globe, Package, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import NotificationPanel from '../NotificationPanel';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState('EN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Polling for notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      const count = data.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'NP' : 'EN');
    toast.success(`Language switched to ${language === 'EN' ? 'Nepali' : 'English'}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="nippo">Color</span>
          <span className="paints">Nest</span>
          <span className="nepal">Nepal</span>
        </Link>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Paints</Link>
          {user?.role !== 'painter' && (
            <Link to="/painters" onClick={() => setIsMobileMenuOpen(false)}>Find a Painter</Link>
          )}
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link to="/track" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="admin-link" onClick={() => setIsMobileMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
          {user?.role === 'painter' && (
            <Link to="/painter-dashboard" className="nav-link-special" onClick={() => setIsMobileMenuOpen(false)}>
              Painter Dashboard
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <div className="search-bar">
            <input type="text" placeholder="Search colors, products..." />
            <Search size={18} />
          </div>

          <button className="lang-toggle" onClick={toggleLanguage} aria-label="Toggle Language">
            <Globe size={18} />
            <span>{language}</span>
          </button>

          {user?.role !== 'admin' && user?.role !== 'painter' && (
            <Link to="/cart" className="cart-icon" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart size={24} />
              {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
            </Link>
          )}

          {user ? (
            <div className="user-menu" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              <div className="notif-wrapper" style={{ position: 'relative' }}>
                <button 
                  className="nav-icon-btn" 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', color: '#1e293b', padding: '5px', display: 'flex', alignItems: 'center' }}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="notif-badge" style={{ position: 'absolute', top: '0px', right: '0px', background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '50%', minWidth: '14px', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel isOpen={isNotifOpen} setIsOpen={setIsNotifOpen} />
              </div>

              {user.role !== 'admin' && user.role !== 'painter' && (
                <Link to="/dashboard" className="my-orders-link" style={{ fontWeight: '500', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Package size={18} /> My Orders
                </Link>
              )}
              <Link to="/profile" className="nav-profile-link" onClick={() => setIsMobileMenuOpen(false)}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="nav-avatar" />
                ) : (
                  <User size={24} />
                )}
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          )}

          <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

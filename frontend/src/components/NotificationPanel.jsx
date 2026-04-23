import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import api from '../services/api';
import './NotificationPanel.css';

const NotificationPanel = ({ isOpen, setIsOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" ref={panelRef}>
      <div className="notification-panel-header">
        <h3>Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h3>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllRead} title="Mark all as read">
              <Check size={16} />
            </button>
          )}
          <button className="btn-close-panel" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notif-loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={40} opacity={0.2} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif._id} className={`notif-item ${!notif.isRead ? 'unread' : ''}`} onClick={() => markAsRead(notif._id)}>
              <div className="notif-icon">
                {notif.type === 'painter_request' ? '🎨' : notif.type === 'order' ? '📦' : '🔔'}
              </div>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
              {!notif.isRead && <div className="notif-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

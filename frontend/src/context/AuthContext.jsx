import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.twoFactorRequired) {
        setLoading(false);
        return { twoFactorRequired: true, email: data.email };
      }

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      if (data.cart && data.cart.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(data.cart));
      }
      
      setLoading(false);
      return { success: true, user: data };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const verify2FA = async (email, code) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-2fa', { email, code });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      if (data.cart && data.cart.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(data.cart));
      }
      
      setLoading(false);
      return { success: true, user: data };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', userData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

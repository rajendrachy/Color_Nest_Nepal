import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const result = await register(formData);
    if (result.success) {
      toast.success('Account created successfully! Welcome to ColorNest.');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <h2>Create Account</h2>
        <p>Join the Nippo Paints community.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone Number (98XXXXXXXX)</label>
            <input type="text" required onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

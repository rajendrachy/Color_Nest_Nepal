import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [code, setCode] = useState('');
  const { login, verify2FA, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (show2FA) {
      const result = await verify2FA(email, code);
      if (result.success) {
        toast.success(`Identity verified! Welcome, ${result.user.name}`);
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await login(email, password);
      if (result.twoFactorRequired) {
        setShow2FA(true);
        toast('Verification code sent to your email', { icon: '📧' });
      } else if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <h2>{show2FA ? 'Verify Identity' : 'Welcome Back'}</h2>
        <p>{show2FA ? 'Please enter the 6-digit code sent to your email.' : 'Login to manage your orders and profile.'}</p>
        
        <form onSubmit={handleSubmit}>
          {!show2FA ? (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="form-group animate-fade">
              <label>Verification Code</label>
              <input 
                type="text" 
                required 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="000000"
                maxLength="6"
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '8px', 
                  fontSize: '1.5rem',
                  fontWeight: '800'
                }}
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
                Secure code sent to {email}
              </p>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Processing...' : (show2FA ? 'Verify Code' : 'Login')}
          </button>

          {show2FA && (
            <button 
              type="button" 
              className="btn btn-outline full-width mt-10" 
              onClick={() => setShow2FA(false)}
              style={{ border: 'none' }}
            >
              Back to Login
            </button>
          )}
        </form>

        {!show2FA && (
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

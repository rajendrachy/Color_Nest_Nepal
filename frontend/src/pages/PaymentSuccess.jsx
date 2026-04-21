import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Home, Loader2, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const { method: pathMethod } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const method = pathMethod || searchParams.get('method');
  const data = searchParams.get('data'); // for eSewa
  const pidx = searchParams.get('pidx'); // for Khalti

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        let response;
        if (method === 'esewa' && data) {
          response = await api.get(`/orders/verify-esewa?data=${data}`);
        } else if (method === 'khalti' && pidx) {
          response = await api.get(`/orders/verify-khalti?pidx=${pidx}`);
        } else {
          throw new Error('Invalid payment verification parameters');
        }

        if (response.data.success) {
          setOrderId(response.data.orderId);
          toast.success('Payment Verified Successfully!');
        } else {
          throw new Error('Verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.response?.data?.message || err.message || 'Payment verification failed');
        toast.error('Payment Verification Failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [method, data, pidx]);

  if (isVerifying) {
    return (
      <div className="payment-success-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={64} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <h2>Verifying Payment...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please do not refresh or close this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="success-card" style={{ maxWidth: '500px', width: '100%', padding: '50px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
          <XCircle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
          <h1 style={{ color: '#ef4444', marginBottom: '15px' }}>Payment Failed</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/checkout')} style={{ width: '100%' }}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--surface)'
    }}>
      <div className="success-card animate-fade" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        background: 'white', 
        padding: '50px 40px', 
        borderRadius: '24px', 
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)'
      }}>
        <div className="icon-badge" style={{ 
          width: '100px', 
          height: '100px', 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 30px' 
        }}>
          <CheckCircle size={50} color="#10b981" />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--secondary)' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
          Thank you for choosing Color Nest Paints. Your payment was verified and your order is now being processed.
        </p>

        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(`/track/${orderId}`)} 
            style={{ width: '100%', height: '54px', fontSize: '1rem' }}
          >
            Track Order <Package size={18} style={{ marginLeft: '8px' }} />
          </button>
          
          <Link 
            to="/" 
            className="btn" 
            style={{ 
              width: '100%', 
              height: '54px', 
              background: 'var(--surface)', 
              color: 'var(--secondary)',
              border: '1px solid var(--border)' 
            }}
          >
            Go to Homepage <Home size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    </div>
  );
};

export default PaymentSuccess;


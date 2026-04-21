import React from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const { method: pathMethod } = useParams();
  const [searchParams] = useSearchParams();
  const method = pathMethod || searchParams.get('method');

  return (
    <div className="payment-failure-page" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--surface)'
    }}>
      <div className="failure-card animate-fade" style={{ 
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
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 30px' 
        }}>
          <XCircle size={50} color="#ef4444" />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--secondary)' }}>Payment Failed</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
          We couldn't process your {method} payment. Your order has been saved as "Pending Payment". You can try again or choose a different payment method.
        </p>

        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/checkout')} 
            style={{ width: '100%', height: '54px', fontSize: '1rem' }}
          >
            Retry Payment <RefreshCw size={18} style={{ marginLeft: '8px' }} />
          </button>
          
          <button 
            className="btn" 
            onClick={() => navigate('/cart')} 
            style={{ 
              width: '100%', 
              height: '54px', 
              background: 'var(--surface)', 
              color: 'var(--secondary)',
              border: '1px solid var(--border)' 
            }}
          >
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;

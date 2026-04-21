import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { PROVINCES, DISTRICTS } from '../utils/constants';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ChevronRight, 
  ShoppingBag, 
  Wallet, 
  ShieldCheck,
  Package,
  ArrowLeft,
  Loader2,
  Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, subtotal, vat, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      toast.error('Administrators are not permitted to place orders. Please use a customer account.');
      navigate('/admin');
    }
  }, [user, navigate]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState({
    province: '',
    district: '',
    municipality: '',
    ward: '',
    street: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isLoadingCharge, setIsLoadingCharge] = useState(false);

  useEffect(() => {
    if (address.province && address.district) {
      const fetchCharge = async () => {
        setIsLoadingCharge(true);
        try {
          const { data } = await api.get('/delivery/calculate-charge', {
            params: { province: address.province, district: address.district }
          });
          setDeliveryCharge(data.charge);
        } catch (error) {
          setDeliveryCharge(150); // Default fallback
        } finally {
          setIsLoadingCharge(false);
        }
      };
      fetchCharge();
    }
  }, [address.province, address.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      return navigate('/login?redirect=checkout');
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Processing your order...');

    const orderData = {
      items: cartItems.map(item => ({
        paint: item._id,
        quantity: item.quantity,
        price: item.pricePerLiter || 0,
        total: (item.pricePerLiter || 0) * item.quantity
      })),
      deliveryAddress: address,
      paymentMethod,
      deliveryCharge: Number(deliveryCharge) || 0,
      subtotal: Number(subtotal) || 0,
      vat: Number(vat) || 0,
      totalAmount: (Number(total) || 0) + (Number(deliveryCharge) || 0)
    };

    try {
      const { data: order } = await api.post('/orders/create', orderData);
      
      toast.success('Order initiated!', { id: loadingToast });
      clearCart();

      if (paymentMethod === 'eSewa') {
        const { data: esewaData } = await api.get(`/orders/${order._id}/initiate-esewa`);
        
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', esewaData.esewa_url);

        Object.keys(esewaData).forEach(key => {
          if (key !== 'esewa_url') {
            const hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', esewaData[key]);
            form.appendChild(hiddenField);
          }
        });

        document.body.appendChild(form);
        form.submit();
      } else if (paymentMethod === 'Khalti') {
        const { data: khaltiData } = await api.get(`/orders/${order._id}/initiate-khalti`);
        if (khaltiData.payment_url) {
          window.location.href = khaltiData.payment_url;
        } else {
          throw new Error('Failed to get Khalti payment URL');
        }
      } else if (paymentMethod === 'Simulated Test Pay') {
        const { data: testData } = await api.post('/orders/verify-test', { orderId: order._id });
        if (testData.success) {
          toast.success('Test payment successful!', { id: loadingToast });
          setTimeout(() => {
            navigate(`/track/${order._id}`);
          }, 1500);
        }
      } else {
        toast.success('Order placed successfully!', { id: loadingToast });
        setTimeout(() => {
          navigate(`/track/${order._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="checkout-page container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <ShoppingBag size={64} color="var(--border)" style={{ marginBottom: '20px' }} />
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Add some premium paints to your cart first!</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="btn-back" onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', marginBottom: '20px', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back to Cart
        </button>
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className="step active">
            <span className="step-number">1</span>
            <span>Shipping</span>
          </div>
          <ChevronRight size={16} color="var(--border)" />
          <div className="step active">
            <span className="step-number">2</span>
            <span>Payment</span>
          </div>
          <ChevronRight size={16} color="var(--border)" />
          <div className="step">
            <span className="step-number">3</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      <form className="checkout-grid" onSubmit={handlePlaceOrder}>
        <div className="checkout-main">
          {/* Delivery Address Section */}
          <section className="form-section animate-fade">
            <h3><MapPin size={22} /> Delivery Address</h3>
            <div className="input-row">
              <div className="form-group">
                <label>Province</label>
                <select 
                  required 
                  name="province"
                  value={address.province}
                  onChange={(e) => {
                    setAddress({ ...address, province: e.target.value, district: '' });
                  }}
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>District</label>
                <select 
                  required 
                  name="district"
                  value={address.district}
                  onChange={handleInputChange}
                  disabled={!address.province}
                >
                  <option value="">Select District</option>
                  {address.province && DISTRICTS[address.province].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label>Municipality / Rural Mun.</label>
                <input 
                  type="text" 
                  name="municipality"
                  required 
                  placeholder="e.g. Kathmandu Metro"
                  value={address.municipality}
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Ward No.</label>
                <input 
                  type="number" 
                  name="ward"
                  required 
                  placeholder="e.g. 10"
                  value={address.ward}
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address & Landmark</label>
              <input 
                type="text" 
                name="street"
                required 
                placeholder="House No, Street Name, Landmark"
                value={address.street}
                onChange={handleInputChange} 
              />
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="form-section animate-fade" style={{ animationDelay: '0.1s' }}>
            <h3><CreditCard size={22} /> Payment Method</h3>
            <div className="payment-grid">
              {[
                { id: 'Cash on Delivery', name: 'Cash On Delivery', icon: <Truck size={20} /> },
                { id: 'eSewa', name: 'eSewa', icon: <Wallet size={20} /> },
                { id: 'Khalti', name: 'Khalti', icon: <Wallet size={20} /> },
                { id: 'ConnectIPS', name: 'ConnectIPS', icon: <ShieldCheck size={20} /> },
                { id: 'Simulated Test Pay', name: 'Test Gateway', icon: <Terminal size={20} /> }
              ].map(method => (
                <label key={method.id} className={`payment-card ${paymentMethod === method.id ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value={method.id} 
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="icon-wrapper">
                    {method.icon}
                  </div>
                  <span>{method.name}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="order-summary animate-fade" style={{ animationDelay: '0.2s' }}>
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item-mini">
                <img src={item.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} />
                <div className="item-details">
                  <p>{item.name}</p>
                  <span>Qty: {item.quantity} × Rs. {item.pricePerLiter}</span>
                </div>
                <span className="item-total">Rs. {item.pricePerLiter * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>VAT (13%)</span>
              <span>Rs. {vat.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>{isLoadingCharge ? <Loader2 size={14} className="animate-spin" /> : `Rs. ${deliveryCharge}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>Rs. {((Number(total) || 0) + (Number(deliveryCharge) || 0)).toFixed(2)}</span>
            </div>
          </div>

          <div className="trust-badges" style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} style={{ color: '#10b981', display: 'block', margin: '0 auto 5px' }} />
              Secure
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Package size={18} style={{ color: '#3b82f6', display: 'block', margin: '0 auto 5px' }} />
              Fast Delivery
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary place-order-btn" 
            disabled={isProcessing || (address.province === '')}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '15px' }}>
            By placing an order, you agree to our Terms of Service.
          </p>
        </aside>
      </form>

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
  );
};

export default Checkout;

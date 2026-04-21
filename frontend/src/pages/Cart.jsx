import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, vat, total } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-wrapper animate-fade">
        <div className="empty-cart-content card">
          <div className="empty-icon-box">
            <ShoppingBag size={64} />
          </div>
          <h2>Your cart is empty</h2>
          <p>It looks like you haven't added any premium colors to your cart yet. Discover our collection to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Explore Collection <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>You have <strong>{cartItems.length}</strong> items in your cart</p>
        </div>

        <div className="cart-grid">
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item-card card animate-fade">
                <div className="item-image">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} />
                </div>
                
                <div className="item-info">
                  <div className="item-main">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                  </div>
                  <div className="item-price-unit">Rs. {item.pricePerLiter} / L</div>
                </div>

                <div className="item-controls">
                  <div className="quantity-toggle">
                    <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity">
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label="Increase quantity">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="item-subtotal">
                    Rs. {(item.pricePerLiter * item.quantity).toFixed(2)}
                  </div>
                </div>

                <button className="item-remove-btn" onClick={() => handleRemove(item._id, item.name)} title="Remove item">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            
            <div className="cart-actions-footer">
              <Link to="/products" className="continue-shopping">
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Continue Shopping
              </Link>
            </div>
          </div>

          <aside className="cart-summary-sidebar">
            <div className="summary-card card">
              <h3>Order Summary</h3>
              <div className="summary-details">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Estimated VAT (13%)</span>
                  <span>Rs. {vat.toFixed(2)}</span>
                </div>
                <div className="summary-line delivery">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="summary-total">
                  <span>Estimated Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className="btn btn-primary btn-checkout full-width"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
              
              <div className="trust-seals">
                <p>Secure checkout powered by ColorNest</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;

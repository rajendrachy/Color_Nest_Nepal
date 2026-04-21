import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Star, Calculator, Info, CheckCircle, ArrowLeft, Loader2, Shield, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [area, setArea] = useState('');
  const [neededLiters, setNeededLiters] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/paints/${id}`);
        setProduct(data);
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const calculateNeeded = () => {
    if (!area || isNaN(area)) return;
    const coverage = product?.specifications?.coverage 
      ? parseInt(product.specifications.coverage) 
      : 120;
    const liters = Math.ceil(area / coverage) * 2; // Default 2 coats
    setNeededLiters(liters);
    setQuantity(liters);
    toast.success(`Recommended quantity updated to ${liters}L`);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  if (loading) return (
    <div className="loader-full">
      <Loader2 size={40} className="animate-spin" />
      <p>Loading premium colors...</p>
    </div>
  );
  
  if (!product) return (
    <div className="container empty-state-detail">
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary">Back to Products</Link>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/products" className="back-link">
          <ArrowLeft size={18} /> Back to Collection
        </Link>
        
        <div className="detail-grid">
          <div className="detail-gallery">
            <div className="main-image-container card">
              <img 
                src={product.images?.[activeImage] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                alt={product.name} 
                className="main-image" 
              />
            </div>
            <div className="image-thumbnails">
              {product.images?.map((img, i) => (
                <div 
                  key={i} 
                  className={`thumb-wrapper ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="detail-content">
            <div className="brand-badge">Premium Quality</div>
            <span className="category-tag">{product.category}</span>
            <h1>{product.name}</h1>
            
            <div className="detail-meta">
              <div className="rating-row">
                <Star size={18} fill="var(--accent)" color="var(--accent)" />
                <Star size={18} fill="var(--accent)" color="var(--accent)" />
                <Star size={18} fill="var(--accent)" color="var(--accent)" />
                <Star size={18} fill="var(--accent)" color="var(--accent)" />
                <Star size={18} fill="rgba(0,0,0,0.1)" color="rgba(0,0,0,0.1)" />
                <span>4.8 (120+ Reviews)</span>
              </div>
              <div className="stock-tag">In Stock</div>
            </div>

            <div className="price-container">
              <div className="price">
                <span className="amount">Rs. {product.pricePerLiter}</span>
                <span className="unit">/ liter</span>
              </div>
              {user?.role !== 'admin' && (
                <button 
                  className="btn-icon" 
                  onClick={() => addToCart(product, 1)}
                  title="Add to Cart"
                >
                  <ShoppingCart size={20} />
                </button>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="specs-list">
              <div className="spec-card">
                <div className="spec-icon"><Info size={20} /></div>
                <div>
                  <label>Finish</label>
                  <p>{product.specifications?.finish || 'Premium Matte'}</p>
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><CheckCircle size={20} /></div>
                <div>
                  <label>Coverage</label>
                  <p>{product.specifications?.coverage || '120 sq.ft/L'}</p>
                </div>
              </div>
            </div>

            <div className="quick-calc card">
              <div className="calc-header-mini">
                <Calculator size={18} />
                <span>Smart Coverage Calculator</span>
              </div>
              <div className="calc-input-group">
                <input 
                  type="number" 
                  placeholder="Total surface area (sq. ft.)" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <button onClick={calculateNeeded}>Estimate</button>
              </div>
              {neededLiters > 0 && (
                <div className="calc-success animate-fade">
                  Recommended: <strong>{neededLiters} Liters</strong> (for 2 coats)
                </div>
              )}
            </div>

            <div className="purchase-controls">
              <div className="quantity-box">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              {user?.role === 'admin' ? (
                <div className="admin-notice" style={{ padding: '15px', background: '#fef2f2', border: '1px dashed #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.9rem', fontWeight: '500' }}>
                  Admin accounts cannot place orders.
                </div>
              ) : (
                <button className="btn btn-primary btn-add-cart" onClick={handleAddToCart}>
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              )}
            </div>

            <div className="product-features-mini">
              <div className="feat-mini"><Shield size={16} /> 10-Year Weather Protection</div>
              <div className="feat-mini"><Droplets size={16} /> Eco-friendly & Low VOC</div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .loader-full {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 20px;
          color: var(--text-muted);
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default ProductDetail;

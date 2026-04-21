import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  return (
    <div className="product-card card">
      <Link to={`/products/${product._id}`} className="product-image">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={product.name || 'Product'} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
        />
        {product.discountPrice && <span className="badge">Offer</span>}
      </Link>
      
      <div className="product-info">
        <span className="category">{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="rating">
          <Star size={16} fill="var(--accent)" color="var(--accent)" />
          <span>{product.rating || '4.5'}</span>
        </div>
        
        <div className="product-footer">
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
      </div>
    </div>
  );
};

export default ProductCard;

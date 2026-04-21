import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/Product/ProductCard';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '-createdAt'
  });

  const query = new URLSearchParams(useLocation().search);
  const catParam = query.get('category');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (catParam) {
      setFilters(prev => ({ ...prev, category: catParam }));
    }
  }, [catParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/paints', { params: filters });
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  return (
    <div className="products-container">
      {/* Products Page Header */}
      <div className="products-banner">
        <div className="banner-content">
          <h1>Premium Paint Collection</h1>
          <p>Discover our wide range of durable, eco-friendly colors for every surface.</p>
        </div>
      </div>

      <div className="products-page">
        <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
          <SlidersHorizontal size={20} /> Filters
        </button>

        <aside className={`sidebar ${showMobileFilters ? 'show' : ''}`}>
          <div className="sidebar-inner">
            <div className="filter-header">
              <h2>Filters</h2>
              <button className="text-btn clear-btn" onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', search: '', sort: '-createdAt' })}>Clear All</button>
            </div>

            <div className="filter-section">
              <h3>Categories</h3>
              <div className="category-list">
                {['Interior', 'Exterior', 'Wood', 'Metal', 'Texture', 'Waterproofing'].map(cat => (
                  <label key={cat} className={`custom-radio ${filters.category === cat ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={filters.category === cat}
                      onChange={() => setFilters({ ...filters, category: cat })}
                    />
                    <span className="radio-label">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Price Range (Rs.)</h3>
              <div className="price-inputs">
                <div className="input-group">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>
                <span className="separator">-</span>
                <div className="input-group">
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-toolbar">
            <div className="search-box-modern">
              <Search size={20} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search by name, color, or finish..." 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div className="sort-box-modern">
              <span className="text-muted">Sort:</span>
              <div className="custom-select">
                <select 
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                  <option value="-createdAt">Newest Arrivals</option>
                  <option value="pricePerLiter">Price: Low to High</option>
                  <option value="-pricePerLiter">Price: High to Low</option>
                  <option value="-rating">Highest Rated</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>

          <div className="products-results">
            <p className="results-count">Showing <strong>{Array.isArray(products) ? products.length : 0}</strong> products</p>
          </div>

          {loading ? (
            <div className="loader-modern">
              <div className="spinner"></div>
              <p>Loading collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn-primary mt-3" onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', search: '', sort: '-createdAt' })}>Clear Filters</button>
            </div>
          ) : (
            <div className="grid-products">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Plus, Edit, Trash2, Upload, X, Loader2, 
  Search, Filter, ShoppingBag, AlertTriangle, 
  Layers, Package, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Interior',
    pricePerLiter: '',
    costPricePerLiter: '',
    availableQuantity: '',
    description: '',
    specifications: { 
      finish: 'Matte', 
      coverage: '',
      dryingTime: '',
      applicationMethod: 'Brush/Roller'
    },
    images: []
  });

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data } = await api.get('/paints');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploading(true);

    try {
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url || data] }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading('Saving product...');
    
    // Clean up formData before sending
    const payload = { ...formData };
    if (payload.specifications) {
      if (!payload.specifications.coverage) delete payload.specifications.coverage;
      if (!payload.specifications.dryingTime) delete payload.specifications.dryingTime;
    }
    
    try {
      if (editingProduct) {
        await api.put(`/admin/paints/${editingProduct._id}`, payload);
        toast.success('Product updated', { id: loadToast });
      } else {
        await api.post('/admin/paints', payload);
        toast.success('Product created', { id: loadToast });
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product', { id: loadToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/paints/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const productStats = {
    total: products.length,
    lowStock: products.filter(p => p.availableQuantity < 20).length,
    categories: [...new Set(products.map(p => p.category))].length,
    totalValue: products.reduce((acc, p) => acc + (p.pricePerLiter * p.availableQuantity), 0)
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Syncing Catalog...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="admin-header-premium">
          <div className="header-info">
            <h1>Catalog Management</h1>
            <p>Define your premium paint collection and manage inventory levels.</p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setEditingProduct(null);
            setFormData({ 
              name: '', 
              category: 'Interior', 
              pricePerLiter: '', 
              costPricePerLiter: '',
              availableQuantity: '', 
              description: '', 
              specifications: { finish: 'Matte', coverage: '', dryingTime: '', applicationMethod: 'Brush/Roller' }, 
              images: [] 
            });
            setShowModal(true);
          }}>
            <Plus size={20} /> Add New Paint
          </button>
        </div>

        <div className="orders-stats-grid">
          <div className="stat-mini-card card">
            <div className="icon-box blue"><ShoppingBag size={20} /></div>
            <div className="stat-val">
              <h3>{productStats.total}</h3>
              <span>Total Skus</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box orange"><AlertTriangle size={20} /></div>
            <div className="stat-val">
              <h3>{productStats.lowStock}</h3>
              <span>Low Stock Alerts</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box purple"><Layers size={20} /></div>
            <div className="stat-val">
              <h3>{productStats.categories}</h3>
              <span>Categories</span>
            </div>
          </div>
          <div className="stat-mini-card card">
            <div className="icon-box green"><Package size={20} /></div>
            <div className="stat-val">
              <h3>Rs. {productStats.totalValue.toLocaleString()}</h3>
              <span>Inventory Value</span>
            </div>
          </div>
        </div>

        <div className="table-controls card">
          <div className="search-box-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {['Interior', 'Exterior', 'Wood', 'Metal', 'Texture', 'Waterproofing'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper card">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Stock Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p._id}>
                  <td className="product-info-cell">
                    <div className="product-thumb">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <ImageIcon size={20} />}
                    </div>
                    <div className="product-name-info">
                      <strong>{p.name}</strong>
                      <span title={p.description}>{p.description?.substring(0, 40) || 'No description provided...'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`category-tag-mini ${p.category.toLowerCase()}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="amount-cell">
                    <strong>Rs. {p.pricePerLiter.toLocaleString()}</strong>
                    <span>per liter</span>
                  </td>
                  <td>
                    <div className={`stock-indicator ${p.availableQuantity < 20 ? 'critical' : 'healthy'}`}>
                      <strong>{p.availableQuantity} L</strong>
                      <div className="progress-bar-mini">
                        <div className="progress" style={{ width: `${Math.min(100, (p.availableQuantity / 100) * 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="view-btn-circle" onClick={() => {
                        setEditingProduct(p);
                        setFormData({
                          ...p,
                          costPricePerLiter: p.costPricePerLiter || 0,
                          specifications: {
                            finish: 'Matte',
                            coverage: '',
                            dryingTime: '',
                            applicationMethod: 'Brush/Roller',
                            ...(p.specifications || {})
                          }
                        });
                        setShowModal(true);
                      }} title="Edit Product">
                        <Edit size={16} />
                      </button>
                      <button className="view-btn-circle delete" onClick={() => handleDelete(p._id)} title="Delete Product">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay-premium">
            <div className="modal-content-premium card animate-fade">
              <div className="modal-header">
                <h2>{editingProduct ? 'Update Collection' : 'Create New Collection'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Emulsion Gold" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {['Interior', 'Exterior', 'Wood', 'Metal', 'Texture', 'Waterproofing'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Cost Price (Rs.)</label>
                    <input type="number" required value={formData.costPricePerLiter} onChange={e => setFormData({...formData, costPricePerLiter: e.target.value})} placeholder="Cost" />
                  </div>
                  <div className="form-group">
                    <label>Selling Price (Rs.)</label>
                    <input type="number" required value={formData.pricePerLiter} onChange={e => setFormData({...formData, pricePerLiter: e.target.value})} placeholder="Selling" />
                  </div>
                  <div className="form-group">
                    <label>Opening Inventory (Liters)</label>
                    <input type="number" required value={formData.availableQuantity} onChange={e => setFormData({...formData, availableQuantity: e.target.value})} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Paint Finish</label>
                    <select value={formData.specifications?.finish} onChange={e => setFormData({...formData, specifications: {...formData.specifications, finish: e.target.value}})}>
                      {['Matte', 'Gloss', 'Satin', 'Semi-Gloss'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Coverage (sq.ft / liter)</label>
                    <input value={formData.specifications?.coverage} onChange={e => setFormData({...formData, specifications: {...formData.specifications, coverage: e.target.value}})} placeholder="e.g. 100-120" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Drying Time</label>
                    <input value={formData.specifications?.dryingTime} onChange={e => setFormData({...formData, specifications: {...formData.specifications, dryingTime: e.target.value}})} placeholder="e.g. 2-4 hours" />
                  </div>
                  <div className="form-group">
                    <label>Application Method</label>
                    <select value={formData.specifications?.applicationMethod} onChange={e => setFormData({...formData, specifications: {...formData.specifications, applicationMethod: e.target.value}})}>
                      <option value="Brush/Roller">Brush/Roller</option>
                      <option value="Spray">Spray</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the paint properties..." />
                </div>

                <div className="form-group">
                  <label>Asset Gallery</label>
                  <div className="gallery-uploader">
                    {formData.images.map((img, i) => (
                      <div key={i} className="gallery-item">
                        <img src={img} alt="" />
                        <button type="button" className="remove-gallery" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="uploader-box">
                      <input type="file" hidden onChange={handleUpload} />
                      <div className="upload-content">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                        <span>{uploading ? 'Uploading...' : 'Add Image'}</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-save">
                    {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Star, Phone, ShieldCheck, X, 
  Briefcase, Calendar, CheckCircle, Zap, ArrowRight,
  TrendingUp, Upload, FileText
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './Painters.css';

const Painters = () => {
  const { user, register: authRegister } = useContext(AuthContext);
  const navigate = useNavigate();
  const [painters, setPainters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [bookingPainter, setBookingPainter] = useState(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  
  const imageInputRef = useRef(null);
  const certInputRef = useRef(null);
  
  // Booking Form State
  const [bookingDetails, setBookingDetails] = useState({
    address: '',
    details: ''
  });

  // Painter Registration Form State
  const [formData, setFormData] = useState({
    name: user ? user.name : '', 
    email: user ? user.email : '', 
    phone: user ? user.phone : '', 
    password: '',
    confirmPassword: '',
    experience: '', 
    location: '', 
    specialties: '',
    image: '',
    certificate: ''
  });

  useEffect(() => {
    fetchPainters();
  }, []);

  const fetchPainters = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/painters');
      // Only show verified painters to users for professionalism
      const verifiedOnly = data.filter(p => p.verified);
      setPainters(verifiedOnly);
    } catch (error) {
      toast.error('Identity database synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('image', file);

    try {
      if (type === 'image') setUploadingImage(true);
      if (type === 'certificate') setUploadingCert(true);

      const { data } = await api.post('/upload', imgData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, [type]: data.url }));
      toast.success(`${type === 'image' ? 'Profile Photo' : 'Certificate'} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${type === 'image' ? 'photo' : 'certificate'}`);
    } finally {
      if (type === 'image') setUploadingImage(false);
      if (type === 'certificate') setUploadingCert(false);
    }
  };

  const handleApplyClick = () => {
    setShowForm(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      return toast.error("Please upload a profile photo");
    }
    
    if (!user) {
      if (!formData.password || formData.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }
    }

    const loadToast = toast.loading('Submitting application...');
    try {
      // If user is not logged in, register them first
      if (!user) {
        const regRes = await authRegister({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (!regRes.success) {
          toast.dismiss(loadToast);
          return toast.error(regRes.message || 'Failed to create account');
        }
      }

      // Now create the painter profile
      const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(s => s);
      const { data } = await api.post('/painters', { ...formData, specialties: specialtiesArray });
      toast.success('Professional entry submitted! Welcome to Color Nest.', { id: loadToast });
      setShowForm(false);
      
      // If backend returned an updated token with painter role, apply it
      if (data.updatedUser) {
        localStorage.setItem('userInfo', JSON.stringify(data.updatedUser));
      }
      
      // Hard redirect to clear any stale state and properly load the dashboard
      setTimeout(() => {
        window.location.href = '/painter-dashboard';
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: loadToast });
    }
  };

  const handleBookNow = (painter) => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    setBookingPainter(painter);
  };

  const submitBooking = async () => {
    if(!bookingDetails.address) {
      toast.error('Please provide an address for the site visit');
      return;
    }
    const loadToast = toast.loading('Sending your request...');
    try {
      await api.post(`/painters/${bookingPainter._id}/request`, bookingDetails);
      toast.success(`Consultation request sent to ${bookingPainter.name}!`, { id: loadToast });
      setBookingPainter(null);
      setBookingDetails({ address: '', details: '' });
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to send booking request', { id: loadToast });
    }
  };

  const handleContact = (painter) => {
    navigator.clipboard.writeText(painter.phone);
    toast.success(`Contact number for ${painter.name} copied to clipboard!`);
  };

  const filteredPainters = painters.filter(painter => {
    const matchesSearch = painter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === '' || painter.location.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesCity;
  });

  return (
    <div className="painters-page">
      <section className="painters-header">
        <div className="container">
          <div className="badge-pill-light" style={{ display: 'inline-flex', padding: '8px 20px', borderRadius: '100px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '700' }}>
            <Zap size={16} color="var(--painter-accent)" style={{ marginRight: '8px' }} /> ColorNest Verified Professionals
          </div>
          <h1>Find Your Perfect Master Painter</h1>
          <p>Connect with Nepal's elite network of verified contractors, specialized in luxury finishes and precision coating.</p>
          
          <div className="search-filters-premium">
            <div className="search-input-group">
              <Search size={20} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search by professional name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-input-group">
              <MapPin size={20} color="#94a3b8" />
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="">All Locations</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Pokhara">Pokhara</option>
                <option value="Chitwan">Chitwan</option>
              </select>
            </div>
            <button className="btn-search-premium">Search Experts</button>
          </div>
        </div>
      </section>

      <div className="container painters-content">
        {user?.role === 'painter' && (
          <div style={{ marginBottom: '30px', background: '#eff6ff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>You are a registered professional!</h3>
              <p style={{ margin: 0, color: '#3b82f6' }}>Check your dashboard for new booking requests.</p>
            </div>
            <Link to="/painter-dashboard" className="btn-book-premium" style={{ background: '#2563eb' }}>
              Go to Dashboard
            </Link>
          </div>
        )}

        {loading ? (
          <div className="loader-box-premium" style={{ background: 'white', padding: '60px', borderRadius: '30px' }}>
            <div className="pulse-loader"></div>
            <p>Authenticating Professional Directory...</p>
          </div>
        ) : (
          <>
            <div className="painters-grid">
              {filteredPainters.map(painter => (
                <div key={painter._id} className="painter-card-premium">
                  <div className="painter-card-header">
                    <div className="painter-avatar-box">
                      <img src={painter.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200'} alt={painter.name} />
                    </div>
                    <div className="painter-main-info">
                      <h3>
                        {painter.name} 
                        {painter.verified && <ShieldCheck size={20} className="verified-badge" />}
                      </h3>
                      <div className="rating-pill">
                        <Star size={14} fill="currentColor" />
                        <span>{painter.rating || '4.8'}</span>
                        <span style={{ opacity: 0.6, fontWeight: '400', fontSize: '0.75rem' }}>({painter.reviews || '24'} Reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="painter-body-premium">
                    <div className="expertise-section">
                      <label>Core Expertise</label>
                      <div className="expertise-tags">
                        {(painter.specialties || ['Interior', 'Texture']).map(spec => (
                          <span key={spec} className="exp-tag">{spec}</span>
                        ))}
                      </div>
                    </div>

                    <div className="painter-meta-info">
                      <div className="meta-item">
                        <Briefcase size={16} /> <span>{painter.experience} Experience</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={16} /> <span>{painter.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="painter-footer-actions">
                    <button className="btn-contact-glass" onClick={() => handleContact(painter)}>
                      <Phone size={18} /> Contact
                    </button>
                    <button className="btn-book-premium" onClick={() => handleBookNow(painter)}>
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPainters.length === 0 && (
              <div className="no-results-premium card" style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '40px' }}>
                <Search size={64} opacity={0.1} style={{ marginBottom: '20px' }} />
                <h3>No Professionals Found</h3>
                <p>Try adjusting your location or search terms to find available experts.</p>
              </div>
            )}
          </>
        )}

        {/* Join as Painter Hero */}
        {user?.role !== 'painter' && !showForm && (
          <div className="painter-join-hero">
            <div className="hero-content">
              <h2>Master the Art of Color</h2>
              <p>Are you a professional contractor? Join our elite network to access premium projects, direct leads, and exclusive Color Nest Paints certification.</p>
              <button className="btn-join-premium" onClick={handleApplyClick}>
                Apply for Certification <ArrowRight size={20} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="registration-glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', color: '#1e293b' }}>Professional Registration</h2>
                <p style={{ color: '#64748b' }}>Provide your credentials to join the ColorNest expert directory.</p>
              </div>
              <button className="btn-icon" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#1e293b', width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            
            <form onSubmit={handleRegister} className="form-premium-grid">
              
              {/* Image Upload Section */}
              <div className="form-group-premium" style={{ gridColumn: '1 / -1' }}>
                <label>Profile & Identity Documents</label>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {/* Photo Upload */}
                  <div style={{ flex: 1, minWidth: '250px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {formData.image ? (
                      <img src={formData.image} alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={24} color="#64748b" />
                      </div>
                    )}
                    <div>
                      <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} />
                      <button 
                        type="button" 
                        onClick={() => imageInputRef.current.click()} 
                        style={{ 
                          padding: '10px 16px', 
                          background: 'white', 
                          border: '2px solid #cbd5e1', 
                          borderRadius: '8px', 
                          color: '#475569', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseOver={(e) => { e.target.style.borderColor = '#c41e3a'; e.target.style.color = '#c41e3a'; }}
                        onMouseOut={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.color = '#475569'; }}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Profile Photo'}
                      </button>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '5px 0 0 0' }}>Clear face photo (Max 2MB)</p>
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div style={{ flex: 1, minWidth: '250px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {formData.certificate ? (
                      <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={30} color="#10b981" />
                      </div>
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} color="#64748b" />
                      </div>
                    )}
                    <div>
                      <input type="file" ref={certInputRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => handleImageUpload(e, 'certificate')} />
                      <button 
                        type="button" 
                        onClick={() => certInputRef.current.click()} 
                        style={{ 
                          padding: '10px 16px', 
                          background: 'white', 
                          border: '2px solid #cbd5e1', 
                          borderRadius: '8px', 
                          color: '#475569', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseOver={(e) => { e.target.style.borderColor = '#c41e3a'; e.target.style.color = '#c41e3a'; }}
                        onMouseOut={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.color = '#475569'; }}
                      >
                        {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                      </button>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '5px 0 0 0' }}>Training or Experience Proof</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group-premium">
                <label>Legal Name</label>
                <input type="text" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!user} />
              </div>
              <div className="form-group-premium">
                <label>Direct Contact</label>
                <input type="tel" placeholder="98XXXXXXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={!!user} />
              </div>

              {!user && (
                <>
                  <div className="form-group-premium">
                    <label>Create Password</label>
                    <input type="password" placeholder="At least 6 characters" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="form-group-premium">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Confirm your password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                  <div className="form-group-premium" style={{ display: 'none' }}></div>
                </>
              )}

              <div className="form-group-premium">
                <label>Years of Experience</label>
                <input type="text" placeholder="e.g. 8 Years" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Base City</label>
                <input type="text" placeholder="e.g. Kathmandu" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Skill Specialties</label>
                <input type="text" placeholder="Interior, Texture, Wood Polish" required value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} />
              </div>
              
              <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '30px' }}>
                <button type="submit" className="btn-premium-red" disabled={uploadingImage || uploadingCert} style={{ padding: '18px 40px', fontSize: '1.1rem' }}>
                   Confirm & Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingPainter && (
        <div className="modal-overlay-premium" onClick={() => setBookingPainter(null)}>
          <div className="booking-modal-content animate-pop" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>Book Appointment</h2>
              <button className="btn-icon" onClick={() => setBookingPainter(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            
            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.05rem', lineHeight: '1.5' }}>
              You are requesting a consultation with <strong style={{ color: '#0f172a' }}>{bookingPainter.name}</strong>.
            </p>

            <div className="form-group-premium" style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', color: '#334155', marginBottom: '8px', display: 'block' }}>Site Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                placeholder="E.g. House No. 12, Baneshwor, Kathmandu" 
                value={bookingDetails.address}
                onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <div className="form-group-premium" style={{ marginBottom: '35px' }}>
              <label style={{ fontWeight: '600', color: '#334155', marginBottom: '8px', display: 'block' }}>Project Details (Optional)</label>
              <textarea 
                placeholder="Briefly describe what you need painted (e.g., 3 bedrooms interior, exterior walls, wood polish)..." 
                rows="4"
                value={bookingDetails.details}
                onChange={e => setBookingDetails({...bookingDetails, details: e.target.value})}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} 
                onClick={() => setBookingPainter(null)}
                onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
              >
                Cancel
              </button>
              <button 
                style={{ flex: 2, padding: '15px', borderRadius: '10px', border: 'none', background: '#c41e3a', color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(196, 30, 58, 0.3)', transition: 'transform 0.2s' }} 
                onClick={submitBooking}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Finalize Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Painters;

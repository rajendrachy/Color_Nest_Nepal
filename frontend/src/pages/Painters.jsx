import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Phone, ShieldCheck, X, 
  Briefcase, Calendar, CheckCircle, Zap, ArrowRight,
  MessageSquare, Eye, TrendingUp
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Painters.css';

const Painters = () => {
  const [painters, setPainters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [bookingPainter, setBookingPainter] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', experience: '', location: '', specialties: ''
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

  const handleRegister = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading('Submitting application...');
    try {
      const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(s => s);
      await api.post('/painters', { ...formData, specialties: specialtiesArray });
      toast.success('Professional entry submitted! Our team will review your credentials.', { id: loadToast });
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', experience: '', location: '', specialties: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: loadToast });
    }
  };

  const handleBookNow = (painter) => {
    setBookingPainter(painter);
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

        {/* Professional Guide Section */}
        <section className="painter-guide-section">
          <div className="guide-header">
            <h2>The Painter's Path to Success</h2>
            <p>Your journey to becoming a top-rated certified professional with Color Nest Paints.</p>
          </div>
          <div className="guide-steps-grid">
            <div className="guide-step-card">
              <div className="step-number">1</div>
              <div className="step-icon-box"><Briefcase size={32} /></div>
              <h4>Apply Online</h4>
              <p>Submit your professional credentials, experience, and contact details through our secure application portal.</p>
            </div>
            <div className="guide-step-card">
              <div className="step-number">2</div>
              <div className="step-icon-box"><ShieldCheck size={32} /></div>
              <h4>Get Certified</h4>
              <p>Our experts review your portfolio. Once approved, you receive the official "ColorNest Verified" digital certificate.</p>
            </div>
            <div className="guide-step-card">
              <div className="step-number">3</div>
              <div className="step-icon-box"><Eye size={32} /></div>
              <h4>Gain Visibility</h4>
              <p>Your profile is featured in our public directory, allowing thousands of premium customers to find and view your work.</p>
            </div>
            <div className="guide-step-card">
              <div className="step-number">4</div>
              <div className="step-icon-box"><TrendingUp size={32} /></div>
              <h4>Grow Business</h4>
              <p>Receive direct booking requests, manage projects, and grow your reputation with verified customer reviews.</p>
            </div>
          </div>
        </section>

        {/* Join as Painter Hero */}
        {!showForm ? (
          <div className="painter-join-hero">
            <div className="hero-content">
              <h2>Master the Art of Color</h2>
              <p>Are you a professional contractor? Join our elite network to access premium projects, direct leads, and exclusive Color Nest Paints certification.</p>
              <button className="btn-join-premium" onClick={() => setShowForm(true)}>
                Apply for Certification <ArrowRight size={20} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </div>
        ) : (
          <div className="registration-glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', color: '#1e293b' }}>Professional Registration</h2>
                <p style={{ color: '#64748b' }}>Provide your credentials to join the ColorNest expert directory.</p>
              </div>
              <button className="btn-icon" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#1e293b', width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleRegister} className="form-premium-grid">
              <div className="form-group-premium">
                <label>Legal Name</label>
                <input type="text" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group-premium">
                <label>Direct Contact</label>
                <input type="tel" placeholder="98XXXXXXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
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
                <button type="submit" className="btn-premium-red" style={{ padding: '18px 40px', fontSize: '1.1rem' }}>
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
            <div className="booking-success-icon">
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#1e293b' }}>Confirm Appointment</h2>
            <p style={{ color: '#64748b', margin: '15px 0 30px' }}>
              You are requesting a consultation with <strong>{bookingPainter.name}</strong>. 
              Our service coordinator will contact you within 2 hours to confirm the site visit schedule.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-glass secondary-dark" style={{ flex: 1 }} onClick={() => setBookingPainter(null)}>Cancel</button>
              <button className="btn-premium-red" style={{ flex: 2 }} onClick={() => {
                toast.success(`Consultation request sent to ${bookingPainter.name}!`);
                setBookingPainter(null);
              }}>
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

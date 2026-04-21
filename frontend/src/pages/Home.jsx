import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Droplets, Calculator, Star, CheckCircle, PaintBucket, Users } from 'lucide-react';
import './Home.css';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-modern-premium">
        <div className="hero-overlay-premium"></div>
        <div className="hero-content-premium container">
          <div className="hero-text-premium animate-fade">
            <div className="badge-premium">✨ #1 Paint Brand in Nepal</div>
            <h1>
              Color Your World<br />
              <span className="text-primary">With ColorNest</span>
            </h1>
            <p className="hero-lead">
              Elevate your spaces with our premium, eco-friendly paints. Experience the perfect blend of extreme durability and breathtaking aesthetics inspired by the heart of Nepal.
            </p>
            <div className="hero-btns-premium">
              <Link to="/products" className="btn btn-primary btn-lg group">
                Explore Colors 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link to="/calculator" className="btn btn-outline-white btn-lg">
                Coverage Calculator
              </Link>
            </div>
            
            <div className="hero-stats-premium">
              <div className="stat-item-premium">
                <span className="stat-number-premium">10K+</span>
                <span className="stat-label-premium">Happy Customers</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-number-premium">50+</span>
                <span className="stat-label-premium">Retail Stores</span>
              </div>
              <div className="stat-item-premium">
                <span className="stat-number-premium">100%</span>
                <span className="stat-label-premium">Eco-Friendly</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual-premium">
            <div className="hero-image-stack">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000" 
                alt="Beautiful Painted Interior" 
                className="img-main"
              />
              <div className="floating-card-premium card-1">
                <div className="color-swatches">
                  <div className="swatch" style={{ background: '#E2DFD2' }}></div>
                  <div className="swatch" style={{ background: '#D99A5B' }}></div>
                  <div className="swatch" style={{ background: '#A0522D' }}></div>
                </div>
                <div className="card-info">
                  <strong>Trending Palette</strong>
                  <span>Himalayan Heritage</span>
                </div>
              </div>
              <div className="floating-card-premium card-2">
                <Star className="text-accent" size={24} fill="currentColor" />
                <div className="card-info">
                  <strong>4.9/5 Rating</strong>
                  <span>From 2,000+ Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Choose ColorNest?</h2>
            <p>We blend innovation with tradition to bring you the best painting solutions.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: Truck, title: "Nationwide Delivery", desc: "Fast and reliable delivery across all 7 provinces of Nepal." },
              { icon: Shield, title: "10-Year Warranty", desc: "Long-lasting finish with our comprehensive weather protection." },
              { icon: Droplets, title: "10,000+ Shades", desc: "An infinite spectrum of colors to match your exact imagination." },
              { icon: Calculator, title: "Smart Estimation", desc: "Calculate your exact paint requirements with our precision tool." }
            ].map((feat, idx) => (
              <div className="feature-card-modern" key={idx}>
                <div className="feature-icon-wrapper">
                  <feat.icon size={28} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <h2>Explore Categories</h2>
            <p>Find the perfect formulation for every surface.</p>
          </div>
          <Link to="/products" className="btn btn-outline">View All Products</Link>
        </div>
        <div className="bento-grid">
          <Link to="/products?category=Interior" className="bento-item bento-large group">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="Interior Paints" />
            <div className="bento-content">
              <h3>Interior Elegance</h3>
              <p>Luxurious finishes that transform your living spaces.</p>
              <span className="bento-link">Explore <ArrowRight size={16} /></span>
            </div>
          </Link>
          <Link to="/products?category=Exterior" className="bento-item group">
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600" alt="Exterior Paints" />
            <div className="bento-content">
              <h3>Exterior Shield</h3>
              <p>Ultimate weather protection.</p>
            </div>
          </Link>
          <Link to="/products?category=Wood" className="bento-item group">
            <img src="https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=600" alt="Wood Care" />
            <div className="bento-content">
              <h3>Wood Care</h3>
              <p>Preserve natural beauty.</p>
            </div>
          </Link>
          <Link to="/products?category=Texture" className="bento-item bento-wide group">
            <img src="https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800" alt="Textures" />
            <div className="bento-content">
              <h3>Designer Textures</h3>
              <p>Add depth and character to your accent walls.</p>
              <span className="bento-link">Explore <ArrowRight size={16} /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Colors of Nepal (Interactive Accordion/Cards) */}
      <section className="colors-of-nepal-modern">
        <div className="container">
          <div className="section-header text-center text-white">
            <h2>The Colors of Nepal</h2>
            <p>Exclusive palettes inspired by the rich culture and landscapes of our beautiful country.</p>
          </div>
          <div className="interactive-palette-grid">
            {[
              { name: "Himalayan Snow", color: "#F0F4F8", desc: "Pure, crisp whites inspired by the peaks of Everest.", image: "https://images.unsplash.com/photo-1483728642387-6c3ba6c6af5f?auto=format&fit=crop&q=80&w=600" },
              { name: "Patan Terracotta", color: "#A0522D", desc: "Earthy tones from the ancient architecture of Lalitpur.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600" },
              { name: "Mustang Forest", color: "#2D5A27", desc: "Deep, calming greens reflecting the serene wilderness.", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600" },
              { name: "Lumbini Gold", color: "#D4AF37", desc: "Warm, spiritual hues echoing the birthplace of Buddha.", image: "https://images.unsplash.com/photo-1528690327387-9bb3a62886c9?auto=format&fit=crop&q=80&w=600" }
            ].map((palette, idx) => (
              <div className="palette-panel" key={idx}>
                <div className="palette-bg" style={{ backgroundImage: `url(${palette.image})` }}></div>
                <div className="palette-overlay" style={{ background: `linear-gradient(to top, ${palette.color}E6, ${palette.color}4D)` }}></div>
                <div className="palette-content">
                  <div className="color-indicator" style={{ backgroundColor: palette.color }}></div>
                  <h4>{palette.name}</h4>
                  <p>{palette.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Section */}
      <section className="trust-section container">
        <div className="trust-content">
          <h2>Trusted by Professionals</h2>
          <p>Over 1,000+ painters and contractors across Nepal choose ColorNest for their prestigious projects.</p>
          <ul className="trust-list">
            <li><CheckCircle className="text-primary" size={20} /> ISO 9001:2015 Certified Manufacturing</li>
            <li><CheckCircle className="text-primary" size={20} /> Low VOC & Environmentally Friendly</li>
            <li><CheckCircle className="text-primary" size={20} /> Advanced Anti-Fungal Properties</li>
          </ul>
        </div>
        <div className="trust-stats grid-2">
          <div className="stat-card">
            <div className="stat-icon"><PaintBucket size={32} /></div>
            <h3>5 Million+</h3>
            <p>Liters Sold Annually</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Users size={32} /></div>
            <h3>50,000+</h3>
            <p>Homes Transformed</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-modern">
        <div className="container">
          <div className="cta-wrapper">
            <div className="cta-text">
              <h2>Ready to Redefine Your Space?</h2>
              <p>Consult with our color experts or use our smart calculator to get started on your next painting project.</p>
              <div className="cta-actions">
                <Link to="/products" className="btn btn-white btn-lg">Shop Collection</Link>
                <Link to="/contact" className="btn btn-outline-white btn-lg">Contact Experts</Link>
              </div>
            </div>
            <div className="cta-decoration">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


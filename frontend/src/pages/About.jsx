import React, { useEffect } from 'react';
import './About.css';
import { CheckCircle, Shield, Award, Users, Globe, Target } from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero-modern">
        <div className="about-hero-content">
          <div className="badge">Our Legacy</div>
          <h1>Coloring the Dreams of Nepal</h1>
          <p>For over two decades, ColorNest Nepal has been the trusted name in premium coatings, bringing innovation and unmatched durability to every home.</p>
        </div>
        <div className="about-hero-overlay"></div>
      </section>

      <section className="about-content-modern">
        <div className="split-layout">
          <div className="split-text">
            <h2>Our Story & Vision</h2>
            <p className="lead">Founded with a vision to redefine the paint industry in Nepal, ColorNest has grown from a small local unit to a nationwide leader.</p>
            <p>We combine precision technology with rich Nepali heritage to create colors that last a lifetime. Every stroke of our brush brings out the vibrancy of your spaces while ensuring deep protection.</p>
            <p>Our unwavering commitment to quality and the environment has made us the premier choice for architects, builders, and homeowners across all 7 provinces.</p>
            
            <div className="vision-box">
              <Target className="text-primary mb-3" size={32} />
              <h4>Our Mission</h4>
              <p>To provide sustainable, world-class painting solutions that elevate aesthetics while preserving the natural beauty of Nepal.</p>
            </div>
          </div>
          <div className="split-visual">
            <div className="image-stack">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800" alt="Beautiful Home Exterior" className="img-front card-hover" />
              <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800" alt="Paint Manufacturing" className="img-back card-hover" />
              
              <div className="floating-stat glass">
                <strong>20+</strong>
                <span>Years of Excellence</span>
              </div>
            </div>
          </div>
        </div>

        <div className="core-values-section">
          <div className="text-center mb-5">
            <h2>Our Core Values</h2>
            <p className="subtitle">The principles that drive our innovation and quality.</p>
          </div>
          <div className="values-grid-modern">
            <div className="value-card-premium">
              <div className="icon-box"><Shield size={32} /></div>
              <h3>Ultimate Durability</h3>
              <p>Formulated to withstand Nepal's diverse climate, from the intense heat of Terai to the freezing cold of the Himalayas.</p>
            </div>
            <div className="value-card-premium">
              <div className="icon-box"><Award size={32} /></div>
              <h3>Uncompromised Quality</h3>
              <p>ISO certified processes ensuring every drop of paint meets international standards for finish and longevity.</p>
            </div>
            <div className="value-card-premium">
              <div className="icon-box"><CheckCircle size={32} /></div>
              <h3>Eco-Friendly</h3>
              <p>Low VOC and lead-free paints that are completely safe for your family and the fragile environment.</p>
            </div>
            <div className="value-card-premium">
              <div className="icon-box"><Users size={32} /></div>
              <h3>Community First</h3>
              <p>Proudly supporting local artisans, painters, and community development projects across Nepal.</p>
            </div>
            <div className="value-card-premium">
              <div className="icon-box"><Globe size={32} /></div>
              <h3>Nationwide Reach</h3>
              <p>Ensuring our products are accessible in every district, backed by an extensive network of reliable dealers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

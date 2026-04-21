import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="nippo">Color</span>
            <span className="paints">Nest</span>
          </Link>
          <p className="footer-desc">
            The leading paint manufacturer in Nepal, providing premium quality, eco-friendly colors for every corner of your home and commercial spaces.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/products">Our Paints</Link></li>
            <li><Link to="/painters">Find a Painter</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/track">Track Your Order</Link></li>
            <li><Link to="/faq">Common Questions</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Get In Touch</h4>
          <div className="contact-item">
            <div className="contact-icon-box"><MapPin size={18} /></div>
            <span>Baneshwor, Kathmandu, Nepal</span>
          </div>
          <div className="contact-item">
            <div className="contact-icon-box"><Phone size={18} /></div>
            <span>+977-1-4400000</span>
          </div>
          <div className="contact-item">
            <div className="contact-icon-box"><Mail size={18} /></div>
            <span>contact@colornest.com.np</span>
          </div>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Join our newsletter for exclusive color inspiration and seasonal offers.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" aria-label="Email for newsletter" />
            <button className="newsletter-btn" aria-label="Subscribe">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; 2026 ColorNest Nepal. Designed for premium spaces.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

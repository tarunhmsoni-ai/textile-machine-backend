import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const machineTypes = [
    {
      id: 'knitting',
      name: 'Knitting',
      icon: '🧶',
      subtypes: ['Warp Knitting', 'Circular Knitting', 'Flat Knitting', 'Beams']
    },
    {
      id: 'weaving',
      name: 'Weaving',
      icon: '🪡',
      subtypes: ['Waterjet Loom', 'Airjet Loom', 'Rapier Loom', 'Power Loom']
    },
    {
      id: 'warping',
      name: 'Warping',
      icon: '⚙️',
      subtypes: ['Direct Warping', 'Split Warping', 'Beamer']
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/machines?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMachineTypeClick = (type) => {
    navigate(`/machines?type=${type}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Send newsletter subscription to backend
    alert('Thank you for subscribing!');
    setEmail('');
  };

  const whatsappContact = '+919662001216';

  return (
    <div className="home-page">
      <Navbar />

      {/* Preserved existing WhatsApp contact action, now a floating button */}
      <a
        href={`https://wa.me/${whatsappContact.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="home-page__whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>

      {/* Hero Section with Search */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Textile Machine</h1>
          <p>Buy, Sell & Trade Textile Machinery - Knitting, Weaving & Warping Machines</p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search machines by brand, model, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍 Search</button>
          </form>
        </div>
      </section>

      {/* Machine Types */}
      <section className="machine-types">
        <h2>Browse by Machine Type</h2>
        <div className="types-grid">
          {machineTypes.map((type) => (
            <div
              key={type.id}
              className="type-card"
              onClick={() => handleMachineTypeClick(type.id)}
            >
              <div className="type-icon">{type.icon}</div>
              <h3>{type.name}</h3>
              <ul className="subtypes">
                {type.subtypes.map((subtype, idx) => (
                  <li key={idx}>{subtype}</li>
                ))}
              </ul>
              <button className="browse-btn">Browse {type.name} →</button>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search Machines</h3>
            <p>Browse through our extensive collection of textile machines</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Contact Seller</h3>
            <p>Connect via WhatsApp, Phone, Email, or Contact Form</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Negotiate & Deal</h3>
            <p>Discuss price and terms directly with the seller</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Complete Transaction</h3>
            <p>Finalize the deal and arrange delivery</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <h2>Get Special Offers in Your Inbox</h2>
        <p>Subscribe to receive exclusive updates about new machines and special offers</p>
        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="subscribe-btn">Subscribe</button>
        </form>
      </section>

      {/* Sell Your Machine */}
      <section className="sell-section">
        <h2>Have Machines to Sell?</h2>
        <p>Post your machines and reach thousands of potential buyers</p>
        <div className="sell-methods">
          <div className="method">
            <h3>📞 Phone</h3>
            <p>Call us at +919662001216</p>
          </div>
          <div className="method">
            <h3>💬 WhatsApp</h3>
            <p>Message +919662001216</p>
          </div>
          <div className="method">
            <h3>📧 Email</h3>
            <p>nikhhilkgarg@gmail.com</p>
          </div>
          <div className="method">
            <h3>📝 Contact Form</h3>
            <button className="contact-form-btn">Fill Form</button>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="contact">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <input type="tel" placeholder="Your Phone" />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>Building India's largest marketplace for textile machines</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/machines">Machines</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a href="#" title="Facebook">f</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="WhatsApp">💬</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Textile Machine Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

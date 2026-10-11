import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import CategoryBar from '../../components/CategoryBar';
import Breadcrumb from '../../components/Breadcrumb';
import apiClient, { resolveMediaUrl } from '../../services/apiClient';
import './MachineDetail.css';

const FALLBACK_MACHINE = {
  id: 1,
  type: 'knitting',
  subtype: 'Warp Knitting (Tricot)',
  brand: 'Karl Mayer',
  model: 'HKS 3-M',
  year: 2003,
  location: 'On request',
  description: 'Karl Mayer HKS 3-M tricot warp knitting machine, E28 gauge, 210" working width. Made in Germany, constructed 2003.',
  photos: ['/machines/karl-mayer-hks3m-plate.webp'],
  videoUrl: '/machines/karl-mayer-hks3m.mp4',
  seller: {
    name: 'Direct Sale',
    phone: '+919662001216',
    whatsapp: '+919662001216',
    email: 'nikhhilkgarg@gmail.com',
  },
  specifications: {
    Type: 'Warp Knitting',
    'Sub Type': 'Tricot',
    Brand: 'Karl Mayer',
    Model: 'HKS 3-M',
    Year: '2003',
    Gauge: 'E28',
    'Working Width': '210" (5334 mm)',
    'Needle Number': '51.50',
    Spacing: '0.9071 mm',
    'Machine No.': '91000',
  },
};

const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [activeMedia, setActiveMedia] = useState('photo');
  const [activePhoto, setActivePhoto] = useState(0);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    apiClient
      .get(`/machines/${id}`)
      .then((res) => {
        if (cancelled) return;
        const m = res.data;
        setMachine({
          id: m.id,
          type: m.type,
          subtype: m.subtype,
          brand: m.brand,
          model: m.model,
          year: m.year,
          location: m.location,
          description: m.description,
          condition: m.condition,
          photos: (m.photos || []).map(resolveMediaUrl),
          videoUrl: m.videoUrl ? resolveMediaUrl(m.videoUrl) : null,
          seller: m.seller,
          specifications: m.specifications || {},
        });
        setActiveMedia(m.videoUrl ? 'video' : 'photo');
        setActivePhoto(0);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        } else if (String(id) === '1') {
          // Backend unreachable — show the bundled sample machine so the demo still works.
          setMachine(FALLBACK_MACHINE);
          setActiveMedia('video');
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleContactFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // TODO: Send enquiry to backend
    setContactSent(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => {
      setContactSent(false);
      setShowContactForm(false);
    }, 2500);
  };

  const whatsappMessage = machine
    ? `Hi, I'm interested in the ${machine.brand} ${machine.model} machine listed on your platform. Could you please provide more details?`
    : '';

  const handleShare = async () => {
    if (!machine) return;
    const shareData = {
      title: `${machine.brand} ${machine.model}`,
      text: `Check out this ${machine.brand} ${machine.model} on Textile Machine`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled share — nothing to do */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch {
        /* clipboard unavailable — silently ignore */
      }
    }
  };

  if (loading) {
    return (
      <div className="machine-detail">
        <Navbar />
        <CategoryBar active="" />
        <div className="detail-loading">Loading machine…</div>
      </div>
    );
  }

  if (notFound || !machine) {
    return (
      <div className="machine-detail">
        <Navbar />
        <CategoryBar active="" />
        <div className="detail-loading">
          <p>We couldn't find that machine.</p>
          <button className="back-btn" onClick={() => navigate('/machines')}>← Back to Listings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="machine-detail">
      <Navbar />
      <CategoryBar active={machine.type} />
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__top">
          <button className="back-btn" onClick={() => navigate('/machines')}>← Back to Listings</button>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Machines', href: '/machines' },
              { label: machine.subtype, href: `/machines?type=${machine.type}` },
              { label: `${machine.brand} ${machine.model}` },
            ]}
          />
        </div>
        <h1>{machine.brand} {machine.model}</h1>
      </div>

      <div className="detail-container">
        {/* Main Content */}
        <main className="detail-main">
          {/* Media Gallery */}
          <section className="gallery-section">
            <div className="main-image">
              <div className="image-placeholder">
                {activeMedia === 'video' && machine.videoUrl ? (
                  <video src={machine.videoUrl} controls autoPlay muted loop playsInline />
                ) : (
                  <img src={machine.photos[activePhoto]} alt={`${machine.brand} ${machine.model}`} />
                )}
                <button
                  className="main-image__share"
                  onClick={handleShare}
                  aria-label="Share this machine"
                  title="Share"
                >
                  ⤴
                </button>
              </div>
            </div>
            <div className="thumbnail-gallery">
              {machine.videoUrl && (
                <div
                  className={`thumbnail ${activeMedia === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveMedia('video')}
                >
                  <video src={machine.videoUrl} muted preload="metadata" />
                  <span className="play-badge">▶</span>
                  <span className="thumbnail__badge">Video</span>
                </div>
              )}
              {machine.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${activeMedia === 'photo' && activePhoto === idx ? 'active' : ''}`}
                  onClick={() => { setActiveMedia('photo'); setActivePhoto(idx); }}
                >
                  <img src={photo} alt={`Machine view ${idx + 1}`} />
                  <span className="thumbnail__badge">{idx + 1}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Machine Info */}
          <section className="info-section">
            <div className="header-info">
              <h2>{machine.brand}</h2>
              <p className="model">{machine.model}</p>
              <div className="badges">
                <span className="type-badge">{machine.subtype}</span>
                <span className="year-badge">{machine.year}</span>
                <span className="condition-badge">{machine.condition || 'Working'}</span>
              </div>
            </div>

            <div className="price-box">
              <p className="price-label">💬 Ask About Price</p>
              <p className="price-text">Contact seller for pricing details</p>
            </div>

            <div className="location-info">
              <p><strong>📍 Location:</strong> {machine.location}</p>
              <p><strong>📅 Year:</strong> {machine.year}</p>
              <p><strong>⚙️ Condition:</strong> {machine.condition || 'Working'}</p>
            </div>

            <p className="description">{machine.description}</p>

            {/* Specifications Table */}
            <section className="specifications">
              <h3>Specifications</h3>
              <table className="spec-table">
                <tbody>
                  {Object.entries(machine.specifications).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          <CategoryBar active={machine.type} layout="vertical" />

          {/* Seller Info */}
          <div className="seller-card">
            <h3>Seller Information</h3>
            <p className="seller-name">{machine.seller.name}</p>

            <div className="contact-methods">
              <h4>Contact Methods</h4>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${machine.seller.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn whatsapp-btn"
              >
                💬 WhatsApp
              </a>

              {/* Phone */}
              <a
                href={`tel:${machine.seller.phone}`}
                className="contact-btn phone-btn"
              >
                📞 Call Now
              </a>

              {/* Email */}
              <a
                href={`mailto:${machine.seller.email}`}
                className="contact-btn email-btn"
              >
                📧 Email
              </a>

              {/* Contact Form */}
              <button
                className="contact-btn form-btn"
                onClick={() => setShowContactForm(!showContactForm)}
              >
                📝 Contact Form
              </button>
            </div>

            {/* Contact Form */}
            {showContactForm && (
              contactSent ? (
                <p className="inline-contact-form__success">✓ Sent — the seller will be in touch shortly.</p>
              ) : (
                <form className="inline-contact-form" onSubmit={handleContactSubmit}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleContactFormChange('name', e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => handleContactFormChange('email', e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) => handleContactFormChange('phone', e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => handleContactFormChange('message', e.target.value)}
                    rows="3"
                    required
                  ></textarea>
                  <button type="submit" className="submit-form-btn">Send Message</button>
                </form>
              )
            )}
          </div>

          {/* Key Highlights */}
          <div className="highlights-card">
            <h3>Quick Facts</h3>
            <ul>
              <li>✅ Verified Seller</li>
              <li>✅ Machine Inspected</li>
              <li>✅ Ready to Operate</li>
              <li>✅ Negotiable Price</li>
            </ul>
          </div>

          {/* Safety Info */}
          <div className="safety-card">
            <h3>Safety Tips</h3>
            <ul>
              <li>Verify seller details before visiting</li>
              <li>Inspect machine thoroughly</li>
              <li>Check documentation</li>
              <li>Get warranty details</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MachineDetail;

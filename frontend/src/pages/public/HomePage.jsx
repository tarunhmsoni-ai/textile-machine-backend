import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../../components/Navbar';
import CategoryBar from '../../components/CategoryBar';
import GearLogo from '../../components/GearLogo';
import AnimatedButton from '../../components/AnimatedButton';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import FacebookIcon from '../../components/FacebookIcon';
import apiClient, { resolveMediaUrl } from '../../services/apiClient';
import { onImageError } from '../../utils/imageFallback';
import { whatsappShareUrl, facebookShareUrl } from '../../utils/shareLinks';
import './HomePage.css';

const MACHINE_TYPES = [
  {
    id: 'knitting',
    name: 'Knitting',
    icon: '🧶',
    subtypes: ['Warp Knitting', 'Circular Knitting', 'Flat Knitting', 'Beams'],
  },
  {
    id: 'weaving',
    name: 'Weaving',
    icon: '🪡',
    subtypes: ['Waterjet Loom', 'Airjet Loom', 'Rapier Loom', 'Power Loom'],
  },
  {
    id: 'warping',
    name: 'Warping',
    icon: '⚙️',
    subtypes: ['Direct Warping', 'Split Warping', 'Beamer'],
  },
];

const BUYER_PIPELINE_STEPS = [
  { n: '01', label: 'SEARCH', copy: 'Search for a machine on our portal.' },
  { n: '02', label: 'ENQUIRE', copy: 'Contact us to buy the machine.' },
  { n: '03', label: 'INSPECT', copy: 'We arrange your factory visit and machine inspection.' },
  { n: '04', label: 'NEGOTIATE', copy: 'Negotiation.' },
  { n: '05', label: 'DEAL', copy: 'Deal is done. We charge you a small brokerage for the deal.' },
];

const SELLER_PIPELINE_STEPS = [
  { n: '01', label: 'LIST', copy: 'Submit your machinery details.' },
  { n: '02', label: 'VERIFY', copy: 'Listing is reviewed and verified.' },
  { n: '03', label: 'CONNECT', copy: 'Our team connects you with genuine buyers.' },
  { n: '04', label: 'NEGOTIATE', copy: 'Negotiations are done.' },
  { n: '05', label: 'DEAL', copy: 'Deal is done. We charge you a small brokerage for the deal.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const [featured, setFeatured] = useState([]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const gearY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const gearRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const whatsappContact = '+919662001216';

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get('/machines')
      .then((res) => {
        // Never show fake/sample listings here — a buyer clicking a card
        // expects a real machine, and a fabricated one is just a dead end.
        const list = res.data || [];
        if (!cancelled) setFeatured(list.map((m) => ({ ...m, photo: resolveMediaUrl(m.photo) })));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (filterType) params.set('type', filterType);
    navigate(`/machines${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleMachineTypeClick = (type) => navigate(`/machines?type=${type}`);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Send newsletter subscription to backend
    setNewsletterDone(true);
    setEmail('');
    setTimeout(() => setNewsletterDone(false), 4000);
  };

  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    const fd = new FormData(e.target);
    try {
      await apiClient.post('/leads/public', {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        message: fd.get('message'),
      });
      setContactDone(true);
      e.target.reset();
      setTimeout(() => setContactDone(false), 4000);
    } catch {
      setContactError('Could not send your message right now. Please try WhatsApp or phone instead.');
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="ind-home">
      <Navbar />

      <a
        href={`https://wa.me/${whatsappContact.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ind-home__whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>

      {/* Category bar + search stay frozen under the navbar while the buyer scrolls */}
      <div className="ind-home__sticky-bar">
        <CategoryBar active={filterType} />

        {/* ---------- Search ---------- */}
        <section className="ind-search ind-search--top">
          <div className="ind-search__inner">
            <form className="ind-search__form" onSubmit={handleSearch}>
              <select
                value={filterType}
                onChange={(e) => {
                  const [type, subtype] = e.target.value.split('::');
                  setFilterType(type || '');
                  if (subtype) setSearchQuery(subtype);
                }}
                className="ind-search__select"
              >
                <option value="">CHOOSE MACHINE</option>
                {MACHINE_TYPES.map((t) => (
                  <optgroup key={t.id} label={t.name.toUpperCase()}>
                    <option value={t.id}>All {t.name}</option>
                    {t.subtypes.map((s) => (
                      <option key={s} value={`${t.id}::${s}`}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search machine name, brand, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ind-search__input"
              />
              <AnimatedButton type="submit" variant="primary" icon={null}>
                SEARCH
              </AnimatedButton>
            </form>
          </div>
        </section>
      </div>

      {/* ---------- Featured Machinery (shown first, before the hero copy) ---------- */}
      {featured.length > 0 && (
        <section className="ind-featured ind-featured--top" id="machines">
          <motion.h2
            className="ind-section-title ind-section-title--center"
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            FEATURED <span className="ind-accent">MACHINERY</span>
          </motion.h2>

          <div className="ind-featured__grid">
            {featured.map((m, i) => (
              <motion.div
                key={m.id}
                className="ind-machine-card"
                initial="hidden"
                animate="show"
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className="ind-machine-card__image">
                  <img src={m.photo} alt={`${m.brand} ${m.model}`} onError={onImageError} />
                  <span className="ind-machine-card__badge">{m.subtype}</span>
                  <div className="ind-machine-card__share-group">
                    <a
                      href={whatsappShareUrl(`Check out this ${m.brand} ${m.model} on Textile Machine`, `${window.location.origin}/machines/${m.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ind-machine-card__share"
                      aria-label="Share on WhatsApp"
                      title="Share on WhatsApp"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                    <a
                      href={facebookShareUrl(`${window.location.origin}/machines/${m.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ind-machine-card__share"
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FacebookIcon size={16} />
                    </a>
                  </div>
                </div>
                <div className="ind-machine-card__body">
                  <h3>
                    {m.year} {m.brand} {m.model}
                  </h3>
                  <p className="ind-machine-card__meta">
                    {m.subtype} · {m.location}
                    {m.quantity > 1 && ` · ×${m.quantity}`}
                  </p>
                  <button
                    type="button"
                    className="ind-machine-card__price ind-machine-card__price--btn"
                    onClick={() => navigate(`/machines/${m.id}`)}
                  >
                    Price On Request
                  </button>
                  <div className="ind-machine-card__actions">
                    <AnimatedButton variant="ghost" onClick={() => navigate(`/machines/${m.id}`)}>
                      VIEW DETAILS
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Hero ---------- */}
      <section className="ind-hero" ref={heroRef}>
        <div className="ind-hero__grid" />
        <div className="ind-hero__glow" />
        <motion.div className="ind-hero__gear" style={{ y: gearY, rotate: gearRotate }} aria-hidden="true">
          <GearLogo size={620} />
        </motion.div>

        <motion.div className="ind-hero__content" style={{ opacity: contentOpacity }}>
          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="ind-hero__sell-note"
          >
            Have a machine to sell?{' '}
            <button type="button" onClick={() => navigate('/admin/post-machine')}>
              List it here →
            </button>
          </motion.p>
        </motion.div>
      </section>

      {/* ---------- Buy / Get In Touch ---------- */}
      <section className="ind-cta-trio">
        <motion.div
          className="ind-cta-card ind-cta-card--yellow"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h3>Buy</h3>
          <p>Browse verified knitting, weaving and warping machinery from trusted sellers.</p>
          <AnimatedButton variant="ghost" className="ind-cta-card__btn" onClick={() => navigate('/machines')}>
            BROWSE MACHINES
          </AnimatedButton>
        </motion.div>

        <motion.div
          className="ind-cta-card ind-cta-card--grey"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
        >
          <h3>Sell</h3>
          <p>Have a machine to sell? List it with us and we'll find the right buyer.</p>
          <AnimatedButton variant="ghost" className="ind-cta-card__btn" onClick={() => navigate('/admin/post-machine')}>
            SELL YOUR MACHINE
          </AnimatedButton>
        </motion.div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="ind-categories" id="categories">
        <motion.h2
          className="ind-section-title ind-section-title--center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          BROWSE BY <span className="ind-accent">MACHINE TYPE</span>
        </motion.h2>

        <div className="ind-categories__grid">
          {MACHINE_TYPES.map((type, i) => (
            <motion.div
              key={type.id}
              className="ind-category-card"
              onClick={() => handleMachineTypeClick(type.id)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="ind-category-card__icon">{type.icon}</div>
              <h3>{type.name}</h3>
              <ul className="ind-category-card__subtypes">
                {type.subtypes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <span className="ind-category-card__arrow">BROWSE {type.name.toUpperCase()} →</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- How It Works — Buyers ---------- */}
      <section className="ind-timeline">
        <motion.h2
          className="ind-section-title ind-section-title--center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          HOW IT WORKS <span className="ind-accent">— FOR BUYERS</span>
        </motion.h2>

        <div className="ind-timeline__track">
          <motion.div
            className="ind-timeline__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          {BUYER_PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="ind-timeline__step"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
              transition={{ delay: i * 0.12 }}
            >
              <span className="ind-timeline__num">{s.n}</span>
              <h3>{s.label}</h3>
              <p>{s.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- How It Works — Sellers ---------- */}
      <section className="ind-timeline">
        <motion.h2
          className="ind-section-title ind-section-title--center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          HOW IT WORKS <span className="ind-accent">— FOR SELLERS</span>
        </motion.h2>

        <div className="ind-timeline__track">
          <motion.div
            className="ind-timeline__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          {SELLER_PIPELINE_STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="ind-timeline__step"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
              transition={{ delay: i * 0.12 }}
            >
              <span className="ind-timeline__num">{s.n}</span>
              <h3>{s.label}</h3>
              <p>{s.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Trust / About ---------- */}
      <section className="ind-trust" id="about">
        <motion.div
          className="ind-trust__visual"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <GearLogo size={220} animate />
        </motion.div>
        <motion.div
          className="ind-trust__content"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2 className="ind-section-title">
            OLD MACHINES.
            <br />
            <span className="ind-accent">NEW OPPORTUNITIES.</span>
          </h2>
          <p className="ind-trust__copy">
            We help you earn more profits by buying good condition used textile machines at heavy discounts.
          </p>
          <ul className="ind-trust__list">
            <li>Verified Listings</li>
            <li>Transparent Information</li>
            <li>Brokered Deals</li>
            <li>Industrial Expertise</li>
          </ul>
        </motion.div>
      </section>

      {/* Selling is a small, low-emphasis line — this site is buyer-first */}
      <p className="ind-sell-line">
        Have a machine to sell? Call/WhatsApp {whatsappContact}, email nikhhilkgarg@gmail.com, or{' '}
        <button type="button" onClick={() => navigate('/admin/post-machine')}>post it directly →</button>
      </p>

      {/* ---------- Newsletter ---------- */}
      <section className="ind-newsletter">
        <h2 className="ind-section-title ind-section-title--center">
          GET SPECIAL OFFERS <span className="ind-accent">IN YOUR INBOX</span>
        </h2>
        <p className="ind-newsletter__sub">Subscribe to receive updates about new machines and listings.</p>
        {newsletterDone ? (
          <p className="ind-newsletter__success">✓ You're subscribed — thank you.</p>
        ) : (
          <form className="ind-newsletter__form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AnimatedButton type="submit" variant="primary" icon={null}>
              Subscribe
            </AnimatedButton>
          </form>
        )}
      </section>

      {/* ---------- Contact Us ---------- */}
      <section className="ind-contact" id="contact">
        <h2 className="ind-section-title ind-section-title--center">
          CONTACT <span className="ind-accent">US</span>
        </h2>
        {contactDone ? (
          <p className="ind-newsletter__success">✓ Message sent — we'll be in touch shortly.</p>
        ) : (
          <form className="ind-contact__form" onSubmit={handleContactSubmit}>
            {contactError && <p className="ind-contact__error">{contactError}</p>}
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <input type="tel" name="phone" placeholder="Your Phone" />
            <textarea name="message" placeholder="Your Message" rows="5" required />
            <AnimatedButton type="submit" variant="primary" icon={null}>
              Send Message
            </AnimatedButton>
          </form>
        )}
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="ind-footer">
        <motion.div
          className="ind-footer__gear"
          initial={{ opacity: 0, rotate: -30 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          aria-hidden="true"
        >
          <GearLogo size={420} />
        </motion.div>

        <div className="ind-footer__content">
          <div className="ind-footer__brand">
            <GearLogo size={36} showWordmark />
            <p>Marketplace for pre-owned textile machinery — knitting, weaving and warping equipment.</p>
          </div>

          <div className="ind-footer__col">
            <h3>Quick Links</h3>
            <button onClick={() => navigate('/machines')}>Machines</button>
            <button onClick={() => scrollTo('categories')}>Categories</button>
            <button onClick={() => navigate('/admin/post-machine')}>Sell Machine</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
          </div>

          <div className="ind-footer__col">
            <h3>Contact</h3>
            <p>{whatsappContact}</p>
            <p>nikhhilkgarg@gmail.com</p>
          </div>
        </div>

        <div className="ind-footer__bottom">
          <p>&copy; {new Date().getFullYear()} Textile Machine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

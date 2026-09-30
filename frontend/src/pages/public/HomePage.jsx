import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../../components/Navbar';
import GearLogo from '../../components/GearLogo';
import AnimatedButton from '../../components/AnimatedButton';
import apiClient from '../../services/apiClient';
import { SAMPLE_MACHINES } from '../../data/sampleMachines';
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

const TRUST_INDICATORS = ['VERIFIED LISTINGS', 'DIRECT SELLER CONNECTION', 'SMART SEARCH', 'INDUSTRIAL MARKETPLACE'];

const PIPELINE_STEPS = [
  { n: '01', label: 'LIST', copy: 'Submit your machinery details.' },
  { n: '02', label: 'VERIFY', copy: 'Listing is reviewed and verified.' },
  { n: '03', label: 'DISCOVER', copy: 'Qualified buyers discover your machinery.' },
  { n: '04', label: 'CONNECT', copy: 'Buyer and seller communicate directly.' },
  { n: '05', label: 'DEAL', copy: 'Complete the transaction.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
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
        if (!cancelled) setFeatured((res.data && res.data.length ? res.data : SAMPLE_MACHINES).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setFeatured(SAMPLE_MACHINES);
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
    if (filterLocation.trim()) params.set('location', filterLocation.trim());
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // TODO: Send contact enquiry to backend
    setContactDone(true);
    e.target.reset();
    setTimeout(() => setContactDone(false), 4000);
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
        💬
      </a>

      {/* ---------- Hero ---------- */}
      <section className="ind-hero" ref={heroRef}>
        <div className="ind-hero__grid" />
        <div className="ind-hero__glow" />
        <motion.div className="ind-hero__gear" style={{ y: gearY, rotate: gearRotate }} aria-hidden="true">
          <GearLogo size={620} />
        </motion.div>

        <motion.div className="ind-hero__content" style={{ opacity: contentOpacity }}>
          <motion.h1 initial="hidden" animate="show" variants={fadeUp} className="ind-hero__headline">
            FIND THE <span className="ind-accent">MACHINE</span>
            <br />
            THAT BUILDS
            <br />
            YOUR <span className="ind-accent">NEXT BIG MOVE.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="ind-hero__subcopy"
          >
            Discover verified pre-owned industrial machinery from trusted sellers. Search, evaluate and connect —
            all from one intelligent marketplace.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="ind-hero__actions"
          >
            <AnimatedButton variant="primary" onClick={() => navigate('/machines')}>
              EXPLORE MACHINES
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon={null} onClick={() => navigate('/admin/post-machine')}>
              SELL YOUR MACHINE
            </AnimatedButton>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="ind-hero__trust"
          >
            {TRUST_INDICATORS.map((t) => (
              <span key={t} className="ind-hero__trust-item">
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Search ---------- */}
      <section className="ind-search">
        <motion.div
          className="ind-search__inner"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2 className="ind-section-title">
            FIND EXACTLY
            <br />
            <span className="ind-accent">WHAT YOU NEED.</span>
          </h2>

          <form className="ind-search__form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search machine name, brand, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ind-search__input"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="ind-search__select">
              <option value="">CATEGORY</option>
              {MACHINE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="LOCATION"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="ind-search__input ind-search__input--location"
            />
            <AnimatedButton type="submit" variant="primary">
              SEARCH MACHINES
            </AnimatedButton>
          </form>
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

      {/* ---------- Featured Machinery ---------- */}
      {featured.length > 0 && (
        <section className="ind-featured" id="machines">
          <motion.h2
            className="ind-section-title ind-section-title--center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
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
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className="ind-machine-card__image">
                  <img src={m.photo} alt={`${m.brand} ${m.model}`} />
                </div>
                <div className="ind-machine-card__body">
                  <h3>
                    {m.year} {m.brand} {m.model}
                  </h3>
                  <p className="ind-machine-card__meta">
                    {m.subtype} · {m.location}
                  </p>
                  <p className="ind-machine-card__price">Price On Request</p>
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

      {/* ---------- How It Works ---------- */}
      <section className="ind-timeline">
        <motion.h2
          className="ind-section-title ind-section-title--center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          HOW IT <span className="ind-accent">WORKS</span>
        </motion.h2>

        <div className="ind-timeline__track">
          <motion.div
            className="ind-timeline__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          {PIPELINE_STEPS.map((s, i) => (
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
            We're building the marketplace for textile machinery — connecting owners, brokers and buyers of
            knitting, weaving and warping machines in one place, with direct, verified communication at every step.
          </p>
          <ul className="ind-trust__list">
            <li>Verified Listings</li>
            <li>Transparent Information</li>
            <li>Direct Communication</li>
            <li>Industrial Expertise</li>
          </ul>
        </motion.div>
      </section>

      {/* ---------- Sell Your Machine ---------- */}
      <section className="ind-sell">
        <motion.h2
          className="ind-section-title ind-section-title--center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          HAVE MACHINES TO <span className="ind-accent">SELL?</span>
        </motion.h2>
        <p className="ind-sell__sub">Post your machines and reach qualified buyers directly.</p>

        <div className="ind-sell__methods">
          <div className="ind-sell__method">
            <h3>📞 Phone</h3>
            <p>Call us at {whatsappContact}</p>
          </div>
          <div className="ind-sell__method">
            <h3>💬 WhatsApp</h3>
            <p>Message {whatsappContact}</p>
          </div>
          <div className="ind-sell__method">
            <h3>📧 Email</h3>
            <p>nikhhilkgarg@gmail.com</p>
          </div>
          <div className="ind-sell__method">
            <h3>📝 Contact Form</h3>
            <AnimatedButton variant="ghost" icon={null} onClick={() => scrollTo('contact')}>
              Fill Form
            </AnimatedButton>
          </div>
        </div>
      </section>

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
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="tel" placeholder="Your Phone" />
            <textarea placeholder="Your Message" rows="5" required />
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
          <p>&copy; {new Date().getFullYear()} IronMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

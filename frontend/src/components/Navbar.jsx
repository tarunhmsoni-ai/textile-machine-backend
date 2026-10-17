import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GearLogo from './GearLogo';
import './Navbar.css';

const LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'MACHINES', href: '/machines' },
  { label: 'CATEGORIES', href: '/machines' },
  { label: 'SELL YOUR MACHINE', href: '/admin/post-machine' },
];

const WHATSAPP_NUMBER = '919662001216';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href) => {
    setMenuOpen(false);
    navigate(href);
  };

  return (
    <nav className={`ind-navbar ${scrolled ? 'ind-navbar--scrolled' : ''}`}>
      <div className="ind-navbar__inner">
        <button className="ind-navbar__brand" onClick={() => go('/')}>
          <GearLogo size={32} showWordmark />
        </button>

        <div className="ind-navbar__links">
          {LINKS.map((l) => (
            <button key={l.label} className="ind-navbar__link" onClick={() => go(l.href)}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="ind-navbar__actions">
          <button className="ind-navbar__login" onClick={() => go('/admin/login')}>
            LOGIN
          </button>
          <a
            className="ind-navbar__cta ind-navbar__cta--whatsapp"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WHATSAPP US
          </a>
        </div>

        <button
          className={`ind-navbar__burger ${menuOpen ? 'ind-navbar__burger--open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`ind-navbar__mobile ${menuOpen ? 'ind-navbar__mobile--open' : ''}`}>
        {LINKS.map((l) => (
          <button key={l.label} className="ind-navbar__mobile-link" onClick={() => go(l.href)}>
            {l.label}
          </button>
        ))}
        <a
          className="ind-navbar__mobile-link ind-navbar__mobile-link--accent"
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 WHATSAPP US
        </a>
        <button className="ind-navbar__mobile-link" onClick={() => go('/admin/login')}>
          LOGIN
        </button>
      </div>
    </nav>
  );
}

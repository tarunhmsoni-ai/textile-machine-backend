import React from 'react';
import './GearLogo.css';

/**
 * Inline SVG gear + wordmark mark. Placeholder brand mark until a real
 * logo asset is supplied — themeable via `currentColor` so it can be
 * recolored per usage (navbar, preloader, login, footer) with CSS.
 */
export default function GearLogo({ size = 40, animate = false, showWordmark = false, className = '' }) {
  return (
    <span className={`gear-logo ${className}`} style={{ '--gear-size': `${size}px` }}>
      <svg
        className={`gear-logo__svg ${animate ? 'gear-logo__svg--spin' : ''}`}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Machine marketplace logo"
      >
        <path
          d="M50 8 L57 8 L59 20 L68 23 L77 16 L84 23 L77 32 L80 41 L92 43 L92 50 L92 57 L80 59 L77 68 L84 77 L77 84 L68 77 L59 80 L57 92 L50 92 L43 92 L41 80 L32 77 L23 84 L16 77 L23 68 L20 59 L8 57 L8 50 L8 43 L20 41 L23 32 L16 23 L23 16 L32 23 L41 20 L43 8 Z"
          fill="currentColor"
          opacity="0.15"
        />
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <path
          d="M50 12 L55 12 L56.5 22 L64 24.5 L71 18.5 L76 23.5 L70 30.5 L72.5 38 L82.5 39.5 L82.5 45 L82.5 50 L82.5 55 L72.5 56.5 L70 64 L76 71 L71 76 L64 70 L56.5 72.5 L55 82.5 L50 82.5 L45 82.5 L43.5 72.5 L36 70 L29 76 L24 71 L30 64 L27.5 56.5 L17.5 55 L17.5 50 L17.5 45 L27.5 43.5 L30 36 L24 29 L29 24 L36 30 L43.5 27.5 L45 17.5 Z"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="50" cy="50" r="13" stroke="currentColor" strokeWidth="2.5" fill="var(--bg-dark, #333333)" />
        <circle cx="50" cy="50" r="4" fill="currentColor" />
      </svg>
      {showWordmark && (
        <span className="gear-logo__wordmark">
          TEXTILE <span className="gear-logo__wordmark-accent">MACHINE</span>
        </span>
      )}
    </span>
  );
}

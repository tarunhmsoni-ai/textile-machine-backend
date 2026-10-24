import React from 'react';

export default function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M29.333 16c0-7.364-5.969-13.333-13.333-13.333S2.667 8.636 2.667 16c0 6.655 4.876 12.17 11.25 13.17V19.82h-3.386V16h3.386v-2.938c0-3.342 1.991-5.187 5.037-5.187 1.459 0 2.985.26 2.985.26v3.282h-1.682c-1.657 0-2.174 1.028-2.174 2.082V16h3.7l-.591 3.82h-3.109v9.35C24.457 28.17 29.333 22.655 29.333 16z" />
    </svg>
  );
}

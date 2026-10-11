import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

/**
 * items: [{ label, href }] — the last item renders as plain text (current page).
 */
export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <nav className="ind-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="ind-breadcrumb__item">
            {isLast || !item.href ? (
              <span className="ind-breadcrumb__current">{item.label}</span>
            ) : (
              <button className="ind-breadcrumb__link" onClick={() => navigate(item.href)}>
                {item.label}
              </button>
            )}
            {!isLast && <span className="ind-breadcrumb__sep">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

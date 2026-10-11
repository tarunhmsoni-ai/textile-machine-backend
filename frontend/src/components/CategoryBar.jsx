import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryBar.css';

const CATEGORIES = [
  { id: '', name: 'All Machines' },
  { id: 'knitting', name: 'Knitting' },
  { id: 'weaving', name: 'Weaving' },
  { id: 'warping', name: 'Warping' },
];

export default function CategoryBar({ active = '', layout = 'horizontal' }) {
  const navigate = useNavigate();

  if (layout === 'vertical') {
    return (
      <nav className="ind-category-bar ind-category-bar--vertical" aria-label="Machine categories">
        <h3 className="ind-category-bar__title">Categories</h3>
        <div className="ind-category-bar__inner">
          {CATEGORIES.map((c) => (
            <button
              key={c.id || 'all'}
              className={`ind-category-bar__tab ${active === c.id ? 'ind-category-bar__tab--active' : ''}`}
              onClick={() => navigate(c.id ? `/machines?type=${c.id}` : '/machines')}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="ind-category-bar" aria-label="Machine categories">
      <div className="ind-category-bar__inner">
        {CATEGORIES.map((c) => (
          <button
            key={c.id || 'all'}
            className={`ind-category-bar__tab ${active === c.id ? 'ind-category-bar__tab--active' : ''}`}
            onClick={() => navigate(c.id ? `/machines?type=${c.id}` : '/machines')}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

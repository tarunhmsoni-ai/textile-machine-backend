import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const HOVER_SELECTOR = 'a, button, [role="button"], input, select, textarea, .machine-card, .ind-machine-card, .ind-category-card';
const CARD_SELECTOR = '.machine-card, .ind-machine-card';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hoveringCard, setHoveringCard] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reducedMotion) return;

    setEnabled(true);

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleOver = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) setHovering(true);
      if (e.target.closest?.(CARD_SELECTOR)) setHoveringCard(true);
    };
    const handleOut = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) setHovering(false);
      if (e.target.closest?.(CARD_SELECTOR)) setHoveringCard(false);
    };

    let raf;
    const animateRing = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(animateRing);
    };
    raf = requestAnimationFrame(animateRing);

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className={`custom-cursor-ring ${hovering ? 'custom-cursor-ring--active' : ''}`}>
        {hoveringCard && <span className="custom-cursor-ring__label">VIEW MACHINE →</span>}
      </div>
    </>
  );
}

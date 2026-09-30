import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GearLogo from './GearLogo';
import './IndustrialLoader.css';

const SESSION_KEY = 'industrial-loader-shown';

// Decide once, at module scope, whether this page load should show the
// sequence — reading/writing sessionStorage here (not inside the effect)
// avoids a React 18 StrictMode dev pitfall where the effect's first
// invocation writes the flag, gets cleaned up, and the second invocation
// then sees the flag already set and silently skips starting the timer.
const shouldPlay = (() => {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(SESSION_KEY)) return false;
  sessionStorage.setItem(SESSION_KEY, '1');
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();

export default function IndustrialLoader() {
  const [visible, setVisible] = useState(shouldPlay);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!shouldPlay) return;

    const duration = 2200;
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setExiting(true);
        setTimeout(() => setVisible(false), 650);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`industrial-loader ${exiting ? 'industrial-loader--exit' : ''}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="industrial-loader__glow" />
          <div className={`industrial-loader__mark ${exiting ? 'industrial-loader__mark--settle' : ''}`}>
            <GearLogo size={84} animate />
          </div>
          <p className="industrial-loader__title">INITIALIZING MACHINERY</p>
          <p className="industrial-loader__subtitle">LOADING INDUSTRIAL INVENTORY</p>
          <div className="industrial-loader__bar">
            <div className="industrial-loader__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="industrial-loader__percent">{String(progress).padStart(2, '0')}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

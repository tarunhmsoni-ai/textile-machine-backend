import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedButton.css';

/**
 * Shared CTA button with an arrow-slide micro-interaction.
 * variant: 'primary' (solid copper) | 'ghost' (outline)
 */
export default function AnimatedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  icon = '→',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`ind-btn ind-btn--${variant} ${className}`}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className="ind-btn__label">{children}</span>
      {icon && <span className="ind-btn__icon">{icon}</span>}
    </motion.button>
  );
}

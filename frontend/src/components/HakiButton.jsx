import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const HakiButton = ({ children, onClick, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    setIsAnimating(true);
    if (onClick) onClick(e);
    // Reinicia el estado de la animación
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="relative inline-block">
      {/* Onda de choque (Haki) */}
      {isAnimating && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.8, borderWeight: '6px' }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-red-700/80 pointer-events-none z-0"
        />
      )}

      {/* Botón Principal */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`relative z-10 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full shadow-lg transition-colors duration-200 ${className}`}
      >
        {children}
      </motion.button>
    </div>
  );
};

export default HakiButton;
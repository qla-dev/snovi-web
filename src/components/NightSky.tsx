import React, { useMemo } from 'react';
import { motion } from 'motion/react';

/** Twinkling stars and a floating crescent behind the voucher and promoter pages. */
export function NightSky() {
  const stars = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 53) % 100, delay: (i % 7) * 0.6, size: i % 5 === 0 ? 3 : 2 })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.28),transparent_60%)]" />
      {stars.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: star.delay }}
        />
      ))}
      {/* Crescent: a transparent circle that only casts its glowing shadow. */}
      <motion.div
        className="absolute right-6 top-28 h-28 w-28 rounded-full sm:right-[10%] sm:top-24 sm:h-40 sm:w-40"
        style={{ boxShadow: '24px 14px 0 0 #fde68a', filter: 'drop-shadow(0 0 22px rgba(253,230,138,0.45))' }}
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

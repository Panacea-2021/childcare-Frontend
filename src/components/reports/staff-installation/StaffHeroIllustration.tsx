'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Laptop, Smartphone, Sparkles, UserRound } from 'lucide-react';

const floats = [
  { Icon: UserRound, className: 'sai-float sai-float-lg', style: { top: '16%', left: '12%' }, duration: 5.6, delay: 0 },
  { Icon: Briefcase, className: 'sai-float', style: { top: '22%', right: '14%' }, duration: 6.2, delay: 0.35 },
  { Icon: Laptop, className: 'sai-float', style: { bottom: '20%', left: '18%' }, duration: 5.9, delay: 0.2 },
  { Icon: Smartphone, className: 'sai-float', style: { bottom: '18%', right: '20%' }, duration: 6.4, delay: 0.55 },
  { Icon: Sparkles, className: 'sai-float', style: { top: '48%', left: '46%' }, duration: 5.4, delay: 0.4 },
];

const particles = [
  { top: '18%', left: '42%' },
  { top: '38%', left: '68%' },
  { top: '62%', left: '32%' },
  { top: '50%', left: '55%' },
  { top: '28%', left: '22%' },
];

function StaffHeroIllustrationBase() {
  return (
    <div className="sai-hero-illus" aria-hidden>
      <motion.div
        className="sai-hero-blob sai-hero-blob-a"
        animate={{ x: [0, 10, 0], y: [0, -8, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="sai-hero-blob sai-hero-blob-b"
        animate={{ x: [0, -8, 0], y: [0, 10, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {floats.map(({ Icon, className, style, duration, delay }, i) => (
        <motion.div
          key={i}
          className={className}
          style={style}
          animate={{
            y: [0, -8, 0],
            rotate: [0, i % 2 === 0 ? 5 : -5, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={className.includes('float-lg') ? 26 : 20} strokeWidth={1.75} />
        </motion.div>
      ))}

      {particles.map((pos, i) => (
        <motion.span
          key={`p-${i}`}
          className="sai-hero-particle"
          style={pos}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.2, 0.7] }}
          transition={{ duration: 2.6 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

export const StaffHeroIllustration = memo(StaffHeroIllustrationBase);

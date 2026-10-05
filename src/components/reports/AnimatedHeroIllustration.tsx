'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  PieChart,
} from 'lucide-react';

const floats = [
  { Icon: FileSpreadsheet, className: 'rp-illus-float rp-illus-float-lg', style: { top: '18%', left: '22%' }, duration: 5.5, delay: 0 },
  { Icon: FolderOpen, className: 'rp-illus-float', style: { top: '28%', right: '18%' }, duration: 6.2, delay: 0.4 },
  { Icon: BarChart3, className: 'rp-illus-float', style: { bottom: '22%', left: '18%' }, duration: 5.8, delay: 0.2 },
  { Icon: PieChart, className: 'rp-illus-float', style: { bottom: '18%', right: '24%' }, duration: 6.4, delay: 0.6 },
  { Icon: GraduationCap, className: 'rp-illus-float', style: { top: '48%', left: '42%' }, duration: 5.2, delay: 0.3 },
  { Icon: ClipboardList, className: 'rp-illus-float', style: { top: '12%', right: '38%' }, duration: 7, delay: 0.5 },
  { Icon: CalendarDays, className: 'rp-illus-float', style: { bottom: '38%', right: '8%' }, duration: 6, delay: 0.15 },
  { Icon: BookOpen, className: 'rp-illus-float', style: { top: '62%', left: '10%' }, duration: 5.6, delay: 0.7 },
];

const sparkles = [
  { top: '20%', left: '48%' },
  { top: '40%', left: '72%' },
  { top: '70%', left: '36%' },
  { top: '55%', left: '58%' },
  { top: '30%', left: '12%' },
];

function AnimatedHeroIllustrationBase() {
  return (
    <div className="rp-illus" aria-hidden>
      <motion.div
        className="rp-illus-blob rp-illus-blob-a"
        animate={{ x: [0, 12, 0], y: [0, -10, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="rp-illus-blob rp-illus-blob-b"
        animate={{ x: [0, -10, 0], y: [0, 12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="rp-illus-blob rp-illus-blob-c"
        animate={{ x: [0, 8, 0], y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="rp-illus-glass"
        style={{ width: 90, height: 90, top: '16%', right: '12%' }}
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.05, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="rp-illus-glass"
        style={{ width: 60, height: 60, bottom: '16%', left: '28%' }}
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {floats.map(({ Icon, className, style, duration, delay }, i) => (
        <motion.div
          key={i}
          className={className}
          style={style}
          animate={{
            y: [0, -10, 0],
            rotate: [0, i % 2 === 0 ? 6 : -6, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={className.includes('float-lg') ? 28 : 22} strokeWidth={1.75} />
        </motion.div>
      ))}

      {sparkles.map((pos, i) => (
        <motion.span
          key={`s-${i}`}
          className="rp-illus-sparkle"
          style={pos}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.25, 0.7] }}
          transition={{ duration: 2.4 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export const AnimatedHeroIllustration = memo(AnimatedHeroIllustrationBase);

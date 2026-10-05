'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flower2, Leaf, Sparkles } from 'lucide-react';

/** Soft floating accents around the notes card grid. */
export function NotesAmbient() {
  return (
    <div className="notes-ambient" aria-hidden>
      {(
        [
          { top: '8%', left: '4%', size: 18, delay: 0, Icon: Sparkles },
          { top: '22%', left: 'auto', right: '6%', size: 22, delay: 0.4, Icon: Flower2 },
          { top: '48%', left: '2%', size: 20, delay: 0.8, Icon: Leaf },
          { top: '68%', left: 'auto', right: '3%', size: 16, delay: 1.1, Icon: Sparkles },
          { top: '86%', left: '10%', size: 24, delay: 0.2, Icon: Flower2 },
          { top: '35%', left: '48%', size: 14, delay: 1.4, Icon: Leaf },
        ] as const
      ).map((item, index) => {
        const Icon = item.Icon;
        return (
          <motion.span
            key={index}
            className="notes-ambient-orb"
            style={{
              top: item.top,
              left: item.left,
              ...('right' in item ? { right: item.right } : null),
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.18, 0.35, 0.18],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            <Icon size={item.size} strokeWidth={1.3} />
          </motion.span>
        );
      })}

      <motion.div
        className="notes-ambient-glow notes-ambient-glow-a"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="notes-ambient-glow notes-ambient-glow-b"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  );
}

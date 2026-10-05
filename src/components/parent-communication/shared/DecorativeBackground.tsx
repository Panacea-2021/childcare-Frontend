'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bird,
  Flower2,
  Leaf,
  Moon,
  Sparkles,
  TreeDeciduous,
} from 'lucide-react';

interface DecorativeBackgroundProps {
  theme: 'notes' | 'concerns';
}

/** Soft premium vector decorations — low opacity, non-interactive. */
export function DecorativeBackground({ theme }: DecorativeBackgroundProps) {
  if (theme === 'notes') {
    return (
      <div className="pc-decor pc-decor-notes" aria-hidden>
        <div className="pc-decor-blob pc-decor-blob-1" />
        <div className="pc-decor-blob pc-decor-blob-2" />
        <div className="pc-decor-blob pc-decor-blob-3" />

        <motion.span
          className="pc-decor-icon pc-decor-tl"
          animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flower2 size={42} strokeWidth={1.25} />
        </motion.span>
        <motion.span
          className="pc-decor-icon pc-decor-tl-2"
          animate={{ y: [0, 5, 0], x: [0, 4, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <Leaf size={36} strokeWidth={1.25} />
        </motion.span>
        <motion.span
          className="pc-decor-icon pc-decor-br"
          animate={{ y: [0, -5, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <Sparkles size={38} strokeWidth={1.25} />
        </motion.span>
        <motion.span
          className="pc-decor-icon pc-decor-br-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <Flower2 size={28} strokeWidth={1.25} />
        </motion.span>
        <motion.span
          className="pc-decor-icon pc-decor-mid"
          animate={{ y: [0, -8, 0], x: [0, 6, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <Sparkles size={26} strokeWidth={1.2} />
        </motion.span>
        <motion.span
          className="pc-decor-icon pc-decor-mid-2"
          animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <Leaf size={30} strokeWidth={1.2} />
        </motion.span>

        {/* Elegant butterfly silhouette (vector path) */}
        <motion.svg
          className="pc-decor-svg pc-decor-butterfly"
          viewBox="0 0 64 64"
          fill="none"
          animate={{ y: [0, -8, 0], x: [0, 6, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M32 34c2-8 10-16 18-18-2 10-8 16-18 18 10 2 16 8 18 18-8-2-16-10-18-18-2 8-10 16-18 18 2-10 8-16 18-18-10-2-16-8-18-18 8 2 16 10 18 18Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <circle cx="32" cy="34" r="2.2" fill="currentColor" />
        </motion.svg>

        <motion.svg
          className="pc-decor-svg pc-decor-butterfly-2"
          viewBox="0 0 64 64"
          fill="none"
          animate={{ y: [0, 10, 0], x: [0, -5, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <path
            d="M32 34c2-8 10-16 18-18-2 10-8 16-18 18 10 2 16 8 18 18-8-2-16-10-18-18-2 8-10 16-18 18 2-10 8-16 18-18-10-2-16-8-18-18 8 2 16 10 18 18Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <circle cx="32" cy="34" r="2.2" fill="currentColor" />
        </motion.svg>
      </div>
    );
  }

  return (
    <div className="pc-decor pc-decor-concerns" aria-hidden>
      <div className="pc-decor-blob pc-decor-blob-c1" />
      <div className="pc-decor-blob pc-decor-blob-c2" />
      <div className="pc-decor-blob pc-decor-blob-c3" />

      <motion.span
        className="pc-decor-icon pc-decor-tl"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TreeDeciduous size={40} strokeWidth={1.2} />
      </motion.span>
      <motion.span
        className="pc-decor-icon pc-decor-tl-2"
        animate={{ y: [0, 5, 0], x: [0, -3, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <Moon size={30} strokeWidth={1.2} />
      </motion.span>
      <motion.span
        className="pc-decor-icon pc-decor-br"
        animate={{ y: [0, -5, 0], x: [0, 3, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <Bird size={36} strokeWidth={1.2} />
      </motion.span>
      <motion.span
        className="pc-decor-icon pc-decor-br-2"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <Leaf size={28} strokeWidth={1.2} />
      </motion.span>

      {/* Elephant silhouette */}
      <svg className="pc-decor-svg pc-decor-elephant" viewBox="0 0 80 56" fill="none">
        <path
          d="M12 34c0-10 8-18 22-18 8 0 14 3 18 8 2-6 8-10 16-8 4 1 6 5 6 10v14c0 4-3 7-7 7h-6v-8c0-2-1-3-3-3H38c-2 0-3 1-3 3v8H18c-4 0-6-3-6-7V34Zm8 6h6v6h-6v-6Zm36-2c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4Z"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>

      {/* Giraffe outline */}
      <svg className="pc-decor-svg pc-decor-giraffe" viewBox="0 0 40 72" fill="none">
        <path
          d="M18 68V28c0-8 2-18 4-24 1 4 3 6 5 6 1 0 2-1 3-3 .5 3 0 6-1 8-2 4-3 10-3 18v35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="8" r="2.5" fill="currentColor" fillOpacity="0.25" />
        <path d="M12 40h14M10 50h16" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      </svg>
    </div>
  );
}

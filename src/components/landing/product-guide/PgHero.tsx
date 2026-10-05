'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { GuideSearch } from './GuideSearch';
import { pgEase, pgFadeUp } from './motion';

type Props = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  children?: ReactNode;
};

export function PgHero({
  title = 'Advice and answers from the illumine Team',
  subtitle = 'Search guides, watch training, and get every center online faster.',
  compact = false,
  children,
}: Props) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className={`pg-hero${compact ? ' pg-hero--compact' : ''}`}>
      <div className="pg-hero-ambient" aria-hidden>
        <span className="pg-orb pg-orb--a" />
        <span className="pg-orb pg-orb--b" />
        <span className="pg-orb pg-orb--c" />
        <span className="pg-hero-grid" />
        <span className="pg-hero-sparkles">
          {Array.from({ length: 12 }).map((_, i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
      </div>

      <div className="pg-hero-inner">
        {!compact ? (
          <motion.p
            className="pg-hero-eyebrow"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: pgEase }}
          >
            Help Center · Product Guide
          </motion.p>
        ) : null}

        {!compact ? (
          <motion.h1
            className="pg-hero-title"
            variants={pgFadeUp}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            {title.split(' ').map((word, i, arr) => (
              <span key={`${word}-${i}`} className="pg-hero-word">
                {word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </motion.h1>
        ) : null}

        {!compact ? (
          <motion.p
            className="pg-hero-sub"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease: pgEase }}
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: compact ? 0 : 0.18, duration: 0.5, ease: pgEase }}
        >
          <GuideSearch />
        </motion.div>

        {children}
      </div>

      <svg className="pg-hero-curve" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden>
        <path fill="#f7f8fc" d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
      </svg>
    </section>
  );
}

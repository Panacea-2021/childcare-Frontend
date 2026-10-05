'use client';

import type { Variants } from 'framer-motion';

export const pgEase = [0.22, 1, 0.36, 1] as const;

export const pgFadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: pgEase },
  },
};

export const pgFadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

export const pgStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.075, delayChildren: 0.08 },
  },
};

export const pgCardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: pgEase },
  },
};

export const pgStepVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: pgEase },
  },
};

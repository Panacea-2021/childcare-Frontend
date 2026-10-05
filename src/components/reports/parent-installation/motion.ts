'use client';

import { useReducedMotion } from 'framer-motion';
import type { Transition, Variants } from 'framer-motion';

export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function usePaiMotion() {
  const reduce = useReducedMotion();
  return {
    reduce: !!reduce,
    page: reduce
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0 },
    pageInitial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: (delay = 0): Transition =>
      reduce
        ? { duration: 0 }
        : { duration: 0.55, delay, ease: easeOut },
  };
}

export const pageSectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: easeOut },
  }),
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: 0.06 * i, ease: easeOut },
  }),
};

export const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, delay: 0.05 * i, ease: easeOut },
  }),
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export const menuVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.16, ease: easeOut, staggerChildren: 0.035 },
  },
  exit: { opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } },
};

export const menuItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.16, ease: easeOut } },
};

export const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 22 },
  },
};

import type { Variants } from 'framer-motion';

export const scEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0.35, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: scEase },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0.35, x: -28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: scEase },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0.35, x: 28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: scEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.4, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: scEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export function floatAnim(amount = 7, duration = 6, delay = 0) {
  return {
    animate: { y: [0, -amount, 0] },
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };
}

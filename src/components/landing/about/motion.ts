import type { Variants } from 'framer-motion';

export const auEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0.35, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: auEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0.4 },
  show: { opacity: 1, transition: { duration: 0.55, ease: auEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.4, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: auEase },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0.35, x: -40, rotate: -2 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.85, ease: auEase },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0.35, x: 40, rotate: 2 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.85, ease: auEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export function floatAnim(amount = 6, duration = 6.5, delay = 0) {
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

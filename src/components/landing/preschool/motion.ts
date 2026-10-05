import type { Variants } from 'framer-motion';

export const psEase = [0.22, 1, 0.36, 1] as const;

/**
 * Prefer transform-only hides so content never stays blank if whileInView fails.
 * Opacity still softens slightly but remains readable (>= 0.35).
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0.35, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: psEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0.4 },
  show: { opacity: 1, transition: { duration: 0.55, ease: psEase } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0.35, x: -28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: psEase },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0.35, x: 28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: psEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.4, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: psEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export function floatAnim(amount = 8, duration = 6, delay = 0) {
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

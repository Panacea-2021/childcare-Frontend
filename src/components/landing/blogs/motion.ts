import type { Variants } from 'framer-motion';

export const blEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0.35, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: blEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.4, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: blEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
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

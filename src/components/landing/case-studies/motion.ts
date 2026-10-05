import type { Variants } from 'framer-motion';

export const csEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: csEase } },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: csEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.35, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: csEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

export function floatAnim(amount = 8, duration = 5.5, delay = 0) {
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

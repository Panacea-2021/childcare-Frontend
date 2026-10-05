import type { Variants } from 'framer-motion';

export const ewEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ewEase } },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: ewEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0.4, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: ewEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export function floatAnim(amount = 7, duration = 6.5, delay = 0) {
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

import type { Variants } from 'framer-motion';

export const aipEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: aipEase } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: aipEase } },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: aipEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: aipEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export function floatAnim(amount = 7, duration = 5.2) {
  return {
    animate: { y: [0, -amount, 0] },
    transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

export function orbPulse(duration = 14) {
  return {
    animate: {
      scale: [1, 1.12, 1],
      opacity: [0.45, 0.72, 0.45],
    },
    transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

import type { Variants } from 'framer-motion';

export const adrEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: adrEase } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: adrEase } },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: adrEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: adrEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
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
      scale: [1, 1.1, 1],
      opacity: [0.4, 0.68, 0.4],
    },
    transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

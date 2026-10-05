import type { Variants } from 'framer-motion';

export const attEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: attEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55, ease: attEase } },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -42 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: attEase },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 42 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: attEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: attEase },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

export function floatAnim(amount = 7, duration = 5) {
  return {
    animate: { y: [0, -amount, 0] },
    transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

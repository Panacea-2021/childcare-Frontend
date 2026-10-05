import type { Transition, Variants } from 'framer-motion';

export const entEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: entEase } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: entEase } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: entEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: entEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const pillSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};

export function floatAnim(amount = 8, duration = 5.4) {
  return {
    animate: { y: [0, -amount, 0] },
    transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
  };
}

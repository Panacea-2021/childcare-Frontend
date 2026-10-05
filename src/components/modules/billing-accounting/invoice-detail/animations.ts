export const easeOutCubic = [0.33, 1, 0.68, 1] as const;

export const pageEnter = {
  initial: { opacity: 0, scale: 0.98, y: 16, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: easeOutCubic },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: 0.28, ease: easeOutCubic },
  },
};

export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

export const fadeUpTransition = (delay = 0) => ({
  duration: 0.45,
  delay,
  ease: easeOutCubic,
});

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, x: -16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: easeOutCubic },
  },
};

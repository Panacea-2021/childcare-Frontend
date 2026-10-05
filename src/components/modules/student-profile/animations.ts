export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const tabPanelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
};

export const btnMotion = {
  whileHover: {
    y: -2,
    scale: 1.02,
    boxShadow: '0 8px 20px rgba(93, 95, 239, 0.16)',
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  },
  whileTap: {
    y: 0,
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

export const cardHover = {
  y: -3,
  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export const tableMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, ease: easeOut },
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
    transition: { duration: 0.32, ease: easeOut },
  },
};

export const dialogMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
  transition: { duration: 0.22, ease: easeOut },
};

export const cardHover = {
  whileHover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 18px 40px rgba(93, 95, 239, 0.18)',
    transition: { duration: 0.22, ease: easeOut },
  },
  whileTap: { scale: 0.98 },
};

export const btnMotion = {
  whileHover: {
    y: -2,
    scale: 1.02,
    boxShadow: '0 8px 20px rgba(93, 95, 239, 0.16)',
    transition: { duration: 0.18, ease: easeOut },
  },
  whileTap: { scale: 0.97 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

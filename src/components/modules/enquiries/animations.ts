export const pageMotion = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const sectionMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const cardHover = {
  y: -4,
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export const dialogMotion = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export const boardColumnMotion = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const boardCardMotion = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -6 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export const cardHoverLift = {
  y: -3,
  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export const drawerSectionMotion = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Premium interactive controls — ~180ms feel across toolbar / cards / menus */
export const btnTransition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

export const interactiveBtn = {
  whileHover: {
    y: -2,
    scale: 1.02,
    boxShadow: '0 8px 20px rgba(93, 95, 239, 0.16)',
    transition: btnTransition,
  },
  whileTap: {
    y: 0,
    scale: 0.97,
    transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const softInteractiveBtn = {
  whileHover: {
    y: -1,
    scale: 1.03,
    transition: btnTransition,
  },
  whileTap: {
    scale: 0.96,
    transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: btnTransition,
};

export const tooltipMotion = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 2 },
  transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const },
};

export const rowHoverMotion = {
  whileHover: {
    backgroundColor: 'rgba(232, 242, 255, 0.45)',
    transition: btnTransition,
  },
};

export const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export const btnMotion = {
  whileHover: { y: -1, scale: 1.02, transition: { duration: 0.16 } },
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const },
};

export const badgeMotion = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
};

export const drawerPanelMotion = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 28, opacity: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const softInteractiveBtn = {
  whileHover: { y: -1, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98 },
};

'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
  title?: string;
};

export function GradientButton({
  children,
  onClick,
  className = '',
  disabled,
  variant = 'primary',
  type = 'button',
  title,
}: Props) {
  const base =
    variant === 'primary'
      ? 'ui-btn ui-btn-primary ivw-btn ivw-btn-primary'
      : variant === 'outline'
        ? 'ui-btn ui-btn-outline ivw-btn'
        : 'ivw-btn ivw-btn-ghost';

  return (
    <motion.button
      type={type}
      className={`${base} ${className}`.trim()}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </motion.button>
  );
}

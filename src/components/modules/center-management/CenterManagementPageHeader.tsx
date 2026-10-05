'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './center-management-page-header.css';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  /** Right-corner actions inside the header card (Add Student, Actions, etc.) */
  actions?: ReactNode;
};

/**
 * Center Management–only page header (Staff Announcements visual language).
 * Action buttons sit in the card’s right corner — not below the header.
 */
export function CenterManagementPageHeader({ title, description, icon, actions }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className="cmph"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cmph-card">
        <div className="cmph-left">
          <div className="cmph-icon-art" aria-hidden>
            <motion.div
              className="cmph-icon"
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              }
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            >
              {icon}
            </motion.div>
          </div>
          <div className="cmph-copy">
            <h1 className={`cmph-title${reduceMotion ? '' : ' cmph-title-shimmer'}`}>{title}</h1>
            <p className="cmph-desc">{description}</p>
          </div>
        </div>
        {actions ? <div className="cmph-actions">{actions}</div> : null}
      </div>
    </motion.header>
  );
}

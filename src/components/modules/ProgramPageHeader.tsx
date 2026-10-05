'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './program-page-header.css';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  /** Right-corner actions inside the header card */
  actions?: ReactNode;
};

/**
 * Programs-module page header — visual match to Center Management / Students header.
 * Scoped classes (progh-*) so other modules are unaffected.
 */
export function ProgramPageHeader({ title, description, icon, actions }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className="progh"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="progh-card">
        <div className="progh-left">
          <div className="progh-icon-art" aria-hidden>
            <motion.div
              className="progh-icon"
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
          <div className="progh-copy">
            <h1 className={`progh-title${reduceMotion ? '' : ' progh-title-shimmer'}`}>{title}</h1>
            <p className="progh-desc">{description}</p>
          </div>
        </div>
        {actions ? <div className="progh-actions">{actions}</div> : null}
      </div>
    </motion.header>
  );
}

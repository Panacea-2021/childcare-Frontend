'use client';

import { memo, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { sectionMotion } from './animations';

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export const FormSection = memo(function FormSection({
  id,
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
}: Props) {
  return (
    <section className="enq-section">
      <button
        type="button"
        className="enq-section-head"
        aria-expanded={open}
        aria-controls={`enq-section-${id}`}
        onClick={onToggle}
      >
        <span className="enq-section-head-left">
          <span className="enq-section-icon" aria-hidden>
            {icon}
          </span>
          <span>
            <p className="enq-section-title">{title}</p>
            {subtitle ? <p className="enq-section-sub">{subtitle}</p> : null}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`enq-section-chevron${open ? ' is-open' : ''}`}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`enq-section-${id}`}
            className="enq-section-body"
            initial={sectionMotion.initial}
            animate={sectionMotion.animate}
            exit={sectionMotion.exit}
            transition={sectionMotion.transition}
          >
            <div className="enq-section-content">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
});

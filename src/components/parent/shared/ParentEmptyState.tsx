'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import './parent-shared.css';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  tone?: 'default' | 'error';
};

export function ParentEmptyState({
  icon,
  title,
  description,
  action,
  tone = 'default',
}: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.div
          className={`psh-state${tone === 'error' ? ' psh-state--error' : ''}`}
          role={tone === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28 }}
        >
          <div className="psh-state-icon" aria-hidden>
            {icon}
          </div>
          <h2 className="psh-state-title">{title}</h2>
          <p className="psh-state-desc">{description}</p>
          {action ? <div className="psh-state-actions">{action}</div> : null}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}

export function ParentErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this information right now. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <ParentEmptyState
      tone="error"
      icon={
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" />
        </svg>
      }
      title={title}
      description={description}
      action={
        onRetry ? (
          <button type="button" className="ui-btn ui-btn-primary" onClick={onRetry}>
            Try Again
          </button>
        ) : undefined
      }
    />
  );
}

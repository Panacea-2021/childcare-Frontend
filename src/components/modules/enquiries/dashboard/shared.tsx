'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { cardHoverLift, softInteractiveBtn } from '../animations';
import type { CardAccent, SectionState } from './types';

type CardProps = {
  title: string;
  children: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  toolbar?: ReactNode;
  state?: SectionState;
  onRetry?: () => void;
  accent?: CardAccent;
  icon?: ReactNode;
};

export function DashCard({
  title,
  children,
  actionHref,
  actionLabel,
  className = '',
  toolbar,
  state = 'ready',
  onRetry,
  accent = 'purple',
  icon,
}: CardProps) {
  return (
    <motion.section
      className={`edash-card edash-card-${accent} ${className}`}
      whileHover={cardHoverLift}
      aria-label={title}
    >
      <header className="edash-card-head">
        <div className="edash-card-title-row">
          {icon ? (
            <span className="edash-card-chip" aria-hidden>
              {icon}
            </span>
          ) : (
            <span className="edash-card-chip edash-card-chip-dot" aria-hidden />
          )}
          <h2 className="edash-card-title">{title}</h2>
        </div>
        <div className="edash-card-actions">
          {toolbar}
          {actionHref && actionLabel ? (
            <motion.div {...softInteractiveBtn}>
              <Link href={actionHref} className="edash-link">
                {actionLabel}
              </Link>
            </motion.div>
          ) : null}
        </div>
      </header>
      <div className="edash-card-body">
        {state === 'loading' ? (
          <DashSkeleton rows={4} />
        ) : state === 'error' ? (
          <DashError onRetry={onRetry} />
        ) : state === 'empty' ? (
          <DashEmpty />
        ) : (
          children
        )}
      </div>
    </motion.section>
  );
}

export function DashSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="edash-skel" aria-busy="true" aria-label="Loading section">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="edash-skel-row" style={{ width: `${92 - i * 8}%` }} />
      ))}
    </div>
  );
}

export function DashEmpty() {
  return (
    <div className="edash-empty" role="status">
      <Inbox size={28} strokeWidth={1.75} aria-hidden />
      <p>There&apos;s no data available for this period.</p>
    </div>
  );
}

export function DashError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="edash-error" role="alert">
      <AlertCircle size={28} strokeWidth={1.75} aria-hidden />
      <p>Unable to load this section.</p>
      {onRetry ? (
        <button type="button" className="ui-btn ui-btn-outline" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden /> Retry
        </button>
      ) : null}
    </div>
  );
}

export function ChartTooltip(props: Record<string, unknown>) {
  const active = Boolean(props.active);
  const payload =
    (props.payload as
      | readonly { name?: string | number; value?: string | number; color?: string }[]
      | undefined) ?? [];
  const label = props.label as string | number | undefined;
  if (!active || !payload.length) return null;
  return (
    <div className="edash-tooltip">
      <p className="edash-tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={String(p.name)} className="edash-tooltip-row">
          <span style={{ background: p.color }} />
          {p.name}:{' '}
          <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function ProgressBar({
  value,
  color = 'var(--color-accent)',
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="edash-progress" aria-hidden>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

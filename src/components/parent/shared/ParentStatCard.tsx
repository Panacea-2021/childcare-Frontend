'use client';

import type { ReactNode } from 'react';
import CountUp from 'react-countup';
import './parent-shared.css';

export type ParentStatTone = 'accent' | 'pending' | 'success' | 'danger' | 'info';

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tone?: ParentStatTone;
  /** Animate numeric values with a short count-up */
  countUp?: boolean;
};

export function ParentStatCard({
  icon,
  label,
  value,
  hint,
  tone = 'accent',
  countUp = false,
}: Props) {
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  const canCount = countUp && Number.isFinite(numeric) && String(value) === String(numeric);

  return (
    <article className={`psh-stat psh-stat--${tone}`}>
      <span className="psh-stat-icon" aria-hidden>
        {icon}
      </span>
      <div className="psh-stat-body">
        <span className="psh-stat-label">{label}</span>
        <span className="psh-stat-value">
          {canCount ? <CountUp end={numeric} duration={0.9} separator="," /> : value}
        </span>
        {hint ? <span className="psh-stat-hint">{hint}</span> : null}
      </div>
    </article>
  );
}

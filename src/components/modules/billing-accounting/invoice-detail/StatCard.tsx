'use client';

import type { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export function StatCard({
  label,
  value,
  icon,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  delay?: number;
}) {
  return (
    <GlassCard className="ivd-stat-card" delay={delay}>
      <span className="ivd-stat-label">
        {icon}
        {label}
      </span>
      <strong className="ivd-stat-value">{value}</strong>
    </GlassCard>
  );
}

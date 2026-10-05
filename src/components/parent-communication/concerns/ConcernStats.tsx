'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, CircleDot, Loader2, type LucideIcon } from 'lucide-react';

interface ConcernStatsProps {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

interface StatItem {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  tone: string;
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let frameId = 0;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * value));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span className="concerns-stat-value">{display}</span>;
}

export function ConcernStats({ total, open, inProgress, resolved }: ConcernStatsProps) {
  const stats: StatItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: total,
      icon: CircleDot,
      gradient: 'linear-gradient(135deg, #3D6B82 0%, #2C5570 100%)',
      tone: 'sky',
    },
    {
      id: 'open',
      label: 'Open',
      value: open,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
      tone: 'coral',
    },
    {
      id: 'progress',
      label: 'In Progress',
      value: inProgress,
      icon: Loader2,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      tone: 'amber',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
      tone: 'green',
    },
  ];

  return (
    <section className="concerns-stats" aria-label="Concern statistics">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.id}
            className={`concerns-stat-card pc-tone-${stat.tone}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <div className="concerns-stat-top">
              <span className="concerns-stat-label">{stat.label}</span>
              <div className="concerns-stat-icon" style={{ background: stat.gradient }}>
                <Icon size={20} aria-hidden />
              </div>
            </div>
            <AnimatedCounter value={stat.value} />
          </motion.article>
        );
      })}
    </section>
  );
}

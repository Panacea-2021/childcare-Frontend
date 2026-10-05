'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CalendarDays, Clock, Lock, type LucideIcon } from 'lucide-react';

interface ActivityStatsProps {
  totalActivities: number;
  todaysPosts: number;
  scheduledPosts: number;
  staffOnlyPosts: number;
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
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <motion.span
      key={value}
      className="act-stat-value act-stat-num"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
}

export function ActivityStats({
  totalActivities,
  todaysPosts,
  scheduledPosts,
  staffOnlyPosts,
}: ActivityStatsProps) {
  const stats: StatItem[] = [
    {
      id: 'total',
      label: 'Total Activities',
      value: totalActivities,
      icon: Activity,
      gradient: 'linear-gradient(135deg, #5D5FEF 0%, #4B51E0 100%)',
      tone: 'purple',
    },
    {
      id: 'today',
      label: "Today's Posts",
      value: todaysPosts,
      icon: CalendarDays,
      gradient: 'linear-gradient(135deg, #3D7A55 0%, #2D6A45 100%)',
      tone: 'green',
    },
    {
      id: 'scheduled',
      label: 'Scheduled Posts',
      value: scheduledPosts,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #8A7040 0%, #7A6030 100%)',
      tone: 'amber',
    },
    {
      id: 'staff',
      label: 'Staff Only Posts',
      value: staffOnlyPosts,
      icon: Lock,
      gradient: 'linear-gradient(135deg, #7C3A6B 0%, #6B2A5A 100%)',
      tone: 'pink',
    },
  ];

  return (
    <section className="act-stats act-stats-grid" aria-label="Activity statistics">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className={`act-stat-card pc-tone-${stat.tone}`}
          >
            <div className="act-stat-top">
              <span className="act-stat-label">{stat.label}</span>
              <div
                className="act-stat-icon act-stat-icon-wrap"
                style={{ background: stat.gradient }}
              >
                <Icon size={22} />
              </div>
            </div>
            <div className="act-stat-val-row">
              <AnimatedCounter value={stat.value} />
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, MailOpen, StickyNote, type LucideIcon } from 'lucide-react';

interface NotesStatsProps {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
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

  return <span className="notes-stat-value">{display}</span>;
}

export function NotesStats({ total, unread, today, thisWeek }: NotesStatsProps) {
  const stats: StatItem[] = [
    {
      id: 'total',
      label: 'Total Notes',
      value: total,
      icon: StickyNote,
      gradient: 'linear-gradient(135deg, #5D5FEF 0%, #4B51E0 100%)',
      tone: 'purple',
    },
    {
      id: 'unread',
      label: 'Unread',
      value: unread,
      icon: MailOpen,
      gradient: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
      tone: 'coral',
    },
    {
      id: 'today',
      label: "Today's Notes",
      value: today,
      icon: CalendarDays,
      gradient: 'linear-gradient(135deg, #C084A8 0%, #A86B90 100%)',
      tone: 'pink',
    },
    {
      id: 'week',
      label: 'This Week',
      value: thisWeek,
      icon: CalendarRange,
      gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      tone: 'mint',
    },
  ];

  return (
    <section className="notes-stats" aria-label="Notes statistics">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.id}
            className={`notes-stat-card pc-tone-${stat.tone}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <div className="notes-stat-top">
              <span className="notes-stat-label">{stat.label}</span>
              <div className="notes-stat-icon" style={{ background: stat.gradient }}>
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

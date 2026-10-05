'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, CalendarClock } from 'lucide-react';

interface ActivityTabsProps {
  activeTab: 'all' | 'scheduled';
  onTabChange: (tab: 'all' | 'scheduled') => void;
  allCount: number;
  scheduledCount: number;
}

const TABS = [
  { id: 'all' as const, label: 'All Posts', icon: LayoutGrid },
  { id: 'scheduled' as const, label: 'Scheduled', icon: CalendarClock },
];

export function ActivityTabs({
  activeTab,
  onTabChange,
  allCount,
  scheduledCount,
}: ActivityTabsProps) {
  const counts: Record<'all' | 'scheduled', number> = {
    all: allCount,
    scheduled: scheduledCount,
  };

  return (
    <nav className="act-tabs act-tabs-wrap" aria-label="Activity feed tabs">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`act-tab act-tab-btn${isActive ? ' act-tab-active active' : ''}`}
            aria-selected={isActive}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            <span className="act-tab-badge">{counts[tab.id]}</span>
            {isActive && (
              <motion.span
                layoutId="act-tab-underline"
                className="act-tab-underline"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

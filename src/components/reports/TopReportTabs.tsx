'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type TopTabId = 'excel' | 'parent-install' | 'staff-install';

const TABS: { id: TopTabId; label: string }[] = [
  { id: 'excel', label: 'Excel Reports' },
  { id: 'parent-install', label: 'Parent App Installation Report' },
  { id: 'staff-install', label: 'Staff App Installation Report' },
];

type Props = {
  active: TopTabId;
  onChange: (id: TopTabId) => void;
};

function TopReportTabsBase({ active, onChange }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [glow, setGlow] = useState({ left: 0, width: 0, height: 0, top: 0 });

  useEffect(() => {
    const el = btnRefs.current[active];
    const parent = listRef.current;
    if (!el || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setIndicator({
      left: rect.left - parentRect.left + parent.scrollLeft,
      width: rect.width * 0.45,
    });
    setGlow({
      left: rect.left - parentRect.left + parent.scrollLeft,
      width: rect.width,
      height: rect.height,
      top: rect.top - parentRect.top,
    });
  }, [active]);

  return (
    <div className="rp-top-tabs" ref={listRef} role="tablist" aria-label="Reports modules">
      <motion.div
        className="rp-top-tab-glow"
        animate={{ left: glow.left, width: glow.width, height: glow.height, top: glow.top }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          ref={(node) => {
            btnRefs.current[tab.id] = node;
          }}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`rp-top-tab${active === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <motion.div
        className="rp-top-tab-indicator"
        animate={{
          left: indicator.left + indicator.width * 0.6,
          width: indicator.width,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      />
    </div>
  );
}

export const TopReportTabs = memo(TopReportTabsBase);

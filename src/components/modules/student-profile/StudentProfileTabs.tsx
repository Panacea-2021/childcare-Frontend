'use client';

import { motion } from 'framer-motion';
import type { StudentProfileTab } from '@/lib/students/profileTypes';

const TABS: { id: StudentProfileTab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'documents', label: 'Documents' },
  { id: 'forms', label: 'Forms' },
  { id: 'invoices', label: 'Invoices' },
];

type Props = {
  active: StudentProfileTab;
  onChange: (tab: StudentProfileTab) => void;
};

export function StudentProfileTabs({ active, onChange }: Props) {
  return (
    <div className="sp-tabs" role="tablist" aria-label="Student profile sections">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`sp-tab${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {isActive ? (
              <motion.span
                className="sp-tab-indicator"
                layoutId="sp-tab-indicator"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

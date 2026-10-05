'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Lock,
  Bell,
  MessageSquare,
  Pin,
  Star,
  Heart,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { MOCK_LABELS } from '@/lib/mock/mockLabels';
import type { AdvancedToggleKey } from '@/types/activity';
import './activities.css';

interface AdvancedOptionsProps {
  notifyStaff: boolean;
  enableComments: boolean;
  staffOnly: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  allowParentReactions: boolean;
  sendPushNotification: boolean;
  labels: string[];
  onToggle: (key: AdvancedToggleKey, value: boolean) => void;
  onLabelsChange: (labels: string[]) => void;
}

const TOGGLE_OPTIONS: {
  key: AdvancedToggleKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: 'notifyStaff', label: 'Notify Staff', icon: Bell },
  { key: 'enableComments', label: 'Enable Comments', icon: MessageSquare },
  { key: 'staffOnly', label: 'Staff Only', icon: Lock },
  { key: 'isPinned', label: 'Pinned Activity', icon: Pin },
  { key: 'isFeatured', label: 'Featured Activity', icon: Star },
  { key: 'allowParentReactions', label: 'Allow Parent Reactions', icon: Heart },
  { key: 'sendPushNotification', label: 'Send Push Notification', icon: Bell },
];

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  notifyStaff,
  enableComments,
  staffOnly,
  isPinned,
  isFeatured,
  allowParentReactions,
  sendPushNotification,
  labels,
  onToggle,
  onLabelsChange,
}) => {
  const [expanded, setExpanded] = useState(true);

  const values: Record<AdvancedToggleKey, boolean> = {
    notifyStaff,
    enableComments,
    staffOnly,
    isPinned,
    isFeatured,
    allowParentReactions,
    sendPushNotification,
  };

  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      onLabelsChange(labels.filter((l) => l !== label));
    } else {
      onLabelsChange([...labels, label]);
    }
  };

  return (
    <div className="act-advanced act-step">
      <button
        type="button"
        className="act-advanced-trigger"
        onClick={() => setExpanded((o) => !o)}
        aria-expanded={expanded}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={16} color="var(--color-accent, #5d5fef)" />
          Step 8: Advanced Options
        </span>
        <ChevronDown
          size={18}
          className={`act-advanced-chevron${expanded ? ' act-advanced-chevron-open' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="act-advanced-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <AnimatePresence>
              {staffOnly && (
                <motion.div
                  className="act-staff-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  🔒 This activity is visible only to staff members. Parents will not
                  receive or view this activity.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="act-advanced-grid">
              {TOGGLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <label key={opt.key} className="act-advanced-toggle">
                    <span className="act-advanced-toggle-label">
                      <Icon size={16} />
                      {opt.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={values[opt.key]}
                      onChange={(e) => onToggle(opt.key, e.target.checked)}
                    />
                  </label>
                );
              })}
            </div>

            <div className="act-labels-section">
              <h5>Labels</h5>
              <div className="act-labels-grid">
                {MOCK_LABELS.map((lbl) => {
                  const isSelected = labels.includes(lbl);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => toggleLabel(lbl)}
                      className={`act-label-chip${isSelected ? ' act-label-chip-selected' : ''}`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

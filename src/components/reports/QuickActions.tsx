'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  History,
  Sparkles,
  Star,
  FileDown,
  type LucideIcon,
} from 'lucide-react';

export type QuickActionId =
  | 'generate'
  | 'recent'
  | 'favorites'
  | 'export'
  | 'history';

type Action = {
  id: QuickActionId;
  title: string;
  description: string;
  icon: LucideIcon;
};

const ACTIONS: Action[] = [
  {
    id: 'generate',
    title: 'Generate Report',
    description: 'Jump to report cards and create an export.',
    icon: Sparkles,
  },
  {
    id: 'recent',
    title: 'Recently Generated',
    description: 'Review your latest export previews.',
    icon: History,
  },
  {
    id: 'favorites',
    title: 'Favourite Reports',
    description: 'Open your starred reports instantly.',
    icon: Star,
  },
  {
    id: 'export',
    title: 'Export Center',
    description: 'Browse all Excel report categories.',
    icon: Download,
  },
  {
    id: 'history',
    title: 'Download History',
    description: 'Re-open the last successful preview.',
    icon: FileDown,
  },
];

type Props = {
  onAction: (id: QuickActionId) => void;
};

function QuickActionsBase({ onAction }: Props) {
  return (
    <div className="rp-quick-grid">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            type="button"
            className="rp-quick-card"
            onClick={() => onAction(action.id)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.04 }}
            whileHover={{ y: -4 }}
          >
            <span className="rp-quick-icon">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export const QuickActions = memo(QuickActionsBase);

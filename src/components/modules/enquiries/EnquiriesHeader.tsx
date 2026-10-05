'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers3, Share2, UserRoundPlus, Users } from 'lucide-react';
import { EnquiriesPageHeader } from './EnquiriesPageHeader';
import '@/components/modules/calendar/calendar.css';

type Props = {
  onManageStages: () => void;
  onManageSources: () => void;
  onAdd: () => void;
};

export function EnquiriesHeader({ onManageStages, onManageSources, onAdd }: Props) {
  const [pulse, setPulse] = useState(false);

  return (
    <EnquiriesPageHeader
      title="Enquiries"
      description="Track prospective families and move them toward enrollment"
      icon={<Users size={22} strokeWidth={2.1} />}
      actions={
        <>
          <motion.button
            type="button"
            className="cal-btn-export"
            onClick={onManageStages}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="cal-btn-export-glow" aria-hidden />
            <Layers3 size={16} aria-hidden />
            Manage Stages
          </motion.button>
          <motion.button
            type="button"
            className="cal-btn-export"
            onClick={onManageSources}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="cal-btn-export-glow" aria-hidden />
            <Share2 size={16} aria-hidden />
            Manage Sources
          </motion.button>
          <motion.button
            type="button"
            className="cal-btn-add"
            onClick={() => {
              setPulse(true);
              onAdd();
              window.setTimeout(() => setPulse(false), 500);
            }}
            whileHover={{ y: -5, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            animate={pulse ? { scale: [1, 1.06, 1] } : undefined}
            transition={pulse ? { duration: 0.45 } : undefined}
          >
            <span className="cal-btn-save-shine" aria-hidden />
            <UserRoundPlus size={16} aria-hidden />
            Add Enquiry
          </motion.button>
        </>
      }
    />
  );
}

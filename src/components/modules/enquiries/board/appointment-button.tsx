'use client';

import { memo } from 'react';
import { CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onClick: () => void;
  label?: string;
};

export const AppointmentButton = memo(function AppointmentButton({
  onClick,
  label = 'Add Appointment',
}: Props) {
  return (
    <motion.button
      type="button"
      className="ui-btn ui-btn-primary enq-card-action-btn"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CalendarPlus size={14} aria-hidden />
      {label}
    </motion.button>
  );
});

'use client';

import { memo } from 'react';
import { CalendarDays, List } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AppointmentViewMode } from '@/lib/appointments/types';

type Props = {
  mode: AppointmentViewMode;
  onChange: (mode: AppointmentViewMode) => void;
  total: number;
  filtered: number;
};

export const ViewSwitcher = memo(function ViewSwitcher({
  mode,
  onChange,
  total,
  filtered,
}: Props) {
  return (
    <div className="appt-view-bar">
      <div className="appt-view-meta">
        Showing <strong>{filtered}</strong> of <strong>{total}</strong> appointments
      </div>
      <div className="appt-view-toggle" role="tablist" aria-label="Appointment view">
        <motion.button
          type="button"
          role="tab"
          aria-selected={mode === 'calendar'}
          className={`appt-view-btn${mode === 'calendar' ? ' is-active' : ''}`}
          onClick={() => onChange('calendar')}
          whileTap={{ scale: 0.98 }}
        >
          {mode === 'calendar' ? (
            <motion.span className="appt-view-btn-bg" layoutId="appt-view-pill" />
          ) : null}
          <span className="appt-view-btn-label">
            <CalendarDays size={15} aria-hidden />
            Calendar View
          </span>
        </motion.button>
        <motion.button
          type="button"
          role="tab"
          aria-selected={mode === 'list'}
          className={`appt-view-btn${mode === 'list' ? ' is-active' : ''}`}
          onClick={() => onChange('list')}
          whileTap={{ scale: 0.98 }}
        >
          {mode === 'list' ? (
            <motion.span className="appt-view-btn-bg" layoutId="appt-view-pill" />
          ) : null}
          <span className="appt-view-btn-label">
            <List size={15} aria-hidden />
            List View
          </span>
        </motion.button>
      </div>
    </div>
  );
});

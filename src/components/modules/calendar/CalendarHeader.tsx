'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarPlus, Download, Loader2 } from 'lucide-react';
import { CalendarPageHeader } from './CalendarPageHeader';

type Props = {
  onExport: () => void | Promise<void>;
  onAdd: () => void;
};

export function CalendarHeader({ onExport, onAdd }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await onExport();
      await new Promise((r) => setTimeout(r, 420));
    } finally {
      setExporting(false);
    }
  };

  return (
    <CalendarPageHeader
      title="Staff Schedule"
      description="Manage staff shifts and schedules"
      icon={<CalendarDays size={22} strokeWidth={2.1} />}
      actions={
        <>
          <motion.button
            type="button"
            className="cal-btn-export"
            onClick={handleExport}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Export schedule"
            disabled={exporting}
          >
            <span className="cal-btn-export-glow" aria-hidden />
            {exporting ? <Loader2 size={16} className="cal-spin" aria-hidden /> : <Download size={16} aria-hidden />}
            {exporting ? 'Exporting…' : 'Export Schedule'}
          </motion.button>
          <motion.button
            type="button"
            className="cal-btn-add"
            onClick={onAdd}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Add schedule"
          >
            <span className="cal-btn-save-shine" aria-hidden />
            <CalendarPlus size={16} aria-hidden />
            Add Schedule
          </motion.button>
        </>
      }
    />
  );
}

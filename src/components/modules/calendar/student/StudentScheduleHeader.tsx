'use client';

import { useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarPlus, Download, GraduationCap, Loader2 } from 'lucide-react';
import { CalendarPageHeader } from '../CalendarPageHeader';

type Props = {
  onExport: () => void | Promise<void>;
  onAdd: () => void;
};

export function StudentScheduleHeader({ onExport, onAdd }: Props) {
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
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <CalendarPageHeader
          title="Student Schedule"
          description="Manage weekly classroom activities and student routines."
          icon={<GraduationCap size={22} strokeWidth={2.1} />}
          actions={
            <>
              <m.button
                type="button"
                className="ss-btn ss-btn-outline"
                onClick={handleExport}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Export student schedule"
                disabled={exporting}
              >
                <span className="ss-btn-ripple" aria-hidden />
                {exporting ? <Loader2 size={16} className="ss-spin" aria-hidden /> : <Download size={16} aria-hidden />}
                {exporting ? 'Exporting…' : 'Export'}
              </m.button>
              <m.button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={onAdd}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Add schedule"
              >
                <span className="ss-btn-shine" aria-hidden />
                <span className="ss-btn-ripple" aria-hidden />
                <CalendarPlus size={16} aria-hidden />
                Add Schedule
              </m.button>
            </>
          }
        />
      </MotionConfig>
    </LazyMotion>
  );
}

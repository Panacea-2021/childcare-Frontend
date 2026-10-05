'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import { CLASSROOMS, createDailyScheduleReport } from './dailyScheduleUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

export function DailyScheduleModal({ open, onClose, onGenerated }: Props) {
  const [room, setRoom] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRoom(null);
    setError(undefined);
    setGenerating(false);
  }, [open]);

  const handleGenerate = () => {
    if (!room) {
      setError('Room selection is mandatory.');
      return;
    }
    if (generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createDailyScheduleReport(room);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      open={open}
      title="Daily Schedule Report"
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={generating}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 size={16} className="asr-spin" style={{ marginRight: 8 }} />
                Generating…
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </>
      }
    >
      {generating ? (
        <div className="asr-loading">
          <Loader2 size={32} className="asr-spin" />
          <strong>Generating Daily Schedule Report...</strong>
          <span>Preparing your CSV export for the selected classroom.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <AsrDropdown
            label={
              <>
                Select Room <span className="asr-req">*</span>
              </>
            }
            ariaLabel="Select Room"
            placeholder="Select classroom"
            searchPlaceholder="Search classrooms…"
            value={room}
            error={error}
            onChange={(next) => {
              setRoom(next);
              if (next) setError(undefined);
            }}
            options={CLASSROOMS.map((r) => ({ value: r, label: r }))}
          />
        </motion.div>
      )}
    </Modal>
  );
}

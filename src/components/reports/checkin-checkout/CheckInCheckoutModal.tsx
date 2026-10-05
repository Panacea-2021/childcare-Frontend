'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StatusMultiSelect } from '@/components/reports/attendance-summary/StatusMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  createCheckInCheckoutReport,
  defaultCheckInCheckoutForm,
  type CheckInCheckoutFormValues,
} from './checkinCheckoutUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'statuses', string>>;

export function CheckInCheckoutModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<CheckInCheckoutFormValues>(defaultCheckInCheckoutForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultCheckInCheckoutForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Attendance Date Range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (!values.statuses.length) {
      next.statuses = 'Select at least one student status.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createCheckInCheckoutReport(values);
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
      title="Check-In / Check-Out Form Records"
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
          <strong>Generating Check-In / Check-Out Form Records...</strong>
          <span>Preparing your CSV export from the selected date range, rooms, and statuses.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <DateRangeField
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
          />

          <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />

          <StatusMultiSelect
            value={values.statuses}
            error={errors.statuses}
            onChange={(statuses) => setValues((v) => ({ ...v, statuses }))}
          />
        </motion.div>
      )}
    </Modal>
  );
}

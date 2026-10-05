'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordExcel } from '@/components/reports/shared/generatedReport';
import {
  createStudentCountAgeReport,
  defaultStudentCountAgeForm,
  type StudentCountAgeFormValues,
} from './studentCountAgeUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './student-count-age.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range', string>>;

export function StudentCountAgeGroupModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StudentCountAgeFormValues>(defaultStudentCountAgeForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentCountAgeForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Admission Date Range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      e.currentTarget.style.setProperty('--ripple-x', `${x}%`);
      e.currentTarget.style.setProperty('--ripple-y', `${y}%`);
    }
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStudentCountAgeReport(values);
      downloadRecordExcel(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      open={open}
      title="Student Count By Age Group"
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={generating}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary scag-gen-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
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
          <strong>Generating Student Count By Age Group Report...</strong>
          <span>Building age-band totals, Excel export, and analytics preview.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <DateRangeField
            label="Student Admission Date"
            startAriaLabel="Admission start date"
            endAriaLabel="Admission end date"
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={(next) => setValues((v) => ({ ...v, ...next }))}
          />
        </motion.div>
      )}
    </Modal>
  );
}

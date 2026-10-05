'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  createNewJoinerBreakdownReport,
  defaultNewJoinerBreakdownForm,
  type NewJoinerBreakdownFormValues,
} from './newJoinerBreakdownUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range', string>>;

export function NewJoinerBreakdownModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<NewJoinerBreakdownFormValues>(
    defaultNewJoinerBreakdownForm,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultNewJoinerBreakdownForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Student Admission Date is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createNewJoinerBreakdownReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <UserPlus size={18} />, []);

  return (
    <Modal
      open={open}
      title="New Joiner Breakdown By Month"
      subtitle="Configure your report before generating."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter
          generating={generating}
          onCancel={onClose}
          onGenerate={handleGenerate}
        />
      }
    >
      {generating ? (
        <div className="asr-loading" role="status" aria-live="polite">
          <Loader2 size={32} className="asr-spin" aria-hidden />
          <strong>Generating New Joiner Breakdown By Month...</strong>
          <span>Preparing your CSV export for the selected admission date range.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={reportItemVariants}>
            <DateRangeField
              label="Student Admission Date"
              startDate={values.startDate}
              endDate={values.endDate}
              error={errors.range}
              onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

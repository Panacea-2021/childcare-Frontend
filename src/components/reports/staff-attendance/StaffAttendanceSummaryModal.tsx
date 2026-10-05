'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  StaffAttendanceFields,
  validateStaffAttendanceBase,
} from './StaffAttendanceFields';
import { StaffStatusMultiSelect } from './StaffStatusMultiSelect';
import { STAFF_ATTENDANCE_LAST_GENERATED } from './types';
import {
  createStaffSummaryReport,
  defaultStaffSummaryForm,
  type StaffSummaryFormValues,
} from './staffSummaryUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'staff' | 'statuses', string>>;

export function StaffAttendanceSummaryModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StaffSummaryFormValues>(defaultStaffSummaryForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffSummaryForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = validateStaffAttendanceBase(values);
    if (!values.statuses.length) {
      next.statuses = 'Select at least one staff status.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStaffSummaryReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const report = createStaffSummaryReport(defaultStaffSummaryForm(), STAFF_ATTENDANCE_LAST_GENERATED.by);
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <BarChart3 size={18} />, []);

  return (
    <Modal
      open={open}
      title="Staff Attendance Summary"
      subtitle="Configure your staff attendance report before generating."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter generating={generating} onCancel={onClose} onGenerate={handleGenerate} />
      }
    >
      {generating ? (
        <div className="asr-loading" role="status" aria-live="polite">
          <Loader2 size={32} className="asr-spin" aria-hidden />
          <strong>Generating Staff Attendance Report...</strong>
          <span>Preparing your CSV export. This will only take a moment.</span>
        </div>
      ) : (
        <motion.div className="asr-form" variants={reportFormVariants} initial="hidden" animate="show">
          <motion.div variants={reportItemVariants}>
            <LastGeneratedCard
              onDownload={handleLastDownload}
              dateLabel={STAFF_ATTENDANCE_LAST_GENERATED.dateLabel}
              timeLabel={STAFF_ATTENDANCE_LAST_GENERATED.timeLabel}
              by={STAFF_ATTENDANCE_LAST_GENERATED.by}
            />
          </motion.div>

          <StaffAttendanceFields
            values={values}
            errors={errors}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          />

          <motion.div variants={reportItemVariants}>
            <StaffStatusMultiSelect
              value={values.statuses}
              error={errors.statuses}
              onChange={(statuses) => setValues((v) => ({ ...v, statuses }))}
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  ACTIVE_STUDENTS_LAST_GENERATED,
  createActiveStudentsReport,
  defaultActiveStudentsForm,
  type ActiveStudentsFormValues,
} from './activeStudentsUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range', string>>;

export function ActiveStudentsModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<ActiveStudentsFormValues>(defaultActiveStudentsForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultActiveStudentsForm());
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
      const report = createActiveStudentsReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const report = createActiveStudentsReport(
      defaultActiveStudentsForm(),
      ACTIVE_STUDENTS_LAST_GENERATED.by,
    );
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <BadgeCheck size={18} />, []);

  return (
    <Modal
      open={open}
      title="Active Students Report"
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
          <strong>Generating Active Students Report...</strong>
          <span>Preparing your CSV export for the selected admission dates and rooms.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={reportItemVariants}>
            <LastGeneratedCard
              onDownload={handleLastDownload}
              dateLabel={ACTIVE_STUDENTS_LAST_GENERATED.dateLabel}
              timeLabel={ACTIVE_STUDENTS_LAST_GENERATED.timeLabel}
              by={ACTIVE_STUDENTS_LAST_GENERATED.by}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <DateRangeField
              label="Student Admission Date"
              startDate={values.startDate}
              endDate={values.endDate}
              error={errors.range}
              onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <RoomMultiSelect
              value={values.rooms}
              placeholder="Leave blank to select all rooms"
              onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

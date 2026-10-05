'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StatusMultiSelect } from '@/components/reports/attendance-summary/StatusMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  PROGRAM_STUDENTS_LAST_GENERATED,
  createProgramStudentsReport,
  defaultProgramStudentsForm,
  type ProgramStudentsFormValues,
} from './programStudentsUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'statuses', string>>;

export function ProgramStudentsModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<ProgramStudentsFormValues>(defaultProgramStudentsForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultProgramStudentsForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Enrollment Date is mandatory.';
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
      const report = createProgramStudentsReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const report = createProgramStudentsReport(
      defaultProgramStudentsForm(),
      PROGRAM_STUDENTS_LAST_GENERATED.by,
    );
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <BookOpen size={18} />, []);

  return (
    <Modal
      open={open}
      title="Program Students Report"
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
          <strong>Generating Program Students Report...</strong>
          <span>Preparing your CSV export with the selected enrollment dates, rooms, and statuses.</span>
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
              dateLabel={PROGRAM_STUDENTS_LAST_GENERATED.dateLabel}
              timeLabel={PROGRAM_STUDENTS_LAST_GENERATED.timeLabel}
              by={PROGRAM_STUDENTS_LAST_GENERATED.by}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <DateRangeField
              label="Enrollment Date"
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

          <motion.div variants={reportItemVariants}>
            <StatusMultiSelect
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ListChecks } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StatusMultiSelect } from '@/components/reports/attendance-summary/StatusMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  createStudentStatusReport,
  defaultStudentStatusForm,
  type StudentStatusFormValues,
} from './studentStatusUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'statuses', string>>;

export function StudentStatusModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StudentStatusFormValues>(defaultStudentStatusForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentStatusForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
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
      const report = createStudentStatusReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <ListChecks size={18} />, []);

  return (
    <Modal
      open={open}
      title="Student Status Report"
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
          <strong>Generating Student Status Report...</strong>
          <span>Preparing your CSV export for the selected rooms and statuses.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
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

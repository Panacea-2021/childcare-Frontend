'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  StaffAttendanceFields,
  validateStaffAttendanceBase,
} from './StaffAttendanceFields';
import {
  STAFF_LATE_COLUMNS,
  createStaffLateReport,
  defaultStaffLateForm,
  type StaffLateColumnId,
  type StaffLateFormValues,
} from './staffLateUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'staff' | 'columns', string>>;

export function StaffLateAttendanceModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StaffLateFormValues>(defaultStaffLateForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffLateForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = validateStaffAttendanceBase(values);
    if (values.columnMode === 'custom' && !values.selectedColumns.length) {
      next.columns = 'Select at least one column, or switch to All Columns.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStaffLateReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Clock3 size={18} />, []);

  return (
    <Modal
      open={open}
      title="Staff Late Attendance"
      subtitle="Configure late staff check-ins before generating."
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
          <strong>Generating Staff Late Attendance Report...</strong>
          <span>Preparing your CSV export with the selected columns.</span>
        </div>
      ) : (
        <motion.div className="asr-form" variants={reportFormVariants} initial="hidden" animate="show">
          <StaffAttendanceFields
            values={values}
            errors={errors}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          />

          <motion.div variants={reportItemVariants}>
            <ReportColumnsSelector
              mode={values.columnMode}
              modeOptions={[
                { id: 'all', label: 'All Columns' },
                { id: 'custom', label: 'Custom' },
              ]}
              compactModes={['all']}
              columns={STAFF_LATE_COLUMNS}
              selected={values.selectedColumns}
              twoColumn
              pageSize={10}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode: columnMode as StaffLateFormValues['columnMode'],
                  selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({
                  ...v,
                  selectedColumns: selectedColumns as StaffLateColumnId[],
                }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardClock, Loader2 } from 'lucide-react';
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
  STAFF_TIMECARD_COLUMNS,
  createStaffTimeCardReport,
  defaultStaffTimeCardForm,
  type StaffTimeCardColumnId,
  type StaffTimeCardFormValues,
} from './staffDailyTimeCardUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'staff' | 'columns', string>>;

export function StaffDailyTimeCardModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StaffTimeCardFormValues>(defaultStaffTimeCardForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffTimeCardForm());
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
      const report = createStaffTimeCardReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <ClipboardClock size={18} />, []);

  return (
    <Modal
      open={open}
      title="Staff Daily Time Card"
      subtitle="Generate staff daily time cards with punch details."
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
          <strong>Generating Staff Daily Time Card Report...</strong>
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
              columns={STAFF_TIMECARD_COLUMNS}
              selected={values.selectedColumns}
              twoColumn
              pageSize={10}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode: columnMode as StaffTimeCardFormValues['columnMode'],
                  selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({
                  ...v,
                  selectedColumns: selectedColumns as StaffTimeCardColumnId[],
                }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UserX } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  StaffAttendanceFields,
  validateStaffAttendanceBase,
} from './StaffAttendanceFields';
import { STAFF_ATTENDANCE_LAST_GENERATED } from './types';
import {
  DEFAULT_STAFF_ABSENTEE_COLUMNS,
  STAFF_ABSENTEE_COLUMNS,
  createStaffAbsenteesReport,
  defaultStaffAbsenteesForm,
  type StaffAbsenteeColumnId,
  type StaffAbsenteesFormValues,
} from './staffAbsenteesUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'staff' | 'columns', string>>;

export function StaffAbsenteesReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StaffAbsenteesFormValues>(defaultStaffAbsenteesForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffAbsenteesForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = validateStaffAttendanceBase(values);
    if (values.columnMode === 'custom' && !values.selectedColumns.length) {
      next.columns = 'Select at least one column.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStaffAbsenteesReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const report = createStaffAbsenteesReport(
      defaultStaffAbsenteesForm(),
      STAFF_ATTENDANCE_LAST_GENERATED.by,
    );
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <UserX size={18} />, []);

  return (
    <Modal
      open={open}
      title="Staff Absentees Report"
      subtitle="Configure your staff absentees report before generating."
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
          <strong>Generating Staff Absentees Report...</strong>
          <span>Preparing your CSV export with the selected columns.</span>
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
            <ReportColumnsSelector
              mode={values.columnMode}
              modeOptions={[
                { id: 'default', label: 'Default' },
                { id: 'custom', label: 'Custom' },
              ]}
              compactModes={['default']}
              columns={STAFF_ABSENTEE_COLUMNS}
              selected={values.selectedColumns}
              twoColumn
              pageSize={10}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode: columnMode as StaffAbsenteesFormValues['columnMode'],
                  selectedColumns:
                    columnMode === 'default' ? [...DEFAULT_STAFF_ABSENTEE_COLUMNS] : v.selectedColumns,
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({
                  ...v,
                  selectedColumns: selectedColumns as StaffAbsenteeColumnId[],
                }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

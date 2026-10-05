'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UserX } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { FilterByRadios } from '@/components/reports/attendance-summary/FilterByRadios';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StudentCombobox } from '@/components/reports/attendance-summary/StudentCombobox';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import { ColumnsSelector } from './ColumnsSelector';
import {
  ABSENTEES_LAST_GENERATED,
  createAbsenteesReport,
  defaultAbsenteesForm,
  type AbsenteesFormValues,
} from './absenteesUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'student' | 'columns', string>>;

export function AbsenteesReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<AbsenteesFormValues>(defaultAbsenteesForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultAbsenteesForm());
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
    if (values.filterBy === 'student' && !values.studentId) {
      next.student = 'Please select a student.';
    }
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
      const report = createAbsenteesReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultAbsenteesForm();
    const report = createAbsenteesReport(seed, ABSENTEES_LAST_GENERATED.by);
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <UserX size={18} />, []);

  return (
    <Modal
      open={open}
      title="Absentees Report"
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
          <strong>Generating Absentees Report...</strong>
          <span>Preparing your CSV export with the selected columns.</span>
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
              dateLabel={ABSENTEES_LAST_GENERATED.dateLabel}
              timeLabel={ABSENTEES_LAST_GENERATED.timeLabel}
              by={ABSENTEES_LAST_GENERATED.by}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <DateRangeField
              startDate={values.startDate}
              endDate={values.endDate}
              error={errors.range}
              onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <FilterByRadios
              value={values.filterBy}
              onChange={(filterBy) =>
                setValues((v) => ({
                  ...v,
                  filterBy,
                  rooms: filterBy === 'classroom' ? v.rooms : [],
                  studentId: filterBy === 'student' ? v.studentId : null,
                }))
              }
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            {values.filterBy === 'classroom' ? (
              <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />
            ) : (
              <StudentCombobox
                value={values.studentId}
                error={errors.student}
                onChange={(studentId) => setValues((v) => ({ ...v, studentId }))}
              />
            )}
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <ColumnsSelector
              mode={values.columnMode}
              selected={values.selectedColumns}
              error={errors.columns}
              onModeChange={(columnMode) => setValues((v) => ({ ...v, columnMode }))}
              onSelectedChange={(selectedColumns) => setValues((v) => ({ ...v, selectedColumns }))}
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

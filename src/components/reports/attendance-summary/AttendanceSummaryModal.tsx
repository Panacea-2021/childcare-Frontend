'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { LastGeneratedCard } from './LastGeneratedCard';
import { DateRangeField } from './DateRangeField';
import { FilterByRadios } from './FilterByRadios';
import { RoomMultiSelect } from './RoomMultiSelect';
import { StudentCombobox } from './StudentCombobox';
import { StatusMultiSelect } from './StatusMultiSelect';
import {
  CURRENT_USER,
  type AttendanceFormValues,
} from './types';
import {
  attendanceToExcelReport,
  buildAttendanceRows,
  createGeneratedReport,
  defaultFormValues,
  downloadCsv,
  buildReportName,
} from './utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import './attendance-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'student' | 'statuses', string>>;

export function AttendanceSummaryModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<AttendanceFormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultFormValues());
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
      const base = createGeneratedReport(values, CURRENT_USER);
      downloadCsv(base.name, base.rows);
      onGenerated(attendanceToExcelReport(base));
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultFormValues();
    const rows = buildAttendanceRows(seed);
    downloadCsv(`${buildReportName(seed.startDate, seed.endDate)}.csv`, rows);
  };

  const icon = useMemo(
    () => (
      <BarChart3 size={18} />
    ),
    [],
  );

  return (
    <Modal
      open={open}
      title="Attendance Summary"
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
          <strong>Generating Attendance Report...</strong>
          <span>Preparing your CSV export. This will only take a moment.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={reportItemVariants}>
            <LastGeneratedCard onDownload={handleLastDownload} />
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
              <RoomMultiSelect
                value={values.rooms}
                onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
              />
            ) : (
              <StudentCombobox
                value={values.studentId}
                error={errors.student}
                onChange={(studentId) => setValues((v) => ({ ...v, studentId }))}
              />
            )}
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

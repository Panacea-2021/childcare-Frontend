'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardClock, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { FilterByRadios } from '@/components/reports/attendance-summary/FilterByRadios';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StudentCombobox } from '@/components/reports/attendance-summary/StudentCombobox';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  DAILY_TIME_CARD_COLUMNS,
  createDailyTimeCardReport,
  defaultDailyTimeCardForm,
  type DailyTimeCardColumnId,
  type DailyTimeCardFormValues,
} from './dailyTimeCardUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'student' | 'columns', string>>;

export function DailyTimeCardModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<DailyTimeCardFormValues>(defaultDailyTimeCardForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultDailyTimeCardForm());
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
      next.columns = 'Select at least one column, or switch to All Columns.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createDailyTimeCardReport(values);
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
      title="Daily Time Card"
      subtitle="Generate and customize your daily time card report."
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
          <strong>Generating Daily Time Card Report...</strong>
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
            <ReportColumnsSelector
              mode={values.columnMode}
              modeOptions={[
                { id: 'all', label: 'All Columns' },
                { id: 'custom', label: 'Custom' },
              ]}
              compactModes={['all']}
              columns={DAILY_TIME_CARD_COLUMNS}
              selected={values.selectedColumns}
              twoColumn
              pageSize={10}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode: columnMode as DailyTimeCardFormValues['columnMode'],
                  selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({ ...v, selectedColumns: selectedColumns as DailyTimeCardColumnId[] }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

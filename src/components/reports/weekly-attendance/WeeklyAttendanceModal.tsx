'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { FilterByRadios } from '@/components/reports/attendance-summary/FilterByRadios';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StudentCombobox } from '@/components/reports/attendance-summary/StudentCombobox';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  createWeeklyAttendanceReport,
  defaultWeeklyForm,
  type WeeklyAttendanceFormValues,
} from './weeklyUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './weekly-attendance.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'student', string>>;

export function WeeklyAttendanceModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<WeeklyAttendanceFormValues>(defaultWeeklyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultWeeklyForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Date Range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (values.filterBy === 'student' && !values.studentId) {
      next.student = 'Please select a student.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createWeeklyAttendanceReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      open={open}
      title="Weekly Attendance Report"
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={generating}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 size={16} className="asr-spin" style={{ marginRight: 8 }} />
                Generating…
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </>
      }
    >
      {generating ? (
        <div className="asr-loading">
          <Loader2 size={32} className="asr-spin" />
          <strong>Generating Weekly Attendance Report...</strong>
          <span>Preparing your CSV export from the selected weekly filters.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <DateRangeField
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
          />

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

          {values.filterBy === 'classroom' ? (
            <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />
          ) : (
            <StudentCombobox
              value={values.studentId}
              error={errors.student}
              onChange={(studentId) => setValues((v) => ({ ...v, studentId }))}
            />
          )}

          <div className="asr-field">
            <motion.label
              className={`wk-autofill${values.autoFill ? ' is-on' : ''}`}
              whileTap={{ scale: 0.99 }}
            >
              <span className={`asr-dd-checkbox${values.autoFill ? ' is-on' : ''}`} aria-hidden>
                {values.autoFill ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <input
                type="checkbox"
                checked={values.autoFill}
                onChange={(e) => setValues((v) => ({ ...v, autoFill: e.target.checked }))}
              />
              <span>
                <strong>Auto fill report data</strong>
                {!values.autoFill ? (
                  <em>The report will include only the selected filters and available attendance data.</em>
                ) : (
                  <em>Automatically populate the report using realistic weekly attendance mock data.</em>
                )}
              </span>
            </motion.label>
          </div>
        </motion.div>
      )}
    </Modal>
  );
}

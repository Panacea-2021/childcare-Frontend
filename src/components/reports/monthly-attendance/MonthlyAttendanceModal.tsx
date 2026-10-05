'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CalendarRange,
  Clock3,
  Download,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StudentCombobox } from '@/components/reports/attendance-summary/StudentCombobox';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import { MonthlyColumnsPanel } from './MonthlyColumnsPanel';
import {
  MONTHLY_COLUMNS,
  MONTHLY_LAST_GENERATED,
  createMonthlyAttendanceReport,
  defaultMonthlyForm,
  type MonthlyAttendanceFormValues,
  type MonthlyColumnId,
} from './monthlyUtils';
import '@/components/modules/view-profile/field-picker.css';
import '@/components/reports/attendance-summary/attendance-summary.css';
import './monthly-attendance.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'student' | 'columns', string>>;

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function MonthlyAttendanceModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<MonthlyAttendanceFormValues>(defaultMonthlyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultMonthlyForm());
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
      const report = createMonthlyAttendanceReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultMonthlyForm();
    const report = createMonthlyAttendanceReport(seed, MONTHLY_LAST_GENERATED.by);
    downloadRecordCsv(report.name, report.columns, report.rows);
  };

  const icon = useMemo(() => <CalendarRange size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Monthly Attendance"
      subtitle="Generate and customize your monthly attendance report."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <>
          <button
            type="button"
            className="mar-footer-btn mar-footer-cancel"
            onClick={onClose}
            disabled={generating}
          >
            Cancel
          </button>
          <button
            type="button"
            className="mar-footer-btn mar-footer-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 size={16} className="mar-spin" aria-hidden />
                Generating…
              </>
            ) : (
              <>
                <BarChart3 size={16} aria-hidden />
                Generate Report
              </>
            )}
          </button>
        </>
      }
    >
      {generating ? (
        <div className="mar-loading">
          <Loader2 size={36} className="mar-spin" />
          <strong>Generating Monthly Attendance Report...</strong>
          <span>Building your export with the selected date range, filters, and columns.</span>
        </div>
      ) : (
        <motion.div
          className="mar-root"
          initial={{ opacity: 0, scale: 0.975 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="mar-last" {...fadeUp} transition={{ delay: 0.02, duration: 0.24 }}>
            <div className="mar-last-left">
              <span className="mar-last-icon" aria-hidden>
                <FileSpreadsheet size={20} />
              </span>
              <div>
                <p className="mar-last-kicker">Recent export</p>
                <p className="mar-last-title">Last Generated On</p>
                <div className="mar-last-meta">
                  <span className="mar-chip">
                    <Clock3 size={13} aria-hidden />
                    {MONTHLY_LAST_GENERATED.dateLabel}
                  </span>
                  <span className="mar-chip">{MONTHLY_LAST_GENERATED.timeLabel}</span>
                  <span className="mar-chip">
                    <span>Generated By</span>
                    {MONTHLY_LAST_GENERATED.by}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              type="button"
              className="mar-download"
              aria-label="Download last generated report"
              onClick={handleLastDownload}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <Download size={18} />
            </motion.button>
          </motion.div>

          <motion.section className="mar-section" {...fadeUp} transition={{ delay: 0.06, duration: 0.24 }}>
            <p className="mar-section-label">Attendance Date</p>
            <div className="mar-card mar-card-pad">
              <div className="mar-date-grid">
                <div className="mar-date-item">
                  <span>Start Date</span>
                  <FieldDatePicker
                    value={values.startDate}
                    onChange={(startDate) => setValues((v) => ({ ...v, startDate }))}
                    ariaLabel="Attendance start date"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="mar-date-item">
                  <span>End Date</span>
                  <FieldDatePicker
                    value={values.endDate}
                    onChange={(endDate) => setValues((v) => ({ ...v, endDate }))}
                    ariaLabel="Attendance end date"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
              {errors.range ? <p className="mar-error mar-date-error">{errors.range}</p> : null}
            </div>
          </motion.section>

          <motion.section className="mar-section" {...fadeUp} transition={{ delay: 0.1, duration: 0.24 }}>
            <p className="mar-section-label">Filter By</p>
            <div className="mar-segment" role="radiogroup" aria-label="Filter by">
              {(
                [
                  ['classroom', 'Classroom'],
                  ['student', 'Student'],
                ] as const
              ).map(([id, label]) => {
                const active = values.filterBy === id;
                return (
                  <label key={id} className={`mar-segment-opt${active ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="mar-filter-by"
                      checked={active}
                      onChange={() =>
                        setValues((v) => ({
                          ...v,
                          filterBy: id,
                          rooms: id === 'classroom' ? v.rooms : [],
                          studentId: id === 'student' ? v.studentId : null,
                        }))
                      }
                    />
                    {active ? (
                      <motion.span
                        layoutId="mar-filter-indicator"
                        className="mar-segment-indicator"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        aria-hidden
                      />
                    ) : null}
                    <span className="mar-segment-label">{label}</span>
                  </label>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={values.filterBy}
                className="mar-card mar-card-pad"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
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
            </AnimatePresence>
          </motion.section>

          <motion.div {...fadeUp} transition={{ delay: 0.14, duration: 0.24 }}>
            <MonthlyColumnsPanel
              mode={values.columnMode}
              selected={values.selectedColumns}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode,
                  selectedColumns:
                    columnMode === 'all'
                      ? []
                      : v.selectedColumns.length
                        ? v.selectedColumns
                        : MONTHLY_COLUMNS.map((c) => c.id as MonthlyColumnId),
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({ ...v, selectedColumns }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

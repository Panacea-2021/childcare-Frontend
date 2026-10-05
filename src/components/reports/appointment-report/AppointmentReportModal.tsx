'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, CalendarDays, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  APPOINTMENT_COLUMNS,
  createAppointmentReport,
  defaultAppointmentReportForm,
  type AppointmentColumnId,
  type AppointmentReportFormValues,
} from './appointmentReportUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './appointment-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function AppointmentReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<AppointmentReportFormValues>(defaultAppointmentReportForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultAppointmentReportForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Appointment date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (values.columnMode === 'custom' && !values.selectedColumns.length) {
      next.columns = 'Select at least one column, or switch to Export All Columns.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createAppointmentReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const onFormKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    if (target.closest('button, a, [role="button"]')) return;
    e.preventDefault();
    handleGenerate();
  };

  const icon = useMemo(() => <CalendarDays size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      autoHeight
      iconClose
      open={open}
      title="Appointment Report"
      subtitle="Generate appointment reports with flexible date filters and customizable export columns."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter
          generating={generating}
          onCancel={onClose}
          onGenerate={handleGenerate}
          generatingLabel="Generating Report..."
        />
      }
    >
      <div className="apr-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading apr-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Report...</strong>
              <span>Preparing your appointment export for the selected date range and columns.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="apr-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="apr-card" variants={reportItemVariants}>
                <header className="apr-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Choose the appointment date range to include in the generated report.</p>
                  </div>
                </header>

                <div className="apr-filter-grid">
                  <DateRangeField
                    label="Appointment Date"
                    startAriaLabel="Appointment start date"
                    endAriaLabel="Appointment end date"
                    startDate={values.startDate}
                    endDate={values.endDate}
                    error={errors.range}
                    onChange={({ startDate, endDate }) => {
                      setValues((v) => ({ ...v, startDate, endDate }));
                      if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
                    }}
                  />
                </div>
              </motion.section>

              <motion.aside
                className="apr-info"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="apr-info-icon" aria-hidden>
                  <BarChart3 size={18} strokeWidth={2.1} />
                </span>
                <div>
                  <strong>About this report</strong>
                  <p>
                    This report exports appointment information for the selected date range including
                    schedules, clients, status, and assigned staff.
                  </p>
                </div>
              </motion.aside>

              <motion.section className="apr-card" variants={reportItemVariants}>
                <header className="apr-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>
                      Choose whether to export all appointment information or customize the exported
                      fields.
                    </p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${values.selectedColumns.length}`}
                    className="apr-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {values.columnMode === 'all'
                      ? `${APPOINTMENT_COLUMNS.length} / ${APPOINTMENT_COLUMNS.length}`
                      : `${values.selectedColumns.length} / ${APPOINTMENT_COLUMNS.length}`}
                  </motion.span>
                </header>

                <ReportColumnsSelector
                  appearance="premium"
                  mode={values.columnMode}
                  modeOptions={[
                    { id: 'all', label: 'Export All Columns' },
                    { id: 'custom', label: 'Custom Columns' },
                  ]}
                  compactModes={['all']}
                  compactHint={`All ${APPOINTMENT_COLUMNS.length} columns will be included in the report.`}
                  columns={APPOINTMENT_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={6}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Pick the fields your export should include."
                  searchPlaceholder="Search report columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as AppointmentReportFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }))
                  }
                  onSelectedChange={(selectedColumns) => {
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as AppointmentColumnId[],
                    }));
                    if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
                  }}
                />
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  ACTIVITY_EXCEL_COLUMNS,
  createActivityExcelReport,
  defaultActivityExcelForm,
  type ActivityExcelColumnId,
  type ActivityExcelFormValues,
} from './activityExcelUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './activity-excel.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function ActivityExcelReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<ActivityExcelFormValues>(defaultActivityExcelForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultActivityExcelForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Activity date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
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
      const report = createActivityExcelReport(values);
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

  const icon = useMemo(() => <Sparkles size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Activity Excel Report"
      subtitle="Export classroom activities with the filters and columns you need."
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
      <div className="aer-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading aer-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Activity Excel Report...</strong>
              <span>Preparing your CSV export from the selected filters and columns.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="aer-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="aer-card" variants={reportItemVariants}>
                <header className="aer-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Choose the activity period and rooms to include.</p>
                  </div>
                </header>

                <div className="aer-filter-grid">
                  <DateRangeField
                    label="Activity Date"
                    startAriaLabel="Activity start date"
                    endAriaLabel="Activity end date"
                    startDate={values.startDate}
                    endDate={values.endDate}
                    error={errors.range}
                    onChange={({ startDate, endDate }) => {
                      setValues((v) => ({ ...v, startDate, endDate }));
                      if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
                    }}
                  />
                  <RoomMultiSelect
                    value={values.rooms}
                    onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
                  />
                </div>
              </motion.section>

              <motion.section className="aer-card" variants={reportItemVariants}>
                <header className="aer-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>Choose whether to export all fields or customize the exported columns.</p>
                  </div>
                </header>

                <div className="aer-columns">
                  <div className="ui-field aer-mode-field">
                    <label className="ui-label" htmlFor="aer-column-mode">
                      Columns
                    </label>
                    <select
                      id="aer-column-mode"
                      className="ui-select"
                      value={values.columnMode}
                      aria-label="Column preset"
                      onChange={(e) => {
                        const columnMode = e.target.value as ActivityExcelFormValues['columnMode'];
                        setValues((v) => ({
                          ...v,
                          columnMode,
                          selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                        }));
                        if (columnMode === 'all') {
                          setErrors((err) => ({ ...err, columns: undefined }));
                        }
                      }}
                    >
                      <option value="all">All Columns</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <AnimatePresence initial={false} mode="wait">
                    {values.columnMode === 'custom' ? (
                      <motion.div
                        key="custom-columns"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ReportColumnsSelector
                          appearance="premium"
                          inlinePanel
                          hideModeOptions
                          mode="custom"
                          modeOptions={[{ id: 'custom', label: 'Custom' }]}
                          compactModes={[]}
                          columns={ACTIVITY_EXCEL_COLUMNS}
                          selected={values.selectedColumns}
                          twoColumn
                          pageSize={10}
                          searchPlaceholder="Search Columns..."
                          selectAllLabel="Select All"
                          error={errors.columns}
                          onModeChange={() => undefined}
                          onSelectedChange={(selectedColumns) => {
                            setValues((v) => ({
                              ...v,
                              selectedColumns: selectedColumns as ActivityExcelColumnId[],
                            }));
                            if (selectedColumns.length) {
                              setErrors((e) => ({ ...e, columns: undefined }));
                            }
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.p
                        key="all-hint"
                        className="ab-default-hint"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        All {ACTIVITY_EXCEL_COLUMNS.length} columns will be included in the report.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

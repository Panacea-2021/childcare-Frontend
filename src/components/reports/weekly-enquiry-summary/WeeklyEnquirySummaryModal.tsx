'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, LineChart, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  WEEKLY_ENQUIRY_COLUMNS,
  createWeeklyEnquirySummaryReport,
  defaultWeeklyEnquiryForm,
  type WeeklyEnquiryColumnId,
  type WeeklyEnquiryFormValues,
} from './weeklyEnquiryUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './weekly-enquiry-summary.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'columns', string>>;

export function WeeklyEnquirySummaryModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<WeeklyEnquiryFormValues>(defaultWeeklyEnquiryForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultWeeklyEnquiryForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
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
      const report = createWeeklyEnquirySummaryReport(values);
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

  const icon = useMemo(() => <LineChart size={20} strokeWidth={2.1} />, []);
  const selectedCount =
    values.columnMode === 'all'
      ? WEEKLY_ENQUIRY_COLUMNS.length
      : values.selectedColumns.length;

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Weekly Enquiry Summary"
      subtitle="Generate a comparative weekly enquiry report with customizable export columns."
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
      <div className="wes-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading wes-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Report...</strong>
              <span>Comparing enquiry performance between this week and the previous week.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="wes-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.aside
                className="wes-info"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="wes-info-icon" aria-hidden>
                  <BarChart3 size={18} strokeWidth={2.1} />
                </span>
                <p>
                  This report compares enquiry performance between the current week and the previous
                  week for each center.
                </p>
              </motion.aside>

              <motion.section className="wes-card" variants={reportItemVariants}>
                <header className="wes-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>
                      Choose whether to export all available fields or customize the exported
                      columns.
                    </p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${selectedCount}`}
                    className="wes-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {selectedCount} / {WEEKLY_ENQUIRY_COLUMNS.length} Selected
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
                  compactHint={`All ${WEEKLY_ENQUIRY_COLUMNS.length} columns will be included in the report.`}
                  columns={WEEKLY_ENQUIRY_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={4}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Pick the fields your export should include."
                  searchPlaceholder="Search report columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) => {
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as WeeklyEnquiryFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }));
                    if (columnMode === 'all') setErrors((e) => ({ ...e, columns: undefined }));
                  }}
                  onSelectedChange={(selectedColumns) => {
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as WeeklyEnquiryColumnId[],
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

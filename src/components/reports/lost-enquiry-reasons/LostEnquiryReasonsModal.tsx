'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  LOST_ENQUIRY_COLUMNS,
  createLostEnquiryReport,
  defaultLostEnquiryForm,
  type LostEnquiryColumnId,
  type LostEnquiryFormValues,
} from './lostEnquiryReasonsUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './lost-enquiry-reasons.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function LostEnquiryReasonsModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<LostEnquiryFormValues>(defaultLostEnquiryForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultLostEnquiryForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Date range is mandatory.';
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
      const report = createLostEnquiryReport(values);
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

  const icon = useMemo(() => <TrendingDown size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Lost Enquiry Reasons Report"
      subtitle="Analyze lost enquiries and understand the most common reasons across selected periods."
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
      <div className="ler-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading ler-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Report...</strong>
              <span>Preparing your CSV export of lost enquiry reasons for the selected period.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="ler-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="ler-card" variants={reportItemVariants}>
                <header className="ler-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Configure the report period before generating the report.</p>
                  </div>
                </header>

                <div className="ler-filter-grid">
                  <DateRangeField
                    label="Date Range"
                    startAriaLabel="Lost enquiry start date"
                    endAriaLabel="Lost enquiry end date"
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
                className="ler-info"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="ler-info-icon" aria-hidden>
                  <BarChart3 size={18} strokeWidth={2.1} />
                </span>
                <div>
                  <strong>About this report</strong>
                  <p>
                    This report summarizes lost enquiry reasons and provides counts and percentages
                    for the selected period.
                  </p>
                </div>
              </motion.aside>

              <motion.section className="ler-card" variants={reportItemVariants}>
                <header className="ler-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>Choose which information should appear in the exported report.</p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${values.selectedColumns.length}`}
                    className="ler-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {values.columnMode === 'all'
                      ? `${LOST_ENQUIRY_COLUMNS.length} / ${LOST_ENQUIRY_COLUMNS.length}`
                      : `${values.selectedColumns.length} / ${LOST_ENQUIRY_COLUMNS.length}`}
                  </motion.span>
                </header>

                <ReportColumnsSelector
                  appearance="premium"
                  mode={values.columnMode}
                  modeOptions={[
                    { id: 'all', label: 'All Columns' },
                    { id: 'custom', label: 'Custom Columns' },
                  ]}
                  compactModes={['all']}
                  compactHint={`All ${LOST_ENQUIRY_COLUMNS.length} columns will be included in the report.`}
                  columns={LOST_ENQUIRY_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={4}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Pick the fields your export should include."
                  searchPlaceholder="Search report columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as LostEnquiryFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }))
                  }
                  onSelectedChange={(selectedColumns) =>
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as LostEnquiryColumnId[],
                    }))
                  }
                />
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

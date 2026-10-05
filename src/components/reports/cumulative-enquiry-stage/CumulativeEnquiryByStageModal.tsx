'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, PieChart } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  CUMULATIVE_ENQUIRY_COLUMNS,
  createCumulativeEnquiryReport,
  defaultCumulativeEnquiryForm,
  type CumulativeEnquiryColumnId,
  type CumulativeEnquiryFormValues,
} from './cumulativeEnquiryUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './cumulative-enquiry-stage.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function CumulativeEnquiryByStageModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<CumulativeEnquiryFormValues>(defaultCumulativeEnquiryForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultCumulativeEnquiryForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Enquiry creation date range is mandatory.';
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
      const report = createCumulativeEnquiryReport(values);
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

  const icon = useMemo(() => <PieChart size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Cumulative Enquiry by Stage"
      subtitle="Generate a cumulative stage-wise enquiry analysis with customizable export columns."
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
      <div className="ces-report" onKeyDown={onFormKeyDown}>
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading ces-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Report...</strong>
              <span>
                Preparing your cumulative stage-wise enquiry analysis for the selected period.
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="ces-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="ces-card" variants={reportItemVariants}>
                <header className="ces-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Choose the enquiry creation period for cumulative stage analysis.</p>
                  </div>
                  <span className="ces-req-pill" aria-hidden>
                    Required
                  </span>
                </header>

                <div className="ces-filter-grid">
                  <DateRangeField
                    label="Enquiry Creation Date"
                    startAriaLabel="Enquiry creation start date"
                    endAriaLabel="Enquiry creation end date"
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
                className="ces-info"
                variants={reportItemVariants}
                role="note"
                aria-label="Report information"
              >
                <span className="ces-info-icon" aria-hidden>
                  📈
                </span>
                <p>
                  This report provides cumulative enquiry statistics across different enquiry stages
                  for the selected date range.
                </p>
              </motion.aside>

              <motion.section className="ces-card" variants={reportItemVariants}>
                <header className="ces-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>
                      Select whether to export all available data or customize the exported fields.
                    </p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${values.selectedColumns.length}`}
                    className="ces-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {values.columnMode === 'all'
                      ? `${CUMULATIVE_ENQUIRY_COLUMNS.length} / ${CUMULATIVE_ENQUIRY_COLUMNS.length}`
                      : `${values.selectedColumns.length} / ${CUMULATIVE_ENQUIRY_COLUMNS.length}`}
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
                  compactHint={`All ${CUMULATIVE_ENQUIRY_COLUMNS.length} columns will be included in the report.`}
                  columns={CUMULATIVE_ENQUIRY_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={8}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Pick the fields your export should include."
                  searchPlaceholder="Search report columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as CumulativeEnquiryFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }))
                  }
                  onSelectedChange={(selectedColumns) =>
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as CumulativeEnquiryColumnId[],
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

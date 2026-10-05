'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  ENQUIRY_COLUMNS,
  ENQUIRY_OWNERS,
  ENQUIRY_PROGRAMS,
  ENQUIRY_SOURCES,
  ENQUIRY_STAGES,
  createEnquiryReport,
  defaultEnquiryReportForm,
  type EnquiryColumnId,
  type EnquiryReportFormValues,
  type EnquirySource,
  type EnquiryStage,
} from './enquiryReportUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import './enquiry-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'stages' | 'columns', string>>;

export function EnquiryReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<EnquiryReportFormValues>(defaultEnquiryReportForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultEnquiryReportForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Enquiry date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (!values.stages.length) {
      next.stages = 'Select at least one enquiry stage.';
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
      const report = createEnquiryReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <BarChart3 size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Enquiry Report"
      subtitle="Customize your filters and choose the exact columns to generate a tailored report."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter generating={generating} onCancel={onClose} onGenerate={handleGenerate} />
      }
    >
      <div className="enq-report">
        <AnimatePresence mode="wait">
          {generating ? (
            <motion.div
              key="loading"
              className="asr-loading enq-loading"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={32} className="asr-spin" aria-hidden />
              <strong>Generating Enquiry Report...</strong>
              <span>Preparing your CSV export with the selected filters and columns.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="enq-form"
              variants={reportFormVariants}
              initial="hidden"
              animate="show"
            >
              <motion.section className="enq-card" variants={reportItemVariants}>
                <header className="enq-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Customize which enquiry records should be exported.</p>
                  </div>
                </header>

                <div className="enq-filter-grid">
                  <div className="enq-filter-span">
                    <DateRangeField
                      label="Enquiry Date"
                      startDate={values.startDate}
                      endDate={values.endDate}
                      error={errors.range}
                      startAriaLabel="Enquiry start date"
                      endAriaLabel="Enquiry end date"
                      onChange={({ startDate, endDate }) =>
                        setValues((v) => ({ ...v, startDate, endDate }))
                      }
                    />
                  </div>

                  <AsrDropdown
                    multiple
                    label={
                      <>
                        Stage <span className="asr-req">*</span>
                      </>
                    }
                    ariaLabel="Enquiry Stage"
                    placeholder="Select stages…"
                    searchPlaceholder="Search stages…"
                    value={values.stages}
                    error={errors.stages}
                    onChange={(next) => {
                      setValues((v) => ({ ...v, stages: next as EnquiryStage[] }));
                      if (next.length) setErrors((e) => ({ ...e, stages: undefined }));
                    }}
                    options={ENQUIRY_STAGES.map((stage) => ({ value: stage, label: stage }))}
                  />

                  <AsrDropdown
                    multiple
                    label="Source"
                    ariaLabel="Enquiry Source"
                    placeholder="All sources"
                    searchPlaceholder="Search sources…"
                    value={values.sources}
                    onChange={(next) =>
                      setValues((v) => ({ ...v, sources: next as EnquirySource[] }))
                    }
                    options={ENQUIRY_SOURCES.map((source) => ({ value: source, label: source }))}
                  />

                  <AsrDropdown
                    multiple
                    label="Owner"
                    ariaLabel="Enquiry Owner"
                    placeholder="All owners"
                    searchPlaceholder="Search owners…"
                    value={values.owners}
                    onChange={(owners) => setValues((v) => ({ ...v, owners }))}
                    options={ENQUIRY_OWNERS.map((owner) => ({ value: owner, label: owner }))}
                  />

                  <AsrDropdown
                    multiple
                    label="Program Interest"
                    ariaLabel="Program Interest"
                    placeholder="All programs"
                    searchPlaceholder="Search programs…"
                    value={values.programs}
                    onChange={(programs) => setValues((v) => ({ ...v, programs }))}
                    options={ENQUIRY_PROGRAMS.map((program) => ({ value: program, label: program }))}
                  />
                </div>
              </motion.section>

              <motion.section className="enq-card" variants={reportItemVariants}>
                <header className="enq-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>Choose exactly which information should appear in the generated report.</p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${values.selectedColumns.length}`}
                    className="enq-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {values.columnMode === 'all'
                      ? `${ENQUIRY_COLUMNS.length} / ${ENQUIRY_COLUMNS.length}`
                      : `${values.selectedColumns.length} / ${ENQUIRY_COLUMNS.length}`}
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
                  compactHint={`All ${ENQUIRY_COLUMNS.length} columns will be included in the report.`}
                  columns={ENQUIRY_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={8}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Pick the fields your export should include."
                  searchPlaceholder="Search columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as EnquiryReportFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }))
                  }
                  onSelectedChange={(selectedColumns) =>
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as EnquiryColumnId[],
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

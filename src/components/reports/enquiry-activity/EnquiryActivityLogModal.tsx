'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  ACTIVITY_ASSIGNEES,
  ACTIVITY_BRANCHES,
  ACTIVITY_COLUMNS,
  ACTIVITY_LEAD_STATUSES,
  ACTIVITY_TYPES,
  createEnquiryActivityReport,
  defaultEnquiryActivityForm,
  type ActivityColumnId,
  type ActivityLeadStatus,
  type ActivityType,
  type EnquiryActivityFormValues,
} from './enquiryActivityUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/enquiry-report/enquiry-report.css';
import './enquiry-activity.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'leadStatuses' | 'columns', string>>;

export function EnquiryActivityLogModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<EnquiryActivityFormValues>(defaultEnquiryActivityForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultEnquiryActivityForm());
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
    if (!values.leadStatuses.length) {
      next.leadStatuses = 'Select at least one lead status.';
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
      const report = createEnquiryActivityReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Activity size={20} strokeWidth={2.1} />, []);

  return (
    <Modal
      xl
      iconClose
      open={open}
      title="Enquiry Activity Log"
      subtitle="Generate a detailed activity report by selecting filters and the columns you want to export."
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
      <div className="enq-report enq-activity">
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
              <strong>Generating Report...</strong>
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
              <motion.section className="enq-card enq-date-card" variants={reportItemVariants}>
                <header className="enq-card-head">
                  <div>
                    <h3>Date Range</h3>
                    <p>Choose the activity period to include in this report.</p>
                  </div>
                </header>
                <DateRangeField
                  label="Activity Date"
                  startDate={values.startDate}
                  endDate={values.endDate}
                  error={errors.range}
                  onChange={({ startDate, endDate }) =>
                    setValues((v) => ({ ...v, startDate, endDate }))
                  }
                />
              </motion.section>

              <motion.section className="enq-card" variants={reportItemVariants}>
                <header className="enq-card-head">
                  <div>
                    <h3>Report Filters</h3>
                    <p>Narrow the activity log by branch, status, type, and owner.</p>
                  </div>
                </header>

                <div className="enq-filter-grid">
                  <AsrDropdown
                    multiple
                    label="Branch"
                    ariaLabel="Branch"
                    placeholder="All branches"
                    searchPlaceholder="Search branches…"
                    value={values.branches}
                    onChange={(branches) => setValues((v) => ({ ...v, branches }))}
                    options={ACTIVITY_BRANCHES.map((branch) => ({ value: branch, label: branch }))}
                  />

                  <AsrDropdown
                    multiple
                    label={
                      <>
                        Lead Status <span className="asr-req">*</span>
                      </>
                    }
                    ariaLabel="Lead Status"
                    placeholder="Select lead statuses…"
                    searchPlaceholder="Search statuses…"
                    value={values.leadStatuses}
                    error={errors.leadStatuses}
                    onChange={(next) => {
                      setValues((v) => ({ ...v, leadStatuses: next as ActivityLeadStatus[] }));
                      if (next.length) setErrors((e) => ({ ...e, leadStatuses: undefined }));
                    }}
                    options={ACTIVITY_LEAD_STATUSES.map((status) => ({
                      value: status,
                      label: status,
                    }))}
                  />

                  <AsrDropdown
                    multiple
                    label="Activity Type"
                    ariaLabel="Activity Type"
                    placeholder="All activity types"
                    searchPlaceholder="Search activity types…"
                    value={values.activityTypes}
                    onChange={(next) =>
                      setValues((v) => ({ ...v, activityTypes: next as ActivityType[] }))
                    }
                    options={ACTIVITY_TYPES.map((type) => ({ value: type, label: type }))}
                  />

                  <AsrDropdown
                    multiple
                    label="Assigned To"
                    ariaLabel="Assigned To"
                    placeholder="All assignees"
                    searchPlaceholder="Search assignees…"
                    value={values.assignees}
                    onChange={(assignees) => setValues((v) => ({ ...v, assignees }))}
                    options={ACTIVITY_ASSIGNEES.map((person) => ({
                      value: person,
                      label: person,
                    }))}
                  />
                </div>
              </motion.section>

              <motion.section className="enq-card" variants={reportItemVariants}>
                <header className="enq-card-head">
                  <div>
                    <h3>Columns</h3>
                    <p>Choose which fields should be included in the exported report.</p>
                  </div>
                  <motion.span
                    key={`${values.columnMode}-${values.selectedColumns.length}`}
                    className="enq-selected-pill"
                    initial={{ scale: 0.92, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  >
                    {values.columnMode === 'all'
                      ? `${ACTIVITY_COLUMNS.length} / ${ACTIVITY_COLUMNS.length}`
                      : `${values.selectedColumns.length} / ${ACTIVITY_COLUMNS.length}`}
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
                  compactHint={`All ${ACTIVITY_COLUMNS.length} columns will be included in the report.`}
                  columns={ACTIVITY_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageSize={10}
                  panelTitle="Select Report Columns"
                  panelSubtitle="Choose which fields should appear in your report."
                  searchPlaceholder="Search report columns..."
                  selectAllLabel="Select All"
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as EnquiryActivityFormValues['columnMode'],
                      selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                    }))
                  }
                  onSelectedChange={(selectedColumns) =>
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as ActivityColumnId[],
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

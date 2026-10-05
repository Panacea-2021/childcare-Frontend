'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  MONTHLY_AGING_COLUMNS,
  createMonthlyAgingReport,
  defaultMonthlyAgingForm,
  type MonthlyAgingColumnId,
  type MonthlyAgingFormValues,
} from './monthlyAgingUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'asOfDate' | 'columns', string>>;

export function MonthlyAgingReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<MonthlyAgingFormValues>(defaultMonthlyAgingForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultMonthlyAgingForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Invoice Raise Date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (!values.asOfDate) {
      next.asOfDate = 'As Of Date is mandatory.';
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
      const report = createMonthlyAgingReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Monthly Aging Report"
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
                <Loader2 size={16} className="asr-spin" aria-hidden style={{ marginRight: 8 }} />
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
          <strong>Generating Monthly Aging Report...</strong>
          <span>Preparing your Excel export with receivables aging buckets.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <DateRangeField
            label="Invoice Raise Date"
            startAriaLabel="Invoice raise start date"
            endAriaLabel="Invoice raise end date"
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={({ startDate, endDate }) => {
              setValues((v) => ({ ...v, startDate, endDate }));
              if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
            }}
          />

          <div className="asr-field">
            <label className="ui-label">
              As Of Date <span className="asr-req">*</span>
            </label>
            <FieldDatePicker
              value={values.asOfDate}
              onChange={(asOfDate) => {
                setValues((v) => ({ ...v, asOfDate }));
                if (asOfDate) setErrors((e) => ({ ...e, asOfDate: undefined }));
              }}
              ariaLabel="As Of Date"
              placeholder="dd/mm/yyyy"
            />
            {errors.asOfDate ? <p className="asr-error">{errors.asOfDate}</p> : null}
          </div>

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={MONTHLY_AGING_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={10}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as MonthlyAgingFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as MonthlyAgingColumnId[],
              }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

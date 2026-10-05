'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  DEPOSIT_REPORT_COLUMNS,
  createDepositReport,
  defaultDepositReportForm,
  type DepositReportColumnId,
  type DepositReportFormValues,
} from './depositReportUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function DepositReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<DepositReportFormValues>(defaultDepositReportForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultDepositReportForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Deposit Date range is mandatory.';
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
      const report = createDepositReport(values);
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
      title="Deposit Report"
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
          <strong>Generating Deposit Report...</strong>
          <span>Preparing your Excel export for deposits in the selected date range.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <DateRangeField
            label="Deposit Date"
            startAriaLabel="Deposit start date"
            endAriaLabel="Deposit end date"
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={({ startDate, endDate }) => {
              setValues((v) => ({ ...v, startDate, endDate }));
              if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
            }}
          />

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={DEPOSIT_REPORT_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageChunks={[10, 3]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as DepositReportFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as DepositReportColumnId[],
              }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

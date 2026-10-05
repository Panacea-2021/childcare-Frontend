'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { ReportFormatSelector } from '@/components/reports/shared/ReportFormatSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import { InvoicesColumnsSelector } from './InvoicesColumnsSelector';
import {
  INVOICES_LAST_GENERATED,
  createInvoicesReport,
  defaultInvoicesForm,
  type InvoiceReportType,
  type InvoicesFormValues,
} from './invoicesUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/shared/report-format.css';
import './invoices-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function InvoicesReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<InvoicesFormValues>(defaultInvoicesForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultInvoicesForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const dateLabel =
    values.reportType === 'invoice-date' ? 'Invoice Date Range' : 'Billing Period Range';

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = `${dateLabel} is mandatory.`;
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
      const report = createInvoicesReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultInvoicesForm();
    const report = createInvoicesReport(seed, INVOICES_LAST_GENERATED.by);
    downloadGeneratedReport(report);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Invoices"
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
                <Loader2 size={16} className="asr-spin" style={{ marginRight: 8 }} />
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
          <strong>Generating Invoices Report...</strong>
          <span>
            Preparing your {values.format === 'pdf' ? 'PDF' : 'Excel'} export for the selected
            filters and columns.
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <LastGeneratedCard
            onDownload={handleLastDownload}
            dateLabel={INVOICES_LAST_GENERATED.dateLabel}
            timeLabel={INVOICES_LAST_GENERATED.timeLabel}
            by={INVOICES_LAST_GENERATED.by}
          />

          <div className="asr-field">
            <div className="ui-label">Report Type</div>
            <div className="asr-radios" role="radiogroup" aria-label="Report Type">
              {(
                [
                  ['invoice-date', 'Invoice Date'],
                  ['billing-period', 'Billing Period'],
                ] as const
              ).map(([id, label]) => (
                <label key={id} className={`asr-radio${values.reportType === id ? ' is-on' : ''}`}>
                  <input
                    type="radio"
                    name="inv-report-type"
                    checked={values.reportType === id}
                    onChange={() => setValues((v) => ({ ...v, reportType: id as InvoiceReportType }))}
                  />
                  <span className="asr-radio-dot" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={values.reportType}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <DateRangeField
                label={dateLabel}
                startAriaLabel={`${dateLabel} start`}
                endAriaLabel={`${dateLabel} end`}
                startDate={values.startDate}
                endDate={values.endDate}
                error={errors.range}
                onChange={({ startDate, endDate }) => {
                  setValues((v) => ({ ...v, startDate, endDate }));
                  if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
                }}
              />
            </motion.div>
          </AnimatePresence>

          <RoomMultiSelect
            value={values.rooms}
            placeholder="Leave blank to select all rooms"
            onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
          />

          <div className="asr-field">
            <div className="inv-switch-row">
              <div className="inv-switch-copy">
                <strong>Include Cancelled Invoices</strong>
                <span>When on, cancelled invoices are included in the export.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values.includeCancelled}
                aria-label="Include Cancelled Invoices"
                className={`inv-switch${values.includeCancelled ? ' is-on' : ''}`}
                onClick={() => setValues((v) => ({ ...v, includeCancelled: !v.includeCancelled }))}
              >
                <span className="inv-switch-knob" aria-hidden />
              </button>
            </div>
          </div>

          <ReportFormatSelector
            value={values.format}
            onChange={(format) => setValues((v) => ({ ...v, format }))}
          />

          <div className="asr-field">
            <label
              className={`inv-multi-check${values.collapsePaymentRows ? ' is-on' : ''}`}
            >
              <span
                className={`asr-dd-checkbox${values.collapsePaymentRows ? ' is-on' : ''}`}
                aria-hidden
              >
                {values.collapsePaymentRows ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <input
                type="checkbox"
                checked={values.collapsePaymentRows}
                onChange={(e) =>
                  setValues((v) => ({ ...v, collapsePaymentRows: e.target.checked }))
                }
              />
              <span>
                <strong>Multiple Payment Records</strong>
                <em>
                  Show a single row for invoices with multiple payment records.
                </em>
              </span>
            </label>
          </div>

          <hr className="inv-divider" />

          <InvoicesColumnsSelector
            mode={values.columnMode}
            selected={values.selectedColumns}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode,
                selectedColumns:
                  columnMode === 'all'
                    ? defaultInvoicesForm().selectedColumns
                    : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({ ...v, selectedColumns }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

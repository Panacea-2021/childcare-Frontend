'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  INVOICE_AGEING_COLUMNS,
  INVOICE_AGEING_LAST_GENERATED,
  INVOICE_AGEING_PAGE_CHUNKS,
  INVOICE_AGEING_STATUS_OPTIONS,
  createInvoiceAgeingReport,
  defaultInvoiceAgeingForm,
  type InvoiceAgeingColumnId,
  type InvoiceAgeingColumnMode,
  type InvoiceAgeingFormValues,
  type InvoiceAgeingStatusOption,
} from './invoiceAgeingUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'asOfDate' | 'columns', string>>;

const COLUMN_TYPE_OPTIONS = [
  { value: 'all', label: 'All Columns' },
  { value: 'custom', label: 'Custom' },
];

export function InvoiceAgeingReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<InvoiceAgeingFormValues>(defaultInvoiceAgeingForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultInvoiceAgeingForm());
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
      const report = createInvoiceAgeingReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultInvoiceAgeingForm();
    const report = createInvoiceAgeingReport(seed, INVOICE_AGEING_LAST_GENERATED.by);
    downloadGeneratedReport(report);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Invoice Ageing Report"
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
          <strong>Generating Invoice Ageing Report...</strong>
          <span>Preparing your Excel export for collections follow-up.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <LastGeneratedCard
            onDownload={handleLastDownload}
            dateLabel={INVOICE_AGEING_LAST_GENERATED.dateLabel}
            timeLabel={INVOICE_AGEING_LAST_GENERATED.timeLabel}
            by={INVOICE_AGEING_LAST_GENERATED.by}
          />

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
            <label className="ui-label" htmlFor="ia-as-of-date">
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

          <RoomMultiSelect
            value={values.rooms}
            placeholder="Leave blank to select all rooms"
            onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
          />

          <AsrDropdown
            label="Invoice Status"
            ariaLabel="Invoice Status"
            placeholder="Select invoice status"
            value={values.invoiceStatus}
            onChange={(invoiceStatus) =>
              setValues((v) => ({
                ...v,
                invoiceStatus: (invoiceStatus ?? 'overdue-only') as InvoiceAgeingStatusOption,
              }))
            }
            options={INVOICE_AGEING_STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />

          <hr className="ab-section-divider" />

          <AsrDropdown
            label="Columns"
            ariaLabel="Columns"
            placeholder="Select column type"
            value={values.columnMode}
            onChange={(next) => {
              const columnMode = (next ?? 'all') as InvoiceAgeingColumnMode;
              setValues((v) => ({
                ...v,
                columnMode,
                selectedColumns:
                  columnMode === 'all'
                    ? INVOICE_AGEING_COLUMNS.map((c) => c.id)
                    : v.selectedColumns,
              }));
              if (columnMode === 'all') setErrors((e) => ({ ...e, columns: undefined }));
            }}
            options={COLUMN_TYPE_OPTIONS}
          />

          <AnimatePresence initial={false} mode="wait">
            {values.columnMode === 'custom' ? (
              <motion.div
                key="custom-columns"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <ReportColumnsSelector
                  hideModeOptions
                  mode={values.columnMode}
                  modeOptions={COLUMN_TYPE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
                  compactModes={['all']}
                  columns={INVOICE_AGEING_COLUMNS}
                  selected={values.selectedColumns}
                  twoColumn
                  pageChunks={[...INVOICE_AGEING_PAGE_CHUNKS]}
                  error={errors.columns}
                  onModeChange={(columnMode) =>
                    setValues((v) => ({
                      ...v,
                      columnMode: columnMode as InvoiceAgeingFormValues['columnMode'],
                    }))
                  }
                  onSelectedChange={(selectedColumns) => {
                    setValues((v) => ({
                      ...v,
                      selectedColumns: selectedColumns as InvoiceAgeingColumnId[],
                    }));
                    if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
                  }}
                />
              </motion.div>
            ) : (
              <motion.p
                key="all-columns-hint"
                className="ab-default-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                All {INVOICE_AGEING_COLUMNS.length} columns will be included in the report.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </Modal>
  );
}

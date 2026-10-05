'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { StatusMultiSelect } from '@/components/reports/attendance-summary/StatusMultiSelect';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  LINE_ITEM_COLUMNS,
  LINE_ITEM_LAST_GENERATED,
  LINE_ITEM_PAGE_CHUNKS,
  createLineItemReport,
  defaultLineItemForm,
  type LineItemColumnId,
  type LineItemColumnMode,
  type LineItemFormValues,
  type LineItemReportType,
} from './lineItemUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'statuses' | 'columns', string>>;

const COLUMN_TYPE_OPTIONS = [
  { value: 'all', label: 'All Columns' },
  { value: 'custom', label: 'Custom' },
];

export function LineItemReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<LineItemFormValues>(defaultLineItemForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultLineItemForm());
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
    if (!values.statuses.length) {
      next.statuses = 'Select at least one student status.';
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
      const report = createLineItemReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultLineItemForm();
    const report = createLineItemReport(seed, LINE_ITEM_LAST_GENERATED.by);
    downloadGeneratedReport(report);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Line Item"
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
          <strong>Generating Line Item Report...</strong>
          <span>Preparing your Excel export with invoice line-item detail.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <LastGeneratedCard
            onDownload={handleLastDownload}
            dateLabel={LINE_ITEM_LAST_GENERATED.dateLabel}
            timeLabel={LINE_ITEM_LAST_GENERATED.timeLabel}
            by={LINE_ITEM_LAST_GENERATED.by}
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
                    name="li-report-type"
                    checked={values.reportType === id}
                    onChange={() => setValues((v) => ({ ...v, reportType: id as LineItemReportType }))}
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

          <StatusMultiSelect
            value={values.statuses}
            error={errors.statuses}
            onChange={(statuses) => {
              setValues((v) => ({ ...v, statuses }));
              if (statuses.length) setErrors((e) => ({ ...e, statuses: undefined }));
            }}
          />

          <hr className="ab-section-divider" />

          <AsrDropdown
            label="Column Type"
            ariaLabel="Column Type"
            placeholder="Select column type"
            value={values.columnMode}
            onChange={(next) => {
              const columnMode = (next ?? 'all') as LineItemColumnMode;
              setValues((v) => ({
                ...v,
                columnMode,
                selectedColumns:
                  columnMode === 'all'
                    ? LINE_ITEM_COLUMNS.map((c) => c.id)
                    : v.selectedColumns,
              }));
              if (columnMode === 'all') setErrors((e) => ({ ...e, columns: undefined }));
            }}
            options={COLUMN_TYPE_OPTIONS}
          />

          <ReportColumnsSelector
            hideModeOptions
            mode={values.columnMode}
            modeOptions={COLUMN_TYPE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
            compactModes={['all']}
            columns={LINE_ITEM_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageChunks={[...LINE_ITEM_PAGE_CHUNKS]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as LineItemFormValues['columnMode'],
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as LineItemColumnId[],
              }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

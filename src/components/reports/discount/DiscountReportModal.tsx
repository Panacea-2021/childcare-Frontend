'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  ALL_DISCOUNTS_VALUE,
  DISCOUNT_COLUMNS,
  DISCOUNT_OPTIONS,
  createDiscountReport,
  defaultDiscountForm,
  type DiscountColumnId,
  type DiscountFormValues,
} from './discountUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'discounts' | 'columns', string>>;

export function DiscountReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<DiscountFormValues>(defaultDiscountForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultDiscountForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const discountOptions = useMemo(
    () => [
      { value: ALL_DISCOUNTS_VALUE, label: 'All Discounts' },
      ...DISCOUNT_OPTIONS.map((name) => ({ value: name, label: name })),
    ],
    [],
  );

  const onDiscountsChange = (next: string[]) => {
    let selected = next;
    const addedAll =
      next.includes(ALL_DISCOUNTS_VALUE) && !values.discounts.includes(ALL_DISCOUNTS_VALUE);
    const hadAll = values.discounts.includes(ALL_DISCOUNTS_VALUE);
    const addedOther = next.some((v) => v !== ALL_DISCOUNTS_VALUE && !values.discounts.includes(v));

    if (addedAll) {
      selected = [ALL_DISCOUNTS_VALUE];
    } else if (hadAll && addedOther) {
      selected = next.filter((v) => v !== ALL_DISCOUNTS_VALUE);
    } else if (next.includes(ALL_DISCOUNTS_VALUE) && next.length > 1) {
      selected = next.filter((v) => v !== ALL_DISCOUNTS_VALUE);
    }

    setValues((v) => ({ ...v, discounts: selected }));
    if (selected.length) setErrors((e) => ({ ...e, discounts: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Discount Date Range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (!values.discounts.length) {
      next.discounts = 'Select at least one discount.';
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
      const report = createDiscountReport(values);
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
      title="Discount Report"
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
          <strong>Generating Discount Report...</strong>
          <span>Preparing your Excel export for the selected discount date range and types.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <DateRangeField
            label="Discount Date"
            startAriaLabel="Discount start date"
            endAriaLabel="Discount end date"
            startDate={values.startDate}
            endDate={values.endDate}
            error={errors.range}
            onChange={({ startDate, endDate }) => {
              setValues((v) => ({ ...v, startDate, endDate }));
              if (startDate && endDate) setErrors((e) => ({ ...e, range: undefined }));
            }}
          />

          <AsrDropdown
            multiple
            label={
              <>
                Discount <span className="asr-req">*</span>
              </>
            }
            ariaLabel="Discount"
            placeholder="Select discounts"
            searchPlaceholder="Search discounts…"
            value={values.discounts}
            error={errors.discounts}
            onChange={onDiscountsChange}
            options={discountOptions}
          />

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={DISCOUNT_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={6}
            pageChunks={[6, 5]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as DiscountFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) =>
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as DiscountColumnId[],
              }))
            }
          />
        </motion.div>
      )}
    </Modal>
  );
}

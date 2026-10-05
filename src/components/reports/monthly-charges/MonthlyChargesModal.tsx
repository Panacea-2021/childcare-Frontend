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
  ALL_FEE_PLANS_VALUE,
  FEE_PLAN_OPTIONS,
  MONTHLY_CHARGES_COLUMNS,
  createMonthlyChargesReport,
  defaultMonthlyChargesForm,
  type MonthlyChargesColumnId,
  type MonthlyChargesFormValues,
} from './monthlyChargesUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'feePlans' | 'columns', string>>;

export function MonthlyChargesModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<MonthlyChargesFormValues>(defaultMonthlyChargesForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultMonthlyChargesForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const feePlanOptions = useMemo(
    () => [
      { value: ALL_FEE_PLANS_VALUE, label: 'All Fee Plans' },
      ...FEE_PLAN_OPTIONS.map((name) => ({ value: name, label: name })),
    ],
    [],
  );

  const onFeePlansChange = (next: string[]) => {
    let selected = next;
    const addedAll =
      next.includes(ALL_FEE_PLANS_VALUE) && !values.feePlans.includes(ALL_FEE_PLANS_VALUE);
    const hadAll = values.feePlans.includes(ALL_FEE_PLANS_VALUE);
    const addedOther = next.some((v) => v !== ALL_FEE_PLANS_VALUE && !values.feePlans.includes(v));

    if (addedAll) {
      selected = [ALL_FEE_PLANS_VALUE];
    } else if (hadAll && addedOther) {
      selected = next.filter((v) => v !== ALL_FEE_PLANS_VALUE);
    } else if (next.includes(ALL_FEE_PLANS_VALUE) && next.length > 1) {
      selected = next.filter((v) => v !== ALL_FEE_PLANS_VALUE);
    }

    setValues((v) => ({ ...v, feePlans: selected }));
    if (selected.length) setErrors((e) => ({ ...e, feePlans: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Billing Period date range is mandatory.';
    } else if (values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    if (!values.feePlans.length) {
      next.feePlans = 'Select at least one fee plan.';
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
      const report = createMonthlyChargesReport(values);
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
      title="Monthly Charges Report"
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
          <strong>Generating Monthly Charges Report...</strong>
          <span>Preparing your Excel export for the selected billing period and fee plans.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <DateRangeField
            label="Billing Period"
            startAriaLabel="Billing period start date"
            endAriaLabel="Billing period end date"
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
            label="Fee Plans"
            ariaLabel="Fee Plans"
            placeholder="Select fee plans"
            searchPlaceholder="Search fee plans…"
            value={values.feePlans}
            error={errors.feePlans}
            onChange={onFeePlansChange}
            options={feePlanOptions}
          />

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={MONTHLY_CHARGES_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={10}
            pageChunks={[10, 4]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as MonthlyChargesFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) =>
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as MonthlyChargesColumnId[],
              }))
            }
          />
        </motion.div>
      )}
    </Modal>
  );
}

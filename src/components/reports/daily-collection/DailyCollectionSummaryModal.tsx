'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  DAILY_COLLECTION_COLUMNS,
  createDailyCollectionReport,
  defaultDailyCollectionForm,
  type DailyCollectionColumnId,
  type DailyCollectionFormValues,
} from './dailyCollectionUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'asOfDate' | 'columns', string>>;

export function DailyCollectionSummaryModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<DailyCollectionFormValues>(defaultDailyCollectionForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultDailyCollectionForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.asOfDate) {
      next.asOfDate = 'As of date is mandatory.';
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
      const report = createDailyCollectionReport(values);
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
      title="Daily Collection Summary"
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
          <strong>Generating Daily Collection Summary...</strong>
          <span>Preparing your Excel export for the selected as-of date and columns.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <div className="asr-field">
            <label className="ui-label" htmlFor="dcs-as-of-date">
              As of date <span className="asr-req">*</span>
            </label>
            <FieldDatePicker
              value={values.asOfDate}
              onChange={(asOfDate) => {
                setValues((v) => ({ ...v, asOfDate }));
                if (asOfDate) setErrors((e) => ({ ...e, asOfDate: undefined }));
              }}
              ariaLabel="As of date"
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
            columns={DAILY_COLLECTION_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={5}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as DailyCollectionFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) =>
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as DailyCollectionColumnId[],
              }))
            }
          />
        </motion.div>
      )}
    </Modal>
  );
}

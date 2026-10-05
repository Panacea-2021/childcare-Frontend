'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  FEE_PLAN_COLUMNS,
  createFeePlanReport,
  defaultFeePlanForm,
  type FeePlanColumnId,
  type FeePlanFormValues,
} from './feePlanUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'columns', string>>;

export function FeePlanModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<FeePlanFormValues>(defaultFeePlanForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultFeePlanForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
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
      const report = createFeePlanReport(values);
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
      title="Fee Plan"
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
          <strong>Generating Fee Plan Report...</strong>
          <span>Preparing your Excel export with the selected rooms and columns.</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22 }}>
          <RoomMultiSelect value={values.rooms} onChange={(rooms) => setValues((v) => ({ ...v, rooms }))} />

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={FEE_PLAN_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={12}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as FeePlanFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) =>
              setValues((v) => ({ ...v, selectedColumns: selectedColumns as FeePlanColumnId[] }))
            }
          />
        </motion.div>
      )}
    </Modal>
  );
}

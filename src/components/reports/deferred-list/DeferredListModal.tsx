'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ReportGenerateFooter } from '@/components/reports/shared/ReportGenerateFooter';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { reportFormVariants, reportItemVariants } from '@/components/reports/shared/reportMotion';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { RoomMultiSelect } from '@/components/reports/attendance-summary/RoomMultiSelect';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';
import {
  DEFERRED_COLUMNS,
  createDeferredListReport,
  defaultDeferredListForm,
  type DeferredColumnId,
  type DeferredListFormValues,
} from './deferredListUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function DeferredListModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<DeferredListFormValues>(defaultDeferredListForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultDeferredListForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.startDate || !values.endDate) {
      next.range = 'Reporting Date Range is mandatory.';
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
      const report = createDeferredListReport(values);
      downloadRecordCsv(report.name, report.columns, report.rows);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const icon = useMemo(() => <Hourglass size={18} />, []);

  return (
    <Modal
      wide
      open={open}
      title="Deferred List Report"
      subtitle="Configure your report before generating."
      icon={icon}
      onClose={() => {
        if (!generating) onClose();
      }}
      footer={
        <ReportGenerateFooter
          generating={generating}
          onCancel={onClose}
          onGenerate={handleGenerate}
        />
      }
    >
      {generating ? (
        <div className="asr-loading" role="status" aria-live="polite">
          <Loader2 size={32} className="asr-spin" aria-hidden />
          <strong>Generating Deferred List Report...</strong>
          <span>Preparing your CSV export with the selected columns.</span>
        </div>
      ) : (
        <motion.div
          className="asr-form"
          variants={reportFormVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={reportItemVariants}>
            <DateRangeField
              label="Reporting Date Range"
              startDate={values.startDate}
              endDate={values.endDate}
              error={errors.range}
              onChange={({ startDate, endDate }) => setValues((v) => ({ ...v, startDate, endDate }))}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <RoomMultiSelect
              value={values.rooms}
              placeholder="Leave blank to select all rooms"
              onChange={(rooms) => setValues((v) => ({ ...v, rooms }))}
            />
          </motion.div>

          <motion.div variants={reportItemVariants}>
            <hr className="ab-section-divider" />
            <ReportColumnsSelector
              mode={values.columnMode}
              modeOptions={[
                { id: 'all', label: 'All Columns' },
                { id: 'custom', label: 'Custom' },
              ]}
              compactModes={['all']}
              columns={DEFERRED_COLUMNS}
              selected={values.selectedColumns}
              twoColumn
              pageSize={6}
              error={errors.columns}
              onModeChange={(columnMode) =>
                setValues((v) => ({
                  ...v,
                  columnMode: columnMode as DeferredListFormValues['columnMode'],
                  selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
                }))
              }
              onSelectedChange={(selectedColumns) =>
                setValues((v) => ({
                  ...v,
                  selectedColumns: selectedColumns as DeferredColumnId[],
                }))
              }
            />
          </motion.div>
        </motion.div>
      )}
    </Modal>
  );
}

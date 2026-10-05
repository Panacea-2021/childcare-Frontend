'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  STAFF_COLUMNS,
  STAFF_STATUSES,
  createStaffReport,
  defaultStaffReportForm,
  type StaffColumnId,
  type StaffReportFormValues,
  type StaffStatus,
} from './staffReportUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'status' | 'columns', string>>;

export function StaffReportModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StaffReportFormValues>(defaultStaffReportForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffReportForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const validate = () => {
    const next: Errors = {};
    if (!values.statuses.length) {
      next.status = 'Select at least one staff status.';
    }
    if (!values.selectedColumns.length) {
      next.columns = 'Select at least one column.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStaffReport(values);
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
      title="Staff Report"
      subtitle="Configure your staff report before generating."
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
              <>
                <BarChart3 size={16} aria-hidden style={{ marginRight: 8 }} />
                Generate Report
              </>
            )}
          </button>
        </>
      }
    >
      {generating ? (
        <div className="asr-loading">
          <Loader2 size={32} className="asr-spin" />
          <strong>Generating Staff Report...</strong>
          <span>Preparing your Excel export for the selected statuses and columns.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <AsrDropdown
            multiple
            label={
              <>
                Status <span className="asr-req">*</span>
              </>
            }
            ariaLabel="Staff Status"
            placeholder="Select status…"
            searchPlaceholder="Search status…"
            value={values.statuses}
            error={errors.status}
            onChange={(next) => {
              setValues((v) => ({ ...v, statuses: next as StaffStatus[] }));
              if (next.length) setErrors((e) => ({ ...e, status: undefined }));
            }}
            options={STAFF_STATUSES.map((status) => ({ value: status, label: status }))}
          />

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode="custom"
            modeOptions={[{ id: 'custom', label: 'Custom' }]}
            hideModeOptions
            compactModes={[]}
            columns={STAFF_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageSize={8}
            pageChunks={[8, 8]}
            panelTitle="Select Columns"
            panelSubtitle="Choose the fields you want included in your report."
            searchPlaceholder="Search columns..."
            selectAllLabel="Select All Columns"
            error={errors.columns}
            onModeChange={() => undefined}
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as StaffColumnId[],
              }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

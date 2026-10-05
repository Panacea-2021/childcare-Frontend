'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { MOCK_STUDENTS } from '@/components/reports/attendance-summary/types';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import { ReportFormatSelector } from '@/components/reports/shared/ReportFormatSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  CUSTOMER_STATEMENT_COLUMNS,
  createCustomerStatementReport,
  defaultCustomerStatementForm,
  isPdfAllowed,
  type CustomerStatementColumnId,
  type CustomerStatementFormValues,
} from './customerStatementUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'columns' | 'format', string>>;

export function CustomerStatementModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<CustomerStatementFormValues>(defaultCustomerStatementForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultCustomerStatementForm());
    setErrors({});
    setGenerating(false);
  }, [open]);

  const studentOptions = useMemo(
    () =>
      MOCK_STUDENTS.map((student) => ({
        value: student.id,
        label: student.name,
        meta: `${student.admissionNo} · ${student.room}`,
        leading: <span className={`asr-avatar ${student.tone}`}>{student.initials}</span>,
      })),
    [],
  );

  const pdfAllowed = isPdfAllowed(values.studentIds);

  const validate = () => {
    const next: Errors = {};
    if (values.columnMode === 'custom' && !values.selectedColumns.length) {
      next.columns = 'Select at least one column, or switch to All Columns.';
    }
    if (values.format === 'pdf' && !pdfAllowed) {
      next.format = 'PDF format is not available when classroom or multiple students are selected.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createCustomerStatementReport(values);
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
      title="Customer Statement"
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
          <strong>Generating Customer Statement...</strong>
          <span>
            Preparing your {values.format === 'pdf' ? 'PDF' : 'Excel'} export for the selected
            students and columns.
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <AsrDropdown
            multiple
            label="Select Students"
            ariaLabel="Select Students"
            placeholder="Leave blank to get report of all students"
            searchPlaceholder="Search by name, admission no, or room…"
            value={values.studentIds}
            onChange={(studentIds) => {
              setValues((v) => {
                const nextFormat =
                  studentIds.length === 1 ? v.format : v.format === 'pdf' ? 'excel' : v.format;
                return { ...v, studentIds, format: nextFormat };
              });
              setErrors((e) => ({ ...e, format: undefined }));
            }}
            options={studentOptions}
          />

          <ReportFormatSelector
            value={values.format}
            disabledFormats={pdfAllowed ? [] : ['pdf']}
            helperText="PDF format is not available when classroom or multiple students are selected."
            onChange={(format) => {
              setValues((v) => ({ ...v, format }));
              setErrors((e) => ({ ...e, format: undefined }));
            }}
          />
          {errors.format ? <p className="asr-error">{errors.format}</p> : null}

          <hr className="ab-section-divider" />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={CUSTOMER_STATEMENT_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageChunks={[10, 2]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as CustomerStatementFormValues['columnMode'],
                selectedColumns: columnMode === 'all' ? [] : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({
                ...v,
                selectedColumns: selectedColumns as CustomerStatementColumnId[],
              }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

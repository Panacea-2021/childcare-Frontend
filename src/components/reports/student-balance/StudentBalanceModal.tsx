'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AsrDropdown } from '@/components/reports/attendance-summary/AsrDropdown';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { LastGeneratedCard } from '@/components/reports/attendance-summary/LastGeneratedCard';
import { MOCK_STUDENTS } from '@/components/reports/attendance-summary/types';
import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  BALANCE_COLUMNS,
  INVOICE_STATUS_OPTIONS,
  REPORT_FILTER_OPTIONS,
  STUDENT_BALANCE_LAST_GENERATED,
  createStudentBalanceReport,
  defaultStudentBalanceForm,
  type BalanceColumnId,
  type DateScope,
  type InvoiceStatusOption,
  type ReportFilterOption,
  type StudentBalanceFormValues,
} from './studentBalanceUtils';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'range' | 'columns', string>>;

export function StudentBalanceModal({ open, onClose, onGenerated }: Props) {
  const [values, setValues] = useState<StudentBalanceFormValues>(defaultStudentBalanceForm);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentBalanceForm());
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

  const validate = () => {
    const next: Errors = {};
    if (values.dateScope === 'range') {
      if (!values.startDate || !values.endDate) {
        next.range = 'Invoice Raise Date range is mandatory.';
      } else if (values.startDate > values.endDate) {
        next.range = 'Start date must be on or before end date.';
      }
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
      const report = createStudentBalanceReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  const handleLastDownload = () => {
    const seed = defaultStudentBalanceForm();
    const report = createStudentBalanceReport(seed, STUDENT_BALANCE_LAST_GENERATED.by);
    downloadGeneratedReport(report);
  };

  const icon = useMemo(() => <Info size={18} />, []);

  return (
    <Modal
      open={open}
      title="Student Balance"
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
          <strong>Generating Student Balance Report...</strong>
          <span>Preparing your Excel export with outstanding balances and invoice filters.</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <LastGeneratedCard
            onDownload={handleLastDownload}
            dateLabel={STUDENT_BALANCE_LAST_GENERATED.dateLabel}
            timeLabel={STUDENT_BALANCE_LAST_GENERATED.timeLabel}
            by={STUDENT_BALANCE_LAST_GENERATED.by}
          />

          <div className="asr-field">
            <div className="ui-label">Report Filters</div>
            <div className="asr-radios" role="radiogroup" aria-label="Report date scope">
              {(
                [
                  ['range', 'Filter by date range'],
                  ['lifetime', 'Show lifetime data'],
                ] as const
              ).map(([id, label]) => (
                <label key={id} className={`asr-radio${values.dateScope === id ? ' is-on' : ''}`}>
                  <input
                    type="radio"
                    name="sb-date-scope"
                    checked={values.dateScope === id}
                    onChange={() => {
                      setValues((v) => ({ ...v, dateScope: id as DateScope }));
                      if (id === 'lifetime') setErrors((e) => ({ ...e, range: undefined }));
                    }}
                  />
                  <span className="asr-radio-dot" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {values.dateScope === 'range' ? (
              <motion.div
                key="invoice-raise-date"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
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
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AsrDropdown
            multiple
            label="Select Students"
            ariaLabel="Select Students"
            placeholder="Leave blank to get report of all students"
            searchPlaceholder="Search by name, admission no, or room…"
            value={values.studentIds}
            onChange={(studentIds) => setValues((v) => ({ ...v, studentIds }))}
            options={studentOptions}
          />

          <AsrDropdown
            label="Report Filter"
            ariaLabel="Report Filter"
            placeholder="Select report filter"
            value={values.reportFilter}
            onChange={(reportFilter) =>
              setValues((v) => ({
                ...v,
                reportFilter: (reportFilter ?? 'show-zero') as ReportFilterOption,
              }))
            }
            options={REPORT_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />

          <AsrDropdown
            label="Invoice Status"
            ariaLabel="Invoice Status"
            placeholder="Select invoice status"
            value={values.invoiceStatus}
            onChange={(invoiceStatus) =>
              setValues((v) => ({
                ...v,
                invoiceStatus: (invoiceStatus ?? 'overdue-only') as InvoiceStatusOption,
              }))
            }
            options={INVOICE_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />

          <ReportColumnsSelector
            mode={values.columnMode}
            modeOptions={[
              { id: 'all', label: 'All Columns' },
              { id: 'custom', label: 'Custom' },
            ]}
            compactModes={['all']}
            columns={BALANCE_COLUMNS}
            selected={values.selectedColumns}
            twoColumn
            pageChunks={[10, 10]}
            error={errors.columns}
            onModeChange={(columnMode) =>
              setValues((v) => ({
                ...v,
                columnMode: columnMode as StudentBalanceFormValues['columnMode'],
                selectedColumns:
                  columnMode === 'all' ? BALANCE_COLUMNS.map((c) => c.id) : v.selectedColumns,
              }))
            }
            onSelectedChange={(selectedColumns) => {
              setValues((v) => ({ ...v, selectedColumns: selectedColumns as BalanceColumnId[] }));
              if (selectedColumns.length) setErrors((e) => ({ ...e, columns: undefined }));
            }}
          />
        </motion.div>
      )}
    </Modal>
  );
}

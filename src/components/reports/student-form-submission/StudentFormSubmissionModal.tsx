'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarRange, Check, ClipboardList, Info, X } from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { PremiumDateField } from '@/components/modules/calendar/PremiumDateField';
import type { GeneratedExcelReport, ReportExportFormat } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  STUDENT_FORM_OPTIONS,
  createStudentFormSubmissionReport,
  defaultStudentFormSubmissionValues,
  type StudentFormSubmissionValues,
} from './studentFormSubmissionUtils';
import '@/components/modules/calendar/calendar.css';
import './student-form-submission.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'formId' | 'startDate' | 'endDate' | 'range', string>>;

export function StudentFormSubmissionModal({ open, onClose, onGenerated }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<StudentFormSubmissionValues>(defaultStudentFormSubmissionValues);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStudentFormSubmissionValues());
    setErrors({});
    setGenerating(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !generating) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, generating]);

  const validate = () => {
    const next: Errors = {};
    if (!values.formId) next.formId = 'Select a form name';
    if (!values.startDate) next.startDate = 'Select start date';
    if (!values.endDate) next.endDate = 'Select end date';
    if (values.startDate && values.endDate && values.startDate > values.endDate) {
      next.range = 'Start date must be on or before end date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (!validate() || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      const report = createStudentFormSubmissionReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => {
            if (!generating) onClose();
          }}
        >
          <motion.div
            className="cal-dialog sfs-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  <Info size={20} strokeWidth={2.1} color="var(--color-accent)" />
                </span>
                <div>
                  <h2 id={titleId}>Student Form Submission Report</h2>
                  <p>Generate report for student form submissions in the selected period.</p>
                </div>
              </div>
              <button
                type="button"
                className="cal-dialog-close"
                onClick={onClose}
                aria-label="Close"
                disabled={generating}
              >
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <motion.div
                className="sfs-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.28 }}
              >
                <p className="sfs-field-label">
                  Select Form Name <span className="sfs-req">*</span>
                </p>
                <PremiumSelect
                  id="sfs-form-name"
                  searchable
                  placeholder="Select Form Name"
                  icon={<ClipboardList size={16} />}
                  value={values.formId}
                  error={errors.formId}
                  onChange={(formId) => {
                    setValues((v) => ({ ...v, formId }));
                    if (formId) setErrors((e) => ({ ...e, formId: undefined }));
                  }}
                  options={[...STUDENT_FORM_OPTIONS]}
                />
              </motion.div>

              <motion.div
                className="sfs-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.28 }}
              >
                <p className="sfs-field-label">
                  Submission Date Range <span className="sfs-req">*</span>
                </p>
                <div className="cal-modal-grid">
                  <PremiumDateField
                    id="sfs-start-date"
                    placeholder="Start Date"
                    icon={<CalendarRange size={16} />}
                    value={values.startDate}
                    error={errors.startDate}
                    onChange={(startDate) => {
                      setValues((v) => ({ ...v, startDate }));
                      setErrors((e) => ({ ...e, startDate: undefined, range: undefined }));
                    }}
                  />
                  <PremiumDateField
                    id="sfs-end-date"
                    placeholder="End Date"
                    icon={<CalendarRange size={16} />}
                    value={values.endDate}
                    error={errors.endDate || errors.range}
                    onChange={(endDate) => {
                      setValues((v) => ({ ...v, endDate }));
                      setErrors((e) => ({ ...e, endDate: undefined, range: undefined }));
                    }}
                  />
                </div>
              </motion.div>

              <motion.label
                className={`sfs-check${values.includePending ? ' is-on' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.28 }}
                whileTap={{ scale: 0.995 }}
              >
                <span className="sfs-check-box" aria-hidden>
                  <AnimatePresence initial={false}>
                    {values.includePending ? (
                      <motion.span
                        key="on"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.14 }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
                <input
                  type="checkbox"
                  checked={values.includePending}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, includePending: e.target.checked }))
                  }
                />
                <span className="sfs-check-copy">
                  <strong>Include Pending Submissions</strong>
                  <span>Include forms that are still awaiting review or completion.</span>
                </span>
              </motion.label>

              <motion.div
                className="sfs-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.28 }}
              >
                <p className="sfs-field-label" id="sfs-format-label">
                  Select Format
                </p>
                <div className="sfs-format" role="radiogroup" aria-labelledby="sfs-format-label">
                  {(
                    [
                      { id: 'excel', label: 'Excel', hint: 'Spreadsheet export' },
                      { id: 'pdf', label: 'PDF', hint: 'Printable document' },
                    ] as const
                  ).map((opt) => {
                    const on = values.format === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`sfs-format-opt${on ? ' is-on' : ''}`}
                      >
                        <input
                          type="radio"
                          name="sfs-format"
                          checked={on}
                          onChange={() =>
                            setValues((v) => ({
                              ...v,
                              format: opt.id as ReportExportFormat,
                            }))
                          }
                        />
                        <span className="sfs-radio" aria-hidden>
                          {on ? <span className="sfs-radio-dot" /> : null}
                        </span>
                        <span className="sfs-format-text">
                          <strong>{opt.label}</strong>
                          <span>{opt.hint}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <footer className="cal-dialog-footer">
              <button
                type="button"
                className="cal-btn-ghost"
                onClick={onClose}
                disabled={generating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cal-btn-save"
                onClick={handleGenerate}
                disabled={generating}
                aria-busy={generating}
              >
                <span className="cal-btn-save-shine" aria-hidden />
                {generating ? (
                  <span className="cal-saving">
                    <span className="cal-spinner" aria-hidden />
                    Generating Report...
                  </span>
                ) : (
                  'Generate Report'
                )}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

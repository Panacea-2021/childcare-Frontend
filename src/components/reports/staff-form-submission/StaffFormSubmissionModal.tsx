'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarRange,
  Check,
  CheckCircle2,
  ClipboardList,
  Info,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { PremiumDateField } from '@/components/modules/calendar/PremiumDateField';
import type { GeneratedExcelReport, ReportExportFormat } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import {
  STAFF_FORM_STATUS_OPTIONS,
  createStaffFormSubmissionReport,
  defaultStaffFormFilters,
  defaultStaffFormSubmissionValues,
  filterStaffFormOptions,
  hasActiveStaffFormFilters,
  type StaffFormFilters,
  type StaffFormStatusFilter,
  type StaffFormSubmissionValues,
} from './staffFormSubmissionUtils';
import '@/components/modules/calendar/calendar.css';
import './staff-form-submission.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (report: GeneratedExcelReport) => void;
};

type Errors = Partial<Record<'formId' | 'startDate' | 'endDate' | 'range' | 'createdRange', string>>;

export function StaffFormSubmissionModal({ open, onClose, onGenerated }: Props) {
  const titleId = useId();
  const filterTitleId = useId();
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<StaffFormSubmissionValues>(defaultStaffFormSubmissionValues);
  const [draftFilters, setDraftFilters] = useState<StaffFormFilters>(defaultStaffFormFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [generating, setGenerating] = useState(false);

  const formOptions = useMemo(
    () =>
      filterStaffFormOptions(values.filters).map((f) => ({
        value: f.value,
        label: f.label,
      })),
    [values.filters],
  );

  const filtersActive = hasActiveStaffFormFilters(values.filters);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setValues(defaultStaffFormSubmissionValues());
    setDraftFilters(defaultStaffFormFilters());
    setFilterOpen(false);
    setErrors({});
    setGenerating(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || generating) return;
      if (filterOpen) {
        setFilterOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, generating, filterOpen]);

  const openFilters = () => {
    setDraftFilters({ ...values.filters });
    setErrors((e) => ({ ...e, createdRange: undefined }));
    setFilterOpen(true);
  };

  const closeFilters = () => {
    setFilterOpen(false);
    setErrors((e) => ({ ...e, createdRange: undefined }));
  };

  const applyFilters = () => {
    if (
      draftFilters.createdOnStart &&
      draftFilters.createdOnEnd &&
      draftFilters.createdOnStart > draftFilters.createdOnEnd
    ) {
      setErrors((e) => ({
        ...e,
        createdRange: 'Start date must be on or before end date.',
      }));
      return;
    }

    const nextForms = filterStaffFormOptions(draftFilters);
    setValues((v) => ({
      ...v,
      filters: { ...draftFilters },
      formId: nextForms.some((f) => f.value === v.formId) ? v.formId : '',
    }));
    setFilterOpen(false);
    setErrors((e) => ({ ...e, createdRange: undefined, formId: undefined }));
  };

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
      const report = createStaffFormSubmissionReport(values);
      downloadGeneratedReport(report);
      onGenerated(report);
      setGenerating(false);
      onClose();
    }, 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <>
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
            if (!generating && !filterOpen) onClose();
          }}
        >
          <motion.div
            className="cal-dialog stf-dialog"
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
                  <h2 id={titleId}>Staff Form Submission Report</h2>
                  <p>Generate report for staff form submissions in the selected period.</p>
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
                className="stf-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.28 }}
              >
                <p className="stf-field-label">
                  Select Form Name <span className="stf-req">*</span>
                </p>
                <div className="stf-form-row">
                  <div className="stf-form-select">
                    <PremiumSelect
                      id="stf-form-name"
                      searchable
                      placeholder="Select Form Name"
                      icon={<ClipboardList size={16} />}
                      value={values.formId}
                      error={errors.formId}
                      onChange={(formId) => {
                        setValues((v) => ({ ...v, formId }));
                        if (formId) setErrors((e) => ({ ...e, formId: undefined }));
                      }}
                      options={formOptions}
                    />
                  </div>
                  <button
                    type="button"
                    className={`stf-filter-btn${filtersActive ? ' is-active' : ''}`}
                    onClick={openFilters}
                    aria-label="Open form filters"
                    aria-haspopup="dialog"
                    aria-expanded={filterOpen}
                    disabled={generating}
                  >
                    <SlidersHorizontal size={18} strokeWidth={2} />
                    {filtersActive ? <span className="stf-filter-dot" aria-hidden /> : null}
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="stf-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.28 }}
              >
                <p className="stf-field-label">
                  Submission Date Range <span className="stf-req">*</span>
                </p>
                <div className="cal-modal-grid">
                  <PremiumDateField
                    id="stf-start-date"
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
                    id="stf-end-date"
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
                className={`stf-check${values.includePending ? ' is-on' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.28 }}
                whileTap={{ scale: 0.995 }}
              >
                <span className="stf-check-box" aria-hidden>
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
                <span className="stf-check-copy">
                  <strong>Include Pending Submissions</strong>
                  <span>Include forms that are still awaiting review or completion.</span>
                </span>
              </motion.label>

              <motion.div
                className="stf-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.28 }}
              >
                <p className="stf-field-label" id="stf-format-label">
                  Select Format
                </p>
                <div className="stf-format" role="radiogroup" aria-labelledby="stf-format-label">
                  {(
                    [
                      { id: 'excel', label: 'Excel', hint: 'Spreadsheet export' },
                      { id: 'pdf', label: 'PDF', hint: 'Printable document' },
                    ] as const
                  ).map((opt) => {
                    const on = values.format === opt.id;
                    return (
                      <label key={opt.id} className={`stf-format-opt${on ? ' is-on' : ''}`}>
                        <input
                          type="radio"
                          name="stf-format"
                          checked={on}
                          onChange={() =>
                            setValues((v) => ({
                              ...v,
                              format: opt.id as ReportExportFormat,
                            }))
                          }
                        />
                        <span className="stf-radio" aria-hidden>
                          {on ? <span className="stf-radio-dot" /> : null}
                        </span>
                        <span className="stf-format-text">
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
    </AnimatePresence>

    <AnimatePresence>
      {open && filterOpen ? (
        <motion.div
          className="cal-dialog-backdrop stf-filter-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeFilters}
        >
          <motion.div
            className="cal-dialog stf-filter-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={filterTitleId}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  <SlidersHorizontal
                    size={20}
                    strokeWidth={2.1}
                    color="var(--color-accent)"
                  />
                </span>
                <div>
                  <h2 id={filterTitleId}>Form Filters</h2>
                  <p>Filter available forms by status and created date.</p>
                </div>
              </div>
              <button
                type="button"
                className="cal-dialog-close"
                onClick={closeFilters}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <motion.div
                className="stf-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.28 }}
              >
                <p className="stf-field-label">Status</p>
                <PremiumSelect
                  id="stf-filter-status"
                  placeholder="Select Status"
                  icon={<CheckCircle2 size={16} />}
                  value={draftFilters.status}
                  onChange={(status) =>
                    setDraftFilters((f) => ({
                      ...f,
                      status: status as StaffFormStatusFilter,
                    }))
                  }
                  options={[...STAFF_FORM_STATUS_OPTIONS]}
                />
              </motion.div>

              <motion.div
                className="stf-field-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.28 }}
              >
                <p className="stf-field-label">Created On</p>
                <div className="cal-modal-grid">
                  <PremiumDateField
                    id="stf-created-start"
                    placeholder="Start Date"
                    icon={<CalendarRange size={16} />}
                    value={draftFilters.createdOnStart}
                    onChange={(createdOnStart) => {
                      setDraftFilters((f) => ({ ...f, createdOnStart }));
                      setErrors((e) => ({ ...e, createdRange: undefined }));
                    }}
                  />
                  <PremiumDateField
                    id="stf-created-end"
                    placeholder="End Date"
                    icon={<CalendarRange size={16} />}
                    value={draftFilters.createdOnEnd}
                    error={errors.createdRange}
                    onChange={(createdOnEnd) => {
                      setDraftFilters((f) => ({ ...f, createdOnEnd }));
                      setErrors((e) => ({ ...e, createdRange: undefined }));
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={closeFilters}>
                Cancel
              </button>
              <button type="button" className="cal-btn-save" onClick={applyFilters}>
                <span className="cal-btn-save-shine" aria-hidden />
                Apply Filters
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </>,
    document.body,
  );
}

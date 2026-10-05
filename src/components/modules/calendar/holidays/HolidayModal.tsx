'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { PremiumDateField } from '../PremiumDateField';
import type { Holiday, HolidayFormState } from './types';

type Props = {
  open: boolean;
  editing: Holiday | null;
  onClose: () => void;
  onSubmit: (form: HolidayFormState) => Promise<void> | void;
};

function emptyForm(): HolidayFormState {
  return { name: '', startDate: '', endDate: '' };
}

export function HolidayModal({ open, editing, onClose, onSubmit }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<HolidayFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof HolidayFormState, string>>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        startDate: editing.startDate,
        endDate: editing.endDate,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
    setSaving(false);
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const validate = () => {
    const next: Partial<Record<keyof HolidayFormState, string>> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.startDate) next.startDate = 'Start date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate || form.startDate,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open ? (
            <m.div
              className="sh-modal-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            >
              <m.div
                className="sh-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sh-modal-header">
                  <div>
                    <h2 id={titleId}>Holiday Calendar</h2>
                    <p>{editing ? 'Update holiday details' : 'Add a new staff holiday'}</p>
                  </div>
                  <div className="sh-modal-art" aria-hidden>
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none">
                      <circle cx="50" cy="12" r="8" fill="#FDE68A" opacity="0.9" />
                      <path d="M12 34c6-10 14-14 20-14s14 4 20 14H12Z" fill="#FBBF24" opacity="0.55" />
                      <path d="M32 10v16" stroke="#92400E" strokeWidth="2" />
                      <path d="M32 10c-3 6-8 8-11 6 5-1 8-4 11-6 3 2 6 5 11 6-3 2-8 0-11-6Z" fill="#10B981" />
                    </svg>
                  </div>
                  <m.button
                    type="button"
                    className="sh-modal-close"
                    aria-label="Close"
                    onClick={onClose}
                    whileHover={{ rotate: 90, scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X size={18} />
                  </m.button>
                </div>

                <div className="sh-modal-body">
                  <div className={`sh-float-field${errors.name ? ' has-error' : ''}`}>
                    <label className="sh-float-label" htmlFor="sh-hol-name">
                      <span className="sh-req">*</span> Name
                    </label>
                    <input
                      id="sh-hol-name"
                      className="sh-float-input"
                      placeholder="Holiday name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'sh-hol-name-err' : undefined}
                    />
                    {errors.name ? (
                      <p id="sh-hol-name-err" className="sh-field-error">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className={`sh-float-field${errors.startDate ? ' has-error' : ''}`}>
                    <span className="sh-float-label">
                      <span className="sh-req">*</span> Start Date
                    </span>
                    <PremiumDateField
                      id="sh-hol-start"
                      value={form.startDate}
                      onChange={(iso) => setForm((f) => ({ ...f, startDate: iso }))}
                      placeholder="Select date"
                      icon={<CalendarDays size={16} />}
                      error={errors.startDate}
                    />
                  </div>

                  <div className="sh-float-field">
                    <span className="sh-float-label">End Date</span>
                    <PremiumDateField
                      id="sh-hol-end"
                      value={form.endDate}
                      onChange={(iso) => setForm((f) => ({ ...f, endDate: iso }))}
                      placeholder="Select date"
                      icon={<CalendarDays size={16} />}
                    />
                  </div>
                </div>

                <div className="sh-modal-footer">
                  <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  <m.button
                    type="button"
                    className="cal-btn-save"
                    onClick={handleSubmit}
                    disabled={saving}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="cal-btn-save-shine" aria-hidden />
                    {saving ? (
                      <span className="cal-saving">
                        <Loader2 size={16} className="cal-spin" /> Saving…
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </m.button>
                </div>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}

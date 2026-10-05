'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { PremiumDateField } from '../PremiumDateField';
import type { BirthdayEntry, BirthdayFormState, PersonType, ProfileColor } from './types';
import {
  PROFILE_COLORS,
  STAFF_NAME_SUGGESTIONS,
  STUDENT_NAME_SUGGESTIONS,
} from './types';
import '../calendar.css';
import '../holidays/staff-holidays.css';

type Props = {
  open: boolean;
  editing: BirthdayEntry | null;
  onClose: () => void;
  onSubmit: (form: BirthdayFormState) => Promise<void> | void;
};

function emptyForm(): BirthdayFormState {
  return {
    type: 'student',
    name: '',
    birthDate: '',
    profileColor: 'sky',
    notes: '',
    relationship: '',
  };
}

function BirthdayModalArt() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden>
      <ellipse cx="32" cy="30" rx="18" ry="6" fill="#FBCFE8" opacity="0.55" />
      <path
        d="M20 28c0-8 5-14 12-14s12 6 12 14H20Z"
        fill="#F9A8D4"
        opacity="0.7"
      />
      <rect x="28" y="12" width="3" height="8" rx="1.5" fill="#FBBF24" />
      <rect x="33" y="10" width="3" height="10" rx="1.5" fill="#F59E0B" />
      <circle cx="29.5" cy="11" r="2" fill="#FDE68A" />
      <circle cx="34.5" cy="9" r="2" fill="#FDE68A" />
      <circle cx="50" cy="10" r="5" fill="#BAE6FD" opacity="0.85" />
      <path d="M50 15v8" stroke="#93C5FD" strokeWidth="1.2" />
      <circle cx="12" cy="14" r="3.5" fill="#DDD6FE" opacity="0.9" />
      <path d="M12 17.5v6" stroke="#C4B5FD" strokeWidth="1.1" />
    </svg>
  );
}

export function BirthdayModal({ open, editing, onClose, onSubmit }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<BirthdayFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'birthDate', string>>>({});
  const [suggestOpen, setSuggestOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        type: editing.type,
        name: editing.name,
        birthDate: editing.birthDate,
        profileColor: editing.profileColor,
        notes: editing.notes ?? '',
        relationship: editing.relationship ?? '',
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
    setSaving(false);
    setSuggestOpen(false);
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const suggestions = useMemo(() => {
    const pool = form.type === 'student' ? STUDENT_NAME_SUGGESTIONS : STAFF_NAME_SUGGESTIONS;
    const q = form.name.trim().toLowerCase();
    if (!q) return pool.slice(0, 5);
    return pool.filter((n) => n.toLowerCase().includes(q)).slice(0, 5);
  }, [form.name, form.type]);

  const validate = () => {
    const next: Partial<Record<'name' | 'birthDate', string>> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.birthDate) next.birthDate = 'Birthday is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        notes: form.notes.trim(),
        relationship: form.relationship.trim(),
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
                className="sh-modal bc-sh-modal"
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
                    <h2 id={titleId}>{editing ? 'Edit Birthday' : 'Birthday Calendar'}</h2>
                    <p>{editing ? 'Update birthday details' : 'Add a new birthday'}</p>
                  </div>
                  <div className="sh-modal-art" aria-hidden>
                    <BirthdayModalArt />
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
                  <div className="sh-float-field">
                    <label className="sh-float-label" htmlFor="bc-person-type">
                      <span className="sh-req">*</span> Person Type
                    </label>
                    <select
                      id="bc-person-type"
                      className="sh-float-input"
                      value={form.type}
                      onChange={(e) => {
                        const type = e.target.value as PersonType;
                        setForm((f) => ({
                          ...f,
                          type,
                          profileColor: (type === 'student' ? 'sky' : 'lavender') as ProfileColor,
                        }));
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>

                  <div className={`sh-float-field bc-suggest${errors.name ? ' has-error' : ''}`}>
                    <label className="sh-float-label" htmlFor="bc-name">
                      <span className="sh-req">*</span> Name
                    </label>
                    <input
                      id="bc-name"
                      className="sh-float-input"
                      placeholder="Person name"
                      value={form.name}
                      autoComplete="off"
                      onChange={(e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        setSuggestOpen(true);
                      }}
                      onFocus={() => setSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'bc-name-err' : undefined}
                    />
                    {suggestOpen && suggestions.length > 0 ? (
                      <ul className="bc-suggest-menu" role="listbox" aria-label="Name suggestions">
                        {suggestions.map((n) => (
                          <li key={n}>
                            <button
                              type="button"
                              role="option"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setForm((f) => ({ ...f, name: n }));
                                setSuggestOpen(false);
                              }}
                            >
                              {n}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {errors.name ? (
                      <p id="bc-name-err" className="sh-field-error">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className={`sh-float-field${errors.birthDate ? ' has-error' : ''}`}>
                    <span className="sh-float-label">
                      <span className="sh-req">*</span> Birthday
                    </span>
                    <PremiumDateField
                      id="bc-birthday"
                      value={form.birthDate}
                      onChange={(iso) => setForm((f) => ({ ...f, birthDate: iso }))}
                      placeholder="Select date"
                      icon={<CalendarDays size={16} />}
                      error={errors.birthDate}
                    />
                  </div>

                  <div className="sh-float-field">
                    <label className="sh-float-label" htmlFor="bc-color">
                      Profile Color
                    </label>
                    <select
                      id="bc-color"
                      className="sh-float-input"
                      value={form.profileColor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, profileColor: e.target.value as ProfileColor }))
                      }
                    >
                      {PROFILE_COLORS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sh-float-field">
                    <label className="sh-float-label" htmlFor="bc-notes">
                      Notes
                    </label>
                    <input
                      id="bc-notes"
                      className="sh-float-input"
                      placeholder="Optional notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>

                  <div className="sh-float-field">
                    <label className="sh-float-label" htmlFor="bc-rel">
                      Relationship
                    </label>
                    <input
                      id="bc-rel"
                      className="sh-float-input"
                      placeholder="Optional relationship"
                      value={form.relationship}
                      onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
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

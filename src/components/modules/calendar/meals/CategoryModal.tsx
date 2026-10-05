'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import type { CategoryFormState } from './types';

const PRESET_COLORS = ['#D97706', '#059669', '#EA580C', '#2563EB', '#DC2626', '#7C3AED', '#DB2777', '#64748B', '#4F9CF9', '#F59E0B'];
const PRESET_ICONS = ['🌾', '🥦', '🍎', '🥛', '🍗', '🫘', '⚠️', '🍽️', '🧀', '🍪', '🧃', '🥗'];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CategoryFormState) => Promise<void> | void;
};

function empty(): CategoryFormState {
  return { name: '', icon: '🍽️', color: '#4F9CF9' };
}

export function CategoryModal({ open, onClose, onSubmit }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setForm(empty());
    setError('');
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Category name is required');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
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
              className="mp-modal-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ zIndex: 90 }}
            >
              <m.div
                className="mp-modal"
                style={{ width: 'min(420px, 100%)' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mp-modal-header">
                  <div>
                    <h2 id={titleId}>Create Category</h2>
                    <p>Available immediately in food forms</p>
                  </div>
                  <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                  </button>
                </div>
                <div className="mp-modal-body">
                  <div className={`mp-field${error ? ' has-error' : ''}`}>
                    <label htmlFor="mp-cat-name">
                      <span className="mp-req">*</span> Category Name
                    </label>
                    <input
                      id="mp-cat-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Smoothies"
                      autoFocus
                    />
                    {error ? <p className="mp-field-error">{error}</p> : null}
                  </div>
                  <div className="mp-field">
                    <span className="mp-label">Category Icon</span>
                    <div className="mp-emoji-picker" role="group" aria-label="Category icon">
                      {PRESET_ICONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          className={`mp-emoji-btn${form.icon === em ? ' is-active' : ''}`}
                          onClick={() => setForm((f) => ({ ...f, icon: em }))}
                          aria-pressed={form.icon === em}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mp-field">
                    <span className="mp-label">Color</span>
                    <div className="mp-color-swatch" role="group" aria-label="Category color">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={form.color === c ? 'is-active' : ''}
                          style={{ background: c }}
                          aria-label={c}
                          aria-pressed={form.color === c}
                          onClick={() => setForm((f) => ({ ...f, color: c }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mp-modal-footer">
                  <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                    Cancel
                  </button>
                  <m.button
                    type="button"
                    className="mp-btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Loader2 size={16} className="cal-spin" /> Saving…
                      </span>
                    ) : (
                      'Save'
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

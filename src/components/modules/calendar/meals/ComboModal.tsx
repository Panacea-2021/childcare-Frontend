'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import type { ComboFormState, FoodItem } from './types';

type Props = {
  open: boolean;
  foods: FoodItem[];
  onClose: () => void;
  onSubmit: (form: ComboFormState) => Promise<void> | void;
};

function empty(): ComboFormState {
  return { name: '', description: '', itemIds: [], hasAllergen: false };
}

export function ComboModal({ open, foods, onClose, onSubmit }: Props) {
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

  const baseFoods = useMemo(
    () => foods.filter((f) => f.status === 'active' && !f.isCombo),
    [foods],
  );

  const toggle = (id: string) => {
    setForm((f) => ({
      ...f,
      itemIds: f.itemIds.includes(id) ? f.itemIds.filter((x) => x !== id) : [...f.itemIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Combo name is required');
      return;
    }
    if (form.itemIds.length < 2) {
      setError('Select at least two foods');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() });
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
            >
              <m.div
                className="mp-modal mp-modal-wide"
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
                    <h2 id={titleId}>Create Combo Food</h2>
                    <p>Bundle multiple foods into one reusable item</p>
                  </div>
                  <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                  </button>
                </div>
                <div className="mp-modal-body">
                  <div className={`mp-field${error && !form.name.trim() ? ' has-error' : ''}`}>
                    <label htmlFor="mp-combo-name">
                      <span className="mp-req">*</span> Combo Name
                    </label>
                    <input
                      id="mp-combo-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Fruit Combo"
                    />
                  </div>
                  <div className="mp-field">
                    <label htmlFor="mp-combo-desc">Description</label>
                    <textarea
                      id="mp-combo-desc"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="What does this combo include?"
                    />
                  </div>
                  <div className="mp-field">
                    <span className="mp-label">
                      <span className="mp-req">*</span> Select Foods
                    </span>
                    <div className="mp-combo-picks" role="group" aria-label="Combo food items">
                      {baseFoods.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`mp-combo-pick${form.itemIds.includes(f.id) ? ' is-selected' : ''}`}
                          onClick={() => toggle(f.id)}
                          aria-pressed={form.itemIds.includes(f.id)}
                        >
                          <span aria-hidden>{f.imageEmoji ?? '🍽️'}</span>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="mp-check">
                    <input
                      type="checkbox"
                      checked={form.hasAllergen}
                      onChange={(e) => setForm((f) => ({ ...f, hasAllergen: e.target.checked }))}
                    />
                    Contains allergens
                  </label>
                  {error ? <p className="mp-field-error">{error}</p> : null}
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

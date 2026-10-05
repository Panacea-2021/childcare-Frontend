'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { FoodFields } from './AddFoodModal';
import type { FoodCategory, FoodFormState, FoodItem } from './types';

type Props = {
  open: boolean;
  editing: FoodItem | null;
  categories: FoodCategory[];
  onClose: () => void;
  onSubmit: (form: FoodFormState) => Promise<void> | void;
  onCreateCategory: () => void;
};

function emptyForm(): FoodFormState {
  return {
    name: '',
    categoryId: 'fruits',
    description: '',
    imageEmoji: '🍎',
    hasAllergen: false,
  };
}

export function FoodFormModal({
  open,
  editing,
  categories,
  onClose,
  onSubmit,
  onCreateCategory,
}: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FoodFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'categoryId', string>>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        categoryId: editing.categoryId,
        description: editing.description ?? '',
        imageEmoji: editing.imageEmoji ?? '🍽️',
        hasAllergen: editing.hasAllergen,
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

  const handleSubmit = async () => {
    const next: Partial<Record<'name' | 'categoryId', string>> = {};
    if (!form.name.trim()) next.name = 'Food name is required';
    if (!form.categoryId) next.categoryId = 'Category is required';
    setErrors(next);
    if (Object.keys(next).length || saving) return;
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
                className="mp-modal"
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
                    <h2 id={titleId}>{editing ? 'Edit Food Item' : 'Add Food Item'}</h2>
                    <p>Manage reusable food items for meal planning</p>
                  </div>
                  <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                  </button>
                </div>
                <div className="mp-modal-body">
                  <FoodFields
                    form={form}
                    setForm={setForm}
                    categories={categories}
                    errors={errors}
                    showCreateCategory
                    onCreateCategory={onCreateCategory}
                  />
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

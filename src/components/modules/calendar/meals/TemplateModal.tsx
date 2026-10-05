'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { GripVertical, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { MealSlotDef, MealTemplate, TemplateFormState } from './types';
import { DEFAULT_MEAL_SLOTS } from './types';

type Props = {
  open: boolean;
  editing: MealTemplate | null;
  onClose: () => void;
  onSubmit: (form: TemplateFormState) => Promise<void> | void;
};

function empty(): TemplateFormState {
  return {
    name: '',
    description: '',
    sections: DEFAULT_MEAL_SLOTS.map((s) => ({ ...s })),
  };
}

export function TemplateModal({ open, editing, onClose, onSubmit }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        sections: editing.sections.map((s) => ({ ...s })),
      });
    } else {
      setForm(empty());
    }
    setError('');
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

  const updateSection = (index: number, patch: Partial<MealSlotDef>) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const addSection = () => {
    setForm((f) => ({
      ...f,
      sections: [
        ...f.sections,
        {
          id: `custom-${Date.now()}`,
          name: 'Custom Meal',
          icon: '🍽️',
          color: '#4F9CF9',
          order: f.sections.length,
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    }));
  };

  const onDrop = (to: number) => {
    if (dragIndex === null || dragIndex === to) {
      setDragIndex(null);
      return;
    }
    setForm((f) => {
      const next = [...f.sections];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(to, 0, moved);
      return { ...f, sections: next.map((s, i) => ({ ...s, order: i })) };
    });
    setDragIndex(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Template name is required');
      return;
    }
    if (form.sections.length === 0) {
      setError('Add at least one meal section');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        sections: form.sections.map((s, i) => ({ ...s, order: i, name: s.name.trim() || `Section ${i + 1}` })),
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
                    <h2 id={titleId}>{editing ? 'Edit Template' : 'Create Template'}</h2>
                    <p>Reusable meal structures for faster planning</p>
                  </div>
                  <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
                    <X size={18} />
                  </button>
                </div>
                <div className="mp-modal-body">
                  <div className="mp-grid-2">
                    <div className={`mp-field${error && !form.name.trim() ? ' has-error' : ''}`}>
                      <label htmlFor="mp-tpl-name">
                        <span className="mp-req">*</span> Template Name
                      </label>
                      <input
                        id="mp-tpl-name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Standard Weekday"
                      />
                    </div>
                    <div className="mp-field">
                      <label htmlFor="mp-tpl-desc">Description</label>
                      <input
                        id="mp-tpl-desc"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Short description"
                      />
                    </div>
                  </div>

                  <div className="mp-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mp-label">Meal Sections</span>
                      <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={addSection}>
                        <Plus size={14} /> Add New Section
                      </button>
                    </div>
                    <div className="mp-section-editor">
                      {form.sections.map((section, index) => (
                        <div
                          key={section.id}
                          className="mp-section-row"
                          draggable
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(index)}
                        >
                          <span className="mp-drag-handle" aria-hidden>
                            <GripVertical size={16} />
                          </span>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(index, { name: e.target.value })}
                            aria-label={`Section ${index + 1} name`}
                          />
                          <input
                            className="mp-hide-sm"
                            type="text"
                            value={section.icon}
                            onChange={(e) => updateSection(index, { icon: e.target.value })}
                            aria-label={`Section ${index + 1} icon`}
                            maxLength={4}
                          />
                          <input
                            className="mp-hide-sm"
                            type="color"
                            value={section.color}
                            onChange={(e) => updateSection(index, { color: e.target.value })}
                            aria-label={`Section ${index + 1} color`}
                          />
                          <button
                            type="button"
                            className="mp-icon-btn is-danger"
                            aria-label={`Delete ${section.name}`}
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {error ? <p className="mp-field-error">{error}</p> : null}

                  <div className="mp-field">
                    <span className="mp-label">Preview</span>
                    <TemplateTimeline sections={form.sections} />
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

export function TemplateTimeline({ sections }: { sections: MealSlotDef[] }) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return (
    <div className="mp-timeline" aria-label="Template meal flow preview">
      {sorted.map((s, i) => (
        <m.div
          key={s.id}
          className="mp-timeline-item"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="mp-timeline-rail">
            <span className="mp-timeline-dot" style={{ background: s.color, boxShadow: `0 0 0 2px ${s.color}` }} />
            {i < sorted.length - 1 ? <span className="mp-timeline-line" /> : null}
          </div>
          <div className="mp-timeline-body">
            <strong>
              {s.icon} {s.name}
            </strong>
            <span>Order {i + 1}</span>
          </div>
        </m.div>
      ))}
    </div>
  );
}

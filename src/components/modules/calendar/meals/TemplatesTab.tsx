'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Copy, Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { MealTemplate } from './types';
import { TemplateTimeline } from './TemplateModal';

type Props = {
  templates: MealTemplate[];
  onNew: () => void;
  onEdit: (tpl: MealTemplate) => void;
  onDuplicate: (tpl: MealTemplate) => void;
  onDelete: (tpl: MealTemplate) => void;
};

export function TemplatesTab({ templates, onNew, onEdit, onDuplicate, onDelete }: Props) {
  const [preview, setPreview] = useState<MealTemplate | null>(null);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div
          className="sh-panel"
          role="tabpanel"
          id="mp-panel-templates"
          aria-labelledby="mp-tab-templates"
        >
          <div className="mp-section-head">
            <div>
              <h2>📋 Meal Templates</h2>
              <p>Create reusable meal structures for faster planning.</p>
            </div>
            <div className="mp-section-actions">
              <m.button
                type="button"
                className="mp-btn-primary"
                onClick={onNew}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> New Template
              </m.button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="mp-empty">
              <m.div
                className="mp-empty-art"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                📓
              </m.div>
              <h3>No templates created.</h3>
              <p>Build a reusable meal structure to speed up daily planning.</p>
              <button type="button" className="mp-btn-primary" onClick={onNew}>
                <Plus size={16} /> New Template
              </button>
            </div>
          ) : (
            <div className="mp-tpl-grid">
              {templates.map((tpl, i) => (
                <m.article
                  key={tpl.id}
                  className="mp-tpl-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <h3>{tpl.name}</h3>
                  <p>{tpl.description || 'No description'}</p>
                  <div className="mp-tpl-sections">
                    {tpl.sections
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((s) => (
                        <span key={s.id} className="mp-tpl-chip" style={{ borderColor: `${s.color}55` }}>
                          {s.icon} {s.name}
                        </span>
                      ))}
                  </div>
                  <div className="mp-tpl-actions">
                    <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => setPreview(tpl)}>
                      <Eye size={14} /> Preview
                    </button>
                    <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => onEdit(tpl)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" className="mp-btn-ghost" style={{ minHeight: 34 }} onClick={() => onDuplicate(tpl)}>
                      <Copy size={14} /> Duplicate
                    </button>
                    <button
                      type="button"
                      className="mp-btn-ghost"
                      style={{ minHeight: 34, color: 'var(--color-close)' }}
                      onClick={() => onDelete(tpl)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </m.article>
              ))}
            </div>
          )}

          <PreviewModal template={preview} onClose={() => setPreview(null)} />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

function PreviewModal({ template, onClose }: { template: MealTemplate | null; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {template ? (
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
            aria-label={`Preview ${template.name}`}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-header">
              <div>
                <h2>{template.name}</h2>
                <p>{template.description || 'Template preview'}</p>
              </div>
              <button type="button" className="mp-modal-close" aria-label="Close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
            <div className="mp-modal-body">
              <TemplateTimeline sections={template.sections} />
            </div>
            <div className="mp-modal-footer">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                Close
              </button>
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

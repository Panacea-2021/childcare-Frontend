'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { lockUiOverlay, unlockUiOverlay } from '@/lib/uiOverlay';
import { fadeIn } from './animations';
import { OfficialFormDocument } from './OfficialFormDocument';
import { printOfficialForm } from './printOfficialForm';
import type { BuilderView, FormField } from './types';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  fields: FormField[];
  onClose: () => void;
};

export function FormPreviewModal({ open, title, description, fields, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<BuilderView>('desktop');
  const [values, setValues] = useState<Record<string, string | boolean | number | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setValues({});
    setErrors({});
    setSubmitted(false);
    setPage(0);
    setView('desktop');
    lockUiOverlay();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlockUiOverlay();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const pages = useMemo(() => {
    if (!fields.length) return [[] as FormField[]];
    const chunks: FormField[][] = [[]];
    fields.forEach((f) => {
      if (f.type === 'multi-step' && chunks[chunks.length - 1].length) chunks.push([]);
      else chunks[chunks.length - 1].push(f);
    });
    return chunks.filter((c) => c.length) as FormField[][];
  }, [fields]);

  const current = pages[page] ?? fields;

  if (!mounted) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    current.forEach((f) => {
      if (!f.required || f.type === 'heading' || f.type === 'paragraph' || f.type === 'divider' || f.type === 'spacer') return;
      const v = values[f.id];
      if (v === undefined || v === '' || v === false) next[f.id] = 'This field is required';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    if (page < pages.length - 1) {
      setPage((p) => p + 1);
      return;
    }
    setSubmitted(true);
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="sfp-root" role="dialog" aria-modal="true" aria-label="Form preview" {...fadeIn}>
          <div className="sfp-bar">
            <div className="sfp-bar-title">
              <strong>{title || 'Form preview'}</strong>
              <div className="sf-meta">Official PDF form preview · scroll to see all pages</div>
            </div>
            <div className="sfp-modes" role="tablist" aria-label="Device preview">
              {(
                [
                  ['desktop', Monitor, 'Desktop'],
                  ['tablet', Tablet, 'Tablet'],
                  ['mobile', Smartphone, 'Mobile'],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`sfp-mode ${view === id ? 'is-active' : ''}`}
                  onClick={() => setView(id)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <div className="sfp-bar-actions">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => printOfficialForm({ title, description, fields })}
              >
                <Download size={15} /> Download PDF
              </button>
              <button type="button" className="sf-icon-btn" aria-label="Close preview" onClick={onClose}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="sfp-body">
            <motion.div
              key={`${view}-${page}`}
              className={`sfp-sheet ofd-preview-wrap is-${view}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitted ? (
                <div className="sf-empty">
                  <h2>Submitted</h2>
                  <p>Frontend mock submission recorded successfully.</p>
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => {
                      setSubmitted(false);
                      setPage(0);
                      setValues({});
                    }}
                  >
                    Submit another
                  </button>
                </div>
              ) : (
                <>
                  {pages.length > 1 ? (
                    <p className="sf-meta sfp-page-meta">
                      Page {page + 1} of {pages.length}
                    </p>
                  ) : null}

                  {!current.length ? (
                    <div className="sf-empty">
                      <h3>No fields on this form yet</h3>
                      <p>Open the form in the builder and add fields from the component library.</p>
                    </div>
                  ) : (
                    <OfficialFormDocument
                      title={title}
                      description={description}
                      fields={current}
                      interactive
                      values={values}
                      errors={errors}
                      onChange={(id, v) => {
                        setValues((prev) => ({ ...prev, [id]: v }));
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n[id];
                          return n;
                        });
                      }}
                    />
                  )}

                  <div className="sf-preview-actions">
                    {page > 0 ? (
                      <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPage((p) => p - 1)}>
                        Back
                      </button>
                    ) : null}
                    {current.length ? (
                      <button type="button" className="ui-btn ui-btn-primary" onClick={onSubmit}>
                        {page < pages.length - 1 ? 'Continue' : 'Submit Form'}
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

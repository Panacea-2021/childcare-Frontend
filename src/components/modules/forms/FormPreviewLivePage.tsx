'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { getFormById } from './formsStore';
import { loadFormBuilderSchema } from './formBuilderSchemaStore';
import { FormPreviewSheet, type FormPreviewMode } from './FormPreviewSheet';
import { downloadBlankFormPdf } from './downloadBlankFormPdf';
import type { FormItem } from './types';
import './form-preview-sheet.css';

type Props = {
  formId: string;
  mode?: FormPreviewMode;
};

export function FormPreviewLivePage({ formId, mode = 'fill' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormItem | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setForm(getFormById(formId));
    setReady(true);
  }, [formId]);

  useEffect(() => {
    if (mode !== 'blank') return;
    document.body.classList.add('fps-form-blank-page');
    return () => document.body.classList.remove('fps-form-blank-page');
  }, [mode]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const schema = useMemo(() => {
    if (!form) return null;
    return loadFormBuilderSchema(form.id, { seedDemoIfEmpty: true, formName: form.name });
  }, [form]);

  const meta = form
    ? [
        form.type,
        form.category,
        form.durationMin != null ? `${form.durationMin} min` : null,
        form.status,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const downloadBlankForm = async () => {
    if (!form || !schema || downloading) return;
    setDownloading(true);
    try {
      await downloadBlankFormPdf({
        title: form.name,
        fields: schema.fields,
        styles: schema.styles,
        fileName: form.name,
      });
      setToast('Blank form downloaded');
    } catch {
      setToast('Could not generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!ready) {
    return (
      <div className="fps-live-page">
        <p style={{ color: 'var(--text-secondary)' }}>Loading form…</p>
      </div>
    );
  }

  if (!form || !schema) {
    return (
      <div className="fps-live-page">
        <div className="fps-missing">
          <FileText size={28} color="var(--color-accent)" />
          <h1>Form not found</h1>
          <p>This share link is invalid or the form was removed.</p>
          <Link href="/forms" className="ui-btn ui-btn-primary">
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const modeLabel =
    mode === 'blank' ? 'Blank form' : mode === 'preview' ? 'Preview' : 'Shared form';

  return (
    <div className={`fps-live-page${mode === 'blank' ? ' is-blank-mode' : ''}`}>
      <span className="fps-live-orb fps-live-orb-a" aria-hidden />
      <span className="fps-live-orb fps-live-orb-b" aria-hidden />

      <motion.div
        className="fps-live-toolbar fps-no-print"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="fps-live-toolbar-copy">
          <h1>{modeLabel}</h1>
          <p>{form.name}</p>
        </div>
        <div className="fps-live-toolbar-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => router.back()}>
            <ArrowLeft size={15} aria-hidden />
            Back
          </button>
          {mode === 'blank' ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={downloading}
              onClick={() => void downloadBlankForm()}
            >
              <Download size={15} aria-hidden />
              {downloading ? 'Downloading…' : 'Download Form'}
            </button>
          ) : null}
        </div>
      </motion.div>

      <FormPreviewSheet
        title={form.name}
        fields={schema.fields}
        styles={schema.styles}
        mode={mode}
        meta={meta}
        onSaveDraft={() => setToast('Draft saved locally')}
        onSubmit={() => setToast('Form submitted successfully')}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fps-toast fps-no-print"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

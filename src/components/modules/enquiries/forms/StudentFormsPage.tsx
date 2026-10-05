'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import '@/components/ui/module.css';
import { AiFormCreatorModal } from './AiFormCreatorModal';
import { CreateOptionsModal } from './CreateOptionsModal';
import { FormPreviewModal } from './FormPreviewModal';
import {
  cloneFields,
  createBlankForm,
  deleteStudentForm,
  duplicateStudentForm,
  duplicateTemplate,
  loadStudentForms,
  loadTemplates,
  saveStudentForms,
  saveTemplateFromForm,
  toggleTemplateFavorite,
  upsertStudentForm,
} from './formsStore';
import { PdfUploadModal } from './PdfFormEditor';
import { createScratchStarterFields } from './scratchStarter';
import { StudentFormCard } from './StudentFormCard';
import { StudentFormsHeader } from './StudentFormsHeader';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import type { CreateMode, FormField, StudentForm, StudentTemplate } from './types';
import './student-forms.css';

export function StudentFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<StudentForm[]>([]);
  const [templates, setTemplates] = useState<StudentTemplate[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; description?: string; fields: FormField[] } | null>(
    null,
  );

  const refresh = () => {
    setForms(loadStudentForms());
    setTemplates(loadTemplates());
  };

  useEffect(() => {
    refresh();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const openBuilder = (id: string) => {
    router.push(`/enquiries/forms/builder?id=${encodeURIComponent(id)}`);
  };

  const startScratch = () => {
    const form = createBlankForm({
      title: 'New Student Form',
      description: 'Official form for parents / guardians to complete and return.',
      source: 'scratch',
      fields: createScratchStarterFields(),
    });
    const next = upsertStudentForm(form);
    setForms(next);
    setCreateOpen(false);
    flash('Scratch form created — add or edit fields in the builder');
    openBuilder(form.id);
  };

  const onCreateSelect = (mode: CreateMode) => {
    setCreateOpen(false);
    if (mode === 'scratch') startScratch();
    if (mode === 'pdf') setPdfOpen(true);
    if (mode === 'ai') setAiOpen(true);
  };

  const useTemplate = (tpl: StudentTemplate) => {
    const fields = cloneFields(tpl.fields?.length ? tpl.fields : []);
    if (!fields.length) {
      flash('This template has no fields');
      return;
    }
    const form = createBlankForm({
      title: tpl.title,
      description: tpl.description,
      source: 'template',
      category: tpl.category,
      fields,
    });
    form.fields = fields;
    const next = upsertStudentForm(form);
    setForms(next);
    setTemplatesOpen(false);
    flash(`Template “${tpl.title}” applied`);
    openBuilder(form.id);
  };

  const sorted = useMemo(
    () => [...forms].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [forms],
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page sf-page sf-page-premium">
          <div className="sf-ambient" aria-hidden>
            <span className="sf-blob b1" />
            <span className="sf-blob b2" />
            <span className="sf-blob b3" />
            <span className="sf-mesh" />
          </div>

          <m.div
            className="sf-page-inner"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <StudentFormsHeader
              onTemplates={() => setTemplatesOpen(true)}
              onAi={() => setAiOpen(true)}
              onCreate={() => setCreateOpen(true)}
            />

            {sorted.length === 0 ? (
              <m.div
                className="sf-empty sf-empty-premium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <m.div
                  className="sf-empty-art"
                  aria-hidden
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ClipboardList size={36} />
                </m.div>
                <h3>No student forms yet</h3>
                <p>Create from scratch, upload a PDF, or generate with AI.</p>
                <m.button
                  type="button"
                  className="sf-ss-btn sf-ss-btn-primary"
                  onClick={() => setCreateOpen(true)}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="sf-ss-btn-shine" aria-hidden />
                  <Plus size={16} /> Create Form
                </m.button>
              </m.div>
            ) : (
              <div className="sf-premium-grid">
                {sorted.map((form, index) => (
                  <StudentFormCard
                    key={form.id}
                    form={form}
                    index={index}
                    onEdit={() => openBuilder(form.id)}
                    onPreview={() =>
                      setPreview({
                        title: form.title,
                        description: form.description,
                        fields: form.fields ?? [],
                      })
                    }
                    onFavorite={() => {
                      const next = forms.map((f) =>
                        f.id === form.id ? { ...f, favorite: !f.favorite } : f,
                      );
                      setForms(next);
                      saveStudentForms(next);
                      flash(form.favorite ? 'Removed from favorites' : 'Added to favorites');
                    }}
                    onDuplicate={() => {
                      setForms(duplicateStudentForm(form.id));
                      flash('Form duplicated');
                    }}
                    onSaveTemplate={() => {
                      saveTemplateFromForm(form);
                      setTemplates(loadTemplates());
                      flash('Saved to My Templates');
                    }}
                    onDelete={() => {
                      if (!window.confirm(`Delete “${form.title}”?`)) return;
                      setForms(deleteStudentForm(form.id));
                      flash('Form deleted');
                    }}
                  />
                ))}
              </div>
            )}
          </m.div>

          <CreateOptionsModal open={createOpen} onClose={() => setCreateOpen(false)} onSelect={onCreateSelect} />

          <TemplateLibraryModal
            open={templatesOpen}
            templates={templates}
            onClose={() => setTemplatesOpen(false)}
            onUse={useTemplate}
            onPreview={(tpl) =>
              setPreview({
                title: tpl.title,
                description: tpl.description,
                fields: tpl.fields ?? [],
              })
            }
            onFavorite={(id) => {
              setTemplates(toggleTemplateFavorite(id));
              flash('Favorites updated');
            }}
            onDuplicate={(id) => {
              setTemplates(duplicateTemplate(id));
              flash('Template duplicated');
            }}
          />

          <AiFormCreatorModal
            open={aiOpen}
            onClose={() => setAiOpen(false)}
            onGenerated={({ title, description, fields, category, savedAsTemplate }) => {
              const form = createBlankForm({
                title,
                description,
                fields,
                source: 'ai',
                category: category || 'Documents',
              });
              form.fields = cloneFields(fields);
              const next = upsertStudentForm(form);
              setForms(next);
              if (savedAsTemplate !== false) {
                saveTemplateFromForm(form);
                setTemplates(loadTemplates());
              }
              setAiOpen(false);
              flash('Official form saved');
              openBuilder(form.id);
            }}
          />

          <PdfUploadModal
            open={pdfOpen}
            onClose={() => setPdfOpen(false)}
            onUploaded={(fileName) => {
              setPdfOpen(false);
              router.push(`/enquiries/forms/pdf?file=${encodeURIComponent(fileName)}`);
            }}
          />

          <FormPreviewModal
            open={Boolean(preview)}
            title={preview?.title ?? ''}
            description={preview?.description}
            fields={preview?.fields ?? []}
            onClose={() => setPreview(null)}
          />

          <AnimatePresence>
            {toast ? (
              <m.div
                className="sf-toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {toast}
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Check, ChevronRight } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { CertificatePreview } from './CertificatePreview';
import { CertificateDownloadStep } from './CertificateDownloadStep';
import { CertificateStylePanel, type SectionKey } from './CertificateStylePanel';
import { CertificateStudentStep } from './CertificateStudentStep';
import { createDefaultCertificateStyles, type CertificateStyleState } from './certificateStyles';
import {
  CERTIFICATE_TEMPLATES,
  MOCK_STUDENTS,
  type CertificateAudience,
  type MockStudent,
} from './toolsData';
import '../center-management/students.css';
import './tools.css';
import './certificates.css';

const STEPS = ['Select Template', 'Customize Template', 'Select Student', 'Download'] as const;

export function CertificatesPage() {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<CertificateAudience>('Student');
  const [templateId, setTemplateId] = useState(CERTIFICATE_TEMPLATES[0].id);
  const [styles, setStyles] = useState<CertificateStyleState>(() =>
    createDefaultCertificateStyles({
      title: CERTIFICATE_TEMPLATES[0].title,
      sampleName: CERTIFICATE_TEMPLATES[0].sampleName,
      body: CERTIFICATE_TEMPLATES[0].description,
    }),
  );
  const [openSection, setOpenSection] = useState<SectionKey>('schoolName');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const visibleTemplates = useMemo(
    () => CERTIFICATE_TEMPLATES.filter((t) => t.audiences.includes(audience)),
    [audience],
  );

  const template =
    visibleTemplates.find((t) => t.id === templateId) ??
    visibleTemplates[0] ??
    CERTIFICATE_TEMPLATES[0];

  useEffect(() => {
    if (!visibleTemplates.some((t) => t.id === templateId) && visibleTemplates[0]) {
      const next = visibleTemplates[0];
      setTemplateId(next.id);
      setStyles((prev) => ({
        ...prev,
        header: { ...prev.header, text: next.title },
        name: { ...prev.name, text: next.sampleName },
        body: { ...prev.body, text: next.description },
      }));
    }
  }, [audience, templateId, visibleTemplates]);

  const selected = MOCK_STUDENTS.filter((s) => selectedIds.includes(s.id));

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const canNext =
    step === 0
      ? Boolean(template?.id)
      : step === 1
        ? Boolean(styles.header.text.trim())
        : step === 2
          ? selectedIds.length > 0
          : true;

  const selectTemplate = (id: string, advance = false) => {
    setTemplateId(id);
    const next = CERTIFICATE_TEMPLATES.find((t) => t.id === id);
    if (!next) return;
    setStyles((prev) => ({
      ...prev,
      header: { ...prev.header, text: next.title },
      name: { ...prev.name, text: next.sampleName },
      body: { ...prev.body, text: next.description },
    }));
    if (advance) {
      setOpenSection('schoolName');
      setStep(1);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAllVisible = (visibleIds: string[]) => {
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds])),
    );
  };

  return (
    <div className="cm-page cm-page--tools tools-page cert-page">
      <CenterManagementPageHeader
        title="Certificates"
        description="Create printable student or staff certificates in four guided steps."
        icon={<Award size={22} strokeWidth={2.1} />}
      />

      <motion.section
        className="cm-panel tools-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <ol className="tools-stepper" aria-label="Certificate steps">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className={`${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
                <button type="button" onClick={() => i <= step && setStep(i)}>
                  <span className="tools-step-num">{done ? <Check size={14} /> : i + 1}</span>
                  <span className="tools-step-label">{label}</span>
                </button>
                {i < STEPS.length - 1 ? <ChevronRight className="tools-step-sep" size={16} /> : null}
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {step === 0 ? (
              <section className="tools-section">
                <label className="tools-inline-field cert-for-inline">
                  Show certificates for
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as CertificateAudience)}
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                  </select>
                </label>

                <div className="cert-template-grid cert-template-grid-3">
                  {visibleTemplates.map((tpl) => {
                    const selectedTpl = template.id === tpl.id;
                    return (
                      <motion.button
                        key={tpl.id}
                        type="button"
                        className={`cert-template-card ${selectedTpl ? 'is-selected' : ''}`}
                        onClick={() => selectTemplate(tpl.id, true)}
                        aria-pressed={selectedTpl}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.995 }}
                      >
                        <span className="cert-template-label top">{tpl.name}</span>
                        <CertificatePreview
                          template={tpl}
                          schoolName={styles.schoolName.text}
                          title={tpl.title}
                          studentName={tpl.sampleName}
                        />
                      </motion.button>
                    );
                  })}
                  <div className="cert-custom-card">
                    <span className="cert-custom-plus" aria-hidden>
                      +
                    </span>
                    <strong>Add Custom Design</strong>
                    <p className="cert-premium">
                      Premium feature · Talk to sales for custom certificate branding from <b>$99</b>
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 1 ? (
              <section className="tools-section cert-customize">
                <CertificateStylePanel
                  styles={styles}
                  openSection={openSection}
                  onOpenSection={setOpenSection}
                  onChange={setStyles}
                  onPrevious={() => setStep(0)}
                  onNext={() => setStep(2)}
                  onSaveNew={() => flash('Saved as new certificate style (UI only)')}
                />
                <div className="cert-live-preview">
                  <CertificatePreview template={template} styles={styles} size="lg" />
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <CertificateStudentStep
                students={MOCK_STUDENTS}
                selectedIds={selectedIds}
                onToggle={toggleStudent}
                onToggleAllVisible={toggleAllVisible}
                onPrevious={() => setStep(1)}
                onNext={() => selectedIds.length > 0 && setStep(3)}
                canNext={selectedIds.length > 0}
              />
            ) : null}

            {step === 3 ? (
              <CertificateDownloadStep
                template={template}
                styles={styles}
                students={selected}
                onPrevious={() => setStep(2)}
                onDownloadOne={(s: MockStudent) => flash(`Downloading certificate for ${s.name}…`)}
                onDownloadAll={() =>
                  flash(`Downloading all ${selected.length} certificate${selected.length === 1 ? '' : 's'}…`)
                }
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {step === 0 ? (
          <footer className="tools-footer">
            <button type="button" className="tools-btn ghost ui-btn ui-btn-outline" disabled>
              Back
            </button>
            <button
              type="button"
              className="tools-btn primary ui-btn ui-btn-primary"
              disabled={!canNext}
              onClick={() => canNext && setStep(1)}
            >
              Continue
            </button>
          </footer>
        ) : null}
      </motion.section>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="tools-toast"
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

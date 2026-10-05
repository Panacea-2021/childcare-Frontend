'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  FileStack,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  detectFormKind,
  generateFromKnowledge,
  listKnowledgeKinds,
  parseRefinePrompt,
  type AiFormKind,
} from './aiKnowledge';
import { btnMotion } from './animations';
import { OfficialFormDocument } from './OfficialFormDocument';
import { printOfficialForm } from './printOfficialForm';
import type { FormField } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (payload: {
    title: string;
    description: string;
    fields: FormField[];
    category: string;
    savedAsTemplate?: boolean;
  }) => void;
};

type Tab = 'prompt' | 'image';
type Phase = 'compose' | 'generating' | 'preview' | 'refine';

const DEFAULT_PROMPT = `Create a complete Student Admission Form with all essential admission details for parents to fill.`;

export function AiFormCreatorModal({ open, onClose, onGenerated }: Props) {
  const [tab, setTab] = useState<Tab>('prompt');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [kindHint, setKindHint] = useState<AiFormKind | null>('admission');
  const [phase, setPhase] = useState<Phase>('compose');
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Documents');
  const [fields, setFields] = useState<FormField[]>([]);
  const [sectionTitles, setSectionTitles] = useState<string[]>([]);
  const [detectedKind, setDetectedKind] = useState<AiFormKind>('admission');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [wantMore, setWantMore] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const reset = () => {
    clearTimers();
    setTab('prompt');
    setPrompt(DEFAULT_PROMPT);
    setKindHint('admission');
    setPhase('compose');
    setStepIdx(0);
    setProgress(0);
    setTyped('');
    setFileName(null);
    setTitle('');
    setDescription('');
    setFields([]);
    setSectionTitles([]);
    setRefinePrompt('');
    setWantMore(null);
    setToast(null);
  };

  useEffect(() => {
    if (!open) reset();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const applyGeneration = (sourcePrompt: string) => {
    const kind = kindHint ?? detectFormKind(sourcePrompt);
    const pack = generateFromKnowledge(kind, `ai-${Date.now()}`);
    setDetectedKind(kind);
    setTitle(pack.title);
    setDescription(pack.description);
    setCategory(pack.category);
    setFields(pack.fields);
    setSectionTitles(pack.sectionTitles);
  };

  const runGenerate = () => {
    if (tab === 'prompt' && !prompt.trim()) return;
    if (tab === 'image' && !fileName) return;

    clearTimers();
    setPhase('generating');
    setStepIdx(0);
    setProgress(10);
    setTyped('');
    setWantMore(null);

    const kind = kindHint ?? detectFormKind(tab === 'image' ? 'admission form from scan' : prompt);
    const packPreview = generateFromKnowledge(kind, 'tmp');
    const typeTarget = `Training on ${packPreview.title} · ${packPreview.sectionTitles.length} sections · essential parent fields…`;
    let char = 0;
    const typeTimer = window.setInterval(() => {
      char += 1;
      setTyped(typeTarget.slice(0, char));
      if (char >= typeTarget.length) window.clearInterval(typeTimer);
    }, 22);
    timers.current.push(typeTimer as unknown as number);

    const steps = tab === 'image'
      ? ['Scanning document…', 'OCR field extraction…', 'Matching admission essentials…', 'Building official PDF form…']
      : ['Understanding request…', 'Loading trained form knowledge…', 'Assembling essential sections…', 'Building official PDF form…'];

    steps.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setStepIdx(i);
        setProgress(Math.round(((i + 1) / steps.length) * 100));
        if (i === steps.length - 1) {
          const done = window.setTimeout(() => {
            applyGeneration(tab === 'image' ? `admission form ${fileName}` : prompt);
            setPhase('preview');
          }, 400);
          timers.current.push(done);
        }
      }, 700 * (i + 1));
      timers.current.push(t);
    });
  };

  const onRefine = () => {
    if (!refinePrompt.trim()) return;
    setPhase('generating');
    setStepIdx(0);
    setProgress(20);
    const t = window.setTimeout(() => {
      setFields((prev) => parseRefinePrompt(refinePrompt, prev));
      setRefinePrompt('');
      setWantMore(null);
      setPhase('preview');
      flash('Fields added to the form');
    }, 1200);
    timers.current.push(t);
  };

  const downloadPdf = () => {
    printOfficialForm({ title, description, fields });
    flash('Opening official PDF — use Save as PDF in the print dialog');
  };

  const accept = (saveTemplate: boolean) => {
    onGenerated({
      title,
      description,
      fields,
      category,
      savedAsTemplate: saveTemplate,
    });
  };

  const kinds = listKnowledgeKinds();

  const footer =
    phase === 'compose' ? (
      <>
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
          Cancel
        </button>
        {tab === 'prompt' ? (
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setPrompt('')}>
            Clear
          </button>
        ) : null}
        <motion.button type="button" className="ui-btn ui-btn-primary" onClick={runGenerate} {...btnMotion}>
          {tab === 'prompt' ? 'Generate Official Form' : 'Scan & Generate'}
        </motion.button>
      </>
    ) : phase === 'preview' ? (
      <>
        <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPhase('compose')}>
          Back
        </button>
        <button type="button" className="ui-btn ui-btn-outline" onClick={downloadPdf}>
          <Download size={15} /> Download PDF
        </button>
        <button type="button" className="ui-btn ui-btn-secondary" onClick={() => accept(true)}>
          <FileStack size={15} /> Save Template & Edit
        </button>
        <motion.button type="button" className="ui-btn ui-btn-primary" onClick={() => accept(true)} {...btnMotion}>
          Open in Builder
        </motion.button>
      </>
    ) : phase === 'refine' ? (
      <>
        <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPhase('preview')}>
          Cancel
        </button>
        <motion.button type="button" className="ui-btn ui-btn-primary" onClick={onRefine} {...btnMotion}>
          Add Fields
        </motion.button>
      </>
    ) : null;

  return (
    <Modal
      open={open}
      title="AI Form Creator"
      subtitle="Trained on essential school forms · generates an official parent PDF form"
      onClose={onClose}
      xl
      autoHeight
      footer={footer}
    >
      {phase === 'compose' || phase === 'generating' ? (
        <>
          <div className="sf-ai-hero">
            <motion.div
              className="sf-ai-orb"
              animate={{ rotate: phase === 'generating' ? 360 : 0, scale: phase === 'generating' ? [1, 1.06, 1] : 1 }}
              transition={{
                rotate: { repeat: phase === 'generating' ? Infinity : 0, duration: 2.4, ease: 'linear' },
                scale: { repeat: phase === 'generating' ? Infinity : 0, duration: 1.4 },
              }}
            >
              <Sparkles size={30} />
            </motion.div>
            <h3>Generate Official Form using AI</h3>
            <p>Pick a form type the AI is trained on, or describe what you need. Preview before saving.</p>
          </div>

          {phase === 'compose' ? (
            <>
              <p className="ui-label">Form knowledge (trained)</p>
              <div className="sf-ai-kind-grid">
                {kinds.map((k) => (
                  <button
                    key={k.kind}
                    type="button"
                    className={`sf-ai-kind ${kindHint === k.kind ? 'is-active' : ''}`}
                    onClick={() => {
                      setKindHint(k.kind);
                      setPrompt(`Create a complete ${k.title} with all essential details for parents to fill on an official school form.`);
                    }}
                  >
                    <strong>{k.title.replace(' Form', '')}</strong>
                    <span>{k.description}</span>
                  </button>
                ))}
              </div>

              <div className="sf-ai-tabs" role="tablist">
                <button type="button" role="tab" className={`sf-ai-tab ${tab === 'prompt' ? 'is-active' : ''}`} onClick={() => setTab('prompt')}>
                  Prompt
                </button>
                <button type="button" role="tab" className={`sf-ai-tab ${tab === 'image' ? 'is-active' : ''}`} onClick={() => setTab('image')}>
                  Image
                </button>
              </div>

              {tab === 'prompt' ? (
                <div className="ui-field">
                  <label className="ui-label" htmlFor="sf-ai-prompt">
                    Prompt
                  </label>
                  <textarea
                    id="sf-ai-prompt"
                    className="ui-textarea"
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && /\.(png|jpe?g|pdf)$/i.test(f.name)) setFileName(f.name);
                    }}
                  />
                  <div
                    className={`sf-dropzone ${dragOver ? 'is-over' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f && /\.(png|jpe?g|pdf)$/i.test(f.name)) setFileName(f.name);
                    }}
                  >
                    {fileName ? <ImagePlus size={28} color="var(--color-accent)" /> : <Upload size={28} color="var(--color-accent)" />}
                    <h4>{fileName ? fileName : 'Drag & drop paper form image'}</h4>
                    <p>Supported: PNG, JPEG, PDF · mock OCR maps to trained essentials</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="sf-ai-progress">
              <div className="sf-progress-bar">
                <motion.div className="sf-progress-fill" animate={{ width: `${progress}%` }} />
              </div>
              {(tab === 'image'
                ? ['Scanning document…', 'OCR field extraction…', 'Matching admission essentials…', 'Building official PDF form…']
                : ['Understanding request…', 'Loading trained form knowledge…', 'Assembling essential sections…', 'Building official PDF form…']
              ).map((label, i) => {
                const done = i < stepIdx || progress === 100;
                const active = i === stepIdx && progress < 100;
                return (
                  <div key={label} className={`sf-ai-step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}>
                    {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="sf-spin" /> : <span>•</span>}
                    {label}
                  </div>
                );
              })}
              <div className="sf-typing">{typed || '…'}</div>
              <div className="sf-skel" />
              <div className="sf-skel" />
            </div>
          )}
        </>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === 'preview' || phase === 'refine' ? (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="sf-meta sf-ai-meta-row">
              <span className="sf-badge sf-badge-published">Detected: {detectedKind}</span>
              <span>{fields.length} fields</span>
              <span>{sectionTitles.length} sections</span>
            </div>

            <p className="ui-label">Sections included</p>
            <div className="sf-ai-sections">
              {sectionTitles.map((s) => (
                <span key={s} className="sf-chip is-active">
                  {s}
                </span>
              ))}
            </div>

            <p className="ui-label">Official PDF preview</p>
            <div className="sf-ai-preview-scroll">
              <OfficialFormDocument title={title} description={description} fields={fields} />
            </div>

            {wantMore === null && phase === 'preview' ? (
              <div className="sf-ai-ask">
                <strong>Would you like to add more fields to any section?</strong>
                <p className="sfb-help">Example: “Add sibling name and transport required under section 5”</p>
                <div className="sf-ai-ask-actions">
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => {
                      setWantMore(true);
                      setPhase('refine');
                    }}
                  >
                    Yes, add more
                  </button>
                  <button type="button" className="ui-btn ui-btn-outline" onClick={() => setWantMore(false)}>
                    No, this looks complete
                  </button>
                </div>
              </div>
            ) : null}

            {phase === 'refine' ? (
              <div className="ui-field sf-ai-refine-field">
                <label className="ui-label" htmlFor="sf-ai-refine">
                  Describe fields to add (and which section)
                </label>
                <textarea
                  id="sf-ai-refine"
                  className="ui-textarea"
                  rows={4}
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="Add Sibling Name, Sibling Age under section 2&#10;Add Transport Required and Bus Route"
                />
              </div>
            ) : null}

            {wantMore === false ? (
              <p className="sfb-help sf-ai-refine-field">
                Ready — download the PDF, save as template, or open in the form builder to edit further.
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div className="sf-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}

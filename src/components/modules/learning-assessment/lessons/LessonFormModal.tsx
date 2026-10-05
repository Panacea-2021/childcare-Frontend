'use client';

import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignLeft,
  BookOpen,
  Clock3,
  Layers,
  Sparkles,
  Tag,
  Users,
  Video,
  X,
} from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { loadRooms } from '@/lib/center-management/roomsStore';
import { AGE_BANDS, DURATION_OPTIONS, LESSON_SETS } from './constants';
import { AddDevelopmentAreaPopup, AddLabelPopup } from './NamePopups';
import { MediaUploader } from './MediaUploader';
import { MultiSelect } from './MultiSelect';
import { RichTextEditor } from './RichTextEditor';
import {
  addDevelopmentArea,
  addLessonLabel,
  extractYoutubeId,
  isValidYoutubeUrl,
  loadDevelopmentAreas,
  loadLessonLabels,
} from './store';
import type { Lesson, LessonFormState, LessonLabel, LessonStatus } from './types';
import { emptyLessonForm } from './types';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Lesson | null;
  onClose: () => void;
  onSave: (form: LessonFormState) => Promise<void> | void;
  onOpenAi: (apply: (html: string) => void, prefill?: Partial<LessonFormState>) => void;
};

function FloatingText({
  id,
  label,
  icon,
  error,
  className = '',
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`cal-float-field ${className}`}>
      <div className="cal-float-shell">
        <span className="cal-float-icon" aria-hidden>
          {icon}
        </span>
        <div className="cal-float-control">
          {children}
          <label htmlFor={id} className="cal-float-label">
            {label}
          </label>
        </div>
      </div>
      {error ? <p className="cal-field-error">{error}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  delay = 0,
  action,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
  action?: ReactNode;
}) {
  return (
    <motion.section
      className="cal-form-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      whileHover={{ y: -1 }}
    >
      <header className="cal-form-section-head">
        <motion.span
          className="cal-form-section-ico"
          aria-hidden
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          {icon}
        </motion.span>
        <h3>{title}</h3>
        {action ? <div className="les-section-action">{action}</div> : null}
      </header>
      <div className="cal-form-section-body">{children}</div>
    </motion.section>
  );
}

function lessonToForm(lesson: Lesson): LessonFormState {
  const presets = DURATION_OPTIONS.filter((d) => d !== 'Custom') as readonly string[];
  const isPreset = presets.includes(lesson.duration);
  return {
    title: lesson.title,
    lessonSet: lesson.lessonSet,
    roomId: lesson.roomId,
    ageBand: lesson.ageBand,
    developmentAreas: [...lesson.developmentAreas],
    labels: [...lesson.labels],
    duration: isPreset ? lesson.duration : 'Custom',
    customDuration: isPreset ? '' : lesson.customDuration || lesson.duration,
    descriptionHtml: lesson.descriptionHtml,
    youtubeUrl: lesson.youtubeUrl,
    attachments: [...lesson.attachments],
    status: lesson.status === 'Archived' ? 'Draft' : lesson.status,
  };
}

export function LessonFormModal({ open, mode, initial, onClose, onSave, onOpenAi }: Props) {
  const titleId = useId();
  const [form, setForm] = useState<LessonFormState>(emptyLessonForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [allLabels, setAllLabels] = useState<LessonLabel[]>([]);
  const [areaPopup, setAreaPopup] = useState(false);
  const [labelPopup, setLabelPopup] = useState(false);

  const rooms = useMemo(() => loadRooms(), [open]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setAreas(loadDevelopmentAreas());
    setAllLabels(loadLessonLabels());
    setForm(initial ? lessonToForm(initial) : emptyLessonForm());
    setErrors({});
    setSaving(false);
    setSaved(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const set = <K extends keyof LessonFormState>(key: K, value: LessonFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const ytId = extractYoutubeId(form.youtubeUrl);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Lesson title is required';
    if (!form.lessonSet) next.lessonSet = 'Select a lesson set';
    if (!form.roomId) next.roomId = 'Select a room';
    if (!form.ageBand) next.ageBand = 'Select an age band';
    if (form.duration === 'Custom' && !form.customDuration.trim()) {
      next.customDuration = 'Enter a custom duration';
    }
    if (!isValidYoutubeUrl(form.youtubeUrl)) next.youtubeUrl = 'Enter a valid YouTube URL';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (status?: LessonStatus) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, status: status ?? form.status };
      await onSave(payload);
      setSaved(true);
      await new Promise((r) => setTimeout(r, 450));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              className="cal-dialog-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            >
              <motion.div
                className="cal-dialog les-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="cal-dialog-header">
                  <div className="cal-dialog-title-block">
                    <span className="cal-dialog-emoji" aria-hidden>
                      📚
                    </span>
                    <div>
                      <h2 id={titleId}>{mode === 'edit' ? 'Edit Lesson' : 'New Lesson'}</h2>
                      <p>
                        {mode === 'edit'
                          ? 'Update lesson plan details'
                          : 'Create and organize a new lesson plan'}
                      </p>
                    </div>
                  </div>
                  <div className="les-header-actions">
                    <button
                      type="button"
                      className="les-ai-btn"
                      onClick={() =>
                        onOpenAi((html) => set('descriptionHtml', html), form)
                      }
                    >
                      <Sparkles size={15} aria-hidden />
                      Write with AI
                    </button>
                    <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                      <X size={18} />
                    </button>
                  </div>
                </header>

                <div className="cal-dialog-body">
                  <SectionCard title="Basics" icon={<Layers size={15} />} delay={0.04}>
                    <div className="cal-modal-grid">
                      <FloatingText
                        id="lesson-title"
                        label="Lesson Title *"
                        icon={<Tag size={16} />}
                        error={errors.title}
                        className="cal-span-2"
                      >
                        <input
                          id="lesson-title"
                          className="cal-float-input"
                          placeholder=" "
                          value={form.title}
                          onChange={(e) => set('title', e.target.value)}
                          aria-invalid={Boolean(errors.title)}
                        />
                      </FloatingText>
                      <PremiumSelect
                        id="lesson-set"
                        placeholder="Lesson Set *"
                        icon={<BookOpen size={16} />}
                        value={form.lessonSet}
                        error={errors.lessonSet}
                        searchable
                        onChange={(v) => set('lessonSet', v)}
                        options={LESSON_SETS.map((s) => ({ value: s, label: s }))}
                      />
                      <PremiumSelect
                        id="lesson-room"
                        placeholder="Room *"
                        icon={<Users size={16} />}
                        value={form.roomId}
                        error={errors.roomId}
                        searchable
                        onChange={(v) => set('roomId', v)}
                        options={rooms
                          .filter((r) => r.status !== 'Inactive')
                          .map((r) => ({ value: r.id, label: r.name }))}
                      />
                      <PremiumSelect
                        id="lesson-age"
                        className="cal-span-2"
                        placeholder="Age Band *"
                        icon={<Users size={16} />}
                        value={form.ageBand}
                        error={errors.ageBand}
                        searchable
                        onChange={(v) => set('ageBand', v)}
                        options={AGE_BANDS.map((a) => ({ value: a, label: a }))}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Content" icon={<AlignLeft size={15} />} delay={0.08}>
                    <div className="cal-modal-grid">
                      <div className="cal-span-2">
                        <span className="les-field-label">Description</span>
                        <RichTextEditor
                          value={form.descriptionHtml}
                          onChange={(html) => set('descriptionHtml', html)}
                        />
                      </div>
                      <PremiumSelect
                        id="lesson-duration"
                        placeholder="Duration"
                        icon={<Clock3 size={16} />}
                        value={form.duration}
                        searchable
                        onChange={(v) => set('duration', v)}
                        options={DURATION_OPTIONS.map((d) => ({ value: d, label: d }))}
                      />
                      {form.duration === 'Custom' ? (
                        <FloatingText
                          id="custom-duration"
                          label="Custom Duration *"
                          icon={<Clock3 size={16} />}
                          error={errors.customDuration}
                        >
                          <input
                            id="custom-duration"
                            className="cal-float-input"
                            placeholder=" "
                            value={form.customDuration}
                            onChange={(e) => set('customDuration', e.target.value)}
                          />
                        </FloatingText>
                      ) : (
                        <div />
                      )}
                      <FloatingText
                        id="youtube-url"
                        label="YouTube Link"
                        icon={<Video size={16} />}
                        error={errors.youtubeUrl}
                        className="cal-span-2"
                      >
                        <input
                          id="youtube-url"
                          className="cal-float-input"
                          placeholder=" "
                          value={form.youtubeUrl}
                          onChange={(e) => set('youtubeUrl', e.target.value)}
                        />
                      </FloatingText>
                      {ytId ? (
                        <div className="cal-span-2 les-yt-preview">
                          <iframe
                            title="YouTube preview"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : null}
                    </div>
                  </SectionCard>

                  <SectionCard title="Development Areas" icon={<Sparkles size={15} />} delay={0.12}>
                    <MultiSelect
                      id="dev-areas"
                      placeholder="Select development areas"
                      icon={<Sparkles size={16} />}
                      values={form.developmentAreas}
                      error={errors.developmentAreas}
                      options={areas.map((a) => ({ value: a, label: a }))}
                      onChange={(v) => set('developmentAreas', v)}
                      onAddNew={() => setAreaPopup(true)}
                      addNewLabel="+ Add Development Area"
                    />
                  </SectionCard>

                  <SectionCard title="Labels" icon={<Tag size={15} />} delay={0.14}>
                    <MultiSelect
                      id="labels"
                      placeholder="Select labels"
                      icon={<Tag size={16} />}
                      values={form.labels.map((l) => l.id)}
                      options={allLabels.map((l) => ({
                        value: l.id,
                        label: l.name,
                        color: l.color,
                      }))}
                      onChange={(ids) =>
                        set(
                          'labels',
                          allLabels.filter((l) => ids.includes(l.id)),
                        )
                      }
                      onAddNew={() => setLabelPopup(true)}
                      addNewLabel="+ Add Label"
                    />
                  </SectionCard>

                  <SectionCard title="Media" icon={<Layers size={15} />} delay={0.16}>
                    <MediaUploader
                      attachments={form.attachments}
                      onChange={(atts) => set('attachments', atts)}
                    />
                  </SectionCard>

                  <SectionCard title="Status" icon={<BookOpen size={15} />} delay={0.18}>
                    <PremiumSelect
                      id="lesson-status"
                      placeholder="Status"
                      value={form.status}
                      onChange={(v) => set('status', v as LessonStatus)}
                      options={[
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Published', label: 'Published' },
                      ]}
                    />
                  </SectionCard>
                </div>

                <footer className="cal-dialog-footer">
                  <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    disabled={saving}
                    onClick={() => submit('Draft')}
                  >
                    Save as Draft
                  </button>
                  <button type="button" className="cal-btn-save" onClick={() => submit()} disabled={saving}>
                    <span className="cal-btn-save-shine" aria-hidden />
                    {saving ? (
                      <span className="cal-saving">
                        <span className="cal-spinner" aria-hidden />
                        Saving…
                      </span>
                    ) : saved ? (
                      'Saved ✓'
                    ) : mode === 'edit' ? (
                      'Save Changes'
                    ) : (
                      'Save Lesson'
                    )}
                  </button>
                </footer>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}

      <AddDevelopmentAreaPopup
        open={areaPopup}
        onClose={() => setAreaPopup(false)}
        onSave={(name) => {
          const next = addDevelopmentArea(name);
          setAreas(next);
          setForm((f) => ({
            ...f,
            developmentAreas: f.developmentAreas.includes(name)
              ? f.developmentAreas
              : [...f.developmentAreas, name],
          }));
        }}
      />
      <AddLabelPopup
        open={labelPopup}
        onClose={() => setLabelPopup(false)}
        onSave={(name, color) => {
          const next = addLessonLabel(name, color);
          setAllLabels(next);
          const created = next.find((l) => l.name.toLowerCase() === name.toLowerCase());
          if (created) {
            setForm((f) => ({
              ...f,
              labels: f.labels.some((l) => l.id === created.id) ? f.labels : [...f.labels, created],
            }));
          }
        }}
      />
    </>
  );
}

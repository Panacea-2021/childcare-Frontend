'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  AlignLeft,
  Bell,
  CalendarRange,
  Clock3,
  FileUp,
  ImagePlus,
  Layers,
  MessageSquareOff,
  Paperclip,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { PremiumSelect } from '../PremiumSelect';
import { PremiumDateField } from '../PremiumDateField';
import { PremiumTimeField } from '../PremiumTimeField';
import type { SchoolEvent, SchoolEventAttachment, SchoolEventFormState } from './types';
import { SCHOOL_CLASSROOMS } from './types';
import {
  categoryOptions,
  emptyEventForm,
  eventToForm,
  fileSizeLabel,
  fileTypeFromName,
} from './mockData';
import { EventCover } from './EventCover';

type Props = {
  open: boolean;
  mode: 'add' | 'edit';
  editing: SchoolEvent | null;
  onClose: () => void;
  onSubmit: (form: SchoolEventFormState) => Promise<void> | void;
};

const DESC_MAX = 500;

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
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <m.section
      className="cal-form-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      whileHover={{ y: -1 }}
    >
      <header className="cal-form-section-head">
        <m.span
          className="cal-form-section-ico"
          aria-hidden
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          {icon}
        </m.span>
        <h3>{title}</h3>
      </header>
      <div className="cal-form-section-body">{children}</div>
    </m.section>
  );
}

function ToggleRow({
  id,
  label,
  helper,
  checked,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  helper: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: ReactNode;
}) {
  return (
    <label htmlFor={id} className={`sc-toggle-row ${checked ? 'is-on' : ''}`}>
      <span className="sc-toggle-ico" aria-hidden>
        {icon}
      </span>
      <span className="sc-toggle-copy">
        <span className="sc-toggle-label">{label}</span>
        <span className="sc-toggle-helper">{helper}</span>
      </span>
      <span className="sc-switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="sc-switch-track" aria-hidden>
          <span className="sc-switch-thumb" />
        </span>
      </span>
    </label>
  );
}

export function EventFormModal({ open, mode, editing, onClose, onSubmit }: Props) {
  const titleId = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<SchoolEventFormState>(emptyEventForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragCover, setDragCover] = useState(false);
  const [dragFiles, setDragFiles] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? eventToForm(editing) : emptyEventForm());
    setErrors({});
    setSaving(false);
    setSaved(false);
  }, [open, editing]);

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

  const set = <K extends keyof SchoolEventFormState>(key: K, value: SchoolEventFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleClassroom = (room: string) => {
    setForm((f) => ({
      ...f,
      classrooms: f.classrooms.includes(room)
        ? f.classrooms.filter((c) => c !== room)
        : [...f.classrooms, room],
    }));
  };

  const readCover = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('coverUrl', String(reader.result ?? ''));
      set('coverFileName', file.name);
    };
    reader.readAsDataURL(file);
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: SchoolEventAttachment[] = Array.from(fileList).map((file) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      sizeLabel: fileSizeLabel(file.size),
      type: fileTypeFromName(file.name),
    }));
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...next] }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Event name is required';
    if (!form.category) next.category = 'Select a category';
    if (!form.classrooms.length) next.classrooms = 'Select at least one classroom';
    if (!form.startDate) next.startDate = 'Select start date';
    if (!form.endDate) next.endDate = 'Select end date';
    if (!form.startTime) next.startTime = 'Select start time';
    if (!form.endTime) next.endTime = 'Select end time';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSubmit(form);
      setSaved(true);
      await new Promise((r) => setTimeout(r, 450));
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
              className="cal-dialog-backdrop"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
            >
              <m.div
                className="cal-dialog sc-dialog"
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
                      📅
                    </span>
                    <div>
                      <h2 id={titleId}>{mode === 'edit' ? 'Edit School Event' : 'Add School Event'}</h2>
                      <p>
                        {mode === 'edit'
                          ? 'Update event details, schedule and notifications'
                          : 'Create a new school event with cover, schedule and attachments'}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                  </button>
                </header>

                <div className="cal-dialog-body">
                  <SectionCard title="Cover Photo" icon={<ImagePlus size={15} />} delay={0.02}>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) readCover(file);
                        e.target.value = '';
                      }}
                    />
                    {form.coverUrl ? (
                      <div className="sc-cover-preview">
                        <EventCover
                          coverUrl={form.coverUrl}
                          category={form.category || 'Event'}
                          name={form.name || 'Cover'}
                          size="hero"
                        />
                        <div className="sc-cover-actions">
                          <button
                            type="button"
                            className="cal-btn-ghost"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            className="cal-btn-ghost sc-btn-danger-text"
                            onClick={() => {
                              set('coverUrl', '');
                              set('coverFileName', '');
                            }}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`sc-dropzone ${dragCover ? 'is-drag' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragCover(true);
                        }}
                        onDragLeave={() => setDragCover(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragCover(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) readCover(file);
                        }}
                      >
                        <div className="sc-dropzone-art" aria-hidden>
                          <ImagePlus size={28} />
                        </div>
                        <p className="sc-dropzone-title">Drag & drop a cover photo</p>
                        <p className="sc-dropzone-sub">PNG, JPG or WEBP up to 5MB</p>
                        <button
                          type="button"
                          className="cal-btn-add sc-dropzone-btn"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          <span className="cal-btn-save-shine" aria-hidden />
                          Browse File
                        </button>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Event Information" icon={<Tag size={15} />} delay={0.06}>
                    <div className="cal-modal-grid">
                      <FloatingText
                        id="sc-event-name"
                        label="Event Name *"
                        icon={<Tag size={16} />}
                        error={errors.name}
                        className="cal-span-2"
                      >
                        <input
                          id="sc-event-name"
                          className="cal-float-input"
                          placeholder=" "
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                          aria-invalid={Boolean(errors.name)}
                        />
                      </FloatingText>

                      <PremiumSelect
                        id="sc-event-category"
                        placeholder="Category *"
                        icon={<Layers size={16} />}
                        value={form.category}
                        error={errors.category}
                        onChange={(v) => set('category', v as SchoolEventFormState['category'])}
                        options={categoryOptions()}
                      />

                      <div className="cal-span-2">
                        <span className="sc-field-label" id="sc-rooms-label">
                          <Users size={14} aria-hidden /> Applicable Classrooms *
                        </span>
                        <div className="sc-chip-picker" role="group" aria-labelledby="sc-rooms-label">
                          {SCHOOL_CLASSROOMS.map((room) => {
                            const on = form.classrooms.includes(room);
                            return (
                              <m.button
                                key={room}
                                type="button"
                                className={`sc-pick-chip ${on ? 'is-on' : ''}`}
                                aria-pressed={on}
                                onClick={() => toggleClassroom(room)}
                                whileTap={{ scale: 0.95 }}
                              >
                                {room}
                              </m.button>
                            );
                          })}
                        </div>
                        {errors.classrooms ? <p className="cal-field-error">{errors.classrooms}</p> : null}
                      </div>

                      <FloatingText
                        id="sc-event-desc"
                        label="Event Description"
                        icon={<AlignLeft size={16} />}
                        className="cal-span-2"
                      >
                        <textarea
                          id="sc-event-desc"
                          className={`cal-float-input cal-float-textarea ${form.description ? 'has-value' : ''}`}
                          rows={4}
                          placeholder=" "
                          maxLength={DESC_MAX}
                          value={form.description}
                          onChange={(e) => set('description', e.target.value)}
                        />
                      </FloatingText>
                      <p className="sc-char-count cal-span-2">
                        {form.description.length}/{DESC_MAX}
                      </p>
                    </div>
                  </SectionCard>

                  <SectionCard title="Event Schedule" icon={<CalendarRange size={15} />} delay={0.1}>
                    <div className="cal-modal-grid">
                      <PremiumDateField
                        id="sc-start-date"
                        placeholder="Start Date"
                        value={form.startDate}
                        error={errors.startDate}
                        onChange={(v) => set('startDate', v)}
                      />
                      <PremiumDateField
                        id="sc-end-date"
                        placeholder="End Date"
                        value={form.endDate}
                        error={errors.endDate}
                        onChange={(v) => set('endDate', v)}
                      />
                      <PremiumTimeField
                        id="sc-start-time"
                        placeholder="Start Time"
                        value={form.startTime}
                        error={errors.startTime}
                        onChange={(v) => set('startTime', v)}
                        icon={<Clock3 size={16} />}
                      />
                      <PremiumTimeField
                        id="sc-end-time"
                        placeholder="End Time"
                        value={form.endTime}
                        error={errors.endTime}
                        onChange={(v) => set('endTime', v)}
                        icon={<Clock3 size={16} />}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Staff Settings" icon={<Bell size={15} />} delay={0.14}>
                    <div className="sc-toggle-stack">
                      <ToggleRow
                        id="sc-staff-only"
                        label="Staff Only"
                        helper="Hide this event from the parent portal"
                        checked={form.staffOnly}
                        onChange={(v) => set('staffOnly', v)}
                        icon={<Users size={15} />}
                      />
                      <ToggleRow
                        id="sc-notify-staff"
                        label="Send Notification to Staff"
                        helper="Alert assigned staff when this event is saved"
                        checked={form.notifyStaff}
                        onChange={(v) => set('notifyStaff', v)}
                        icon={<Bell size={15} />}
                      />
                      <ToggleRow
                        id="sc-notify-parents"
                        label="Send Notification to Parents"
                        helper="Notify families linked to selected classrooms"
                        checked={form.notifyParents}
                        onChange={(v) => set('notifyParents', v)}
                        icon={<Bell size={15} />}
                      />
                      <ToggleRow
                        id="sc-disable-comments"
                        label="Disable Comments"
                        helper="Turn off discussion under this event"
                        checked={form.disableComments}
                        onChange={(v) => set('disableComments', v)}
                        icon={<MessageSquareOff size={15} />}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Attach Files" icon={<Paperclip size={15} />} delay={0.18}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,image/*"
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <div
                      className={`sc-dropzone sc-dropzone--files ${dragFiles ? 'is-drag' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragFiles(true);
                      }}
                      onDragLeave={() => setDragFiles(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragFiles(false);
                        addFiles(e.dataTransfer.files);
                      }}
                    >
                      <div className="sc-dropzone-art" aria-hidden>
                        <FileUp size={26} />
                      </div>
                      <p className="sc-dropzone-title">Drag & drop files here</p>
                      <p className="sc-dropzone-sub">PDF, Images, Word, Excel, PowerPoint, ZIP</p>
                      <button
                        type="button"
                        className="cal-btn-ghost"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </button>
                    </div>
                    {form.attachments.length ? (
                      <ul className="sc-file-list">
                        {form.attachments.map((file) => (
                          <li key={file.id} className="sc-file-card">
                            <span className={`sc-file-type sc-file-type--${file.type}`} aria-hidden>
                              {file.type.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="sc-file-meta">
                              <span className="sc-file-name">{file.name}</span>
                              <span className="sc-file-size">{file.sizeLabel}</span>
                            </span>
                            <button
                              type="button"
                              className="sc-action-btn sc-action-btn--danger"
                              aria-label={`Remove ${file.name}`}
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  attachments: f.attachments.filter((a) => a.id !== file.id),
                                }))
                              }
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </SectionCard>
                </div>

                <footer className="cal-dialog-footer">
                  <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" className="cal-btn-save" onClick={submit} disabled={saving}>
                    <span className="cal-btn-save-shine" aria-hidden />
                    {saving ? (
                      <span className="cal-saving">
                        <span className="cal-spinner" aria-hidden />
                        Saving…
                      </span>
                    ) : saved ? (
                      'Saved ✓'
                    ) : mode === 'edit' ? (
                      'Update Event'
                    ) : (
                      'Save Event'
                    )}
                  </button>
                </footer>
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>,
    document.body,
  );
}

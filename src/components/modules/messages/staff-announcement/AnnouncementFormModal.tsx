'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignLeft,
  Building2,
  Check,
  FileArchive,
  FileImage,
  FileText,
  Globe,
  Link2,
  Mail,
  Megaphone,
  MessageSquare,
  Paperclip,
  Send,
  Smartphone,
  Tag,
  Trash2,
  Type,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react';
import { PremiumDateField } from '@/components/modules/calendar/PremiumDateField';
import { PremiumTimeField } from '@/components/modules/calendar/PremiumTimeField';
import type {
  AnnouncementAttachment,
  AnnouncementFormValues,
  DeliveryMethod,
  FormErrors,
} from './types';
import { roomOptions, staffOptions } from './mockData';
import {
  NOTE_MAX,
  acceptFile,
  fileIconKind,
  formatFileSize,
  isValidUrl,
  linkPreviewKind,
  validateForm,
} from './utils';

type Props = {
  open: boolean;
  mode: 'create' | 'edit' | 'preview';
  initial: AnnouncementFormValues;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
  onPreview?: (values: AnnouncementFormValues) => void;
  onBackFromPreview?: (values: AnnouncementFormValues) => void;
};

const METHOD_CARDS: {
  id: DeliveryMethod;
  label: string;
  hint: string;
  Icon: typeof Mail;
  className: string;
}[] = [
  { id: 'email', label: 'Email', hint: 'Inbox delivery', Icon: Mail, className: 'email' },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Instant chat', Icon: MessageSquare, className: 'whatsapp' },
  { id: 'sms', label: 'SMS', hint: 'Text message', Icon: Smartphone, className: 'sms' },
];

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
      </header>
      <div className="cal-form-section-body">{children}</div>
    </motion.section>
  );
}

function FileKindIcon({ name }: { name: string }) {
  const kind = fileIconKind(name);
  if (kind === 'image') return <FileImage size={18} />;
  if (kind === 'zip') return <FileArchive size={18} />;
  return <FileText size={18} />;
}

function LinkIcon({ url }: { url: string }) {
  const kind = linkPreviewKind(url);
  if (kind === 'youtube') return <Video size={16} />;
  if (kind === 'drive') return <FileText size={16} />;
  if (kind === 'meet') return <Link2 size={16} />;
  if (kind === 'web') return <Globe size={16} />;
  return null;
}

export function AnnouncementFormModal({
  open,
  mode,
  initial,
  submitting,
  onClose,
  onSubmit,
  onPreview,
  onBackFromPreview,
}: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<AnnouncementFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [staffQuery, setStaffQuery] = useState('');
  const [staffOpen, setStaffOpen] = useState(false);
  const [roomQuery, setRoomQuery] = useState('');
  const [roomOpen, setRoomOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const staffWrapRef = useRef<HTMLDivElement>(null);
  const roomWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setValues(initial);
      setErrors({});
      setStaffQuery('');
      setRoomQuery('');
      setStaffOpen(false);
      setRoomOpen(false);
      setDragOver(false);
    }
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

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (staffWrapRef.current && !staffWrapRef.current.contains(t)) setStaffOpen(false);
      if (roomWrapRef.current && !roomWrapRef.current.contains(t)) setRoomOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const patch = <K extends keyof AnnouncementFormValues>(key: K, value: AnnouncementFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const filteredStaff = useMemo(() => {
    const q = staffQuery.trim().toLowerCase();
    return staffOptions.filter(
      (s) =>
        !values.staffIds.includes(s.id) &&
        (!q || s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)),
    );
  }, [staffQuery, values.staffIds]);

  const filteredRooms = useMemo(() => {
    const q = roomQuery.trim().toLowerCase();
    return roomOptions.filter(
      (r) => !q || r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q),
    );
  }, [roomQuery]);

  const selectedRoom = roomOptions.find((r) => r.id === values.roomId) ?? null;

  const toggleMethod = (m: DeliveryMethod) => {
    const next = values.methods.includes(m)
      ? values.methods.filter((x) => x !== m)
      : [...values.methods, m];
    patch('methods', next);
  };

  const addStaff = (id: string) => {
    patch('staffIds', [...values.staffIds, id]);
    setStaffQuery('');
  };

  const removeStaff = (id: string) => {
    patch(
      'staffIds',
      values.staffIds.filter((x) => x !== id),
    );
  };

  const simulateUpload = (files: FileList | File[]) => {
    const list = Array.from(files).filter(acceptFile);
    list.forEach((file) => {
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: AnnouncementAttachment = {
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        progress: 0,
      };
      setValues((prev) => ({ ...prev, attachments: [...prev.attachments, item] }));
      let p = 0;
      const timer = window.setInterval(() => {
        p += 18 + Math.random() * 22;
        if (p >= 100) {
          p = 100;
          window.clearInterval(timer);
          setValues((prev) => ({
            ...prev,
            attachments: prev.attachments.map((a) =>
              a.id === id ? { ...a, progress: undefined } : a,
            ),
          }));
        } else {
          setValues((prev) => ({
            ...prev,
            attachments: prev.attachments.map((a) => (a.id === id ? { ...a, progress: p } : a)),
          }));
        }
      }, 160);
    });
  };

  const removeFile = (id: string) => {
    patch(
      'attachments',
      values.attachments.filter((a) => a.id !== id),
    );
  };

  const handleSubmit = () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  };

  const handlePreview = () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onPreview?.(values);
  };

  const isPreview = mode === 'preview';
  const heading =
    mode === 'edit' ? 'Edit Announcement' : mode === 'preview' ? 'Preview Announcement' : 'Post Announcement';
  const subtitle =
    mode === 'edit'
      ? 'Update and resend this staff announcement'
      : mode === 'preview'
        ? 'Review before posting to staff'
        : 'Create a new announcement for staff or rooms';

  const linkOk = !values.referenceLink.trim() || isValidUrl(values.referenceLink);
  const primaryLabel =
    mode === 'edit' ? 'Save Changes' : submitting ? 'Posting…' : 'Post Announcement';

  if (!mounted) return null;

  return createPortal(
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
            className="cal-dialog sa-ann-dialog"
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
                  📣
                </span>
                <div>
                  <h2 id={titleId}>{heading}</h2>
                  <p>{subtitle}</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              {isPreview ? (
                <SectionCard title="Preview" icon={<Megaphone size={15} />} delay={0.04}>
                  <div className="sa-preview-box">
                    <h3>{values.title}</h3>
                    <p style={{ marginBottom: 12 }}>
                      {values.date} · {values.time} · {values.mode === 'staff' ? 'Staff' : 'Room'} ·{' '}
                      {values.methods.join(', ').toUpperCase()}
                    </p>
                    <p>{values.note}</p>
                  </div>
                </SectionCard>
              ) : (
                <>
                  <SectionCard title="Announcement Details" icon={<Megaphone size={15} />} delay={0.04}>
                    <div className="cal-modal-grid">
                      <PremiumDateField
                        id="ann-date"
                        placeholder="Announcement Date"
                        value={values.date}
                        error={errors.date}
                        onChange={(v) => patch('date', v)}
                      />
                      <PremiumTimeField
                        id="ann-time"
                        placeholder="Announcement Time"
                        value={values.time}
                        error={errors.time}
                        onChange={(v) => patch('time', v)}
                      />
                      <FloatingText
                        id="ann-title"
                        label="Announcement Title *"
                        icon={<Type size={16} />}
                        error={errors.title}
                        className="cal-span-2"
                      >
                        <input
                          id="ann-title"
                          className="cal-float-input"
                          placeholder=" "
                          value={values.title}
                          onChange={(e) => patch('title', e.target.value)}
                          aria-invalid={Boolean(errors.title)}
                        />
                      </FloatingText>
                      <FloatingText
                        id="ann-note"
                        label="Announcement Note *"
                        icon={<AlignLeft size={16} />}
                        error={errors.note}
                        className="cal-span-2"
                      >
                        <textarea
                          id="ann-note"
                          className={`cal-float-input cal-float-textarea ${values.note ? 'has-value' : ''}`}
                          rows={5}
                          placeholder=" "
                          value={values.note}
                          onChange={(e) => patch('note', e.target.value)}
                          aria-invalid={Boolean(errors.note)}
                        />
                      </FloatingText>
                      <div className="cal-span-2">
                        <div
                          className={`sa-char-count ${
                            values.note.length > NOTE_MAX
                              ? 'over'
                              : values.note.length > NOTE_MAX * 0.85
                                ? 'warn'
                                : ''
                          }`}
                        >
                          {values.note.length} / {NOTE_MAX}
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Mode" icon={<Users size={15} />} delay={0.08}>
                    <div className="sa-mode-grid">
                      <motion.button
                        type="button"
                        className={`sa-mode-card ${values.mode === 'staff' ? 'is-active' : ''}`}
                        onClick={() => patch('mode', 'staff')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span
                          className="sa-mode-icon"
                          animate={values.mode === 'staff' ? { rotate: [0, -6, 6, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Users size={20} />
                        </motion.span>
                        <div>
                          <strong>Staff</strong>
                          <small>Notify selected staff members</small>
                        </div>
                      </motion.button>
                      <motion.button
                        type="button"
                        className={`sa-mode-card ${values.mode === 'room' ? 'is-active' : ''}`}
                        onClick={() => patch('mode', 'room')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span
                          className="sa-mode-icon"
                          animate={values.mode === 'room' ? { y: [0, -3, 0] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Building2 size={20} />
                        </motion.span>
                        <div>
                          <strong>Room</strong>
                          <small>Notify everyone in a room</small>
                        </div>
                      </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                      {values.mode === 'staff' ? (
                        <motion.div
                          key="staff"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="sa-mode-field"
                          ref={staffWrapRef}
                        >
                          <FloatingText
                            id="notify-staff"
                            label="Notify Staff *"
                            icon={<Users size={16} />}
                            error={errors.staffIds}
                          >
                            <input
                              id="notify-staff"
                              className="cal-float-input"
                              placeholder=" "
                              value={staffQuery}
                              onChange={(e) => {
                                setStaffQuery(e.target.value);
                                setStaffOpen(true);
                              }}
                              onFocus={() => setStaffOpen(true)}
                              aria-invalid={Boolean(errors.staffIds)}
                            />
                          </FloatingText>
                          <div className="sa-multi-wrap">
                            {staffOpen && filteredStaff.length > 0 ? (
                              <div className="sa-multi-panel" role="listbox">
                                {filteredStaff.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    className="sa-multi-option"
                                    onClick={() => addStaff(s.id)}
                                  >
                                    <span className="sa-chip-avatar">{s.avatar}</span>
                                    <span>
                                      <strong style={{ display: 'block', fontSize: '0.86rem' }}>{s.name}</strong>
                                      <small style={{ color: 'var(--text-secondary)' }}>
                                        {s.role} · {s.department}
                                      </small>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="sa-chips">
                            <AnimatePresence>
                              {values.staffIds.map((id) => {
                                const s = staffOptions.find((x) => x.id === id);
                                if (!s) return null;
                                return (
                                  <motion.span
                                    key={id}
                                    className="sa-chip"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    layout
                                  >
                                    <span className="sa-chip-avatar">{s.avatar}</span>
                                    {s.name}
                                    <button
                                      type="button"
                                      className="sa-chip-x"
                                      aria-label={`Remove ${s.name}`}
                                      onClick={() => removeStaff(id)}
                                    >
                                      <X size={12} />
                                    </button>
                                  </motion.span>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="room"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="sa-mode-field"
                          ref={roomWrapRef}
                        >
                          <FloatingText
                            id="select-room"
                            label="Select Room *"
                            icon={<Building2 size={16} />}
                            error={errors.roomId}
                          >
                            <input
                              id="select-room"
                              className="cal-float-input"
                              placeholder=" "
                              value={roomQuery || (selectedRoom?.name ?? '')}
                              onChange={(e) => {
                                setRoomQuery(e.target.value);
                                setRoomOpen(true);
                                if (values.roomId) patch('roomId', '');
                              }}
                              onFocus={() => {
                                setRoomOpen(true);
                                setRoomQuery('');
                              }}
                              aria-invalid={Boolean(errors.roomId)}
                            />
                          </FloatingText>
                          <div className="sa-multi-wrap">
                            {roomOpen ? (
                              <div className="sa-multi-panel" role="listbox">
                                {filteredRooms.map((r) => (
                                  <button
                                    key={r.id}
                                    type="button"
                                    className={`sa-multi-option ${values.roomId === r.id ? 'is-selected' : ''}`}
                                    onClick={() => {
                                      patch('roomId', r.id);
                                      setRoomQuery('');
                                      setRoomOpen(false);
                                    }}
                                  >
                                    <span className="sa-mode-icon" style={{ width: 34, height: 34 }}>
                                      <Building2 size={16} />
                                    </span>
                                    <span>
                                      <strong style={{ display: 'block', fontSize: '0.86rem' }}>{r.name}</strong>
                                      <small style={{ color: 'var(--text-secondary)' }}>
                                        {r.department} · {r.floor}
                                      </small>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <AnimatePresence>
                            {selectedRoom ? (
                              <motion.div
                                className="sa-room-preview"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <h4>{selectedRoom.name}</h4>
                                <div className="sa-room-stats">
                                  <span className="sa-meta-chip">Total Staff: {selectedRoom.staffCount}</span>
                                  <span className="sa-meta-chip muted">{selectedRoom.department}</span>
                                  <span className="sa-meta-chip muted">{selectedRoom.floor}</span>
                                </div>
                                <div className="sa-avatar-stack">
                                  {selectedRoom.staffAvatars.map((av) => (
                                    <span key={av}>{av}</span>
                                  ))}
                                </div>
                                <p style={{ marginTop: 10 }}>
                                  All staff inside this room will receive this announcement.
                                </p>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SectionCard>

                  <SectionCard title="Send Via" icon={<Send size={15} />} delay={0.12}>
                    <div className="sa-method-grid">
                      {METHOD_CARDS.map((card) => {
                        const active = values.methods.includes(card.id);
                        const Icon = card.Icon;
                        return (
                          <motion.button
                            key={card.id}
                            type="button"
                            className={`sa-method-card ${card.className} ${active ? 'is-active' : ''}`}
                            onClick={() => toggleMethod(card.id)}
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {active ? (
                              <span className="sa-method-check" aria-hidden>
                                <Check size={12} strokeWidth={3} />
                              </span>
                            ) : null}
                            <span className="sa-method-ico">
                              <Icon size={22} />
                            </span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {card.label}
                            </strong>
                            <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                              {card.hint}
                            </small>
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.methods ? <p className="cal-field-error">{errors.methods}</p> : null}
                  </SectionCard>

                  <SectionCard title="Attachments" icon={<Paperclip size={15} />} delay={0.16}>
                    <div
                      className={`sa-dropzone ${dragOver ? 'is-drag' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files?.length) simulateUpload(e.dataTransfer.files);
                      }}
                    >
                      <Upload size={28} color="var(--color-accent)" />
                      <strong>Drag & drop files here</strong>
                      <span>PDF, DOC, DOCX, Images, ZIP — or click to browse</span>
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.zip"
                        hidden
                        onChange={(e) => {
                          if (e.target.files?.length) simulateUpload(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    <div className="sa-files">
                      <AnimatePresence>
                        {values.attachments.map((f) => (
                          <motion.div
                            key={f.id}
                            className="sa-file-card"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            layout
                          >
                            <span className="sa-file-ico" aria-hidden>
                              <FileKindIcon name={f.name} />
                            </span>
                            <div className="sa-file-meta">
                              <strong>{f.name}</strong>
                              <span>{formatFileSize(f.size)}</span>
                              {typeof f.progress === 'number' ? (
                                <div className="sa-progress" aria-hidden>
                                  <i style={{ width: `${f.progress}%` }} />
                                </div>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="sa-icon-btn danger"
                              aria-label={`Remove ${f.name}`}
                              onClick={() => removeFile(f.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </SectionCard>

                  <SectionCard title="Reference Link" icon={<Link2 size={15} />} delay={0.2}>
                    <div className="sa-link-float">
                      <FloatingText
                        id="ref-link"
                        label="URL (YouTube, Drive, Meeting…)"
                        icon={<Tag size={16} />}
                        error={errors.referenceLink}
                      >
                        <input
                          id="ref-link"
                          className="cal-float-input"
                          placeholder=" "
                          value={values.referenceLink}
                          onChange={(e) => patch('referenceLink', e.target.value)}
                          aria-invalid={Boolean(errors.referenceLink)}
                        />
                      </FloatingText>
                      {linkOk && values.referenceLink.trim() ? (
                        <span className="sa-link-preview-inline" aria-hidden>
                          <LinkIcon url={values.referenceLink} />
                        </span>
                      ) : null}
                    </div>
                  </SectionCard>
                </>
              )}
            </div>

            <footer className="cal-dialog-footer">
              {isPreview ? (
                <>
                  <button
                    type="button"
                    className="cal-btn-ghost"
                    onClick={() => onBackFromPreview?.(values)}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="cal-btn-save"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    <span className="cal-btn-save-shine" aria-hidden />
                    {submitting ? (
                      <span className="cal-saving">
                        <span className="cal-spinner" aria-hidden />
                        Posting…
                      </span>
                    ) : (
                      'Post Announcement'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={submitting}>
                    Cancel
                  </button>
                  {mode === 'create' ? (
                    <button
                      type="button"
                      className="cal-btn-export"
                      onClick={handlePreview}
                      disabled={submitting}
                    >
                      <span className="cal-btn-export-glow" aria-hidden />
                      Preview
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="cal-btn-save"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    <span className="cal-btn-save-shine" aria-hidden />
                    {submitting ? (
                      <span className="cal-saving">
                        <span className="cal-spinner" aria-hidden />
                        {mode === 'edit' ? 'Saving…' : 'Posting…'}
                      </span>
                    ) : (
                      primaryLabel
                    )}
                  </button>
                </>
              )}
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

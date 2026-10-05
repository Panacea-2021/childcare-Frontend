'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Bold,
  Italic,
  List,
  Smile,
  AtSign,
  Send,
  Save,
  Eye,
  Lock,
  Megaphone,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActivitySelector, type ActivityCardOption } from './ActivitySelector';
import { AudienceSelector, type LockedAudienceStudent } from './AudienceSelector';
import { AttachmentUploader } from './AttachmentUploader';
import { VoiceRecorder } from './VoiceRecorder';
import { YoutubePreview } from './YoutubePreview';
import { AdvancedOptions } from './AdvancedOptions';
import { MOCK_ROOMS } from '@/lib/mock/mockRooms';
import { getActivityTypeById } from '@/lib/mock/mockActivityTypes';
import type {
  ActivityPost,
  ActivityAttachment,
  VoiceNoteData,
  YoutubePreviewData,
  PostingType,
  AdvancedToggleKey,
} from '@/types/activity';
import '@/components/modules/calendar/calendar.css';
import './activities.css';

export type PostActivityContextStudent = LockedAudienceStudent;

interface PostActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (p: ActivityPost) => void;
  /** When opened from a student profile, lock audience to this child. */
  contextStudent?: PostActivityContextStudent | null;
}

type WizardPhase = 'select' | 'compose';

const TODAY = '2026-08-02';
const MAX_CONTENT_LENGTH = 500;
const EMOJI_INSERT = '😊';
const MENTION_INSERT = '@Parent';

function getCurrentTimeLabel(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function computeStudentCount(selectedRooms: string[], selectedStudents: string[]): number {
  const roomCount = selectedRooms.reduce((acc, roomName) => {
    const room = MOCK_ROOMS.find((r) => r.name === roomName);
    return acc + (room?.studentCount ?? 0);
  }, 0);
  return roomCount + selectedStudents.length;
}

interface FormState {
  selectedActivity: ActivityCardOption | null;
  postingType: PostingType;
  scheduleDate: string;
  scheduleTime: string;
  selectedRooms: string[];
  selectedStudents: string[];
  title: string;
  content: string;
  attachments: ActivityAttachment[];
  voiceNote: VoiceNoteData | null;
  youtubePreview: YoutubePreviewData | null;
  notifyStaff: boolean;
  enableComments: boolean;
  staffOnly: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  allowParentReactions: boolean;
  sendPushNotification: boolean;
  labels: string[];
}

function createInitialFormState(
  contextStudent?: PostActivityContextStudent | null,
): FormState {
  const defaultType = getActivityTypeById('announcement');
  return {
    selectedActivity: defaultType
      ? {
          id: defaultType.id,
          name: defaultType.name,
          category: defaultType.category,
          iconName: defaultType.icon,
          color: defaultType.color,
          bgColor: defaultType.bgColor,
        }
      : null,
    postingType: 'post_now',
    scheduleDate: TODAY,
    scheduleTime: '08:30',
    selectedRooms: contextStudent ? [] : ['Grade 1 A'],
    selectedStudents: contextStudent ? [contextStudent.id] : [],
    title: '',
    content: '',
    attachments: [],
    voiceNote: null,
    youtubePreview: null,
    notifyStaff: true,
    enableComments: true,
    staffOnly: false,
    isPinned: false,
    isFeatured: false,
    allowParentReactions: true,
    sendPushNotification: true,
    labels: ['Daily Update'],
  };
}

export const PostActivityDialog: React.FC<PostActivityDialogProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  contextStudent = null,
}) => {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    createInitialFormState(contextStudent),
  );
  const [phase, setPhase] = useState<WizardPhase>('select');
  const [showPreview, setShowPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTimeLabel);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const resetForm = useCallback(() => {
    setForm(createInitialFormState(contextStudent));
    setPhase('select');
    setShowPreview(false);
    setCurrentTime(getCurrentTimeLabel());
  }, [contextStudent]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return undefined;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose, resetForm]);

  useEffect(() => {
    if (!isOpen || form.postingType !== 'post_now') return undefined;
    const interval = setInterval(() => setCurrentTime(getCurrentTimeLabel()), 30_000);
    return () => clearInterval(interval);
  }, [isOpen, form.postingType]);

  const patchForm = (partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const handleToggle = (key: AdvancedToggleKey, value: boolean) => {
    patchForm({ [key]: value } as Partial<FormState>);
  };

  const applyTextFormat = (
    mode: 'bold' | 'italic' | 'bullet' | 'emoji' | 'mention'
  ) => {
    const el = contentRef.current;
    if (!el) return;

    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd);

    let next = value;
    let cursorPos = selectionEnd;

    switch (mode) {
      case 'bold':
        next =
          value.slice(0, selectionStart) +
          `**${selected || 'bold text'}**` +
          value.slice(selectionEnd);
        cursorPos = selectionStart + (selected ? selected.length + 4 : 11);
        break;
      case 'italic':
        next =
          value.slice(0, selectionStart) +
          `*${selected || 'italic text'}*` +
          value.slice(selectionEnd);
        cursorPos = selectionStart + (selected ? selected.length + 2 : 13);
        break;
      case 'bullet':
        next =
          value.slice(0, selectionStart) +
          `\n- ${selected || 'List item'}` +
          value.slice(selectionEnd);
        cursorPos = selectionStart + (selected ? selected.length + 4 : 12);
        break;
      case 'emoji':
        next =
          value.slice(0, selectionStart) + EMOJI_INSERT + value.slice(selectionEnd);
        cursorPos = selectionStart + EMOJI_INSERT.length;
        break;
      case 'mention':
        next =
          value.slice(0, selectionStart) + MENTION_INSERT + value.slice(selectionEnd);
        cursorPos = selectionStart + MENTION_INSERT.length;
        break;
      default:
        break;
    }

    if (next.length <= MAX_CONTENT_LENGTH) {
      patchForm({ content: next });
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      });
    }
  };

  const buildPost = (isDraft: boolean): ActivityPost => {
    const activity = form.selectedActivity;
    const postTitle =
      (isDraft ? '[Draft] ' : '') +
      (form.title.trim() || `${activity?.name ?? 'Activity'} Update`);
    const postContent =
      form.content.trim() ||
      `Classroom update shared for ${activity?.name ?? 'activity'}.`;

    const studentCount = contextStudent
      ? 1
      : computeStudentCount(form.selectedRooms, form.selectedStudents);

    const scheduledTimestamp =
      form.postingType === 'schedule'
        ? new Date(`${form.scheduleDate}T${form.scheduleTime}`).getTime()
        : undefined;

    return {
      id: `act-user-${Date.now()}`,
      title: postTitle,
      activityTypeId: activity?.id ?? 'announcement',
      activityTypeName: activity?.name ?? 'Announcement',
      activityIcon: activity?.iconName ?? 'Megaphone',
      category: activity?.category ?? 'Communication',
      postedBy: {
        name: 'Sarah Jenkins',
        role: 'Senior Educator',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      createdDate: TODAY,
      createdTime: getCurrentTimeLabel(),
      room:
        form.selectedRooms[0] ??
        contextStudent?.room ??
        'Grade 1 A',
      visibility: form.staffOnly ? 'staff_only' : 'parents',
      status: form.postingType === 'schedule' ? 'scheduled' : 'posted',
      scheduledDate:
        form.postingType === 'schedule' ? form.scheduleDate : undefined,
      scheduledTime:
        form.postingType === 'schedule' ? form.scheduleTime : undefined,
      scheduledTimestamp:
        scheduledTimestamp && !Number.isNaN(scheduledTimestamp)
          ? scheduledTimestamp
          : undefined,
      isPinned: form.isPinned,
      isFeatured: form.isFeatured,
      labels: form.labels,
      content: postContent,
      attachments:
        form.attachments.length > 0 ? form.attachments : undefined,
      voiceNote: form.voiceNote ?? undefined,
      youtubePreview: form.youtubePreview ?? undefined,
      studentCount: studentCount || 1,
      audienceRooms: form.selectedRooms,
      audienceStudents: form.selectedStudents,
      notifyStaff: form.notifyStaff,
      enableComments: form.enableComments,
      allowParentReactions: form.allowParentReactions,
      sendPushNotification: form.sendPushNotification,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
    };
  };

  const handleSaveDraft = () => {
    onPostCreated(buildPost(true));
    onClose();
  };

  const handlePublish = (e?: React.FormEvent) => {
    e?.preventDefault();
    onPostCreated(buildPost(false));
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
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
            className="cal-dialog act-post-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="act-post-dialog-glow" aria-hidden />
            <header className="cal-dialog-header act-post-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="act-post-dialog-icon" aria-hidden>
                  <Megaphone size={20} />
                </span>
                <div>
                  <h2 id={titleId}>Post Activity</h2>
                  <p>
                    {contextStudent
                      ? `Share a classroom moment for ${contextStudent.name}`
                      : 'Create and share classroom moments with parents and staff'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cal-dialog-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="act-wizard-progress" aria-label="Post activity steps">
              <button
                type="button"
                className={`act-wizard-step${phase === 'select' ? ' is-active' : ''}${phase === 'compose' ? ' is-done' : ''}`}
                onClick={() => {
                  setShowPreview(false);
                  setPhase('select');
                }}
              >
                <span>1</span>
                Select activity
              </button>
              <i className="act-wizard-rail" aria-hidden />
              <button
                type="button"
                className={`act-wizard-step${phase === 'compose' ? ' is-active' : ''}`}
                disabled={!form.selectedActivity}
                onClick={() => {
                  if (!form.selectedActivity) return;
                  setPhase('compose');
                }}
              >
                <span>2</span>
                Post setup
              </button>
            </div>

            {contextStudent ? (
              <div className="act-context-pill">
                <Sparkles size={14} />
                Posting for <strong>{contextStudent.name}</strong>
                {contextStudent.room ? <em>· {contextStudent.room}</em> : null}
              </div>
            ) : null}

            <form
              id="post-activity-form"
              className="cal-dialog-body act-post-dialog-body"
              onSubmit={handlePublish}
            >
              {form.staffOnly && phase === 'compose' && (
                <motion.div
                  className="act-staff-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Lock size={18} />
                  This activity is visible only to staff members. Parents will not
                  receive or view this activity.
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {showPreview ? (
                  <motion.div
                    key="preview"
                    className="act-step act-preview-step"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="act-selector-head-copy">
                      <span className="act-step-kicker">Preview</span>
                      <h4 className="act-step-title">Preview Summary</h4>
                    </div>
                    <div className="act-card">
                      <div className="act-card-top-bar">
                        <span className="act-tag-badge">
                          {form.selectedActivity?.name ?? 'Activity'}
                        </span>
                        {form.isPinned && (
                          <span className="act-badge-pinned">Pinned</span>
                        )}
                        {form.staffOnly && (
                          <span className="act-badge-staff">Staff Only</span>
                        )}
                      </div>
                      <h5 className="act-card-title">
                        {form.title.trim() ||
                          `${form.selectedActivity?.name ?? 'Activity'} Update`}
                      </h5>
                      <p className="act-card-text">
                        {form.content.trim() ||
                          'No additional notes provided.'}
                      </p>
                      <div className="act-preview-labels">
                        {form.labels.map((lbl) => (
                          <span key={lbl} className="act-card-label">
                            {lbl}
                          </span>
                        ))}
                      </div>
                      <p className="act-author-meta act-preview-meta">
                        {form.postingType === 'schedule'
                          ? `Scheduled for ${formatDisplayDate(form.scheduleDate)} at ${form.scheduleTime}`
                          : `Publishing now — ${formatDisplayDate(TODAY)} at ${currentTime}`}
                        {' · '}
                        {contextStudent
                          ? contextStudent.name
                          : `${computeStudentCount(form.selectedRooms, form.selectedStudents)} students`}
                      </p>
                    </div>
                  </motion.div>
                ) : phase === 'select' ? (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ActivitySelector
                      selectedId={form.selectedActivity?.id ?? null}
                      onSelect={(opt) => patchForm({ selectedActivity: opt })}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="compose"
                    className="act-compose-stack"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="act-selected-chip">
                      <span
                        className="act-selected-chip-icon"
                        style={{
                          background: form.selectedActivity?.bgColor,
                          color: form.selectedActivity?.color,
                        }}
                      >
                        <Sparkles size={14} />
                      </span>
                      <div>
                        <strong>{form.selectedActivity?.name ?? 'Activity'}</strong>
                        <em>{form.selectedActivity?.category}</em>
                      </div>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline act-change-activity"
                        onClick={() => setPhase('select')}
                      >
                        Change
                      </button>
                    </div>

                    <div className="act-step">
                      <div className="act-selector-head-copy">
                        <span className="act-step-kicker">Step 2</span>
                        <h4 className="act-step-title">Posting Options</h4>
                      </div>
                      <div className="act-posting-options">
                        <label
                          className={`act-radio-card${form.postingType === 'post_now' ? ' act-radio-card-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="postingType"
                            checked={form.postingType === 'post_now'}
                            onChange={() => patchForm({ postingType: 'post_now' })}
                          />
                          <div>
                            <p className="act-radio-label">Post Now</p>
                            <p className="act-radio-desc">
                              {formatDisplayDate(TODAY)} — {currentTime}
                            </p>
                          </div>
                        </label>

                        <label
                          className={`act-radio-card act-radio-card-schedule${form.postingType === 'schedule' ? ' act-radio-card-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="postingType"
                            checked={form.postingType === 'schedule'}
                            onChange={() => patchForm({ postingType: 'schedule' })}
                          />
                          <div>
                            <p className="act-radio-label">Schedule</p>
                            <p className="act-radio-desc">
                              Pick a date and time to publish later
                            </p>
                          </div>
                        </label>
                      </div>

                      {form.postingType === 'schedule' && (
                        <motion.div
                          className="act-schedule-preview"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <Calendar size={16} color="var(--color-warning, #8a7040)" />
                          <input
                            type="date"
                            className="act-schedule-input"
                            value={form.scheduleDate}
                            min={TODAY}
                            onChange={(e) =>
                              patchForm({ scheduleDate: e.target.value })
                            }
                          />
                          <Clock size={16} color="var(--color-warning, #8a7040)" />
                          <input
                            type="time"
                            className="act-schedule-input"
                            value={form.scheduleTime}
                            onChange={(e) =>
                              patchForm({ scheduleTime: e.target.value })
                            }
                          />
                          <span className="act-schedule-badge">
                            Scheduled On {formatDisplayDate(form.scheduleDate)}{' '}
                            {form.scheduleTime}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    <AudienceSelector
                      selectedRooms={form.selectedRooms}
                      selectedStudents={form.selectedStudents}
                      onRoomsChange={(rooms) => patchForm({ selectedRooms: rooms })}
                      onStudentsChange={(students) =>
                        patchForm({ selectedStudents: students })
                      }
                      lockedStudent={contextStudent}
                      studentLabels={
                        contextStudent
                          ? { [contextStudent.id]: contextStudent.name }
                          : undefined
                      }
                    />

                    <div className="act-step">
                      <div className="act-selector-head-copy">
                        <span className="act-step-kicker">Step 4</span>
                        <h4 className="act-step-title">Activity Details</h4>
                      </div>
                      <div className="act-rich-notes">
                        <input
                          type="text"
                          className="act-rich-input"
                          value={form.title}
                          onChange={(e) => patchForm({ title: e.target.value })}
                          placeholder={`Title (e.g. ${form.selectedActivity?.name ?? 'Activity'} Session)`}
                        />

                        <div className="act-rich-editor">
                          <div className="act-rich-toolbar">
                            <button
                              type="button"
                              className="act-rich-toolbar-btn"
                              onClick={() => applyTextFormat('bold')}
                              aria-label="Bold"
                            >
                              <Bold size={16} />
                            </button>
                            <button
                              type="button"
                              className="act-rich-toolbar-btn"
                              onClick={() => applyTextFormat('italic')}
                              aria-label="Italic"
                            >
                              <Italic size={16} />
                            </button>
                            <button
                              type="button"
                              className="act-rich-toolbar-btn"
                              onClick={() => applyTextFormat('bullet')}
                              aria-label="Bullet list"
                            >
                              <List size={16} />
                            </button>
                            <button
                              type="button"
                              className="act-rich-toolbar-btn"
                              onClick={() => applyTextFormat('emoji')}
                              aria-label="Insert emoji"
                            >
                              <Smile size={16} />
                            </button>
                            <button
                              type="button"
                              className="act-rich-toolbar-btn"
                              onClick={() => applyTextFormat('mention')}
                              aria-label="Mention parent"
                            >
                              <AtSign size={16} />
                            </button>
                            <span className="act-rich-char-count">
                              {form.content.length}/{MAX_CONTENT_LENGTH}
                            </span>
                          </div>
                          <textarea
                            ref={contentRef}
                            rows={5}
                            className="act-rich-textarea"
                            value={form.content}
                            maxLength={MAX_CONTENT_LENGTH}
                            onChange={(e) => patchForm({ content: e.target.value })}
                            placeholder="Write rich notes, observations, or instructions..."
                          />
                        </div>
                      </div>
                    </div>

                    <AttachmentUploader
                      attachments={form.attachments}
                      onAdd={(att) =>
                        patchForm({ attachments: [...form.attachments, att] })
                      }
                      onRemove={(id) =>
                        patchForm({
                          attachments: form.attachments.filter((a) => a.id !== id),
                        })
                      }
                    />

                    <VoiceRecorder
                      voiceNote={form.voiceNote}
                      onChange={(v) => patchForm({ voiceNote: v })}
                    />

                    <YoutubePreview
                      value={form.youtubePreview}
                      onChange={(v) => patchForm({ youtubePreview: v })}
                    />

                    <AdvancedOptions
                      notifyStaff={form.notifyStaff}
                      enableComments={form.enableComments}
                      staffOnly={form.staffOnly}
                      isPinned={form.isPinned}
                      isFeatured={form.isFeatured}
                      allowParentReactions={form.allowParentReactions}
                      sendPushNotification={form.sendPushNotification}
                      labels={form.labels}
                      onToggle={handleToggle}
                      onLabelsChange={(labels) => patchForm({ labels })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <footer className="cal-dialog-footer act-post-dialog-footer">
              {phase === 'compose' || showPreview ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={() => {
                    if (showPreview) {
                      setShowPreview(false);
                      return;
                    }
                    setPhase('select');
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                  Cancel
                </button>
              )}

              {phase === 'select' && !showPreview ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  disabled={!form.selectedActivity}
                  onClick={() => setPhase('compose')}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button type="button" className="ui-btn ui-btn-secondary" onClick={handleSaveDraft}>
                    <Save size={16} />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => setShowPreview((p) => !p)}
                  >
                    <Eye size={16} />
                    {showPreview ? 'Edit Form' : 'Preview'}
                  </button>
                  <button type="submit" form="post-activity-form" className="ui-btn ui-btn-primary">
                    <Send size={16} />
                    {form.postingType === 'schedule' ? 'Schedule Activity' : 'Publish'}
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
};

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Paperclip, Plus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { LESSON_CATALOG } from '@/lib/mock/lessonCatalog';
import { PROGRESS_STUDENTS, STATUS_META } from '@/lib/mock/mockProgressTracking';
import { resolveCatalogLessonId } from '@/lib/mock/lessonResolve';
import type { ProgressRecordDraft, ProgressStatus } from '@/types/progressTracking';
import { TagLessonsModal } from './TagLessonsModal';
import { TagStudentsModal } from './TagStudentsModal';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: ProgressRecordDraft) => void;
  presetStudentId?: string | null;
  presetLessonId?: string | null;
};

const STAGES: Array<Exclude<ProgressStatus, 'none' | 'planned'>> = [
  'introduced',
  'practiced',
  'mastered',
];

type MentionMode = 'student' | 'lesson' | null;

export function AddRecordModal({
  open,
  onClose,
  onSubmit,
  presetStudentId,
  presetLessonId,
}: Props) {
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [date, setDate] = useState('2026-08-03');
  const [hiddenFromParents, setHiddenFromParents] = useState(true);
  const [stage, setStage] = useState<ProgressRecordDraft['stage']>(null);
  const [note, setNote] = useState('');
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [mention, setMention] = useState<{ mode: MentionMode; query: string; start: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    setDate('2026-08-03');
    setHiddenFromParents(true);
    setStage(null);
    setNote('');
    setStudentIds(presetStudentId ? [presetStudentId] : []);
    const catalogId = resolveCatalogLessonId(presetLessonId);
    setLessonIds(catalogId ? [catalogId] : []);
    setStudentsOpen(false);
    setLessonsOpen(false);
    setMention(null);
  }, [open, presetStudentId, presetLessonId]);

  const selectedStudents = PROGRESS_STUDENTS.filter((s) => studentIds.includes(s.id));
  const selectedLessons = LESSON_CATALOG.filter((l) => lessonIds.includes(l.id));

  const canSubmit = Boolean(stage && studentIds.length && lessonIds.length);

  const footerSummary = {
    studentLabel: selectedStudents.map((s) => s.shortName).join(', ') || '@student',
    lessonLabel: selectedLessons.map((l) => l.title).join(', ') || '#lesson',
    stageLabel: stage ? STATUS_META[stage].label : null,
  };

  const toggleStudent = (id: string) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleLesson = (id: string) => {
    setLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const detectMention = (value: string, caret: number) => {
    const before = value.slice(0, caret);
    const atMatch = before.match(/(^|[\s])@([\w\s.-]*)$/);
    if (atMatch) {
      const query = atMatch[2] ?? '';
      setMention({ mode: 'student', query, start: caret - query.length - 1 });
      return;
    }
    const hashMatch = before.match(/(^|[\s])#([\w\s.-]*)$/);
    if (hashMatch) {
      const query = hashMatch[2] ?? '';
      setMention({ mode: 'lesson', query, start: caret - query.length - 1 });
      return;
    }
    setMention(null);
  };

  const applyMention = (label: string, id: string, mode: 'student' | 'lesson') => {
    if (!mention || !noteRef.current) return;
    const caret = noteRef.current.selectionStart ?? note.length;
    const before = note.slice(0, mention.start);
    const after = note.slice(caret);
    const token = mode === 'student' ? `@${label}` : `#${label}`;
    const next = `${before}${token} ${after}`;
    setNote(next);
    if (mode === 'student') {
      setStudentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setLessonIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    setMention(null);
    window.requestAnimationFrame(() => {
      const el = noteRef.current;
      if (!el) return;
      const pos = before.length + token.length + 1;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const mentionItems = useMemo(() => {
    if (!mention) return [] as Array<{ id: string; label: string; insert: string }>;
    const q = mention.query.trim().toLowerCase();
    if (mention.mode === 'student') {
      return PROGRESS_STUDENTS.filter(
        (s) => !q || s.name.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q),
      )
        .slice(0, 6)
        .map((s) => ({ id: s.id, label: s.name, insert: s.shortName }));
    }
    return LESSON_CATALOG.filter((l) => !q || l.title.toLowerCase().includes(q))
      .slice(0, 8)
      .map((l) => ({ id: l.id, label: l.title, insert: l.title }));
  }, [mention]);

  return (
    <>
      <Modal
        open={open}
        title="Add record"
        onClose={onClose}
        wide
        footer={
          <>
            <p className="pt-record-hint">
              <span>
                {footerSummary.studentLabel} · {footerSummary.lessonLabel}
              </span>
              {footerSummary.stageLabel ? (
                <span> · {footerSummary.stageLabel}</span>
              ) : (
                <em> · pick a stage</em>
              )}
            </p>
            <div className="pt-record-footer-actions">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={!canSubmit}
                onClick={() => {
                  if (!canSubmit || !stage) return;
                  onSubmit({ date, hiddenFromParents, stage, note, studentIds, lessonIds });
                }}
              >
                {canSubmit ? 'Save' : 'Pick a stage'}
              </button>
            </div>
          </>
        }
      >
        <div className="pt-record-grid">
          <div className="pt-record-left">
            <div className="pt-date-wrap">
              <input
                id="pt-record-date"
                type="date"
                className="ui-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Date"
              />
              <CalendarDays size={16} className="pt-date-icon" aria-hidden />
            </div>

            <label className="pt-toggle-row">
              <span>Hidden from parents</span>
              <button
                type="button"
                role="switch"
                aria-checked={hiddenFromParents}
                className={`pt-switch ${hiddenFromParents ? 'is-on' : ''}`}
                onClick={() => setHiddenFromParents((v) => !v)}
              />
            </label>

            <div className="ui-field">
              <span className="ui-label">
                Stage <span className="pt-required">*required</span>
              </span>
              <div className="pt-stage-list" role="radiogroup" aria-label="Stage">
                {STAGES.map((key) => {
                  const meta = STATUS_META[key];
                  const active = stage === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`pt-stage-btn ${meta.className}${active ? ' is-active' : ''}`}
                      onClick={() => setStage(key)}
                    >
                      <span className={`pt-stage-badge ${meta.className}`}>{meta.code}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" className="pt-attach-btn">
              <Paperclip size={15} aria-hidden />
              Photo, video or file
            </button>
          </div>

          <div className="pt-record-right">
            <div className="ui-field pt-note-field">
              <label className="ui-label" htmlFor="pt-record-note">
                What you saw — Type @ to tag a student, # to tag a lesson
              </label>
              <div className="pt-note-wrap">
                <textarea
                  ref={noteRef}
                  id="pt-record-note"
                  className="ui-textarea pt-note"
                  placeholder="Type @ to tag a student, # to tag a lesson"
                  value={note}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNote(value);
                    detectMention(value, e.target.selectionStart ?? value.length);
                  }}
                  onKeyUp={(e) => {
                    const el = e.currentTarget;
                    detectMention(el.value, el.selectionStart ?? el.value.length);
                  }}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    detectMention(el.value, el.selectionStart ?? el.value.length);
                  }}
                />
                {mention && mentionItems.length > 0 ? (
                  <div className="pt-mention-menu" role="listbox" aria-label="Mentions">
                    {mentionItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        className="pt-mention-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          applyMention(
                            item.insert,
                            item.id,
                            mention.mode === 'lesson' ? 'lesson' : 'student',
                          )
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <button type="button" className="pt-ai-btn">
                  <Plus size={12} aria-hidden />
                  AI assist
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="pt-tag-section" aria-label="Tags">
          <div className="pt-tag-section-head">
            <strong>Tags</strong>
            <span>Students and lessons linked to this record</span>
          </div>

          {(selectedStudents.length > 0 || selectedLessons.length > 0) && (
            <div className="pt-tag-chips">
              {selectedStudents.map((s) => (
                <span key={s.id} className="pt-chip pt-chip-student">
                  @{s.shortName}
                  <button
                    type="button"
                    aria-label={`Remove ${s.shortName}`}
                    onClick={() => toggleStudent(s.id)}
                  >
                    <X size={12} aria-hidden />
                  </button>
                </span>
              ))}
              {selectedLessons.map((l) => (
                <span key={l.id} className="pt-chip pt-chip-lesson">
                  #{l.title}
                  <button
                    type="button"
                    aria-label={`Remove ${l.title}`}
                    onClick={() => toggleLesson(l.id)}
                  >
                    <X size={12} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="pt-tag-actions">
            <button type="button" className="pt-tag-add" onClick={() => setStudentsOpen(true)}>
              <Plus size={14} aria-hidden />
              Tag students
            </button>
            <button type="button" className="pt-tag-add" onClick={() => setLessonsOpen(true)}>
              <Plus size={14} aria-hidden />
              Tag lessons
            </button>
          </div>
        </section>
      </Modal>

      <TagStudentsModal
        open={studentsOpen}
        selectedIds={studentIds}
        onClose={() => setStudentsOpen(false)}
        onApply={(ids) => {
          setStudentIds(ids);
          setStudentsOpen(false);
        }}
      />

      <TagLessonsModal
        open={lessonsOpen}
        selectedIds={lessonIds}
        onClose={() => setLessonsOpen(false)}
        onApply={(ids) => {
          setLessonIds(ids);
          setLessonsOpen(false);
        }}
      />
    </>
  );
}

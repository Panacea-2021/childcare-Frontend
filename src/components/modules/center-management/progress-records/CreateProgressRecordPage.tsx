'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderUp,
  Globe2,
  Lightbulb,
  Lock,
  NotebookPen,
  Plus,
  Smile,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { LESSON_CATALOG, LESSON_CATEGORIES } from '@/lib/mock/lessonCatalog';
import { resolveLessonTitle } from '@/lib/mock/lessonResolve';
import { loadStudents, STAFF_OPTIONS } from '@/lib/center-management/studentsStore';
import { emptyDraft, kindLabel } from '@/lib/center-management/progressRecordsStore';
import type {
  ProgressRecord,
  ProgressRecordDraft,
  ProgressRecordKind,
} from '@/types/progressRecord';
import { AppMultiSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import { SelectPeopleDrawer } from './SelectPeopleDrawer';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './progress-records.css';

type Props = {
  kind: ProgressRecordKind;
  presetStudentId: string;
  editing?: ProgressRecord | null;
  onBack: () => void;
  onSave: (draft: ProgressRecordDraft, opts: { addAnother: boolean }) => void;
  /** Keep URL in sync when switching Observation / Reflection / Concern */
  onKindChange?: (kind: ProgressRecordKind) => void;
};

const KINDS: ProgressRecordKind[] = ['observation', 'reflection', 'concern'];

const AGE_OPTIONS = LESSON_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => ({
  value: c,
  label: c,
}));

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function CreateProgressRecordPage({
  kind: initialKind,
  presetStudentId,
  editing = null,
  onBack,
  onSave,
  onKindChange,
}: Props) {
  const [draft, setDraft] = useState<ProgressRecordDraft>(() => {
    if (editing) {
      return {
        kind: editing.kind,
        status: editing.status,
        date: editing.date,
        hiddenFromParents: editing.hiddenFromParents,
        studentIds: [...editing.studentIds],
        staffIds: [...editing.staffIds],
        ageBands: [...editing.ageBands],
        developmentAreas: [...editing.developmentAreas],
        lessonIds: [...editing.lessonIds],
        description: editing.description,
        nextSteps: editing.nextSteps,
        mediaNames: [...editing.mediaNames],
      };
    }
    return emptyDraft(initialKind, presetStudentId);
  });
  const [peopleMode, setPeopleMode] = useState<'students' | 'staff' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setDraft((prev) =>
      prev.kind === initialKind
        ? prev
        : {
            ...prev,
            kind: initialKind,
            hiddenFromParents:
              initialKind === 'observation' ? prev.hiddenFromParents : true,
          },
    );
  }, [initialKind]);

  const patch = (partial: Partial<ProgressRecordDraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const switchKind = (next: ProgressRecordKind) => {
    patch({
      kind: next,
      hiddenFromParents: next === 'observation' ? draft.hiddenFromParents : true,
    });
    onKindChange?.(next);
  };

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    for (const lesson of LESSON_CATALOG) {
      if (
        draft.ageBands.length &&
        !draft.ageBands.some(
          (a) => a === lesson.ageBand || lesson.ageBand.includes(a) || a.includes(lesson.ageBand),
        )
      ) {
        continue;
      }
      for (const area of lesson.developmentAreas) set.add(area);
    }
    return [...set].sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v }));
  }, [draft.ageBands]);

  const lessonOptions = useMemo(() => {
    return LESSON_CATALOG.filter((lesson) => {
      if (
        draft.ageBands.length &&
        !draft.ageBands.some(
          (a) => a === lesson.ageBand || lesson.ageBand.includes(a) || a.includes(lesson.ageBand),
        )
      ) {
        return false;
      }
      if (
        draft.developmentAreas.length &&
        !lesson.developmentAreas.some((a) => draft.developmentAreas.includes(a))
      ) {
        return false;
      }
      return true;
    })
      .slice(0, 400)
      .map((l) => ({ value: l.id, label: l.title }));
  }, [draft.ageBands, draft.developmentAreas]);

  const students = loadStudents().filter((s) => draft.studentIds.includes(s.id));
  const staff = STAFF_OPTIONS.filter((s) => draft.staffIds.includes(s.id));

  const canPublish = draft.studentIds.length > 0 && draft.description.trim().length > 0;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const save = (status: 'draft' | 'published', addAnother: boolean) => {
    if (status === 'published' && !canPublish) {
      flash('Add at least one student and a description');
      return;
    }
    onSave({ ...draft, status }, { addAnother });
    if (addAnother) {
      setDraft(emptyDraft(draft.kind, presetStudentId));
      flash(`${kindLabel(draft.kind)} published — add another`);
    }
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const names = Array.from(files).map((f) => f.name);
    patch({ mediaNames: [...draft.mediaNames, ...names] });
  };

  const kind = draft.kind;
  const alwaysHidden = kind !== 'observation';

  return (
    <motion.div
      className={`pr-create is-${kind}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      {toast ? <div className="pr-toast">{toast}</div> : null}

      <div className="pr-create-aura" aria-hidden>
        <span className="pr-blob pr-blob-a" />
        <span className="pr-blob pr-blob-b" />
        <span className="pr-blob pr-blob-c" />
      </div>

      <header className="pr-create-hero">
        <div className="pr-create-hero-top">
          <button type="button" className="pr-back" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>
              <em>Back to profile</em>
              <strong>Create {kindLabel(kind)}</strong>
            </span>
          </button>

          <div className="pr-kind-switch" role="tablist" aria-label="Record type">
            <motion.span
              className="pr-kind-pill-bg"
              layoutId="pr-kind-pill"
              style={{
                left: `${(KINDS.indexOf(kind) / KINDS.length) * 100}%`,
                width: `${100 / KINDS.length}%`,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                className={kind === k ? 'is-on' : ''}
                onClick={() => switchKind(k)}
              >
                {kindLabel(k)}
              </button>
            ))}
          </div>
        </div>

        <div className="pr-create-hero-bottom">
          <div className="pr-create-hero-copy">
            <p className="pr-create-eyebrow">Learning journey · Progress record</p>
            <h1>Capture a clear, share-ready {kindLabel(kind).toLowerCase()}</h1>
            <p>
              Tag students, link lessons from your catalog, and publish with one polished workflow.
            </p>
          </div>
          <div className="pr-create-actions">
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => save('published', true)}
            >
              Publish &amp; Add Another
            </button>
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => save('draft', false)}>
              Save As Draft
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => save('published', false)}
            >
              {editing ? 'Update' : 'Publish'} {kindLabel(kind)}
            </button>
          </div>
        </div>
      </header>

      <div className="pr-create-grid">
        <div className="pr-create-col">
        <motion.section
          className="pr-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
        >
          <div className="pr-card-head">
            <span className="pr-card-ico" aria-hidden>
              <CalendarDays size={18} />
            </span>
            <div>
              <h3>Date &amp; visibility</h3>
              <p>When it happened and who can see it.</p>
            </div>
          </div>
          <div className="pr-card-body">
            <div className="ui-field pr-date-field">
              <label className="ui-label">{kindLabel(kind)} date</label>
              <div className="pr-date-row">
                <DayDatePicker
                  value={draft.date}
                  onChange={(date) => patch({ date })}
                  placeholder="Select date"
                  className="pr-day-picker"
                />
                {alwaysHidden ? (
                  <p className="pr-lock-note">
                    <Lock size={14} />
                    {kindLabel(kind)}s are always hidden from parents.
                  </p>
                ) : (
                  <label className="pr-toggle">
                    <input
                      type="checkbox"
                      checked={draft.hiddenFromParents}
                      onChange={(e) => patch({ hiddenFromParents: e.target.checked })}
                    />
                    <span className="pr-toggle-ui" aria-hidden />
                    <span>Hidden from parents</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="pr-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="pr-card-head">
            <span className="pr-card-ico" aria-hidden>
              <Users size={18} />
            </span>
            <div>
              <h3>Students &amp; staff</h3>
              <p>
                {draft.studentIds.length} tagged · required
              </p>
            </div>
          </div>
          <div className="pr-card-body">
            <div className="pr-people-chips">
              <AnimatePresence initial={false}>
                {students.map((s) => (
                  <motion.span
                    key={s.id}
                    className="pr-person-chip"
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <i className="pr-avatar tone-rose">{initials(s.name)}</i>
                    {s.name}
                    <button
                      type="button"
                      aria-label={`Remove ${s.name}`}
                      onClick={() =>
                        patch({ studentIds: draft.studentIds.filter((id) => id !== s.id) })
                      }
                    >
                      <X size={13} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <button type="button" className="pr-link" onClick={() => setPeopleMode('students')}>
              <Plus size={14} /> Select Students
            </button>

            <div className="pr-staff-block">
              <span className="pr-field-label">Staff</span>
              <div className="pr-people-chips">
                {staff.map((s) => (
                  <span key={s.id} className="pr-person-chip is-staff">
                    <i className="pr-avatar tone-violet">{initials(s.name)}</i>
                    {s.name}
                    <button
                      type="button"
                      aria-label={`Remove ${s.name}`}
                      onClick={() =>
                        patch({ staffIds: draft.staffIds.filter((id) => id !== s.id) })
                      }
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <button type="button" className="pr-link" onClick={() => setPeopleMode('staff')}>
                <Plus size={14} /> Select Staff
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="pr-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="pr-card-head">
            <span className="pr-card-ico" aria-hidden>
              <Target size={18} />
            </span>
            <div>
              <h3>Milestones &amp; lessons</h3>
              <p>Classify and link to learning areas.</p>
            </div>
          </div>
          <div className="pr-card-body pr-stack">
            <div className="ui-field">
              <label className="ui-label">Filter milestone based on age band</label>
              <AppMultiSelect
                values={draft.ageBands}
                options={AGE_OPTIONS}
                placeholder="Select age band"
                searchable
                searchPlaceholder="Search age band…"
                className="pr-ms"
                onChange={(ageBands) =>
                  patch({
                    ageBands,
                    developmentAreas: draft.developmentAreas.filter((area) =>
                      LESSON_CATALOG.some(
                        (l) =>
                          l.developmentAreas.includes(area) &&
                          (!ageBands.length ||
                            ageBands.some(
                              (a) =>
                                a === l.ageBand ||
                                l.ageBand.includes(a) ||
                                a.includes(l.ageBand),
                            )),
                      ),
                    ),
                    lessonIds: draft.lessonIds.filter((id) => {
                      const l = LESSON_CATALOG.find((x) => x.id === id);
                      if (!l) return false;
                      if (!ageBands.length) return true;
                      return ageBands.some(
                        (a) => a === l.ageBand || l.ageBand.includes(a) || a.includes(l.ageBand),
                      );
                    }),
                  })
                }
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Select development area</label>
              <AppMultiSelect
                values={draft.developmentAreas}
                options={areaOptions}
                placeholder="Select Development area"
                searchable
                searchPlaceholder="Search area…"
                className="pr-ms"
                onChange={(developmentAreas) =>
                  patch({
                    developmentAreas,
                    lessonIds: draft.lessonIds.filter((id) => {
                      const l = LESSON_CATALOG.find((x) => x.id === id);
                      if (!l) return false;
                      if (!developmentAreas.length) return true;
                      return l.developmentAreas.some((a) => developmentAreas.includes(a));
                    }),
                  })
                }
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Lessons</label>
              <AppMultiSelect
                values={draft.lessonIds}
                options={lessonOptions}
                placeholder="Link lessons"
                searchable
                searchPlaceholder="Search lessons…"
                className="pr-ms"
                onChange={(lessonIds) => patch({ lessonIds })}
              />
            </div>
            {draft.lessonIds.length ? (
              <p className="pr-helper">
                Linked:{' '}
                {draft.lessonIds
                  .map((id) => resolveLessonTitle(id))
                  .filter(Boolean)
                  .join(', ')}
              </p>
            ) : null}
          </div>
        </motion.section>
        </div>

        <div className="pr-create-col">
        <motion.section
          className="pr-card pr-card-tall"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="pr-card-head">
            <span className="pr-card-ico" aria-hidden>
              <NotebookPen size={18} />
            </span>
            <div>
              <h3>Notes</h3>
              <p>Describe the {kind} and next steps.</p>
            </div>
          </div>
          <div className="pr-card-body pr-stack">
            <div className="ui-field">
              <label className="ui-label">Description</label>
              <textarea
                className="ui-textarea pr-textarea"
                rows={8}
                placeholder="Description"
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
              <div className="pr-note-tools">
                <button type="button" className="pr-tool is-suggest" onClick={() => flash('Suggestions coming soon')}>
                  <Lightbulb size={14} /> Suggestions
                </button>
                <button type="button" className="pr-tool is-translate" onClick={() => flash('Translate coming soon')}>
                  <Globe2 size={14} /> Translate
                </button>
                <button type="button" className="pr-tool" aria-label="Emoji" onClick={() => flash('Emoji picker coming soon')}>
                  <Smile size={14} />
                </button>
              </div>
            </div>

            {kind !== 'concern' ? (
              <div className="ui-field">
                <label className="ui-label">Next steps</label>
                <textarea
                  className="ui-textarea pr-textarea"
                  rows={5}
                  placeholder="Next steps"
                  value={draft.nextSteps}
                  onChange={(e) => patch({ nextSteps: e.target.value })}
                />
                <div className="pr-note-tools">
                  <button type="button" className="pr-tool is-suggest" onClick={() => flash('Suggestions coming soon')}>
                    <Sparkles size={14} /> Suggestions
                  </button>
                  <button type="button" className="pr-tool is-translate" onClick={() => flash('Translate coming soon')}>
                    <Globe2 size={14} /> Translate
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          className="pr-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="pr-card-head">
            <span className="pr-card-ico" aria-hidden>
              <FolderUp size={18} />
            </span>
            <div>
              <h3>Photos &amp; videos</h3>
              <p>Attach media from the {kind}.</p>
            </div>
          </div>
          <div className="pr-card-body">
            <button
              type="button"
              className={`pr-drop${dragging ? ' is-drag' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                onFiles(e.dataTransfer.files);
              }}
            >
              <FolderUp size={28} strokeWidth={1.5} />
              <strong>Select files</strong>
              <span>Photos, videos, docs — click or drag to upload</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => onFiles(e.target.files)}
            />
            {draft.mediaNames.length ? (
              <ul className="pr-media-list">
                {draft.mediaNames.map((name) => (
                  <li key={name}>
                    <FileText size={14} />
                    {name}
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        patch({ mediaNames: draft.mediaNames.filter((n) => n !== name) })
                      }
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.section>
        </div>
      </div>

      <footer className="pr-create-foot">
        <button
          type="button"
          className="ui-btn ui-btn-outline"
          onClick={() => save('published', true)}
        >
          Publish &amp; Add Another
        </button>
        <button type="button" className="ui-btn ui-btn-secondary" onClick={() => save('draft', false)}>
          Save As Draft
        </button>
        <button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={() => save('published', false)}
        >
          {editing ? 'Update' : 'Publish'} {kindLabel(kind)}
        </button>
      </footer>

      <SelectPeopleDrawer
        open={peopleMode === 'students'}
        mode="students"
        selectedIds={draft.studentIds}
        onClose={() => setPeopleMode(null)}
        onApply={(ids) => patch({ studentIds: ids })}
      />
      <SelectPeopleDrawer
        open={peopleMode === 'staff'}
        mode="staff"
        selectedIds={draft.staffIds}
        onClose={() => setPeopleMode(null)}
        onApply={(ids) => patch({ staffIds: ids })}
      />
    </motion.div>
  );
}

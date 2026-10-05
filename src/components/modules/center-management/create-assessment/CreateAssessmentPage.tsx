'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarRange,
  ClipboardCheck,
  FolderUp,
  Globe2,
  Lightbulb,
  Paperclip,
  Share2,
  Smile,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { loadAreas, loadScales } from '@/components/modules/learning-assessment/manage/store';
import {
  emptyAssessmentDraft,
  loadAssessmentTemplates,
} from '@/lib/center-management/profileAssessmentsStore';
import type { Student } from '@/lib/center-management/types';
import type {
  AssessmentTemplate,
  ProfileAssessment,
  ProfileAssessmentDraft,
} from '@/types/profileAssessment';
import { AppSelect } from '@/components/modules/center-management/ui';
import { AssessmentPeriodField } from './AssessmentPeriodField';
import '@/components/modules/attendance-leaves/student-attendance.css';
import '../progress-records/progress-records.css';
import './create-assessment.css';

type Props = {
  student: Student;
  editing?: ProfileAssessment | null;
  onBack: () => void;
  onSave: (
    draft: ProfileAssessmentDraft,
    meta: { template: AssessmentTemplate; addAnother: boolean },
  ) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const SUGGEST_COMMENTS =
  'Showing strong engagement during guided activities this period. Continues to build confidence with peers and demonstrates growing independence during transitions.';
const SUGGEST_NEXT =
  'Continue small-group practice on focus skills, invite parent reinforcement at home, and re-check progress at the end of this assessment window.';

export function CreateAssessmentPage({ student, editing = null, onBack, onSave }: Props) {
  const templates = useMemo(() => loadAssessmentTemplates(), []);
  const areas = useMemo(() => loadAreas().filter((a) => a.active), []);
  const scales = useMemo(() => loadScales(), []);

  const [draft, setDraft] = useState<ProfileAssessmentDraft>(() => {
    if (editing) {
      return {
        templateId: editing.templateId,
        periodFrom: editing.periodFrom,
        periodTo: editing.periodTo,
        staffComments: editing.staffComments,
        nextSteps: editing.nextSteps,
        mediaNames: [...editing.mediaNames],
        sharedWithParents: editing.sharedWithParents,
        status: editing.status,
        areaLevels: { ...editing.areaLevels },
      };
    }
    return emptyAssessmentDraft();
  });
  const [studentTagged, setStudentTagged] = useState(true);
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (partial: Partial<ProfileAssessmentDraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const template = templates.find((t) => t.id === draft.templateId) ?? null;
  const scale = scales.find((s) => s.id === (template?.scaleId ?? '')) ?? null;
  const levels = scale?.levels ?? [];

  useEffect(() => {
    if (!template) return;
    // Drop levels that don't belong to the new scale
    setDraft((prev) => {
      const nextLevels: Record<string, string> = {};
      for (const [areaId, lvl] of Object.entries(prev.areaLevels)) {
        if (levels.includes(lvl)) nextLevels[areaId] = lvl;
      }
      return { ...prev, areaLevels: nextLevels };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when template changes
  }, [draft.templateId]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const templateError = tried && !draft.templateId;
  const studentError = tried && !studentTagged;
  const canSave = Boolean(draft.templateId && studentTagged);

  const save = (opts: { share?: boolean; addAnother?: boolean; asDraft?: boolean }) => {
    setTried(true);
    if (!canSave || !template) {
      flash(!studentTagged ? 'Keep the student tagged' : 'Please select assessment template.');
      return;
    }
    onSave(
      {
        ...draft,
        sharedWithParents: opts.share ? true : draft.sharedWithParents,
        status: opts.asDraft ? 'draft' : 'published',
      },
      { template, addAnother: Boolean(opts.addAnother) },
    );
    if (opts.addAnother) {
      setDraft(emptyAssessmentDraft());
      setTried(false);
      flash('Assessment saved — add another');
    } else if (opts.share) {
      flash('Assessment saved & shared with parents');
    }
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    patch({ mediaNames: [...draft.mediaNames, ...Array.from(files).map((f) => f.name)] });
  };

  const setAreaLevel = (areaId: string, level: string | null) => {
    const next = { ...draft.areaLevels };
    if (!level) delete next[areaId];
    else next[areaId] = level;
    patch({ areaLevels: next });
  };

  return (
    <motion.div
      className="ca-create"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      {toast ? <div className="pr-toast">{toast}</div> : null}

      <div className="ca-aura" aria-hidden>
        <span className="ca-blob ca-blob-a" />
        <span className="ca-blob ca-blob-b" />
        <span className="ca-blob ca-blob-c" />
        <span className="ca-blob ca-blob-d" />
      </div>

      <motion.header
        className="ca-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ca-hero-top">
          <button type="button" className="pr-back" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>
              <em>Back to profile</em>
              <strong>{editing ? 'Edit Assessment' : 'Create Assessment'}</strong>
            </span>
          </button>

          <div className="ca-hero-actions">
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => save({})}>
              <ClipboardCheck size={15} />
              Save Assessment
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => save({ share: true })}
            >
              <Share2 size={15} />
              Share with parents
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary"
              onClick={() => save({ addAnother: true })}
            >
              Save &amp; add another
            </button>
          </div>
        </div>

        <div className="ca-hero-bottom">
          <div className="ca-hero-copy">
            <p className="ca-eyebrow">
              <Sparkles size={14} />
              Learning journey · Assessment
            </p>
            <h1>Create a polished, parent-ready assessment</h1>
            <p>
              Choose a template from Learning Manage, rate development areas, and capture comments
              with next steps in one full workspace.
            </p>
          </div>
          <motion.div
            className="ca-hero-student"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          >
            <div className="ca-hero-avatar" aria-hidden>
              {student.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.photoUrl} alt="" />
              ) : (
                initials(student.name)
              )}
            </div>
            <div>
              <strong>{student.name}</strong>
              <span>Profile Progress</span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="ca-grid">
        <div className="ca-col">
          <motion.section
            className="ca-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.38 }}
            whileHover={{ y: -2 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico" aria-hidden>
                <CalendarRange size={18} />
              </span>
              <div>
                <h3>Period &amp; template</h3>
                <p>Assessment window and scoring setup.</p>
              </div>
            </div>
            <div className="ca-card-body">
              <div className="ca-grid-2">
                <div className="ui-field">
                  <label className="ui-label">Assessment Period</label>
                  <AssessmentPeriodField
                    from={draft.periodFrom}
                    to={draft.periodTo}
                    onChange={({ from, to }) => patch({ periodFrom: from, periodTo: to })}
                  />
                </div>
                <div className={`ui-field${templateError ? ' ca-field-error' : ''}`}>
                  <label className="ui-label">Assessment Template</label>
                  <AppSelect
                    value={draft.templateId}
                    options={templates.map((t) => ({ value: t.id, label: t.name }))}
                    placeholder="Select assessment template"
                    className="ca-select"
                    onChange={(templateId) => patch({ templateId })}
                  />
                  {templateError ? (
                    <p className="ca-error">Please select assessment template.</p>
                  ) : template ? (
                    <p className="ca-hint">
                      {template.description}
                      {scale ? ` · Uses ${scale.name}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="ca-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.38 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico" aria-hidden>
                <UserRound size={18} />
              </span>
              <div>
                <h3>Student</h3>
                <p>Who this assessment is for.</p>
              </div>
            </div>
            <div className="ca-card-body">
              <div className={`ca-student-box${studentError ? ' is-error' : ''}`}>
                <AnimatePresence initial={false}>
                  {studentTagged ? (
                    <motion.span
                      key={student.id}
                      className="pr-person-chip"
                      layout
                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.88, opacity: 0 }}
                    >
                      <i className="pr-avatar tone-rose">{initials(student.name)}</i>
                      {student.name}
                      <button
                        type="button"
                        aria-label={`Remove ${student.name}`}
                        onClick={() => setStudentTagged(false)}
                      >
                        <X size={13} />
                      </button>
                    </motion.span>
                  ) : (
                    <motion.button
                      key="readd"
                      type="button"
                      className="pr-link"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setStudentTagged(true)}
                    >
                      Tag {student.name}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              {studentError ? <p className="ca-error">Student is required.</p> : null}
            </div>
          </motion.section>

          <motion.section
            className="ca-card is-stretch"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.38 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico is-areas" aria-hidden>
                <Sparkles size={18} />
              </span>
              <div>
                <h3>Development areas</h3>
                <p>
                  {template
                    ? `Rate each area with ${scale?.name ?? 'the selected scale'}.`
                    : 'Select a template to unlock area ratings.'}
                </p>
              </div>
            </div>
            <div className="ca-card-body">
              <AnimatePresence mode="wait">
                {template && levels.length > 0 ? (
                  <motion.div
                    key="areas-list"
                    className="ca-areas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {areas.map((area, i) => (
                      <motion.div
                        key={area.id}
                        className="ca-area-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i }}
                      >
                        <div className="ca-area-label">
                          <i style={{ background: area.color }} aria-hidden />
                          <span>{area.name}</span>
                        </div>
                        <div
                          className="ca-level-pills"
                          role="group"
                          aria-label={`${area.name} level`}
                        >
                          <button
                            type="button"
                            className={`ca-level-pill is-clear${!draft.areaLevels[area.id] ? ' is-on' : ''}`}
                            onClick={() => setAreaLevel(area.id, null)}
                          >
                            Clear
                          </button>
                          {levels.map((lvl, li) => (
                            <button
                              key={lvl}
                              type="button"
                              className={`ca-level-pill${draft.areaLevels[area.id] === lvl ? ' is-on' : ''}`}
                              style={
                                {
                                  '--lvl-i': String(li),
                                  '--lvl-n': String(Math.max(levels.length - 1, 1)),
                                } as CSSProperties
                              }
                              onClick={() => setAreaLevel(area.id, lvl)}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="areas-empty"
                    className="ca-placeholder-areas"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Sparkles size={28} strokeWidth={1.4} color="var(--color-accent, #5d5fef)" />
                    <strong>Pick a template first</strong>
                    <p>Development area scales appear here once an assessment template is selected.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        <div className="ca-col">
          <motion.section
            className="ca-card is-stretch"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09, duration: 0.38 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico" aria-hidden>
                <Lightbulb size={18} />
              </span>
              <div>
                <h3>Staff Comments</h3>
                <p>Summarize what you observed this period.</p>
              </div>
            </div>
            <div className="ca-card-body">
              <div className="ui-field">
                <textarea
                  className="ui-textarea ca-textarea"
                  rows={9}
                  placeholder="Write staff comments…"
                  value={draft.staffComments}
                  onChange={(e) => patch({ staffComments: e.target.value })}
                />
                <div className="pr-note-tools">
                  <button
                    type="button"
                    className="pr-tool is-suggest"
                    onClick={() => {
                      patch({ staffComments: SUGGEST_COMMENTS });
                      flash('Suggestion applied');
                    }}
                  >
                    <Lightbulb size={14} /> Suggestions
                  </button>
                  <button
                    type="button"
                    className="pr-tool is-translate"
                    onClick={() => flash('Translate coming soon')}
                  >
                    <Globe2 size={14} /> Translate
                  </button>
                  <button
                    type="button"
                    className="pr-tool"
                    aria-label="Emoji"
                    onClick={() => {
                      patch({ staffComments: `${draft.staffComments} 🙂` });
                    }}
                  >
                    <Smile size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="ca-card is-stretch"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13, duration: 0.38 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico" aria-hidden>
                <ClipboardCheck size={18} />
              </span>
              <div>
                <h3>Next Steps</h3>
                <p>What happens next for learning support.</p>
              </div>
            </div>
            <div className="ca-card-body">
              <div className="ui-field">
                <textarea
                  className="ui-textarea ca-textarea"
                  rows={7}
                  placeholder="Outline next steps…"
                  value={draft.nextSteps}
                  onChange={(e) => patch({ nextSteps: e.target.value })}
                />
                <div className="pr-note-tools">
                  <button
                    type="button"
                    className="pr-tool is-suggest"
                    onClick={() => {
                      patch({ nextSteps: SUGGEST_NEXT });
                      flash('Suggestion applied');
                    }}
                  >
                    <Lightbulb size={14} /> Suggestions
                  </button>
                  <button
                    type="button"
                    className="pr-tool is-translate"
                    onClick={() => flash('Translate coming soon')}
                  >
                    <Globe2 size={14} /> Translate
                  </button>
                  <button
                    type="button"
                    className="pr-tool"
                    aria-label="Emoji"
                    onClick={() => {
                      patch({ nextSteps: `${draft.nextSteps} ✨` });
                    }}
                  >
                    <Smile size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="ca-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17, duration: 0.38 }}
          >
            <div className="ca-card-head">
              <span className="ca-card-ico" aria-hidden>
                <FolderUp size={18} />
              </span>
              <div>
                <h3>Add Media And Documents</h3>
                <p>Attach photos, PDFs, or supporting files.</p>
              </div>
            </div>
            <div className="ca-card-body">
              <div
                className={`ca-drop${dragging ? ' is-drag' : ''}`}
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
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip size={15} />
                  Select files
                </button>
                <span>or drag and drop here</span>
              </div>
              {draft.mediaNames.length ? (
                <ul className="ca-files">
                  {draft.mediaNames.map((name) => (
                    <li key={name}>
                      <Paperclip size={13} />
                      <span>{name}</span>
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

      <footer className="ca-footer">
        <button type="button" className="ui-btn ui-btn-outline" onClick={onBack}>
          Cancel
        </button>
        <div className="ca-footer-actions">
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => save({})}>
            Save Assessment
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => save({ share: true })}>
            Share with parents
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-secondary"
            onClick={() => save({ addAnother: true })}
          >
            Save &amp; add another
          </button>
        </div>
      </footer>
    </motion.div>
  );
}

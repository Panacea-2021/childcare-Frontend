'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlignLeft,
  Bold,
  BookOpen,
  ChevronDown,
  Italic,
  Plus,
  Smile,
  Sparkles,
  Underline,
  Video,
} from 'lucide-react';
import {
  AGE_BAND_OPTIONS,
  DEVELOPMENT_AREA_TREE,
  LABEL_OPTIONS,
  LESSON_SET_OPTIONS,
  ensureEditableFromCard,
  loadBoardCards,
  loadEditableLesson,
  saveBoardCards,
  saveEditableLesson,
} from '@/lib/mock/mockProgressBoard';
import { PROGRESS_ROOMS } from '@/lib/mock/mockProgressTracking';
import type { EditableLesson } from '@/types/progressBoard';
import {
  CreateLessonWithAiModal,
  type AiLessonDraft,
} from './CreateLessonWithAiModal';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

type Props = {
  lessonId: string;
};

function ChipMulti({
  values,
  options,
  onChange,
  placeholder,
}: {
  values: string[];
  options: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const available = options.filter((o) => !values.includes(o));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="el-chip-box" ref={boxRef}>
      <button
        type="button"
        className={`el-chip-row${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="el-chip-values">
          {values.length === 0 ? (
            <span className="el-ph">{placeholder}</span>
          ) : (
            values.map((v) => (
              <span
                key={v}
                className="el-chip"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {v}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${v}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(values.filter((x) => x !== v));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(values.filter((x) => x !== v));
                    }
                  }}
                >
                  ×
                </span>
              </span>
            ))
          )}
        </span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {open && available.length > 0 ? (
        <div className="el-chip-menu" role="listbox">
          {available.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              onClick={() => {
                onChange([...values, o]);
                setOpen(false);
              }}
            >
              {o}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionHead({
  step,
  title,
  subtitle,
  action,
}: {
  step: number;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="el-section-head">
      <div className="el-card-title">
        <span className="el-step" aria-hidden>
          {step}
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {action}
    </header>
  );
}

export function EditLessonPage({ lessonId }: Props) {
  const router = useRouter();
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraft] = useState<EditableLesson | null>(null);
  const [areaOpen, setAreaOpen] = useState<Record<string, boolean>>({ art: true });
  const [groupSearch, setGroupSearch] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiHint, setAiHint] = useState(false);
  const [triedSave, setTriedSave] = useState(false);

  useEffect(() => {
    let lesson = loadEditableLesson(lessonId);
    if (!lesson) {
      const card = loadBoardCards().find((c) => c.lessonId === lessonId);
      if (card) lesson = ensureEditableFromCard(card);
    }
    if (lesson) setDraft(lesson);
  }, [lessonId]);

  const filteredTree = useMemo(() => {
    const q = groupSearch.trim().toLowerCase();
    return DEVELOPMENT_AREA_TREE.map((area) => ({
      ...area,
      groups: area.groups.filter((g) => !q || g.name.toLowerCase().includes(q)),
    })).filter((a) => a.groups.length > 0 || !q);
  }, [groupSearch]);

  if (!draft) {
    return (
      <div className="pt-page">
        <ProgressTrackingPageHeader
          title="Edit Lesson"
          description="Update lesson details for the progress board."
          icon={<BookOpen size={22} strokeWidth={2.1} />}
        />
        <div className="pt-shell el-shell">
          <p className="el-missing">Lesson not found.</p>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => router.push('/progress-tracking/progress-boards')}
          >
            Back to Progress Boards
          </button>
        </div>
      </div>
    );
  }

  const set = <K extends keyof EditableLesson>(key: K, value: EditableLesson[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const errors = {
    title: !draft.title.trim(),
    lessonSets: draft.lessonSets.length === 0,
    room: !draft.roomId,
  };
  const canSave = !errors.title && !errors.lessonSets && !errors.room;

  const toggleArea = (name: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const has = prev.developmentAreas.includes(name);
      return {
        ...prev,
        developmentAreas: has
          ? prev.developmentAreas.filter((x) => x !== name)
          : [...prev.developmentAreas, name],
      };
    });
  };

  const toggleGroup = (name: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const has = prev.groups.includes(name);
      return {
        ...prev,
        groups: has ? prev.groups.filter((x) => x !== name) : [...prev.groups, name],
      };
    });
  };

  const cancel = () => router.push('/progress-tracking/progress-boards');

  const save = () => {
    setTriedSave(true);
    if (!canSave) return;
    const next: EditableLesson = {
      ...draft,
      title: draft.title.trim(),
    };
    const saved = saveEditableLesson(next);
    const cards = loadBoardCards().map((c) =>
      c.lessonId === saved.id
        ? {
            ...c,
            lessonTitle: saved.title,
            ageBand: saved.ageBands[0] ?? c.ageBand,
            category: saved.developmentAreas[0] ?? c.category,
            group: saved.groups[0] ?? c.group,
            updatedLabel: saved.updatedLabel,
          }
        : c,
    );
    saveBoardCards(cards);
    router.push('/progress-tracking/progress-boards');
  };

  const applyAiDraft = (ai: AiLessonDraft) => {
    const materialsLine = ai.materials.length
      ? `• Materials: ${ai.materials.join(', ')}`
      : '• Soft pencils, shading strip, and scrap practice paper';
    const description = [
      'What is it?',
      `• ${ai.objectives} — a guided ${ai.environment.toLowerCase()} activity for ages ${ai.ageBands.join(', ') || 'the classroom'} (${ai.durationMin} mins).`,
      '',
      'Why do we do it?',
      '• Strengthens fine motor control and careful observation',
      '• Builds confidence through progressive mastery',
      ai.curriculum !== 'None' ? `• Aligned with ${ai.curriculum}` : '• Supports classroom curriculum goals',
      '',
      'Supporting interest at home:',
      materialsLine,
      '• Invite children to notice light, shadow, and gradients in daily life',
    ].join('\n');

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            title: ai.objectives || prev.title,
            lessonSets: ai.lessonSets.length ? ai.lessonSets : prev.lessonSets,
            ageBands: ai.ageBands.length ? ai.ageBands : prev.ageBands,
            developmentAreas: ai.developmentAreas.length
              ? ai.developmentAreas
              : prev.developmentAreas,
            durationMin: ai.durationMin,
            description,
          }
        : prev,
    );
    setAiOpen(false);
    setAiHint(true);
    window.setTimeout(() => {
      setAiHint(false);
      descRef.current?.focus();
      descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1800);
  };

  return (
    <div className="pt-page el-page">
      <ProgressTrackingPageHeader
        title="Edit Lesson"
        description="Update lesson details for the progress board."
        icon={<BookOpen size={22} strokeWidth={2.1} />}
        actions={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={cancel}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
              Save
            </button>
          </>
        }
      />

      <div className="el-form-shell">
        {/* 1. Basics */}
        <section className="el-section">
          <SectionHead
            step={1}
            title="Basics"
            subtitle="The essentials of this lesson."
            action={
              <button type="button" className="el-ai-btn" onClick={() => setAiOpen(true)}>
                <Sparkles size={15} aria-hidden />
                Write with AI
              </button>
            }
          />
          {aiHint ? (
            <p className="el-ai-toast">Description drafted with AI — review before saving.</p>
          ) : null}

          <div className={`ui-field${triedSave && errors.title ? ' is-invalid' : ''}`}>
            <label className="ui-label" htmlFor="el-title">
              Lesson Title <span className="el-req">*</span>
            </label>
            <input
              id="el-title"
              className="ui-input"
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {triedSave && errors.title ? (
              <span className="el-error">Lesson title is required</span>
            ) : null}
          </div>

          <div className="ui-grid-2">
            <div className={`ui-field${triedSave && errors.lessonSets ? ' is-invalid' : ''}`}>
              <span className="ui-label">
                Lesson Set <span className="el-req">*</span>
              </span>
              <ChipMulti
                values={draft.lessonSets}
                options={LESSON_SET_OPTIONS}
                onChange={(v) => set('lessonSets', v)}
                placeholder="Select lesson set"
              />
              {triedSave && errors.lessonSets ? (
                <span className="el-error">Select at least one lesson set</span>
              ) : null}
            </div>
            <div className={`ui-field${triedSave && errors.room ? ' is-invalid' : ''}`}>
              <label className="ui-label" htmlFor="el-room">
                Room <span className="el-req">*</span>
              </label>
              <OdFilterDropdown
                className="el-dd"
                value={draft.roomId || ''}
                onChange={(v) => set('roomId', v)}
                options={[
                  { value: '', label: 'Room' },
                  ...PROGRESS_ROOMS.filter((r) => r.id !== 'all').map((r) => ({
                    value: r.id,
                    label: r.name,
                  })),
                ]}
                ariaLabel="Room"
              />
              {triedSave && errors.room ? (
                <span className="el-error">Room is required</span>
              ) : null}
            </div>
          </div>

          <div className="ui-field">
            <span className="ui-label">Age Band</span>
            <ChipMulti
              values={draft.ageBands}
              options={AGE_BAND_OPTIONS}
              onChange={(v) => set('ageBands', v)}
              placeholder="Select age band"
            />
          </div>
        </section>

        {/* 2. Content */}
        <section className="el-section">
          <SectionHead
            step={2}
            title="Content"
            subtitle="Describe the lesson and add supporting links."
          />

          <div className="ui-field">
            <span className="ui-label">Description</span>
            <div className="el-editor">
              <div className="el-editor-toolbar" aria-hidden>
                <span>
                  <Bold size={14} />
                </span>
                <span>
                  <Italic size={14} />
                </span>
                <span>
                  <Underline size={14} />
                </span>
                <span className="el-editor-sep" />
                <span>Normal</span>
                <span>
                  <AlignLeft size={14} />
                </span>
                <span>
                  <Smile size={14} />
                </span>
              </div>
              <textarea
                ref={descRef}
                className="ui-textarea el-editor-body"
                rows={12}
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </div>

          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label" htmlFor="el-duration">
                Duration
              </label>
              <div className="el-duration">
                <input
                  id="el-duration"
                  className="ui-input"
                  type="number"
                  min={0}
                  placeholder="Select duration"
                  value={draft.durationMin}
                  onChange={(e) => set('durationMin', e.target.value)}
                />
                <span>min</span>
              </div>
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="el-yt">
                YouTube Link
              </label>
              <div className="el-yt">
                <Video size={18} aria-hidden />
                <input
                  id="el-yt"
                  className="ui-input"
                  placeholder="Paste youtube link, eg: https://www.youtube.com"
                  value={draft.youtubeUrl}
                  onChange={(e) => set('youtubeUrl', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Development areas */}
        <section className="el-section">
          <SectionHead
            step={3}
            title="Development areas"
            subtitle="Tag what this lesson covers so teachers can track it."
          />

          <div className="ui-field">
            <span className="ui-label">Tag Development Areas</span>
            <ChipMulti
              values={draft.developmentAreas}
              options={DEVELOPMENT_AREA_TREE.map((a) => a.name)}
              onChange={(v) => set('developmentAreas', v)}
              placeholder="Select areas"
            />
          </div>

          <div className="ui-field">
            <input
              className="ui-input"
              type="search"
              placeholder="Search within selected areas"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              aria-label="Search within selected areas"
            />
          </div>

          <div className="el-area-list">
            {filteredTree.map((area) => {
              const open = areaOpen[area.id] ?? false;
              const areaChecked = draft.developmentAreas.includes(area.name);
              return (
                <div key={area.id} className="el-area-block">
                  <div className="el-area-row">
                    <button
                      type="button"
                      className="el-area-toggle"
                      onClick={() =>
                        setAreaOpen((prev) => ({ ...prev, [area.id]: !open }))
                      }
                      aria-expanded={open}
                    >
                      <ChevronDown size={16} className={open ? 'is-open' : ''} />
                      <strong>{area.name}</strong>
                    </button>
                    <label className="el-check">
                      <input
                        type="checkbox"
                        checked={areaChecked}
                        onChange={() => toggleArea(area.name)}
                      />
                    </label>
                  </div>
                  {open ? (
                    <ul className="el-group-list">
                      {area.groups.map((g) => (
                        <li key={g.id}>
                          <span>{g.name}</span>
                          <label className="el-check">
                            <input
                              type="checkbox"
                              checked={draft.groups.includes(g.name)}
                              onChange={() => toggleGroup(g.name)}
                            />
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="el-label">
              Labels
            </label>
            <OdFilterDropdown
              className="el-dd"
              value={draft.label || 'Select label'}
              onChange={(v) => set('label', v === 'Select label' ? '' : v)}
              options={LABEL_OPTIONS.map((l) => ({ value: l, label: l }))}
              ariaLabel="Labels"
            />
          </div>
        </section>

        {/* 4. Media */}
        <section className="el-section el-section-last">
          <SectionHead step={4} title="Media" subtitle="Attach supporting files." />
          <button type="button" className="el-upload">
            <Plus size={22} aria-hidden />
            <span>Upload Files</span>
          </button>
        </section>

        <div className="el-footer-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={cancel}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>

      <CreateLessonWithAiModal
        open={aiOpen}
        initial={{
          objectives: draft.title,
          developmentAreas: draft.developmentAreas,
          lessonSets: draft.lessonSets,
          ageBands: draft.ageBands,
          durationMin: draft.durationMin || '30',
          materials: [],
          environment: 'Indoor',
          curriculum: 'None',
        }}
        onClose={() => setAiOpen(false)}
        onGenerate={applyAiDraft}
      />
    </div>
  );
}

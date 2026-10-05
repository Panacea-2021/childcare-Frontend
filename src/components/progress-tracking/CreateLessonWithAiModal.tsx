'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { OdFilterDropdown } from './OdFilterDropdown';

export type AiLessonDraft = {
  objectives: string;
  developmentAreas: string[];
  lessonSets: string[];
  ageBands: string[];
  durationMin: string;
  materials: string[];
  environment: 'Indoor' | 'Outdoor' | 'Both';
  curriculum: string;
};

type Props = {
  open: boolean;
  initial?: Partial<AiLessonDraft>;
  onClose: () => void;
  onGenerate: (draft: AiLessonDraft) => void;
};

const DURATION_PRESETS = ['30', '60', '90'] as const;

const DEVELOPMENT_AREA_OPTIONS = [
  'Mathematics',
  'Language Arts',
  'Botany',
  'Geography',
  'Geometry',
  'History',
  'Science',
  'Zoology',
  'Art',
  'Practical Life',
];

const LESSON_CATEGORY_OPTIONS = [
  'Elementary (6-9)',
  'Elementary (9-12)',
  'Elementary (6-12)',
  'Primary (3-6)',
  'Toddler (1.5-3)',
  'aaaaaaa',
];

const AGE_BAND_OPTIONS = [
  '40 to 60+ months',
  '30 to 50 months',
  '22 to 36 months',
  '16 to 26 months',
  '8 to 20 months',
  '1.5-3',
  '3-6',
  '6-9',
  '6-12',
  '9-12',
];

const MATERIAL_OPTIONS = [
  'Crayons',
  'Paper',
  'Blocks',
  'Paint',
  'Music Instruments',
  'Books',
  'Pencils',
  'Scissors',
];

const CURRICULUM_OPTIONS = ['None', 'Montessori', 'EYFS', 'US State'];

function SearchableMulti({
  values,
  options,
  onChange,
  placeholder,
  searchable = true,
}: {
  values: string[];
  options: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (item: string) => {
    onChange(
      values.includes(item) ? values.filter((x) => x !== item) : [...values, item],
    );
  };

  return (
    <div className="el-ai-select" ref={boxRef}>
      <div
        className={`el-ai-select-control${open ? ' is-open' : ''}`}
        onClick={() => setOpen(true)}
      >
        <div className="el-ai-select-chips">
          {values.length === 0 ? (
            searchable && open ? null : (
              <span className="el-ph">{placeholder}</span>
            )
          ) : (
            values.map((v) => (
              <span key={v} className="el-chip">
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
                      onChange(values.filter((x) => x !== v));
                    }
                  }}
                >
                  ×
                </span>
              </span>
            ))
          )}
          {searchable && open ? (
            <input
              ref={inputRef}
              className="el-ai-select-input"
              value={query}
              placeholder={values.length ? '' : placeholder}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label={placeholder}
            />
          ) : null}
        </div>
        {searchable ? (
          <Search size={16} className="el-ai-select-icon" aria-hidden />
        ) : (
          <button
            type="button"
            className="el-ai-select-caret"
            aria-label="Toggle"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {open ? (
        <div className="el-ai-select-menu" role="listbox">
          {filtered.length === 0 ? (
            <p className="el-ai-select-empty">No matches</p>
          ) : (
            filtered.map((o) => {
              const selected = values.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`el-ai-select-option${selected ? ' is-selected' : ''}`}
                  onClick={() => toggle(o)}
                >
                  <span>{o}</span>
                  {selected ? <Check size={15} aria-hidden /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CreateLessonWithAiModal({ open, initial, onClose, onGenerate }: Props) {
  const [objectives, setObjectives] = useState('');
  const [developmentAreas, setDevelopmentAreas] = useState<string[]>([]);
  const [lessonSets, setLessonSets] = useState<string[]>([]);
  const [ageBands, setAgeBands] = useState<string[]>([]);
  const [durationMode, setDurationMode] = useState<'30' | '60' | '90' | 'custom'>('30');
  const [customMins, setCustomMins] = useState('15');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<'Indoor' | 'Outdoor' | 'Both'>('Indoor');
  const [curriculum, setCurriculum] = useState('None');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setObjectives(initial?.objectives ?? '');
    setDevelopmentAreas(initial?.developmentAreas ?? []);
    setLessonSets(initial?.lessonSets ?? []);
    setAgeBands(initial?.ageBands ?? []);
    const d = initial?.durationMin ?? '30';
    if (DURATION_PRESETS.includes(d as (typeof DURATION_PRESETS)[number])) {
      setDurationMode(d as '30' | '60' | '90');
      setCustomMins('15');
    } else if (d) {
      setDurationMode('custom');
      setCustomMins(d);
    } else {
      setDurationMode('30');
      setCustomMins('15');
    }
    setMaterials(initial?.materials ?? []);
    setEnvironment(initial?.environment ?? 'Indoor');
    setCurriculum(initial?.curriculum ?? 'None');
    setAdvancedOpen(false);
    setTried(false);
  }, [open, initial]);

  const durationMin = durationMode === 'custom' ? customMins.trim() : durationMode;

  const canGenerate =
    objectives.trim().length > 0 &&
    lessonSets.length > 0 &&
    ageBands.length > 0 &&
    Boolean(durationMin) &&
    Number(durationMin) > 0;

  const handleGenerate = () => {
    setTried(true);
    if (!canGenerate) return;
    onGenerate({
      objectives: objectives.trim(),
      developmentAreas,
      lessonSets,
      ageBands,
      durationMin,
      materials,
      environment,
      curriculum,
    });
  };

  return (
    <Modal
      open={open}
      title="Create Lesson with AI"
      onClose={onClose}
      elevated
      icon={<Sparkles size={18} aria-hidden />}
      footer={
        <button type="button" className="el-ai-generate" onClick={handleGenerate}>
          Generate
        </button>
      }
    >
      <div className="el-ai-form">
        <div className={`ui-field${tried && !objectives.trim() ? ' is-invalid' : ''}`}>
          <label className="ui-label" htmlFor="ai-objectives">
            Learning Objectives/Keywords <span className="el-req">*</span>
          </label>
          <input
            id="ai-objectives"
            className="ui-input"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="e.g. Ten Steps of Gradation from Black to White"
          />
        </div>

        <div className="ui-field">
          <span className="ui-label">Development areas</span>
          <SearchableMulti
            values={developmentAreas}
            options={DEVELOPMENT_AREA_OPTIONS}
            onChange={setDevelopmentAreas}
            placeholder="Select development areas"
          />
        </div>

        <div className={`ui-field${tried && lessonSets.length === 0 ? ' is-invalid' : ''}`}>
          <span className="ui-label">
            Lesson Category <span className="el-req">*</span>
          </span>
          <SearchableMulti
            values={lessonSets}
            options={LESSON_CATEGORY_OPTIONS}
            onChange={setLessonSets}
            placeholder="Select lesson category"
          />
        </div>

        <div className={`ui-field${tried && ageBands.length === 0 ? ' is-invalid' : ''}`}>
          <span className="ui-label">
            Age Band <span className="el-req">*</span>
          </span>
          <SearchableMulti
            values={ageBands}
            options={AGE_BAND_OPTIONS}
            onChange={setAgeBands}
            placeholder="Select age band"
          />
        </div>

        <div className="ui-field">
          <span className="ui-label">
            Duration <span className="el-req">*</span>
          </span>
          <div className="el-ai-duration" role="radiogroup" aria-label="Duration">
            {DURATION_PRESETS.map((mins) => (
              <label key={mins} className="el-ai-radio">
                <input
                  type="radio"
                  name="ai-duration"
                  checked={durationMode === mins}
                  onChange={() => setDurationMode(mins)}
                />
                <span>{mins} mins</span>
              </label>
            ))}
            <label className="el-ai-radio el-ai-radio-custom">
              <input
                type="radio"
                name="ai-duration"
                checked={durationMode === 'custom'}
                onChange={() => setDurationMode('custom')}
              />
              <input
                className="ui-input"
                type="number"
                min={1}
                value={customMins}
                onChange={(e) => {
                  setDurationMode('custom');
                  setCustomMins(e.target.value);
                }}
                onFocus={() => setDurationMode('custom')}
                aria-label="Custom duration"
              />
              <span>mins</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          className="el-ai-advanced"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
        >
          Advanced Options
          {advancedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {advancedOpen ? (
          <div className="el-ai-advanced-body">
            <div className="ui-field">
              <span className="ui-label">Materials Available</span>
              <SearchableMulti
                values={materials}
                options={MATERIAL_OPTIONS}
                onChange={setMaterials}
                placeholder="Select or type available materials"
              />
            </div>

            <div className="ui-field">
              <span className="ui-label">Learning Environment</span>
              <div className="el-ai-duration" role="radiogroup" aria-label="Learning environment">
                {(['Indoor', 'Outdoor', 'Both'] as const).map((env) => (
                  <label key={env} className="el-ai-radio">
                    <input
                      type="radio"
                      name="ai-env"
                      checked={environment === env}
                      onChange={() => setEnvironment(env)}
                    />
                    <span>{env}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor="ai-curriculum">
                Curriculum Framework
              </label>
              <OdFilterDropdown
                className="el-dd"
                value={curriculum}
                onChange={setCurriculum}
                options={CURRICULUM_OPTIONS.map((c) => ({ value: c, label: c }))}
                ariaLabel="Curriculum Framework"
              />
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

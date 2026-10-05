'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Sparkles, X } from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import {
  AGE_BANDS,
  DURATION_OPTIONS,
  DIFFICULTY_LEVELS,
  LEARNING_GOALS,
  LESSON_SETS,
  TEACHING_STYLES,
  TEACHING_TONES,
} from './constants';
import { generateLessonDescription } from './generateLessonAi';
import { MultiSelect } from './MultiSelect';
import { loadDevelopmentAreas } from './store';
import type { LessonFormState } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (html: string) => void;
  prefill?: Partial<LessonFormState> | null;
};

export function LessonAiModal({ open, onClose, onGenerate, prefill }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [lessonSet, setLessonSet] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [duration, setDuration] = useState('30 mins');
  const [customDuration, setCustomDuration] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [teachingStyle, setTeachingStyle] = useState('Play Based');
  const [learningGoal, setLearningGoal] = useState('Creativity');
  const [difficulty, setDifficulty] = useState('Easy');
  const [teachingTone, setTeachingTone] = useState('Friendly');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setAreaOptions(loadDevelopmentAreas());
    setKeywords('');
    setAreas(prefill?.developmentAreas ?? []);
    setLessonSet(prefill?.lessonSet ?? '');
    setAgeBand(prefill?.ageBand ?? '');
    setDuration(prefill?.duration && prefill.duration !== 'Custom' ? prefill.duration : '30 mins');
    setCustomDuration(prefill?.customDuration ?? '');
    setAdvancedOpen(true);
    setTeachingStyle('Play Based');
    setLearningGoal('Creativity');
    setDifficulty('Easy');
    setTeachingTone('Friendly');
    setError('');
    setBusy(false);
  }, [open, prefill]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const generate = async () => {
    if (!keywords.trim()) {
      setError('Learning objective / keywords are required');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 650));
      const html = generateLessonDescription({
        keywords: keywords.trim(),
        developmentAreas: areas,
        lessonSet,
        ageBand,
        duration: duration === 'Custom' ? customDuration || 'Custom' : duration,
        teachingStyle,
        learningGoal,
        difficulty,
        teachingTone,
      });
      onGenerate(html);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog les-ai-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  ✨
                </span>
                <div>
                  <h2 id={titleId}>Write with AI</h2>
                  <p>Generate a professional lesson description</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <div className="ui-field">
                <label className="ui-label" htmlFor="ai-keywords">
                  Learning Objective / Keywords *
                </label>
                <input
                  id="ai-keywords"
                  className="ui-input"
                  placeholder="e.g. Dancing, Solar System, Alphabet"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  autoFocus
                />
                {error ? <p className="cal-field-error">{error}</p> : null}
              </div>

              <MultiSelect
                id="ai-areas"
                placeholder="Development Areas"
                values={areas}
                onChange={setAreas}
                options={areaOptions.map((a) => ({ value: a, label: a }))}
              />

              <div className="cal-modal-grid" style={{ marginTop: 12 }}>
                <PremiumSelect
                  placeholder="Lesson Set"
                  value={lessonSet}
                  searchable
                  onChange={setLessonSet}
                  options={LESSON_SETS.map((s) => ({ value: s, label: s }))}
                />
                <PremiumSelect
                  placeholder="Age Band"
                  value={ageBand}
                  searchable
                  onChange={setAgeBand}
                  options={AGE_BANDS.map((a) => ({ value: a, label: a }))}
                />
              </div>

              <fieldset className="les-radio-group">
                <legend>Duration</legend>
                <div className="les-radio-grid">
                  {DURATION_OPTIONS.filter((d) => d !== 'Custom').map((d) => (
                    <label key={d} className={`les-radio ${duration === d ? 'is-on' : ''}`}>
                      <input
                        type="radio"
                        name="ai-duration"
                        checked={duration === d}
                        onChange={() => setDuration(d)}
                      />
                      {d}
                    </label>
                  ))}
                  <label className={`les-radio ${duration === 'Custom' ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="ai-duration"
                      checked={duration === 'Custom'}
                      onChange={() => setDuration('Custom')}
                    />
                    Custom
                  </label>
                </div>
                {duration === 'Custom' ? (
                  <input
                    className="ui-input"
                    style={{ marginTop: 10 }}
                    placeholder="e.g. 25 mins"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                  />
                ) : null}
              </fieldset>

              <div className={`les-accordion ${advancedOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="les-accordion-trigger"
                  aria-expanded={advancedOpen}
                  onClick={() => setAdvancedOpen((v) => !v)}
                >
                  <span>
                    <strong>Advanced Options</strong>
                    <em>Teaching style, goals, difficulty &amp; tone</em>
                  </span>
                  <ChevronDown
                    size={18}
                    className={advancedOpen ? 'is-open' : ''}
                    aria-hidden
                  />
                </button>
                {advancedOpen ? (
                  <div className="les-accordion-body">
                    <div className="les-advanced-grid">
                      <div className="ui-field">
                        <label className="ui-label">Teaching Style</label>
                        <PremiumSelect
                          placeholder="Teaching Style"
                          value={teachingStyle}
                          onChange={setTeachingStyle}
                          options={TEACHING_STYLES.map((s) => ({ value: s, label: s }))}
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label">Learning Goal</label>
                        <PremiumSelect
                          placeholder="Learning Goal"
                          value={learningGoal}
                          onChange={setLearningGoal}
                          options={LEARNING_GOALS.map((s) => ({ value: s, label: s }))}
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label">Difficulty Level</label>
                        <PremiumSelect
                          placeholder="Difficulty Level"
                          value={difficulty}
                          onChange={setDifficulty}
                          options={DIFFICULTY_LEVELS.map((s) => ({ value: s, label: s }))}
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label">Teaching Tone</label>
                        <PremiumSelect
                          placeholder="Teaching Tone"
                          value={teachingTone}
                          onChange={setTeachingTone}
                          options={TEACHING_TONES.map((s) => ({ value: s, label: s }))}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="les-ai-btn les-ai-btn-lg" onClick={generate} disabled={busy}>
                <Sparkles size={16} aria-hidden />
                {busy ? 'Generating…' : 'Generate'}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

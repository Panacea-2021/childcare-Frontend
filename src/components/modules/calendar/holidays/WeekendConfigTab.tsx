'use client';

import { useMemo, useState } from 'react';
import { LazyMotion, MotionConfig, AnimatePresence, domAnimation, m } from 'framer-motion';
import { Check, ChevronDown, Info, Loader2, X } from 'lucide-react';
import type { WeekdayKey, WeekendDayConfig } from './types';
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from './mockData';

type Props = {
  config: WeekendDayConfig[];
  onChange: (next: WeekendDayConfig[]) => void;
  onSave: () => Promise<void> | void;
};

const WEEK_LABELS = ['1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week'];

export function WeekendConfigTab({ config, onChange, onSave }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selected = useMemo(() => new Set(config.map((c) => c.day)), [config]);

  const addDay = (day: WeekdayKey) => {
    if (selected.has(day)) return;
    onChange([...config, { day, weeks: [true, true, true, true, true] }]);
    setPickerOpen(false);
  };

  const removeDay = (day: WeekdayKey) => {
    onChange(config.filter((c) => c.day !== day));
  };

  const toggleWeek = (day: WeekdayKey, weekIndex: number) => {
    onChange(
      config.map((c) => {
        if (c.day !== day) return c;
        const weeks = [...c.weeks] as WeekendDayConfig['weeks'];
        weeks[weekIndex] = !weeks[weekIndex];
        return { ...c, weeks };
      }),
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } finally {
      setSaving(false);
    }
  };

  const available = WEEKDAY_ORDER.filter((d) => !selected.has(d));

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="sh-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sh-weekend-field">
            <div className="sh-weekend-label">
              <span>Configure Weekend Days</span>
              <span className="sh-info-tip" title="Select which weekdays count as weekends for staff.">
                <Info size={14} aria-hidden />
              </span>
            </div>

            <div className="sh-multi">
              <div className="sh-pills">
                <AnimatePresence initial={false}>
                  {config.map((c) => (
                    <m.span
                      key={c.day}
                      className="sh-pill"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      {WEEKDAY_LABELS[c.day]}
                      <button
                        type="button"
                        aria-label={`Remove ${WEEKDAY_LABELS[c.day]}`}
                        onClick={() => removeDay(c.day)}
                      >
                        <X size={12} />
                      </button>
                    </m.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="sh-multi-add">
                <button
                  type="button"
                  className="sh-year-btn sh-multi-btn"
                  aria-haspopup="listbox"
                  aria-expanded={pickerOpen}
                  onClick={() => setPickerOpen((v) => !v)}
                  disabled={available.length === 0}
                >
                  Add day
                  <ChevronDown size={14} aria-hidden />
                </button>
                <AnimatePresence>
                  {pickerOpen ? (
                    <m.ul
                      className="sh-year-menu"
                      role="listbox"
                      aria-label="Add weekend day"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      {available.map((day) => (
                        <li key={day}>
                          <button type="button" role="option" onClick={() => addDay(day)}>
                            {WEEKDAY_LABELS[day]}
                          </button>
                        </li>
                      ))}
                    </m.ul>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="sh-weekend-board">
            <div className="sh-weekend-head">
              <span>Selected days</span>
              {WEEK_LABELS.map((label) => (
                <span key={label} className="sh-week-col">
                  {label}
                </span>
              ))}
            </div>

            {config.length === 0 ? (
              <div className="sh-weekend-empty">Select weekend days to configure the schedule board.</div>
            ) : (
              config.map((row, i) => (
                <m.div
                  key={row.day}
                  className="sh-weekend-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="sh-weekend-day">{WEEKDAY_LABELS[row.day]}</span>
                  {row.weeks.map((on, wi) => (
                    <label key={wi} className="sh-week-cell" data-label={WEEK_LABELS[wi]}>
                      <span className="sh-week-cell-label" aria-hidden>
                        {WEEK_LABELS[wi]}
                      </span>
                      <span className="sr-only">
                        {WEEKDAY_LABELS[row.day]} {WEEK_LABELS[wi]}
                      </span>
                      <span className="sh-check">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleWeek(row.day, wi)}
                        />
                        <m.span
                          className="sh-check-ui"
                          aria-hidden
                          animate={on ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                          transition={{ duration: 0.28 }}
                        >
                          <Check size={12} />
                        </m.span>
                      </span>
                    </label>
                  ))}
                </m.div>
              ))
            )}

            <div className="sh-weekend-footer">
              <m.button
                type="button"
                className={`cal-btn-save sh-cta-lg${saved ? ' is-success' : ''}`}
                onClick={handleSave}
                disabled={saving}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="cal-btn-save-shine" aria-hidden />
                {saving ? (
                  <span className="cal-saving">
                    <Loader2 size={16} className="cal-spin" /> Saving…
                  </span>
                ) : saved ? (
                  <span className="cal-saving">
                    <Check size={16} /> Saved
                  </span>
                ) : (
                  'Save'
                )}
              </m.button>
            </div>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}

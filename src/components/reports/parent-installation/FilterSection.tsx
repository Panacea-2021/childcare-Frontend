'use client';

import { m, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import type { FilterValues } from './types';
import {
  CAMPUS_OPTIONS,
  INSTALL_STATUS_OPTIONS,
  INVITE_STATUS_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from './mockData';

type Props = {
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
};

const CAMPUS_SELECT = [
  { value: '', label: 'All campuses' },
  ...CAMPUS_OPTIONS.map((o) => ({ value: o, label: o })),
];

const STUDENT_STATUS_SELECT = [
  { value: '', label: 'All' },
  ...STUDENT_STATUS_OPTIONS.map((o) => ({ value: o, label: o })),
];

export function FilterSection({ values, onChange, onSearch, onReset, loading }: Props) {
  const reduce = useReducedMotion();

  if (loading) {
    return <div className="pai-filter-card pai-skel pai-skel-filter animate-pulse" aria-hidden />;
  }

  const set = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const focusMotion = reduce ? undefined : { scale: 1.01 };
  const btnHover = reduce ? undefined : { scale: 1.03 };
  const btnTap = reduce ? undefined : { scale: 0.97 };

  return (
    <m.div
      className="pai-filter-card"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { delay: 0.25, duration: 0.45, ease: 'easeOut' }}
    >
      <section aria-label="Filters">
        <div className="pai-filter-head">
          <h3>Filters</h3>
          <p>Search students and refine by campus, status and installation.</p>
        </div>

        <div className="pai-filter-grid pai-filter-grid-5">
          <div className="ui-field">
            <label className="ui-label" htmlFor="pai-student-q">
              Search Student Name
            </label>
            <div className="pai-input-icon-wrap">
              <Search size={15} className="pai-input-icon" aria-hidden />
              <m.input
                id="pai-student-q"
                className="ui-input pai-input-glow"
                placeholder="Student name or admission number"
                value={values.studentQuery}
                onChange={(e) => set('studentQuery', e.target.value)}
                whileFocus={focusMotion}
              />
            </div>
          </div>
          <div className="ui-field pai-filter-select">
            <span className="ui-label">Campus</span>
            <SearchableSelect
              value={values.campus}
              onChange={(v) => set('campus', v)}
              options={CAMPUS_SELECT}
              placeholder="All campuses"
              searchPlaceholder="Search campus…"
              ariaLabel="Campus"
            />
          </div>
          <div className="ui-field pai-filter-select">
            <span className="ui-label">Student Status</span>
            <SearchableSelect
              value={values.studentStatus}
              onChange={(v) => set('studentStatus', v)}
              options={STUDENT_STATUS_SELECT}
              placeholder="All"
              searchable={false}
              ariaLabel="Student Status"
            />
          </div>
          <div className="ui-field pai-filter-select">
            <span className="ui-label">Parent Installation Status</span>
            <SearchableSelect
              value={values.parentInstallationStatus}
              onChange={(v) => set('parentInstallationStatus', v)}
              options={INSTALL_STATUS_OPTIONS}
              placeholder="All"
              searchable={false}
              ariaLabel="Parent Installation Status"
            />
          </div>
          <div className="ui-field pai-filter-select">
            <span className="ui-label">Invitation Status</span>
            <SearchableSelect
              value={values.invitationStatus}
              onChange={(v) => set('invitationStatus', v)}
              options={INVITE_STATUS_OPTIONS}
              placeholder="All"
              searchable={false}
              ariaLabel="Invitation Status"
            />
          </div>
        </div>

        <div className="pai-filter-actions">
          <m.button
            type="button"
            className="ui-btn ui-btn-outline pai-reset-btn transition-all duration-200"
            onClick={onReset}
            whileHover={btnHover}
            whileTap={btnTap}
          >
            <RotateCcw size={14} className="pai-reset-ico" aria-hidden />
            Reset
          </m.button>
          <m.button
            type="button"
            className="ui-btn ui-btn-primary transition-all duration-200"
            onClick={onSearch}
            whileHover={btnHover}
            whileTap={btnTap}
          >
            <Search size={14} style={{ marginRight: 6 }} aria-hidden />
            Search
          </m.button>
        </div>
      </section>
    </m.div>
  );
}

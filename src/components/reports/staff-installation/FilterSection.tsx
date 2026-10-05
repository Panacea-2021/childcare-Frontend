'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import type { FilterValues } from './types';
import {
  CAMPUS_OPTIONS,
  INSTALL_STATUS_OPTIONS,
  INVITE_STATUS_OPTIONS,
  STAFF_STATUS_OPTIONS,
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

const STAFF_STATUS_SELECT = [
  { value: '', label: 'All' },
  ...STAFF_STATUS_OPTIONS.map((o) => ({ value: o, label: o })),
];

export function FilterSection({ values, onChange, onSearch, onReset, loading }: Props) {
  const reduce = useReducedMotion();

  if (loading) {
    return <div className="pai-filter-card pai-skel pai-skel-filter" aria-hidden />;
  }

  const set = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const focusMotion = reduce ? undefined : { scale: 1.01 };
  const btnHover = reduce ? undefined : { scale: 1.03 };
  const btnTap = reduce ? undefined : { scale: 0.97 };

  return (
    <motion.section
      className="pai-filter-card"
      aria-label="Filters"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { delay: 0.12, duration: 0.4, ease: 'easeOut' }}
    >
      <div className="pai-filter-head">
        <h3>Filters</h3>
        <p>Search staff and refine by campus, status and installation.</p>
      </div>

      <div className="pai-filter-grid pai-filter-grid-5">
        <div className="ui-field">
          <label className="ui-label" htmlFor="sai-staff-q">
            Search Staff Name
          </label>
          <div className="pai-input-icon-wrap">
            <Search size={15} className="pai-input-icon" aria-hidden />
            <motion.input
              id="sai-staff-q"
              className="ui-input pai-input-glow"
              placeholder="Staff name or employee ID"
              value={values.staffQuery}
              onChange={(e) => set('staffQuery', e.target.value)}
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
          <span className="ui-label">Staff Status</span>
          <SearchableSelect
            value={values.staffStatus}
            onChange={(v) => set('staffStatus', v)}
            options={STAFF_STATUS_SELECT}
            placeholder="All"
            searchable={false}
            ariaLabel="Staff Status"
          />
        </div>
        <div className="ui-field pai-filter-select">
          <span className="ui-label">Staff Installation Status</span>
          <SearchableSelect
            value={values.staffInstallationStatus}
            onChange={(v) => set('staffInstallationStatus', v)}
            options={INSTALL_STATUS_OPTIONS}
            placeholder="All"
            searchable={false}
            ariaLabel="Staff Installation Status"
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
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline pai-reset-btn"
          onClick={onReset}
          whileHover={btnHover}
          whileTap={btnTap}
        >
          <RotateCcw size={14} className="pai-reset-ico" aria-hidden />
          Reset
        </motion.button>
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={onSearch}
          whileHover={btnHover}
          whileTap={btnTap}
        >
          <Search size={14} style={{ marginRight: 6 }} aria-hidden />
          Search
        </motion.button>
      </div>
    </motion.section>
  );
}

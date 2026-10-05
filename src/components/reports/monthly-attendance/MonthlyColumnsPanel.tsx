'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react';
import type { MonthlyColumnId } from './monthlyUtils';
import { MONTHLY_COLUMNS } from './monthlyUtils';
import './monthly-attendance.css';

type Props = {
  mode: 'all' | 'custom';
  selected: MonthlyColumnId[];
  error?: string;
  onModeChange: (mode: 'all' | 'custom') => void;
  onSelectedChange: (next: MonthlyColumnId[]) => void;
};

const PAGE_CHUNKS = [8, 10, 4];

export function MonthlyColumnsPanel({
  mode,
  selected,
  error,
  onModeChange,
  onSelectedChange,
}: Props) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MONTHLY_COLUMNS;
    return MONTHLY_COLUMNS.filter((c) => c.label.toLowerCase().includes(query));
  }, [q]);

  const pages = useMemo(() => {
    if (q.trim()) {
      const chunks: (typeof MONTHLY_COLUMNS)[] = [];
      for (let i = 0; i < filtered.length; i += 8) chunks.push(filtered.slice(i, i + 8));
      return chunks.length ? chunks : [[]];
    }
    const chunks: (typeof MONTHLY_COLUMNS)[] = [];
    let cursor = 0;
    PAGE_CHUNKS.forEach((size) => {
      chunks.push(filtered.slice(cursor, cursor + size));
      cursor += size;
    });
    if (cursor < filtered.length) chunks.push(filtered.slice(cursor));
    return chunks.filter((c) => c.length > 0);
  }, [filtered, q]);

  const pageCount = Math.max(1, pages.length);
  const safePage = Math.min(page, pageCount - 1);
  const slice = pages[safePage] ?? [];
  const allIds = MONTHLY_COLUMNS.map((c) => c.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  const toggle = (id: MonthlyColumnId) => {
    if (selected.includes(id)) onSelectedChange(selected.filter((x) => x !== id));
    else onSelectedChange([...selected, id]);
  };

  return (
    <section className="mar-section">
      <p className="mar-section-label">Columns</p>
      <div className="mar-mode" role="radiogroup" aria-label="Column preset">
        {(
          [
            ['all', 'All Columns'],
            ['custom', 'Custom'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`mar-mode-btn${mode === id ? ' is-on' : ''}`}
            aria-pressed={mode === id}
            onClick={() => {
              onModeChange(id);
              setOpen(id === 'custom');
              setPage(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'all' ? (
        <p className="mar-hint">All {MONTHLY_COLUMNS.length} columns will be included in the report.</p>
      ) : (
        <div className="mar-col-panel">
          <button
            type="button"
            className={`mar-col-head${open ? ' is-open' : ''}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="mar-col-head-copy">
              <span className="mar-col-head-title">
                <ClipboardList size={17} aria-hidden />
                Select Columns
              </span>
              <span className="mar-col-head-sub">Choose which fields should appear in the report.</span>
            </span>
            <span className="mar-col-head-right">
              <motion.span
                key={selected.length}
                className="mar-badge"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.16 }}
              >
                {selected.length} Selected
              </motion.span>
              <ChevronDown size={18} className="mar-col-chevron" aria-hidden />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                className="mar-col-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <label className="mar-search">
                  <Search size={16} aria-hidden />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Search columns..."
                    aria-label="Search columns"
                  />
                </label>

                <div className="mar-toolbar">
                  <label className="mar-select-all">
                    <span className={`mar-check${allSelected ? ' is-on' : ''}`} aria-hidden>
                      {allSelected ? <Check size={12} strokeWidth={3} /> : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => onSelectedChange(allSelected ? [] : allIds)}
                    />
                    Select All Columns
                  </label>
                  <motion.span
                    key={`${selected.length}-${MONTHLY_COLUMNS.length}`}
                    className="mar-counter"
                    initial={{ opacity: 0.55, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {selected.length} / {MONTHLY_COLUMNS.length} Selected
                  </motion.span>
                </div>

                <div className="mar-grid" role="group" aria-label="Available columns">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {slice.map((col) => {
                      const checked = selected.includes(col.id);
                      return (
                        <motion.label
                          key={col.id}
                          className={`mar-option${checked ? ' is-on' : ''}`}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.16 }}
                        >
                          <span className={`mar-check${checked ? ' is-on' : ''}`} aria-hidden>
                            {checked ? <Check size={12} strokeWidth={3} /> : null}
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(col.id)}
                          />
                          {col.label}
                        </motion.label>
                      );
                    })}
                  </AnimatePresence>
                  {!slice.length ? <div className="mar-empty">No columns match your search.</div> : null}
                </div>

                <div className="mar-pager">
                  <button
                    type="button"
                    className="mar-page"
                    aria-label="Previous columns page"
                    disabled={safePage <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`mar-page${safePage === i ? ' is-on' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="mar-page"
                    aria-label="Next columns page"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
      {error ? <p className="mar-error">{error}</p> : null}
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Search, X } from 'lucide-react';
import { SegmentedControl } from '@/components/reports/shared/SegmentedControl';
import '@/components/reports/absentees-report/absentees-report.css';

export type ReportColumnDef<T extends string = string> = {
  id: T;
  label: string;
};

type ModeOption = {
  id: string;
  label: string;
};

type Props<T extends string> = {
  mode: string;
  modeOptions: ModeOption[];
  columns: ReportColumnDef<T>[];
  selected: T[];
  onModeChange: (mode: string) => void;
  onSelectedChange: (next: T[]) => void;
  /** When this mode is active, hide the custom panel (e.g. all/default). */
  compactModes?: string[];
  pageSize?: number;
  /** Optional uneven page sizes, e.g. [8, 10, 4]. Overrides pageSize when filtering is empty. */
  pageChunks?: number[];
  twoColumn?: boolean;
  error?: string;
  defaultOpen?: boolean;
  /** Hide built-in All/Custom radios when the parent renders its own Column Type control. */
  hideModeOptions?: boolean;
  /** Panel header title. Defaults to Select Columns. */
  panelTitle?: string;
  panelSubtitle?: string;
  searchPlaceholder?: string;
  selectAllLabel?: string;
  /** Hint shown when a compact mode is active. */
  compactHint?: string;
  /** Visual skin only — does not change selection/pagination/search behavior. */
  appearance?: 'default' | 'premium';
  /**
   * When true, skip the nested "Select Columns" accordion header and render the
   * selection body as an integrated card under the mode control.
   * Presentation only — search/selection/pagination behavior is unchanged.
   */
  inlinePanel?: boolean;
};

export function ReportColumnsSelector<T extends string>({
  mode,
  modeOptions,
  columns,
  selected,
  onModeChange,
  onSelectedChange,
  compactModes = ['default', 'all'],
  pageSize = 10,
  pageChunks,
  twoColumn = false,
  error,
  defaultOpen = true,
  hideModeOptions = false,
  panelTitle = 'Select Columns',
  panelSubtitle = 'Choose which fields should appear in your report.',
  searchPlaceholder = 'Search columns...',
  selectAllLabel = 'Select All Columns',
  compactHint,
  appearance = 'default',
  inlinePanel = false,
}: Props<T>) {
  const [open, setOpen] = useState(defaultOpen);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return columns;
    return columns.filter((c) => c.label.toLowerCase().includes(query));
  }, [columns, q]);

  const pages = useMemo(() => {
    if (!pageChunks?.length || q.trim()) {
      const chunks: ReportColumnDef<T>[][] = [];
      for (let i = 0; i < filtered.length; i += pageSize) {
        chunks.push(filtered.slice(i, i + pageSize));
      }
      return chunks.length ? chunks : [[]];
    }
    const chunks: ReportColumnDef<T>[][] = [];
    let cursor = 0;
    pageChunks.forEach((size) => {
      chunks.push(filtered.slice(cursor, cursor + size));
      cursor += size;
    });
    if (cursor < filtered.length) chunks.push(filtered.slice(cursor));
    return chunks.filter((c) => c.length > 0);
  }, [filtered, pageChunks, pageSize, q]);

  const pageCount = Math.max(1, pages.length);
  const safePage = Math.min(page, pageCount - 1);
  const slice = pages[safePage] ?? [];
  const allIds = columns.map((c) => c.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));
  const showPanel = !compactModes.includes(mode);
  const premium = appearance === 'premium';
  const panelExpanded = inlinePanel ? true : open;
  const selectedCountLabel = inlinePanel
    ? `Selected: ${selected.length} / ${columns.length}`
    : premium
      ? `${selected.length} Selected`
      : `${selected.length} / ${columns.length} Selected`;

  const toggle = (id: T) => {
    if (selected.includes(id)) onSelectedChange(selected.filter((x) => x !== id));
    else onSelectedChange([...selected, id]);
  };

  const defaultHint =
    compactHint ?? `All ${columns.length} columns will be included in the report.`;

  const rootClass = [
    'asr-field',
    'ab-columns',
    hideModeOptions ? 'ab-columns-external-mode' : '',
    premium ? 'ab-columns-premium' : '',
    inlinePanel ? 'ab-columns-inline' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const panelBody = (
    <div className="ab-col-inner">
      <div className="ab-col-sticky">
        <label className="asr-dd-search ab-col-search">
          <Search size={16} aria-hidden />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            aria-label="Search columns"
          />
          {q ? (
            <button
              type="button"
              className="ab-col-search-clear"
              aria-label="Clear column search"
              onClick={(e) => {
                e.preventDefault();
                setQ('');
                setPage(0);
              }}
            >
              <X size={14} />
            </button>
          ) : null}
        </label>

        <label className="ab-col-select-all">
          <span className={`asr-dd-checkbox${allSelected ? ' is-on' : ''}`} aria-hidden>
            <AnimatePresence initial={false} mode="wait">
              {allSelected ? (
                <motion.span
                  key="on"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onSelectedChange(allSelected ? [] : allIds)}
          />
          <span>{selectAllLabel}</span>
          <em className="ab-col-counter">
            <motion.span
              key={`${selected.length}-${columns.length}`}
              className="ab-col-counter-badge"
              initial={{ opacity: 0.45, y: 3, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18 }}
            >
              {selectedCountLabel}
            </motion.span>
          </em>
        </label>
      </div>

      <div
        className={`ab-col-list${twoColumn ? ' is-two-col' : ''}`}
        role="group"
        aria-label="Available columns"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {slice.map((col) => {
            const checked = selected.includes(col.id);
            return (
              <motion.label
                key={col.id}
                className={`ab-col-item${checked ? ' is-on' : ''}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.16 }}
              >
                <span className={`asr-dd-checkbox${checked ? ' is-on' : ''}`} aria-hidden>
                  <AnimatePresence initial={false} mode="wait">
                    {checked ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.45, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.45, opacity: 0 }}
                        transition={{ duration: 0.14 }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
                <input type="checkbox" checked={checked} onChange={() => toggle(col.id)} />
                {col.label}
              </motion.label>
            );
          })}
        </AnimatePresence>
        {!slice.length ? (
          <div className={premium || inlinePanel ? 'ab-col-empty' : 'asr-dd-empty'}>
            {premium || inlinePanel ? (
              <>
                <span className="ab-col-empty-icon" aria-hidden>
                  <Search size={18} />
                </span>
                <strong>No matching columns found</strong>
                <span>Try another search keyword.</span>
              </>
            ) : (
              'No columns match your search.'
            )}
          </div>
        ) : null}
      </div>

      <div className="ab-col-pager" role="navigation" aria-label="Column pages">
        <button
          type="button"
          className={`ab-page-btn${premium || inlinePanel ? ' ab-page-btn-nav' : ''}`}
          aria-label="Previous columns page"
          disabled={safePage <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft size={16} />
          {premium || inlinePanel ? <span>Previous</span> : null}
        </button>
        {Array.from({ length: pageCount }, (_, i) => (
          <motion.button
            key={i}
            type="button"
            className={`ab-page-btn${safePage === i ? ' is-on' : ''}`}
            onClick={() => setPage(i)}
            aria-label={`Page ${i + 1}`}
            aria-current={safePage === i ? 'page' : undefined}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {i + 1}
          </motion.button>
        ))}
        <button
          type="button"
          className={`ab-page-btn${premium || inlinePanel ? ' ab-page-btn-nav' : ''}`}
          aria-label="Next columns page"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        >
          {premium || inlinePanel ? <span>Next</span> : null}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={rootClass}>
      {!hideModeOptions ? (
        <SegmentedControl
          label={premium ? 'Export Mode' : 'Columns'}
          ariaLabel="Column preset"
          name="report-column-mode"
          value={mode}
          onChange={(next) => {
            onModeChange(next);
            setOpen(!compactModes.includes(next));
            setPage(0);
          }}
          options={modeOptions}
        />
      ) : null}

      {showPanel ? (
        <motion.div
          className={`ab-col-panel${inlinePanel ? ' ab-col-panel-inline' : ''}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {inlinePanel ? null : (
            <button
              type="button"
              className={`ab-col-panel-head${open ? ' is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span className="ab-col-panel-head-copy">
                <span className="ab-col-panel-title">
                  <ClipboardList size={17} aria-hidden />
                  {panelTitle}
                </span>
                {panelSubtitle ? <span className="ab-col-panel-sub">{panelSubtitle}</span> : null}
              </span>
              <span className="ab-col-panel-meta">
                <motion.span
                  key={selected.length}
                  className="ab-col-count-badge"
                  initial={{ scale: 0.9, opacity: 0.65 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 28 }}
                >
                  {premium
                    ? `${selected.length} / ${columns.length} Selected`
                    : `${selected.length} Selected`}
                </motion.span>
                <ChevronDown size={18} aria-hidden />
              </span>
            </button>
          )}

          <AnimatePresence initial={false}>
            {panelExpanded ? (
              <motion.div
                className="ab-col-panel-body"
                initial={inlinePanel ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={inlinePanel ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {panelBody}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : (
        <p className="ab-default-hint">{defaultHint}</p>
      )}
      {error ? <p className="asr-error">{error}</p> : null}
    </div>
  );
}

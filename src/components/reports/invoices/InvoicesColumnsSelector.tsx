'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  ALL_INVOICE_COLUMN_IDS,
  INVOICE_COLUMNS,
  INVOICE_COLUMN_SECTIONS,
  type InvoiceColumnId,
  type InvoiceColumnMode,
} from './invoicesUtils';
import './invoices-report.css';

type Props = {
  mode: InvoiceColumnMode;
  selected: InvoiceColumnId[];
  onModeChange: (mode: InvoiceColumnMode) => void;
  onSelectedChange: (next: InvoiceColumnId[]) => void;
  error?: string;
};

export function InvoicesColumnsSelector({
  mode,
  selected,
  onModeChange,
  onSelectedChange,
  error,
}: Props) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return INVOICE_COLUMN_SECTIONS.map((section) => {
      const sectionMatch = !query || section.label.toLowerCase().includes(query);
      const fields = INVOICE_COLUMNS.filter((f) => {
        if (f.sectionId !== section.id) return false;
        if (sectionMatch && query && section.label.toLowerCase().includes(query)) return true;
        if (!query) return true;
        return f.label.toLowerCase().includes(query);
      });
      return { section, fields };
    }).filter((s) => s.fields.length > 0);
  }, [query]);

  const allSelected =
    ALL_INVOICE_COLUMN_IDS.length > 0 &&
    ALL_INVOICE_COLUMN_IDS.every((id) => selected.includes(id));

  const toggle = (id: InvoiceColumnId) => {
    if (selected.includes(id)) onSelectedChange(selected.filter((x) => x !== id));
    else onSelectedChange([...selected, id]);
  };

  const toggleSection = (ids: InvoiceColumnId[]) => {
    const everyOn = ids.every((id) => selected.includes(id));
    if (everyOn) onSelectedChange(selected.filter((id) => !ids.includes(id)));
    else onSelectedChange(Array.from(new Set([...selected, ...ids])));
  };

  return (
    <div className="asr-field inv-columns">
      <div className="ui-label">Columns</div>
      <div className="ab-columns-mode" role="radiogroup" aria-label="Column preset">
        {(
          [
            ['all', 'All Columns'],
            ['custom', 'Custom'],
          ] as const
        ).map(([id, label]) => (
          <label key={id} className={`asr-radio${mode === id ? ' is-on' : ''}`}>
            <input
              type="radio"
              name="inv-column-mode"
              checked={mode === id}
              onChange={() => {
                onModeChange(id);
                if (id === 'custom') setOpen(true);
              }}
            />
            <span className="asr-radio-dot" aria-hidden />
            {label}
          </label>
        ))}
      </div>

      {mode === 'custom' ? (
        <div className="inv-col-panel">
          <button
            type="button"
            className={`inv-col-head${open ? ' is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span>Select Columns ({selected.length} selected)</span>
            <ChevronDown size={18} aria-hidden />
          </button>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                className="inv-col-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="inv-col-inner">
                  <div className="inv-col-sticky">
                    <label className="asr-dd-search inv-col-search">
                      <Search size={15} aria-hidden />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search columns…"
                        aria-label="Search columns"
                      />
                    </label>

                    <label className="inv-select-all">
                      <span className={`asr-dd-checkbox${allSelected ? ' is-on' : ''}`} aria-hidden>
                        {allSelected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() =>
                          onSelectedChange(allSelected ? [] : [...ALL_INVOICE_COLUMN_IDS])
                        }
                      />
                      <span>Select All</span>
                      <em>
                        Selected: {selected.length} / {ALL_INVOICE_COLUMN_IDS.length}
                      </em>
                    </label>
                  </div>

                  <div className="inv-col-scroll">
                    {filteredSections.map(({ section, fields }) => {
                      const ids = fields.map((f) => f.id);
                      const sectionAll = ids.length > 0 && ids.every((id) => selected.includes(id));
                      const sectionCount = ids.filter((id) => selected.includes(id)).length;

                      return (
                        <div key={section.id} className="inv-section">
                          <div className="inv-section-head">
                            <h4 className="inv-section-title">{section.label}</h4>
                            <label className="inv-section-all">
                              <span
                                className={`asr-dd-checkbox${sectionAll ? ' is-on' : ''}`}
                                aria-hidden
                              >
                                {sectionAll ? <Check size={12} strokeWidth={3} /> : null}
                              </span>
                              <input
                                type="checkbox"
                                checked={sectionAll}
                                onChange={() => toggleSection(ids)}
                              />
                              Select All
                              <em>
                                {sectionCount}/{ids.length}
                              </em>
                            </label>
                          </div>

                          <div className="inv-field-grid" role="group" aria-label={section.label}>
                            <AnimatePresence mode="popLayout" initial={false}>
                              {fields.map((field) => {
                                const checked = selected.includes(field.id);
                                return (
                                  <motion.label
                                    key={field.id}
                                    className={`inv-field-item${checked ? ' is-on' : ''}`}
                                    layout
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    <span
                                      className={`asr-dd-checkbox${checked ? ' is-on' : ''}`}
                                      aria-hidden
                                    >
                                      {checked ? <Check size={12} strokeWidth={3} /> : null}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggle(field.id)}
                                    />
                                    {field.label}
                                  </motion.label>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}

                    {!filteredSections.length ? (
                      <div className="inv-empty">No columns match your search.</div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : (
        <p className="ab-default-hint">
          All {ALL_INVOICE_COLUMN_IDS.length} columns will be included in the report.
        </p>
      )}
      {error ? <p className="asr-error">{error}</p> : null}
    </div>
  );
}

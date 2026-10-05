'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  ALL_INFO_SHEET_FIELD_IDS,
  INFO_SHEET_FIELDS,
  INFO_SHEET_SECTIONS,
  type InfoSheetFieldId,
} from './studentInfoSheetUtils';
import './student-info-sheet.css';

type Props = {
  selected: InfoSheetFieldId[];
  onChange: (next: InfoSheetFieldId[]) => void;
  error?: string;
};

export function InfoSheetFieldsSelector({ selected, onChange, error }: Props) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return INFO_SHEET_SECTIONS.map((section) => {
      const sectionMatch = !query || section.label.toLowerCase().includes(query);
      const fields = INFO_SHEET_FIELDS.filter((f) => {
        if (f.sectionId !== section.id) return false;
        if (sectionMatch && query && section.label.toLowerCase().includes(query)) return true;
        if (!query) return true;
        return f.label.toLowerCase().includes(query);
      });
      return { section, fields };
    }).filter((s) => s.fields.length > 0);
  }, [query]);

  const toggle = (id: InfoSheetFieldId) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="asr-field">
      <div className="sis-fields-panel">
        <button
          type="button"
          className={`sis-fields-head${open ? ' is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>Select fields to display</span>
          <ChevronDown size={18} />
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              className="sis-fields-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="sis-fields-inner">
                <div className="sis-fields-toolbar">
                  <label className="asr-dd-search">
                    <Search size={15} aria-hidden />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search fields..."
                      aria-label="Search fields"
                    />
                  </label>
                  <div className="sis-fields-actions">
                    <button
                      type="button"
                      className="sis-chip-btn"
                      onClick={() => onChange([...ALL_INFO_SHEET_FIELD_IDS])}
                    >
                      Select All
                    </button>
                    <button type="button" className="sis-chip-btn" onClick={() => onChange([])}>
                      Deselect All
                    </button>
                    <button
                      type="button"
                      className="sis-chip-btn"
                      onClick={() => onChange([...ALL_INFO_SHEET_FIELD_IDS])}
                    >
                      Reset Selection
                    </button>
                  </div>
                  <span className="sis-selected-count">
                    Selected: {selected.length} / {ALL_INFO_SHEET_FIELD_IDS.length}
                  </span>
                </div>

                {filteredSections.map(({ section, fields }) => (
                  <div key={section.id} className="sis-section">
                    <h4 className="sis-section-title">{section.label}</h4>
                    <div className="sis-field-grid" role="group" aria-label={section.label}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {fields.map((field) => {
                          const checked = selected.includes(field.id);
                          return (
                            <motion.label
                              key={field.id}
                              className={`sis-field-item${checked ? ' is-on' : ''}`}
                              layout
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              <span className={`asr-dd-checkbox${checked ? ' is-on' : ''}`} aria-hidden>
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
                ))}

                {!filteredSections.length ? (
                  <div className="sis-empty">No fields match your search.</div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {error ? <p className="asr-error">{error}</p> : null}
    </div>
  );
}

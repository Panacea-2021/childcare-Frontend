'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { LESSON_CATALOG, LESSON_CATEGORIES } from '@/lib/mock/lessonCatalog';
import { OdFilterDropdown } from './OdFilterDropdown';

type Props = {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
};

const CATEGORY_OPTIONS = LESSON_CATEGORIES;

export function TagLessonsModal({ open, selectedIds, onClose, onApply }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All Categories');
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setCategory('All Categories');
    setDraft(selectedIds);
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LESSON_CATALOG.filter((l) => {
      if (category !== 'All Categories' && l.ageBand !== category) return false;
      if (!q) return true;
      return l.title.toLowerCase().includes(q) || l.ageBand.toLowerCase().includes(q);
    });
  }, [search, category]);

  const toggle = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    const ids = filtered.map((l) => l.id);
    const allSelected = ids.length > 0 && ids.every((id) => draft.includes(id));
    if (allSelected) {
      setDraft((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setDraft((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  return (
    <Modal
      open={open}
      title="Tag lessons"
      onClose={onClose}
      elevated
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => onApply(draft)}
          >
            Apply ({draft.length})
          </button>
        </>
      }
    >
      <div className="pt-tag-modal">
        <div className="pt-tag-filters">
          <div className="pt-tag-search">
            <Search size={15} aria-hidden />
            <input
              className="ui-input"
              type="search"
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search lessons"
            />
          </div>
          <OdFilterDropdown
            className="pt-tag-dd"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
            ariaLabel="Filter category"
          />
        </div>

        <div className="pt-tag-meta">
          <span>
            {filtered.length.toLocaleString()} lessons — {draft.length} selected
          </span>
          <button type="button" className="pt-link" onClick={selectAll}>
            Select all
          </button>
        </div>

        <ul className="pt-tag-list pt-tag-list-lessons">
          {filtered.map((l) => {
            const checked = draft.includes(l.id);
            return (
              <li key={l.id}>
                <label className={`pt-tag-row-item${checked ? ' is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(l.id)}
                  />
                  <span className="pt-tag-row-text">
                    <strong>{l.title}</strong>
                    <i className="pt-lesson-band">{l.ageBand}</i>
                  </span>
                </label>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="pt-tag-empty">No lessons match your search.</li>
          ) : null}
        </ul>
      </div>
    </Modal>
  );
}

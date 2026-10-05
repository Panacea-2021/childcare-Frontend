'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PROGRESS_ROOMS, PROGRESS_STUDENTS } from '@/lib/mock/mockProgressTracking';
import { OdFilterDropdown } from './OdFilterDropdown';

type Props = {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
};

export function TagStudentsModal({ open, selectedIds, onClose, onApply }: Props) {
  const [search, setSearch] = useState('');
  const [room, setRoom] = useState('all');
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setRoom('all');
    setDraft(selectedIds);
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROGRESS_STUDENTS.filter((s) => {
      if (room !== 'all') {
        const r = PROGRESS_ROOMS.find((x) => x.id === room);
        if (r && s.room !== r.name) return false;
      }
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q);
    });
  }, [search, room]);

  const toggle = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    const ids = filtered.map((s) => s.id);
    const allSelected = ids.every((id) => draft.includes(id));
    if (allSelected) {
      setDraft((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setDraft((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  return (
    <Modal
      open={open}
      title="Tag students"
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
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>
          <OdFilterDropdown
            className="pt-tag-dd"
            value={room}
            onChange={setRoom}
            options={PROGRESS_ROOMS.map((r) => ({ value: r.id, label: r.name }))}
            ariaLabel="Filter classroom"
          />
        </div>

        <div className="pt-tag-meta">
          <span>
            {filtered.length} students — {draft.length} selected
          </span>
          <button type="button" className="pt-link" onClick={selectAll}>
            Select all
          </button>
        </div>

        <ul className="pt-tag-list">
          {filtered.map((s) => {
            const checked = draft.includes(s.id);
            return (
              <li key={s.id}>
                <label className={`pt-tag-row-item${checked ? ' is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.id)}
                  />
                  <span className="pt-tag-row-text">
                    <strong>{s.name}</strong>
                    <em>{s.room}</em>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  loadStudents,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  roomName,
  STAFF_OPTIONS,
} from '@/lib/center-management/studentsStore';

type Mode = 'students' | 'staff';

type Props = {
  open: boolean;
  mode: Mode;
  selectedIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const tones = ['rose', 'violet', 'sky', 'amber', 'mint', 'coral'] as const;

export function SelectPeopleDrawer({ open, mode, selectedIds, onClose, onApply }: Props) {
  const [search, setSearch] = useState('');
  const [room, setRoom] = useState('all');
  const [program, setProgram] = useState('all');
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setRoom('all');
    setProgram('all');
    setDraft(selectedIds);
  }, [open, selectedIds]);

  const students = useMemo(() => loadStudents().filter((s) => s.status === 'Active'), []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (room !== 'all' && !s.roomIds.includes(room)) return false;
      if (program !== 'all' && !s.programIds?.includes(program)) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q);
    });
  }, [students, search, room, program]);

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STAFF_OPTIONS.filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [search]);

  const rows =
    mode === 'students'
      ? filteredStudents.map((s, i) => ({
          id: s.id,
          name: s.name,
          meta: roomName(s.roomIds[0] ?? '') || 'Unassigned',
          tone: tones[i % tones.length],
        }))
      : filteredStaff.map((s, i) => ({
          id: s.id,
          name: s.name,
          meta: 'Staff',
          tone: tones[i % tones.length],
        }));

  const toggle = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    const ids = rows.map((r) => r.id);
    const allOn = ids.every((id) => draft.includes(id));
    if (allOn) setDraft((prev) => prev.filter((id) => !ids.includes(id)));
    else setDraft((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const title = mode === 'students' ? 'Select Students' : 'Select Staff';

  return (
    <Drawer
      open={open}
      title={title}
      plainHeader
      onClose={onClose}
      meta={`${draft.length} selected`}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply ({draft.length})
          </button>
        </>
      }
    >
      <div className="pr-people">
        {mode === 'students' ? (
          <div className="pr-people-filters">
            <AppSelect
              value={room}
              onChange={setRoom}
              searchable
              options={[
                { value: 'all', label: 'All Classroom' },
                ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            <AppSelect
              value={program}
              onChange={setProgram}
              searchable
              options={[
                { value: 'all', label: 'All Programs' },
                ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
        ) : (
          <div className="pr-people-filters">
            <AppSelect
              value="all"
              onChange={() => undefined}
              disabled
              options={[{ value: 'all', label: 'All Rooms' }]}
            />
          </div>
        )}

        <label className="pr-people-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === 'students' ? 'Search by name' : 'Search staff'}
          />
        </label>

        <div className="pr-people-bar">
          <span>
            {draft.length} {mode === 'students' ? 'selected' : 'Staff selected'}
          </span>
          <button type="button" className="pr-link" onClick={selectAll}>
            Select All
          </button>
        </div>

        <ul className="pr-people-list">
          <AnimatePresence initial={false}>
            {rows.map((row, i) => {
              const on = draft.includes(row.id);
              return (
                <motion.li
                  key={row.id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.25 }}
                >
                  <button
                    type="button"
                    className={`pr-people-row${on ? ' is-on' : ''}`}
                    onClick={() => toggle(row.id)}
                  >
                    <span className={`pr-avatar tone-${row.tone}`} aria-hidden>
                      {initials(row.name)}
                    </span>
                    <span className="pr-people-copy">
                      <strong>{row.name}</strong>
                      <em>{row.meta}</em>
                    </span>
                    <span className={`pr-check${on ? ' is-on' : ''}`} aria-hidden>
                      {on ? <Check size={14} strokeWidth={2.6} /> : null}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </Drawer>
  );
}

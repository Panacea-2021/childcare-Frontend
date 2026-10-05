'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Building2,
  Check,
  Search,
  Users,
  UsersRound,
} from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import {
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  initials,
  roomName,
} from '@/lib/center-management/studentsStore';
import { loadGroups } from '@/lib/center-management/groupsStore';
import {
  dateInputValue,
  dayStatus,
  getDayRecord,
} from '@/lib/center-management/attendanceStore';
import { StudentFilterSelect } from './StudentFilterSelect';

type Props = {
  students: Student[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /**
   * Initial value for the Checked-in filter (from Activity Settings).
   * Staff can still toggle the checkbox freely on this screen.
   */
  defaultCheckedIn?: boolean;
  /** When true with checked-in filter on, ignore classroom room assignment. */
  ignoreRoomWhenCheckedIn?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function SelectStudentsPanel({
  students,
  selectedIds,
  onChange,
  defaultCheckedIn = false,
  ignoreRoomWhenCheckedIn = false,
}: Props) {
  const [classroom, setClassroom] = useState('all');
  const [group, setGroup] = useState('all');
  const [program, setProgram] = useState('all');
  const [checkedInOnly, setCheckedInOnly] = useState(defaultCheckedIn);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setCheckedInOnly(defaultCheckedIn);
  }, [defaultCheckedIn]);

  const groups = useMemo(() => loadGroups().filter((g) => g.status !== 'Inactive'), []);
  const today = dateInputValue();

  const classroomOptions = useMemo(
    () => [
      { value: 'all', label: 'All Classroom' },
      ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
    ],
    [],
  );

  const groupOptions = useMemo(
    () => [
      { value: 'all', label: 'All Group' },
      ...groups.map((g) => ({ value: g.id, label: g.name })),
    ],
    [groups],
  );

  const programOptions = useMemo(
    () => [
      { value: 'all', label: 'All Programs' },
      ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const skipRoom =
      checkedInOnly && ignoreRoomWhenCheckedIn && classroom !== 'all';
    return students.filter((s) => {
      if (s.status !== 'Active' && s.status !== 'Signed up') return false;
      if (!skipRoom && classroom !== 'all' && !s.roomIds.includes(classroom)) return false;
      if (group !== 'all' && !s.groupIds.includes(group)) return false;
      if (program !== 'all' && !s.programIds.includes(program)) return false;
      if (checkedInOnly) {
        const rec = getDayRecord(s, today);
        if (dayStatus(rec) !== 'checked-in') return false;
      }
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [
    students,
    classroom,
    group,
    program,
    checkedInOnly,
    ignoreRoomWhenCheckedIn,
    query,
    today,
  ]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  };

  const selectAllFiltered = () => {
    if (allFilteredSelected) {
      const drop = new Set(filtered.map((s) => s.id));
      onChange(selectedIds.filter((id) => !drop.has(id)));
      return;
    }
    const next = new Set(selectedIds);
    filtered.forEach((s) => next.add(s.id));
    onChange([...next]);
  };

  return (
    <aside className="pap-students-panel">
      <header className="pap-students-head">
        <span className="pap-students-ico" aria-hidden>
          <Users size={16} />
        </span>
        <div>
          <h3>Select Students</h3>
          <p>Choose who this activity is for</p>
        </div>
      </header>

      <div className="pap-students-filters">
        <StudentFilterSelect
          value={classroom}
          onChange={setClassroom}
          options={classroomOptions}
          placeholder="All Classroom"
          icon={Building2}
          ariaLabel="Filter by classroom"
        />
        <StudentFilterSelect
          value={group}
          onChange={setGroup}
          options={groupOptions}
          placeholder="All Group"
          icon={UsersRound}
          ariaLabel="Filter by group"
        />
        <StudentFilterSelect
          value={program}
          onChange={setProgram}
          options={programOptions}
          placeholder="All Programs"
          icon={BookOpen}
          ariaLabel="Filter by program"
        />
      </div>

      <label className="pap-checked-in">
        <input
          type="checkbox"
          checked={checkedInOnly}
          onChange={(e) => setCheckedInOnly(e.target.checked)}
        />
        Checked-in
      </label>

      <label className="pap-students-search">
        <Search size={15} aria-hidden />
        <input
          className="ui-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          aria-label="Search students by name"
        />
      </label>

      <div className="pap-students-meta">
        <strong>{selectedIds.length} selected</strong>
        <button type="button" onClick={selectAllFiltered}>
          {allFilteredSelected ? 'Clear visible' : 'Select All'}
        </button>
      </div>

      <ul className="pap-students-list" role="listbox" aria-label="Students">
        {filtered.length === 0 ? (
          <li className="pap-students-empty">
            {checkedInOnly
              ? 'No checked-in students match these filters.'
              : 'No students match these filters.'}
          </li>
        ) : (
          filtered.map((s, i) => {
            const active = selectedIds.includes(s.id);
            const room = s.roomIds[0] ? roomName(s.roomIds[0]) : '—';
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.24), duration: 0.24, ease }}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`pap-student-row${active ? ' is-selected' : ''}`}
                  onClick={() => toggle(s.id)}
                >
                  <span className="pap-student-avatar" aria-hidden>
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt="" />
                    ) : (
                      initials(s.name)
                    )}
                  </span>
                  <span className="pap-student-copy">
                    <strong>{s.name}</strong>
                    <em>{room}</em>
                  </span>
                  <span className={`pap-student-check${active ? ' is-on' : ''}`} aria-hidden>
                    {active ? <Check size={13} strokeWidth={3} /> : null}
                  </span>
                </button>
              </motion.li>
            );
          })
        )}
      </ul>
    </aside>
  );
}

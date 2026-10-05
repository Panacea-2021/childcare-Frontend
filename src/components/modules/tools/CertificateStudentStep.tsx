'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  CERT_GROUPS,
  CERT_PROGRAMS,
  CERT_ROOMS,
  type MockStudent,
} from './toolsData';

type Props = {
  students: MockStudent[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAllVisible: (visibleIds: string[]) => void;
  onPrevious: () => void;
  onNext: () => void;
  canNext: boolean;
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function CertificateStudentStep({
  students,
  selectedIds,
  onToggle,
  onToggleAllVisible,
  onPrevious,
  onNext,
  canNext,
}: Props) {
  const [nameQuery, setNameQuery] = useState('');
  const [room, setRoom] = useState('all');
  const [group, setGroup] = useState('all');
  const [program, setProgram] = useState('all');

  const filtered = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (room !== 'all' && s.room !== room) return false;
      if (group !== 'all' && (s.group ?? '') !== group) return false;
      if (program !== 'all' && (s.program ?? '') !== program) return false;
      return true;
    });
  }, [students, nameQuery, room, group, program]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  return (
    <section className="tools-section cert-student-step">
      <div className="cert-student-top">
        <div className="cert-student-top-actions">
          <button type="button" className="ui-btn ui-btn-outline cert-nav-btn" onClick={onPrevious}>
            « Previous
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary cert-nav-btn"
            disabled={!canNext}
            onClick={onNext}
          >
            Next »
          </button>
        </div>
      </div>

      <div className="cert-student-filters">
        <div className="ui-field">
          <label className="ui-label" htmlFor="cert-stu-name">
            Name
          </label>
          <div className="cert-filter-search">
            <Search size={15} aria-hidden />
            <input
              id="cert-stu-name"
              className="ui-input"
              placeholder="Search By Student Name"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cert-stu-room">
            Search by room
          </label>
          <select
            id="cert-stu-room"
            className="ui-input ui-select"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="all">All Rooms</option>
            {CERT_ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cert-stu-group">
            Filter by groups
          </label>
          <select
            id="cert-stu-group"
            className="ui-input ui-select"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="all">All Groups</option>
            {CERT_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="cert-stu-program">
            Filter by program
          </label>
          <select
            id="cert-stu-program"
            className="ui-input ui-select"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          >
            <option value="all">All Programs</option>
            {CERT_PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cert-student-table-head">
        <span className="cert-selected-count">{selectedIds.length} selected</span>
      </div>

      <div className="tools-table-wrap ui-table-wrap cert-student-table-wrap">
        <table className="tools-table ui-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => onToggleAllVisible(filtered.map((s) => s.id))}
                  aria-label="Select all visible students"
                />
              </th>
              <th>Name</th>
              <th>Admission No.</th>
              <th>Room</th>
              <th>Group</th>
              <th>Program</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="cert-student-empty">
                  No students match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const checked = selectedIds.includes(s.id);
                return (
                  <tr key={s.id} className={checked ? 'is-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td>
                      <div className="cert-student-name">
                        <span className="cert-student-avatar" aria-hidden>
                          {initials(s.name)}
                        </span>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.admissionNo}</td>
                    <td>{s.room}</td>
                    <td>{s.group ?? '—'}</td>
                    <td>{s.program ?? '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

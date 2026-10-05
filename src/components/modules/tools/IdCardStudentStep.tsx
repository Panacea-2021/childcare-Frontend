'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  CERT_GROUPS,
  CERT_PROGRAMS,
  CERT_ROOMS,
  STAFF_DEPARTMENTS,
  STAFF_EMPLOYMENT,
  STAFF_ROLES,
  type IdCardAudience,
  type MockStudent,
} from './toolsData';

type Props = {
  audience: IdCardAudience;
  people: MockStudent[];
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

function copyFor(audience: IdCardAudience) {
  if (audience === 'Staff') {
    return {
      title: 'Select Staff',
      subtitle: 'Choose staff members who should receive this ID card.',
      namePlaceholder: 'Search By Staff Name',
      filter2Label: 'Search by department',
      filter2All: 'All Departments',
      filter3Label: 'Filter by role',
      filter3All: 'All Roles',
      filter4Label: 'Filter by employment',
      filter4All: 'All Types',
      idCol: 'Staff ID',
      col2: 'Department',
      col3: 'Role',
      empty: 'No staff match these filters.',
      selectedSuffix: 'selected',
    };
  }
  if (audience === 'Authorized Pickup') {
    return {
      title: 'Select Pickup Person',
      subtitle: 'Choose authorized pickup contacts for this ID card.',
      namePlaceholder: 'Search By Pickup Name',
      filter2Label: 'Search by room',
      filter2All: 'All Rooms',
      filter3Label: 'Filter by relation',
      filter3All: 'All Relations',
      filter4Label: 'Linked student',
      filter4All: 'All Students',
      idCol: 'Pickup ID',
      col2: 'Room',
      col3: 'Relation',
      empty: 'No pickup contacts match these filters.',
      selectedSuffix: 'selected',
    };
  }
  return {
    title: 'Select Student',
    subtitle: 'Choose who should receive this ID card.',
    namePlaceholder: 'Search By Student Name',
    filter2Label: 'Search by room',
    filter2All: 'All Rooms',
    filter3Label: 'Filter by groups',
    filter3All: 'All Groups',
    filter4Label: 'Filter by program',
    filter4All: 'All Programs',
    idCol: 'Admission No.',
    col2: 'Room',
    col3: 'Group',
    empty: 'No students match these filters.',
    selectedSuffix: 'selected',
  };
}

export function IdCardStudentStep({
  audience,
  people,
  selectedIds,
  onToggle,
  onToggleAllVisible,
  onPrevious,
  onNext,
  canNext,
}: Props) {
  const copy = copyFor(audience);
  const [nameQuery, setNameQuery] = useState('');
  const [filter2, setFilter2] = useState('all');
  const [filter3, setFilter3] = useState('all');
  const [filter4, setFilter4] = useState('all');

  const filter2Options =
    audience === 'Staff' ? STAFF_DEPARTMENTS : CERT_ROOMS;
  const filter3Options =
    audience === 'Staff'
      ? STAFF_ROLES
      : audience === 'Authorized Pickup'
        ? (['Mother', 'Father', 'Guardian'] as const)
        : CERT_GROUPS;
  const filter4Options =
    audience === 'Staff'
      ? STAFF_EMPLOYMENT
      : audience === 'Authorized Pickup'
        ? Array.from(new Set(people.map((p) => p.program).filter(Boolean) as string[]))
        : CERT_PROGRAMS;

  const filtered = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return people.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (filter2 !== 'all' && s.room !== filter2) return false;
      if (filter3 !== 'all' && (s.group ?? '') !== filter3) return false;
      if (filter4 !== 'all' && (s.program ?? '') !== filter4) return false;
      return true;
    });
  }, [people, nameQuery, filter2, filter3, filter4]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  return (
    <section className="tools-section idc-student-step">
      <div className="idc-student-head">
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="idc-student-nav">
          <button type="button" className="tools-btn ghost sm" onClick={onPrevious}>
            <ChevronLeft size={15} />
            Previous
          </button>
          <button
            type="button"
            className="tools-btn primary sm"
            disabled={!canNext}
            onClick={onNext}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="idc-student-filters">
        <div className="ui-field">
          <label className="ui-label" htmlFor="idc-person-name">
            Name
          </label>
          <div className="idc-filter-search">
            <Search size={15} aria-hidden />
            <input
              id="idc-person-name"
              className="ui-input"
              placeholder={copy.namePlaceholder}
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="idc-person-f2">
            {copy.filter2Label}
          </label>
          <select
            id="idc-person-f2"
            className="ui-input ui-select"
            value={filter2}
            onChange={(e) => setFilter2(e.target.value)}
          >
            <option value="all">{copy.filter2All}</option>
            {filter2Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="idc-person-f3">
            {copy.filter3Label}
          </label>
          <select
            id="idc-person-f3"
            className="ui-input ui-select"
            value={filter3}
            onChange={(e) => setFilter3(e.target.value)}
          >
            <option value="all">{copy.filter3All}</option>
            {filter3Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="idc-person-f4">
            {copy.filter4Label}
          </label>
          <select
            id="idc-person-f4"
            className="ui-input ui-select"
            value={filter4}
            onChange={(e) => setFilter4(e.target.value)}
          >
            <option value="all">{copy.filter4All}</option>
            {filter4Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="idc-student-table-meta">
        <span className="idc-selected-count">
          {selectedIds.length} {copy.selectedSuffix}
        </span>
      </div>

      <div className="tools-table-wrap idc-student-table-wrap">
        <table className="tools-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => onToggleAllVisible(filtered.map((s) => s.id))}
                  aria-label="Select all visible"
                />
              </th>
              <th>Name</th>
              <th>{copy.idCol}</th>
              <th>{copy.col2}</th>
              <th>{copy.col3}</th>
              <th>Blood</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="idc-student-empty">
                  {copy.empty}
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const checked = selectedIds.includes(s.id);
                return (
                  <tr key={s.id} className={checked ? 'is-selected' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td>
                      <div className="idc-student-name">
                        <span className="idc-student-avatar" aria-hidden>
                          {initials(s.name)}
                        </span>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.admissionNo}</td>
                    <td>{s.room}</td>
                    <td>{s.group ?? '—'}</td>
                    <td>{s.bloodGroup}</td>
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

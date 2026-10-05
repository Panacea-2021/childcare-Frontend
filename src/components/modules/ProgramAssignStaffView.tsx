'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadStaff } from '@/lib/center-management/staffStore';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import '@/components/ui/module.css';
import '@/components/modules/view-profile/field-picker.css';
import styles from './ProgramViewPage.module.css';

type ProgramLike = {
  name: string;
  days: string[];
  startDate?: string;
  room?: string;
};

export type NewlyAssignedStaff = {
  id: string;
  name: string;
  status: 'Active';
  startDate: string;
  endDate: string;
  days: string[];
  rooms: string;
  sourceId?: string;
};

type Props = {
  program: ProgramLike;
  assignedCount: number;
  maxCapacity: number;
  alreadyAssignedNames?: string[];
  onBack: () => void;
  onAssign: (staff: NewlyAssignedStaff[]) => void;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_FULL: Record<(typeof WEEK_DAYS)[number], string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function displayToIso(display: string): string {
  const m = (display || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function todayIso(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function SortIcon() {
  return (
    <span className={styles.sortIcon} aria-hidden>
      ↑↓
    </span>
  );
}

function EmptyData() {
  return (
    <div className={styles.assignEmpty}>
      <div className={styles.assignEmptyIcon} aria-hidden>
        <svg width="64" height="56" viewBox="0 0 64 56" fill="none">
          <rect x="8" y="14" width="48" height="36" rx="6" fill="#E8F2FF" stroke="#5D5FEF" strokeWidth="1.5" />
          <path d="M20 14V10a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v4" stroke="#5D5FEF" strokeWidth="1.5" />
          <path d="M22 28h20M22 36h14" stroke="#5D5FEF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className={styles.assignEmptyText}>No data</p>
    </div>
  );
}

export function ProgramAssignStaffView({
  program,
  assignedCount,
  maxCapacity,
  alreadyAssignedNames = [],
  onBack,
  onAssign,
}: Props) {
  const assignedNameSet = useMemo(
    () => new Set(alreadyAssignedNames.map((n) => n.toLowerCase())),
    [alreadyAssignedNames],
  );

  const [startDate, setStartDate] = useState(
    () => displayToIso(program.startDate || '') || todayIso(),
  );
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<string[]>(
    () => (program.days.length ? [...program.days] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );
  const [daysOpen, setDaysOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [room, setRoom] = useState('All');
  const [group, setGroup] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nameSortAsc, setNameSortAsc] = useState(true);
  const [error, setError] = useState('');

  const { roomNames: centerRoomNames, groups: centerGroups } = useCenterCatalog();

  const [staffWithRooms, setStaffWithRooms] = useState<
    Array<{ id: string; name: string; role: string; rooms: string; groups: string[] }>
  >([]);

  useEffect(() => {
    setStaffWithRooms(
      loadStaff()
        .filter((s) => s.status !== 'Inactive')
        .map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          rooms: s.rooms.join(', '),
          groups: s.groups,
        })),
    );
  }, []);

  const roomOptions = useMemo(() => ['All', ...centerRoomNames], [centerRoomNames]);

  const groupOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      ...centerGroups.map((g) => ({ value: g.name, label: g.name })),
    ],
    [centerGroups],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = staffWithRooms.filter((s) => {
      if (assignedNameSet.has(s.name.toLowerCase())) return false;
      const matchesName = !q || s.name.toLowerCase().includes(q);
      const matchesRoom =
        room === 'All' ||
        s.rooms
          .split(',')
          .map((part) => part.trim())
          .includes(room);
      const matchesGroup = group === 'All' || s.groups.includes(group);
      return matchesName && matchesRoom && matchesGroup;
    });
    list = [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return nameSortAsc ? cmp : -cmp;
    });
    return list;
  }, [search, room, group, assignedNameSet, staffWithRooms, nameSortAsc]);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const remaining = Math.max(0, maxCapacity - assignedCount);
      if (remaining > 0 && prev.length >= remaining) {
        setError(`You can assign up to ${remaining} more staff member(s) (${maxCapacity} max capacity).`);
        return prev;
      }
      setError('');
      return [...prev, id];
    });
  };

  const remainingSlots = Math.max(0, maxCapacity - assignedCount);

  const pickWithinRemaining = (current: string[], candidates: string[]) => {
    if (remainingSlots <= 0) return current;
    const merged = [...current];
    for (const id of candidates) {
      if (merged.includes(id)) continue;
      if (merged.length >= remainingSlots) break;
      merged.push(id);
    }
    return merged;
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const canAssign = selectedIds.length > 0 && days.length > 0;

  const handleAssign = () => {
    if (selectedIds.length === 0) {
      setError('Select at least one staff member');
      return;
    }
    if (days.length === 0) {
      setError('Select at least one day');
      return;
    }
    const effectiveStart = startDate || todayIso();
    const picked = staffWithRooms.filter((s) => selectedIds.includes(s.id));
    if (picked.length === 0) {
      setError('No staff selected');
      return;
    }
    const records: NewlyAssignedStaff[] = picked.map((s) => ({
      id: `astf-${s.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: s.name,
      status: 'Active',
      startDate: isoToDisplay(effectiveStart),
      endDate: isoToDisplay(endDate),
      days: [...days],
      rooms: s.rooms,
      sourceId: s.id,
    }));
    onAssign(records);
  };

  return (
    <div className={`mod-page ${styles.page}`}>
      <div className={styles.assignCrumb}>
        <button type="button" className={styles.crumbBackVisible} onClick={onBack}>
          ← Program
        </button>
        <span className={styles.crumbPipe}>|</span>
      </div>

      <h1 className={styles.assignPageTitle}>{program.name}</h1>

      <div className={styles.assignTopRow}>
        <div className="ui-field">
          <label className="ui-label">Start Date</label>
          <FieldDatePicker
            value={startDate}
            onChange={setStartDate}
            ariaLabel="Start date"
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">End Date</label>
          <FieldDatePicker
            value={endDate}
            onChange={setEndDate}
            ariaLabel="End date"
          />
        </div>
        <div className={`ui-field ${styles.assignDaysField}`}>
          <label className="ui-label">Days Of Week</label>
          <div className={styles.multiWrap}>
            <button
              type="button"
              className={`ui-input ${styles.daysBox}`}
              onClick={() => setDaysOpen((o) => !o)}
            >
              <span className={styles.chipsInline}>
                {days.length === 0 ? (
                  <span className={styles.daysPlaceholder}>Select Days</span>
                ) : (
                  days.map((d) => (
                    <span key={d} className={styles.chip}>
                      {DAY_FULL[d as (typeof WEEK_DAYS)[number]] || d}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${d}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDay(d);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDay(d);
                          }
                        }}
                      >
                        ×
                      </span>
                    </span>
                  ))
                )}
              </span>
              <span className={styles.daysChevron} aria-hidden>
                ▾
              </span>
            </button>
            {daysOpen ? (
              <div className={styles.multiMenu}>
                {WEEK_DAYS.map((d) => (
                  <label key={d} className={styles.multiOption}>
                    <input
                      type="checkbox"
                      checked={days.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    {DAY_FULL[d]}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.assignBtnWrap}>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!canAssign}
            onClick={handleAssign}
          >
            Assign
          </button>
        </div>
      </div>
      {error ? <p className={styles.assignError}>{error}</p> : null}

      <div className={styles.assignFiltersCard}>
        <div className={styles.assignFilters}>
          <div className={styles.filterField}>
            <label htmlFor="assign-staff-search">Search Name</label>
            <div className={styles.searchField}>
              <input
                id="assign-staff-search"
                className="ui-input"
                placeholder="Search by staff name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className={styles.searchIcon} aria-hidden>
                ⌕
              </span>
            </div>
          </div>
          <div className={styles.filterField}>
            <label htmlFor="assign-staff-room">Room</label>
            <select
              id="assign-staff-room"
              className="ui-select"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterField}>
            <label htmlFor="assign-staff-group">Groups</label>
            <select
              id="assign-staff-group"
              className="ui-select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {groupOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.assignMeta}>
        <span className={styles.selectedCount}>
          {selectedIds.length} staff selected
          {remainingSlots > 0 ? ` · ${Math.max(0, remainingSlots - selectedIds.length)} slots left` : ''}
        </span>
        <div className={styles.capacityStats}>
          <div className={styles.capacityItem}>
            <span className={styles.capLabel}>Assigned members :</span>
            <span className={styles.capValue}>{assignedCount}</span>
          </div>
          <div className={styles.capacityItem}>
            <span className={styles.capLabel}>Maximum capacity :</span>
            <span className={styles.capValue}>{maxCapacity}</span>
          </div>
        </div>
      </div>

      <div className={styles.assignTableCard}>
        <div className={styles.tableScroll}>
          <table className={`ui-table ${styles.assignTable}`}>
            <thead>
              <tr>
                <th style={{ width: 48 }}>
                  <input
                    type="checkbox"
                    className={styles.roundCheck}
                    aria-label="Select all staff"
                    checked={allFilteredSelected}
                    onChange={(e) => {
                      const ids = filtered.map((s) => s.id);
                      setSelectedIds((prev) => {
                        if (!e.target.checked) {
                          setError('');
                          return prev.filter((id) => !ids.includes(id));
                        }
                        const next = pickWithinRemaining(prev, ids);
                        if (remainingSlots > 0 && next.length >= remainingSlots) {
                          setError(`You can assign up to ${remainingSlots} more staff member(s) (${maxCapacity} max capacity).`);
                        } else {
                          setError('');
                        }
                        return next;
                      });
                    }}
                  />
                </th>
                <th>
                  <button
                    type="button"
                    className={styles.sortBtn}
                    onClick={() => setNameSortAsc((v) => !v)}
                  >
                    Name
                    <SortIcon />
                  </button>
                </th>
                <th>
                  <span className={styles.sortBtn}>
                    Rooms
                    <SortIcon />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyData />
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const atCap =
                    remainingSlots > 0 &&
                    selectedIds.length >= remainingSlots &&
                    !selectedIds.includes(s.id);
                  return (
                  <tr key={s.id} className={selectedIds.includes(s.id) ? styles.rowSelected : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        className={styles.roundCheck}
                        checked={selectedIds.includes(s.id)}
                        disabled={atCap}
                        onChange={() => toggleId(s.id)}
                        aria-label={`Select ${s.name}`}
                      />
                    </td>
                    <td>
                      <div className={styles.personCell}>
                        <span className={styles.avatar} aria-hidden>
                          {s.name.charAt(0)}
                        </span>
                        <strong>{s.name}</strong>
                      </div>
                    </td>
                    <td>{s.rooms}</td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

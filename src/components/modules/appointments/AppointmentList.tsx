'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Eye, Pencil, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/ui/Pagination';
import type { AppointmentRecord } from '@/lib/appointments/types';
import { initialsOf } from '@/lib/appointments/mockData';
import { btnMotion } from './animations';

export type ApptColKey =
  | 'avatar'
  | 'parentName'
  | 'studentName'
  | 'facultyName'
  | 'calendarName'
  | 'date'
  | 'time'
  | 'status'
  | 'taskCount'
  | 'actions';

export const APPT_ALL_COLS: { key: ApptColKey; label: string; always?: boolean }[] = [
  { key: 'avatar', label: 'Avatar' },
  { key: 'parentName', label: 'Parent' },
  { key: 'studentName', label: 'Student' },
  { key: 'facultyName', label: 'Faculty' },
  { key: 'calendarName', label: 'Calendar' },
  { key: 'date', label: 'Appointment Date' },
  { key: 'time', label: 'Appointment Time' },
  { key: 'status', label: 'Status' },
  { key: 'taskCount', label: 'Task Count' },
  { key: 'actions', label: 'Actions', always: true },
];

export const DEFAULT_APPT_COLS: Record<ApptColKey, boolean> = {
  avatar: true,
  parentName: true,
  studentName: true,
  facultyName: true,
  calendarName: true,
  date: true,
  time: true,
  status: true,
  taskCount: true,
  actions: true,
};

type Props = {
  items: AppointmentRecord[];
  loading?: boolean;
  selectedIds: Set<string>;
  visibleCols: Record<ApptColKey, boolean>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onView: (item: AppointmentRecord) => void;
  onEdit: (item: AppointmentRecord) => void;
  onTask: (item: AppointmentRecord) => void;
};

const PAGE_SIZE = 8;

function statusClass(status: string) {
  return `appt-badge appt-badge-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export const AppointmentList = memo(function AppointmentList({
  items,
  loading,
  selectedIds,
  visibleCols,
  onToggleSelect,
  onToggleAll,
  onView,
  onEdit,
  onTask,
}: Props) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<ApptColKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.studentName} ${i.parentName} ${i.facultyName} ${i.calendarName}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = sortKey === 'time' ? a.startTime : String(a[sortKey as keyof AppointmentRecord] ?? '');
      const bv = sortKey === 'time' ? b.startTime : String(b[sortKey as keyof AppointmentRecord] ?? '');
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = rows.map((r) => r.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  useEffect(() => {
    setPage(1);
  }, [query, items]);

  const toggleSort = (key: ApptColKey) => {
    if (key === 'actions') return;
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="appt-skeleton" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="appt-skel-line" />
        ))}
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="appt-empty">
        <h3>No appointments found</h3>
        <p>Adjust filters or create a new appointment to get started.</p>
      </div>
    );
  }

  const show = (key: ApptColKey) => visibleCols[key];

  return (
    <div className="appt-list-shell">
      <div className="appt-list-tools">
        <label className="appt-search-field appt-list-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search table…"
            aria-label="Search table"
          />
        </label>
      </div>

      <div className="appt-table-wrap mod-scroll">
        <table className="ui-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll(pageIds)}
                  aria-label="Select all on page"
                />
              </th>
              {APPT_ALL_COLS.map((col) =>
                show(col.key) ? (
                  <th key={col.key}>
                    <button
                      type="button"
                      className="appt-th-btn"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                ) : null,
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <motion.tr key={item.id} className="appt-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    aria-label={`Select ${item.studentName}`}
                  />
                </td>
                {show('avatar') ? (
                  <td>
                    <span className="appt-avatar" aria-hidden>
                      {initialsOf(item.parentName || item.studentName)}
                    </span>
                  </td>
                ) : null}
                {show('parentName') ? <td>{item.parentName}</td> : null}
                {show('studentName') ? <td>{item.studentName}</td> : null}
                {show('facultyName') ? <td>{item.facultyName}</td> : null}
                {show('calendarName') ? <td>{item.calendarName}</td> : null}
                {show('date') ? <td>{item.date}</td> : null}
                {show('time') ? (
                  <td>
                    {item.startTime} - {item.endTime}
                  </td>
                ) : null}
                {show('status') ? (
                  <td>
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </td>
                ) : null}
                {show('taskCount') ? <td>{item.taskCount}</td> : null}
                {show('actions') ? (
                  <td>
                    <div className="appt-row-actions">
                      <motion.button
                        type="button"
                        className="ui-btn ui-btn-outline enq-card-action-btn"
                        aria-label="View"
                        onClick={() => onView(item)}
                        {...btnMotion}
                      >
                        <Eye size={14} aria-hidden />
                        View
                      </motion.button>
                      <motion.button
                        type="button"
                        className="ui-btn ui-btn-outline enq-card-action-btn"
                        aria-label="Edit"
                        onClick={() => onEdit(item)}
                        {...btnMotion}
                      >
                        <Pencil size={14} aria-hidden />
                        Edit
                      </motion.button>
                      <motion.button
                        type="button"
                        className="ui-btn ui-btn-outline enq-card-action-btn"
                        aria-label="Task"
                        onClick={() => onTask(item)}
                        {...btnMotion}
                      >
                        <ClipboardList size={14} aria-hidden />
                        Task
                      </motion.button>
                    </div>
                  </td>
                ) : null}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="appt-list-pager">
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
});

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Clock3,
  LineChart,
  LogIn,
  LogOut,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { AttendanceLeavePageHeader } from './AttendanceLeavePageHeader';
import { AppSelect, DayDatePicker, ProfileTablePagination } from '@/components/modules/center-management/ui';
import {
  dayStatus,
  dateInputValue,
  getDayRecord,
} from '@/lib/center-management/attendanceStore';
import {
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  initials,
  loadStudents,
  roomName,
} from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';
import './attendance-forecast.css';
import './student-attendance.css';
import '@/components/modules/center-management/students.css';

const ease = [0.22, 1, 0.36, 1] as const;

type SplitBy = 'program' | 'label' | 'hour';

type ForecastRow = {
  id: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  students: Student[];
  checkedIn: number;
  checkedOut: number;
  absent: number;
};

const PROGRAM_HOURS: Record<string, string> = {
  'prog-toddler': '8:30 AM - 3:30 PM',
  'prog-abc': '9:00 AM - 12:00 PM',
  'prog-abcd': '1:00 PM - 4:00 PM',
};

/** Hourly slots for Split by → Hour (matches daycare day grid). */
const HOUR_SLOTS = [
  '08:30 Am-09:30 Am',
  '09:30 Am-10:30 Am',
  '10:30 Am-11:30 Am',
  '11:30 Am-12:30 Pm',
  '12:30 Pm-01:30 Pm',
  '01:30 Pm-02:30 Pm',
  '02:30 Pm-03:30 Pm',
] as const;

const SPLIT_OPTIONS = [
  { value: 'program', label: 'Program' },
  { value: 'label', label: 'Label' },
  { value: 'hour', label: 'Hour' },
];

const ROOM_FILTER_OPTIONS = [
  { value: 'all', label: 'All Rooms' },
  ...ROOM_OPTIONS.filter((r) => r.status === 'Active').map((r) => ({
    value: r.id,
    label: r.name,
  })),
];

function avatarTone(name: string) {
  const tones = ['tone-a', 'tone-b', 'tone-c', 'tone-d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % tones.length;
  return tones[h];
}

function parseClock(raw: string): number {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(Am|Pm|AM|PM)?$/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = (m[3] || '').toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

function parseRange(label: string): { start: number; end: number } {
  const clean = label.replace(/\s*–\s*|\s*-\s*/g, '|');
  const [a, b] = clean.split('|');
  return { start: parseClock(a || ''), end: parseClock(b || '') };
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function countStatuses(students: Student[], dateKey: string) {
  let checkedIn = 0;
  let checkedOut = 0;
  let absent = 0;
  for (const s of students) {
    const st = dayStatus(getDayRecord(s, dateKey));
    if (st === 'checked-in') checkedIn += 1;
    else if (st === 'checked-out') checkedOut += 1;
    else if (st === 'absent') absent += 1;
  }
  return { checkedIn, checkedOut, absent };
}

function uniqueStudents(list: Student[]) {
  const seen = new Set<string>();
  return list.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

function buildRows(splitBy: SplitBy, dateKey: string, roomFilter: string): ForecastRow[] {
  const pool = loadStudents().filter((s) => {
    if (s.status !== 'Active' && s.status !== 'Signed up') return false;
    if (roomFilter !== 'all' && !s.roomIds.includes(roomFilter)) return false;
    return true;
  });

  if (splitBy === 'program') {
    return PROGRAM_OPTIONS.map((prog) => {
      const students = pool.filter((s) => s.programIds.includes(prog.id));
      const counts = countStatuses(students, dateKey);
      return {
        id: prog.id,
        title: prog.name,
        subtitle: PROGRAM_HOURS[prog.id] || 'Full day',
        students,
        ...counts,
      };
    }).filter((r) => r.students.length > 0 || (roomFilter === 'all' && r.id === 'prog-toddler'));
  }

  if (splitBy === 'label') {
    const rooms =
      roomFilter === 'all'
        ? ROOM_OPTIONS.filter((r) => r.status === 'Active')
        : ROOM_OPTIONS.filter((r) => r.id === roomFilter);

    return rooms.map((room) => {
      const students = pool.filter((s) => s.roomIds.includes(room.id));
      const counts = countStatuses(students, dateKey);
      return {
        id: room.id,
        title: room.name,
        subtitle: 'Room label',
        students,
        ...counts,
      };
    });
  }

  // Split by Hour — one row per hourly slot with overlapping program chips
  return HOUR_SLOTS.map((slot) => {
    const slotRange = parseRange(slot);
    const activePrograms = PROGRAM_OPTIONS.filter((prog) => {
      const range = parseRange(PROGRAM_HOURS[prog.id] || '8:30 AM - 3:30 PM');
      return rangesOverlap(slotRange.start, slotRange.end, range.start, range.end);
    });

    const students = uniqueStudents(
      pool.filter((s) =>
        s.programIds.some((pid) => activePrograms.some((p) => p.id === pid)) ||
        // fallback: unassigned students appear in morning toddler slots
        (s.programIds.length === 0 &&
          activePrograms.some((p) => p.id === 'prog-toddler')),
      ),
    );

    // Prefer students from toddler for demo density when programs empty
    const fallBackStudents =
      students.length > 0
        ? students
        : pool.filter((s) => s.programIds.includes('prog-toddler') || s.programIds.length === 0);

    const rowStudents = students.length > 0 ? students : fallBackStudents.slice(0, 4);
    const counts = countStatuses(rowStudents, dateKey);
    const chips =
      activePrograms.length > 0
        ? activePrograms.map((p) => p.name)
        : ['Toddler Program (Sample)'];

    return {
      id: slot,
      title: slot,
      chips,
      students: rowStudents,
      ...counts,
    };
  });
}

export function AttendanceForecastPage() {
  const router = useRouter();
  const [dateKey, setDateKey] = useState(dateInputValue);
  const [splitBy, setSplitBy] = useState<SplitBy>('program');
  const [roomFilter, setRoomFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<ForecastRow | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [dateKey, splitBy, roomFilter, pageSize]);

  const rows = useMemo(
    () => buildRows(splitBy, dateKey, roomFilter),
    [splitBy, dateKey, roomFilter, ready],
  );

  const totals = useMemo(() => {
    // For Hour split, students appear in many slots — use unique students across day for KPIs
    if (splitBy === 'hour') {
      const pool = uniqueStudents(rows.flatMap((r) => r.students));
      return countStatuses(pool, dateKey);
    }
    return rows.reduce(
      (acc, r) => ({
        checkedIn: acc.checkedIn + r.checkedIn,
        checkedOut: acc.checkedOut + r.checkedOut,
        absent: acc.absent + r.absent,
      }),
      { checkedIn: 0, checkedOut: 0, absent: 0 },
    );
  }, [rows, splitBy, dateKey]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openStudents = (row: ForecastRow) => {
    if (row.students.length === 0) return;
    setActiveRow(row);
    setDrawerOpen(true);
  };

  const goToStudentPrograms = (studentId: string) => {
    setDrawerOpen(false);
    router.push(`/center-management/students/${studentId}?tab=Programs`);
  };

  if (!ready) {
    return (
      <div className="af-root">
        <div className="af-shell sa-shell">
          <div className="af-skel">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="af-root"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease }}
    >
      <div className="af-shell sa-shell">
        <AttendanceLeavePageHeader
          title="Attendance Forecast"
          description="Plan capacity by expected enrollment across programs, labels, and hours."
          icon={<LineChart />}
        />

        <div className="af-kpis">
          {(
            [
              {
                id: 'in',
                label: 'Total Check in',
                value: totals.checkedIn,
                icon: <LogIn size={18} />,
                tone: 'in',
              },
              {
                id: 'out',
                label: 'Total Check Out',
                value: totals.checkedOut,
                icon: <LogOut size={18} />,
                tone: 'out',
              },
              {
                id: 'abs',
                label: 'Total Absent',
                value: totals.absent,
                icon: <XCircle size={18} />,
                tone: 'abs',
              },
            ] as const
          ).map((card, i) => (
            <motion.article
              key={card.id}
              className={`af-kpi af-kpi-${card.tone}`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.06 + i * 0.06, duration: 0.35, ease }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              <span className="af-kpi-ico">{card.icon}</span>
              <div>
                <em>{card.label}</em>
                <strong>{card.value}</strong>
              </div>
              <span className="af-kpi-glow" aria-hidden />
            </motion.article>
          ))}
        </div>

        <div className="af-filters">
          <div className="af-field">
            <label className="ui-label">Select Date</label>
            <DayDatePicker value={dateKey} onChange={setDateKey} />
          </div>
          <div className="af-field af-split-field">
            <label className="ui-label">Split by</label>
            <AppSelect
              value={splitBy}
              onChange={(v) => setSplitBy(v as SplitBy)}
              options={SPLIT_OPTIONS}
              className="af-split-dd"
              triggerClassName="af-split-trigger"
            />
          </div>
          <div className="af-field af-room-field">
            <label className="ui-label">Rooms</label>
            <AppSelect
              value={roomFilter}
              onChange={setRoomFilter}
              options={ROOM_FILTER_OPTIONS}
              className="af-room-dd"
              triggerClassName="af-split-trigger"
            />
          </div>
        </div>

        <div className="sa-table-card">
        <div className="cm-table-wrap sa-table-wrap af-table-wrap">
          <table className="ui-table cm-tab-table sa-table af-table">
            <thead>
              <tr>
                <th>{splitBy === 'program' ? 'Program' : splitBy === 'label' ? 'Label' : 'Hour'}</th>
                <th>Expected Students</th>
                <th>Checked-in</th>
                <th>Checked-out</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="sa-empty">
                    No forecast rows for this split
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.28, ease }}
                  >
                    <td>
                      <div className="af-name-cell">
                        <strong>{row.title}</strong>
                        {row.chips?.length ? (
                          <div className="af-chips">
                            {row.chips.map((chip) => (
                              <span key={chip} className="af-chip">
                                {chip}
                              </span>
                            ))}
                          </div>
                        ) : row.subtitle ? (
                          <em>
                            <Clock3 size={12} /> {row.subtitle}
                          </em>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`af-expected${row.students.length ? '' : ' is-empty'}`}
                        onClick={() => openStudents(row)}
                        disabled={row.students.length === 0}
                        aria-label={`View ${row.students.length} expected students`}
                      >
                        <span>{row.students.length}</span>
                        {row.students.length > 0 ? <ChevronRight size={14} /> : null}
                      </button>
                    </td>
                    <td>
                      <span className="af-metric is-in">{row.checkedIn}</span>
                    </td>
                    <td>
                      <span className="af-metric is-out">{row.checkedOut}</span>
                    </td>
                    <td>
                      <span className="af-metric is-abs">{row.absent}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ProfileTablePagination
          page={safePage}
          pageSize={pageSize}
          totalItems={rows.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50]}
        />
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        title="Expected students"
        subtitle={
          activeRow
            ? `${activeRow.title} · ${activeRow.students.length} student${activeRow.students.length === 1 ? '' : 's'}`
            : undefined
        }
        onClose={() => setDrawerOpen(false)}
        icon={<Users size={18} />}
        bodyClassName="af-drawer-body"
      >
        <div className="af-drawer-intro">
          <Sparkles size={15} />
          <p>Tap a student to open their Programs profile.</p>
        </div>

        <ul className="af-student-list">
          <AnimatePresence initial={false}>
            {(activeRow?.students || []).map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: Math.min(i, 12) * 0.035, duration: 0.28, ease }}
              >
                <button type="button" className="af-student-link" onClick={() => goToStudentPrograms(s.id)}>
                  <span className={`sa-avatar ${avatarTone(s.name)}`}>{initials(s.name)}</span>
                  <span className="af-student-meta">
                    <strong>{s.name}</strong>
                    <em>{roomName(s.roomIds[0] || '')}</em>
                  </span>
                  <ChevronRight size={16} className="af-student-chevron" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {activeRow && activeRow.students.length === 0 ? (
          <div className="af-drawer-empty">No students expected in this group.</div>
        ) : null}
      </Drawer>
    </motion.div>
  );
}

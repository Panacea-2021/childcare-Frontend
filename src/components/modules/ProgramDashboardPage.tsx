'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  getProgramAssignments,
  getAssignmentInsightStudents,
  subscribeProgramAssignments,
} from '@/lib/programAssignmentsStore';
import {
  getProgramKpis,
  getPrograms,
  subscribePrograms,
  type ProgramRecord,
  type ProgramStatus as CatalogStatus,
} from '@/lib/programsStore';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgramReveal } from '@/components/modules/ProgramReveal';
import { ProgramPageHeader } from '@/components/modules/ProgramPageHeader';
import { LayoutDashboard } from 'lucide-react';
import '@/components/ui/module.css';
import styles from './ProgramDashboardPage.module.css';
import motion from './programMotion.module.css';

type DashView = 'home' | 'attendance' | 'capacity' | 'occupancy' | 'monthly';
type PersonScope = 'Student' | 'Staff';
type ProgramStatus = 'All' | CatalogStatus;
type StudentInsightKind = 'starting' | 'leaving' | 'without';

type InsightStudent = { id: string; name: string; date?: string };

type ProgramRow = {
  id: string;
  name: string;
  status: CatalogStatus;
  room: string;
  rooms?: string[];
  studentMax: number;
  staffMax: number;
  studentOver: number;
  staffOver: number;
  studentTotal: number;
  staffTotal: number;
  studentExpected: number;
  staffExpected: number;
  studentSignedIn: number;
  staffSignedIn: number;
  studentWeekSeats: Array<number | null>;
  staffWeekSeats: Array<number | null>;
  studentAvailablePct: number;
  studentUtilisedPct: number;
  staffAvailablePct: number;
  staffUtilisedPct: number;
  studentOccupancyByMonth: number[];
  staffOccupancyByMonth: number[];
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_LABELS = ['Aug-2026', 'Sep-2026', 'Oct-2026', 'Nov-2026', 'Dec-2026'] as const;

function pctOf(used: number, max: number) {
  if (max <= 0) return used > 0 ? 100 : 0;
  return Number(((used / max) * 100).toFixed(2));
}

function clampPct(n: number) {
  return Math.min(100, Math.max(0, Number(n.toFixed(2))));
}

function chartBarHeight(pct: number) {
  const clamped = clampPct(pct);
  if (clamped <= 0) return 0;
  return Math.max(clamped, 1);
}

function occupancySeries(base: number, months = 5) {
  return Array.from({ length: months }, () => Number(base.toFixed(2)));
}

function countOnDay(people: Array<{ days: string[] }>, shortDay: string) {
  const matching = people.filter((p) => p.days.includes(shortDay)).length;
  if (matching === 0 && people.length > 0 && people.every((p) => p.days.length === 0)) {
    return people.length;
  }
  return matching;
}

function buildWeekSeats(
  programDays: string[],
  max: number,
  people: Array<{ days: string[] }>,
  fallbackUsed: number,
) {
  const runDays = programDays.length ? programDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return WEEK_DAYS.map((short) => {
    if (!runDays.includes(short)) return null;
    const used = people.length ? countOnDay(people, short) : fallbackUsed;
    return max - used;
  });
}

function formatRatio(staff: number, students: number) {
  if (staff === 0 && students === 0) return '-';
  return `${Math.max(staff, 0)} : ${Math.max(students, 0)}`;
}

/** Build dashboard metrics for one catalog program from its assignments. */
function buildDashRow(program: ProgramRecord): ProgramRow {
  const assignments = getProgramAssignments(program.id, program.name);
  const students = assignments.students;
  const staff = assignments.staff;

  const studentMax =
    (program.maxStudents ?? 20) + (program.allowExtraStudents ? program.extraStudents ?? 0 : 0);
  const staffMax =
    (program.maxStaff ?? 20) + (program.allowExtraStaff ? program.extraStaff ?? 0 : 0);
  const studentExpected = students.filter(
    (s) => s.status === 'Active' || (s.status !== 'Completed' && s.studentStatus === 'Active'),
  ).length;
  const staffExpected = staff.filter((s) => s.status === 'Active').length;
  // No attendance feed yet — show expected as signed-in so KPIs stay honest.
  const studentSignedIn = studentExpected;
  const staffSignedIn = staffExpected;

  const studentUtilisedPct = clampPct(pctOf(studentExpected, studentMax));
  const staffUtilisedPct = clampPct(pctOf(staffExpected, staffMax));

  return {
    id: program.id,
    name: program.name,
    status: program.status,
    room: program.room,
    studentMax,
    staffMax,
    studentOver: Math.max(0, studentExpected - studentMax),
    staffOver: Math.max(0, staffExpected - staffMax),
    studentTotal: students.length,
    staffTotal: staff.length,
    studentExpected,
    staffExpected,
    studentSignedIn,
    staffSignedIn,
    studentWeekSeats: buildWeekSeats(program.days, studentMax, students, studentExpected),
    staffWeekSeats: buildWeekSeats(program.days, staffMax, staff, staffExpected),
    studentAvailablePct: clampPct(100 - studentUtilisedPct),
    studentUtilisedPct,
    staffAvailablePct: clampPct(100 - staffUtilisedPct),
    staffUtilisedPct,
    studentOccupancyByMonth: occupancySeries(studentUtilisedPct),
    staffOccupancyByMonth: occupancySeries(staffUtilisedPct),
  };
}

function scopedMetrics(row: ProgramRow, scope: PersonScope) {
  if (scope === 'Staff') {
    return {
      maxCapacity: row.staffMax,
      overCapacityLimit: row.staffOver,
      maxOccupancy: row.staffMax,
      weekSeats: row.staffWeekSeats,
      availablePct: row.staffAvailablePct,
      utilisedPct: row.staffUtilisedPct,
      occupancyByMonth: row.staffOccupancyByMonth,
    };
  }
  return {
    maxCapacity: row.studentMax,
    overCapacityLimit: row.studentOver,
    maxOccupancy: row.studentMax,
    weekSeats: row.studentWeekSeats,
    availablePct: row.studentAvailablePct,
    utilisedPct: row.studentUtilisedPct,
    occupancyByMonth: row.studentOccupancyByMonth,
  };
}

function KpiIcon({ kind }: { kind: 'people' | 'enter' | 'exit' | 'none' }) {
  if (kind === 'people') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3.5" />
        <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" />
        <path d="M16.5 3.7a3.5 3.5 0 0 1 0 6.6" />
      </svg>
    );
  }
  if (kind === 'enter') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
    );
  }
  if (kind === 'exit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

function formatDateInput(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function seatClass(seats: number | null, max: number) {
  if (seats == null) return '';
  if (seats < 0) return styles.seatRed;
  if (seats === 0) return styles.seatBlue;
  if (seats / Math.max(max, 1) < 0.2) return styles.seatOrange;
  return styles.seatGreen;
}

function occupancyClass(pct: number) {
  if (pct > 100) return styles.occHigh;
  if (pct >= 80) return styles.occMid;
  return styles.occLow;
}

function SegmentToggle({
  value,
  onChange,
}: {
  value: PersonScope;
  onChange: (v: PersonScope) => void;
}) {
  return (
    <div className={styles.segment} role="group" aria-label="Student or staff">
      {(['Student', 'Staff'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          className={`${styles.segmentBtn} ${value === opt ? styles.segmentBtnActive : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProgramMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: ProgramRow[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectedRows = options.filter((p) => selected.includes(p.id));
  const available = options.filter(
    (p) =>
      !selected.includes(p.id) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className={styles.field}>
      <label htmlFor="pd-select-programs">Select programs</label>
      <div
        ref={rootRef}
        className={styles.multiSelect}
        onClick={() => setOpen(true)}
      >
        {selectedRows.map((p) => (
          <span className={styles.tag} key={p.id}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <button
              type="button"
              aria-label={`Remove ${p.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(selected.filter((id) => id !== p.id));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="pd-select-programs"
          className={styles.multiInput}
          value={query}
          placeholder={selected.length ? '' : 'Select programs'}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open ? (
          <div className={styles.multiMenu} role="listbox">
            {available.length === 0 ? (
              <div className={styles.multiOption} style={{ cursor: 'default', color: 'var(--text-secondary)' }}>
                {options.length > 0 && selected.length >= options.length
                  ? 'All programs selected'
                  : 'No programs'}
              </div>
            ) : (
              available.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.multiOption}
                  role="option"
                  onClick={() => {
                    onChange([...selected, p.id]);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  {p.name}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Pager({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className={styles.pager}>
      <span>
        Showing {from}-{to} of {total} results
      </span>
      <div className={styles.pagerControls}>
        <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          ‹
        </button>
        <button type="button" className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
          {page}
        </button>
        <button type="button" className={styles.pageBtn} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          ›
        </button>
        <select
          className="ui-filter"
          style={{ width: 'auto', minWidth: 96 }}
          value={pageSize}
          onChange={(e) => {
            onPageSize(Number(e.target.value));
            onPage(1);
          }}
          aria-label="Rows per page"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ForecastTable({ rows }: { rows: ProgramRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <span className={styles.sortHint}>
                Program Name <span aria-hidden>↕</span>
              </span>
            </th>
            <th>Students</th>
            <th>Expected</th>
            <th>Signed-in</th>
            <th>Staff</th>
            <th>Expected</th>
            <th>Signed-in</th>
            <th>Expected ratio</th>
            <th>Current ratio</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className={styles.emptyRow}>
              <td colSpan={9}>No Data</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id}
                className={motion.rowEnter}
                style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
              >
                <td>
                  <div className={styles.progCell}>
                    <span className={styles.progName}>{row.name}</span>
                  </div>
                </td>
                <td>{row.studentTotal}</td>
                <td>{row.studentExpected}</td>
                <td>{row.studentSignedIn}</td>
                <td>{row.staffTotal}</td>
                <td>{row.staffExpected}</td>
                <td>{row.staffSignedIn}</td>
                <td>{formatRatio(row.staffExpected, row.studentExpected)}</td>
                <td>{formatRatio(row.staffSignedIn, row.studentSignedIn)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CapacityChart({ rows, scope }: { rows: ProgramRow[]; scope: PersonScope }) {
  const yTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  return (
    <div className={styles.chartBox}>
      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: '#f3a683' }} />
          Available Capacity
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: '#e77e9a' }} />
          Utilised Capacity
        </span>
      </div>
      <div className={styles.chartArea} aria-label={`${scope} capacity chart`}>
        <div className={styles.yAxis}>
          {yTicks.map((t) => (
            <span key={t}>{t}%</span>
          ))}
        </div>
        <div className={styles.plot}>
          <div className={styles.bars}>
            {rows.map((row) => {
              const m = scopedMetrics(row, scope);
              return (
                <div className={styles.barGroup} key={row.id}>
                  <div
                    className={`${styles.bar} ${styles.barAvailable}`}
                    style={{ height: `${chartBarHeight(m.availablePct)}%` }}
                    title={`${row.name} available ${clampPct(m.availablePct)}%`}
                  />
                  <div
                    className={`${styles.bar} ${styles.barUtilised}`}
                    style={{ height: `${chartBarHeight(m.utilisedPct)}%` }}
                    title={`${row.name} utilised ${clampPct(m.utilisedPct)}%${
                      m.overCapacityLimit > 0 ? ` (over by ${m.overCapacityLimit})` : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles.xLabels}>
            {rows.map((row) => (
              <span key={row.id} title={row.name}>
                {row.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgramDashboardPage() {
  const [view, setView] = useState<DashView>('home');
  const [catalog, setCatalog] = useState<ProgramRecord[]>(() => getPrograms());
  const [assignTick, setAssignTick] = useState(0);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>(() =>
    getPrograms().map((p) => p.id),
  );
  const [status, setStatus] = useState<ProgramStatus>('Active');
  const [dateStr, setDateStr] = useState('2026-08-01');
  const [capacityScope, setCapacityScope] = useState<PersonScope>('Student');
  const [occupancyScope, setOccupancyScope] = useState<PersonScope>('Student');
  const [splitBy, setSplitBy] = useState<'Day' | 'Week'>('Day');
  const [search, setSearch] = useState('');
  const [detailStatus, setDetailStatus] = useState<ProgramStatus>('All');
  const [occSplit, setOccSplit] = useState('Month');
  const [startMonth, setStartMonth] = useState('Aug-2026');
  const [monthCount, setMonthCount] = useState(5);
  const [weekOfMonth, setWeekOfMonth] = useState('End week');
  const [rooms, setRooms] = useState('All Rooms');
  const { roomNames: centerRoomNames } = useCenterCatalog();
  const roomOptions = useMemo(() => ['All Rooms', ...centerRoomNames], [centerRoomNames]);
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date(2026, 6, 26)));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [studentInsight, setStudentInsight] = useState<StudentInsightKind | null>(null);

  useEffect(() => {
    const unsubPrograms = subscribePrograms(() => {
      const next = getPrograms();
      setCatalog(next);
      setSelectedProgramIds((prev) => {
        const nextIds = next.map((p) => p.id);
        const idSet = new Set(nextIds);
        const kept = prev.filter((id) => idSet.has(id));
        const newcomers = nextIds.filter((id) => !prev.includes(id));
        const merged = [...kept, ...newcomers];
        return merged.length ? merged : nextIds;
      });
    });
    const unsubAssign = subscribeProgramAssignments(() => setAssignTick((n) => n + 1));
    return () => {
      unsubPrograms();
      unsubAssign();
    };
  }, []);

  const PROGRAMS = useMemo(
    () => catalog.map(buildDashRow),
    // Recompute when catalog or assignments change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, assignTick],
  );

  const kpi = useMemo(() => {
    const counts = getProgramKpis();
    const insights = getAssignmentInsightStudents();
    return [
      {
        label: 'Total programs',
        value: String(counts.totalPrograms),
        hint: 'Active catalog',
        tone: styles.kpiPurple,
        icon: 'people' as const,
      },
      {
        label: 'Students starting this week',
        value: String(insights.starting.length),
        hint: 'New joiners',
        tone: styles.kpiGreen,
        icon: 'enter' as const,
        insight: 'starting' as StudentInsightKind,
        students: insights.starting as InsightStudent[],
      },
      {
        label: 'Students leaving this week',
        value: String(insights.leaving.length),
        hint: 'Transitions',
        tone: styles.kpiPink,
        icon: 'exit' as const,
        insight: 'leaving' as StudentInsightKind,
        students: insights.leaving as InsightStudent[],
      },
      {
        label: 'Students without program',
        value: String(insights.without.length),
        hint: 'Needs assignment',
        tone: styles.kpiCoral,
        icon: 'none' as const,
        insight: 'without' as StudentInsightKind,
        students: insights.without as InsightStudent[],
      },
    ];
  }, [catalog, assignTick]);

  const insightMeta: Record<
    StudentInsightKind,
    { label: string; students: InsightStudent[] }
  > = useMemo(() => {
    const insights = getAssignmentInsightStudents();
    return {
      starting: { label: 'Students starting this week', students: insights.starting },
      leaving: { label: 'Students leaving this week', students: insights.leaving },
      without: { label: 'Students without program', students: insights.without },
    };
  }, [catalog, assignTick]);

  const insightStudents = studentInsight ? insightMeta[studentInsight].students : [];
  const insightTitle = studentInsight ? insightMeta[studentInsight].label : '';

  const homeRows = useMemo(() => {
    return PROGRAMS.filter((p) => {
      if (selectedProgramIds.length && !selectedProgramIds.includes(p.id)) return false;
      if (status !== 'All' && p.status !== status) return false;
      return true;
    });
  }, [PROGRAMS, selectedProgramIds, status]);

  const detailRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROGRAMS.filter((p) => {
      if (detailStatus !== 'All' && p.status !== detailStatus) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (
        rooms !== 'All Rooms' &&
        p.room !== rooms &&
        !(p.rooms ?? []).includes(rooms)
      ) {
        return false;
      }
      return true;
    });
  }, [PROGRAMS, search, detailStatus, rooms]);

  const pagedDetail = useMemo(() => {
    const start = (page - 1) * pageSize;
    return detailRows.slice(start, start + pageSize);
  }, [detailRows, page, pageSize]);

  const weekDates = useMemo(
    () => WEEK_DAYS.map((_, i) => addDays(weekAnchor, i)),
    [weekAnchor],
  );

  const openDetail = (next: DashView) => {
    setView(next);
    setPage(1);
    setSearch('');
    setDetailStatus('All');
  };

  const backHome = () => {
    setView('home');
    setPage(1);
  };

  if (view === 'attendance') {
    return (
      <div className={`mod-page ${styles.page}`}>
        <div className={styles.ambient} aria-hidden />
        <ProgramReveal className={styles.head}>
          <div className={styles.headTitle}>
            <button type="button" className={styles.backBtn} onClick={backHome} aria-label="Back">
              ←
            </button>
            <h1 className={styles.title}>Attendance Forecast</h1>
          </div>
        </ProgramReveal>

        <ProgramReveal delayMs={80} className={`${styles.panel} ${styles.panelPad}`}>
          <div className={`${styles.filters} ${styles.filtersWide}`}>
            <div className={styles.field}>
              <label htmlFor="af-split">Split by</label>
              <select id="af-split" className="ui-filter" value={splitBy} onChange={(e) => setSplitBy(e.target.value as 'Day' | 'Week')}>
                <option>Day</option>
                <option>Week</option>
              </select>
            </div>
            <div className={`${styles.field} ${styles.dateField}`}>
              <label htmlFor="af-date">Select date</label>
              <FieldDatePicker
                value={dateStr}
                onChange={setDateStr}
                ariaLabel="Select date"
                placeholder="dd/mm/yyyy"
                displayFormat="dd-mm-yyyy"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="af-search">Search</label>
              <input
                id="af-search"
                className="ui-filter"
                placeholder="Search by program name"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="af-status">Program status</label>
              <select
                id="af-status"
                className="ui-filter"
                value={detailStatus}
                onChange={(e) => {
                  setDetailStatus(e.target.value as ProgramStatus);
                  setPage(1);
                }}
              >
                <option>All</option>
                <option>Active</option>
                <option>Expired</option>
                <option>Upcoming</option>
              </select>
            </div>
          </div>
          <ForecastTable rows={pagedDetail} />
          <Pager page={page} pageSize={pageSize} total={detailRows.length} onPage={setPage} onPageSize={setPageSize} />
        </ProgramReveal>
      </div>
    );
  }

  if (view === 'capacity') {
    return (
      <div className={`mod-page ${styles.page}`}>
        <div className={styles.ambient} aria-hidden />
        <ProgramReveal className={styles.head}>
          <div className={styles.headTitle}>
            <button type="button" className={styles.backBtn} onClick={backHome} aria-label="Back">
              ←
            </button>
            <h1 className={styles.title}>Capacity Planner</h1>
          </div>
          <SegmentToggle value={capacityScope} onChange={setCapacityScope} />
        </ProgramReveal>

        <ProgramReveal delayMs={80} className={`${styles.panel} ${styles.panelPad}`}>
          <div className={styles.toolbar}>
            <div className={styles.weekNav}>
              <button type="button" onClick={() => setWeekAnchor((d) => addDays(d, -7))} aria-label="Previous week">
                ‹
              </button>
              <div className={styles.weekLabel}>
                {formatDateInput(weekDates[0])} - {formatDateInput(weekDates[6])}
              </div>
              <button type="button" onClick={() => setWeekAnchor((d) => addDays(d, 7))} aria-label="Next week">
                ›
              </button>
            </div>
            <div className={styles.toolbarRight} style={{ flex: 1, justifyContent: 'flex-end' }}>
              <div className={styles.field} style={{ minWidth: 200 }}>
                <label htmlFor="cp-search" className={styles.srOnly}>
                  Search
                </label>
                <input
                  id="cp-search"
                  className="ui-filter"
                  placeholder="Search by program name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className={styles.field} style={{ minWidth: 120 }}>
                <label htmlFor="cp-status" className={styles.srOnly}>
                  Status
                </label>
                <select
                  id="cp-status"
                  className="ui-filter"
                  value={detailStatus}
                  onChange={(e) => {
                    setDetailStatus(e.target.value as ProgramStatus);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Upcoming</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.legendRow}>
            <p className={styles.legendTitle}>{capacityScope} capacity planner</p>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#16a34a' }} /> Abundant capacity
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#ea580c' }} /> Limited capacity
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#1d4ed8' }} /> Full capacity
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#dc2626' }} /> Over capacity
              </span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Program Name</th>
                  {weekDates.map((d, i) => (
                    <th key={WEEK_DAYS[i]}>
                      {WEEK_DAYS[i]}
                      <br />
                      <span style={{ fontWeight: 500 }}>{formatDateInput(d)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedDetail.map((row, index) => {
                  const m = scopedMetrics(row, capacityScope);
                  return (
                  <tr
                    key={row.id}
                    className={motion.rowEnter}
                    style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                  >
                    <td>
                      <div className={styles.progCell}>
                        <span className={styles.progName}>{row.name}</span>
                        <span className={styles.progMeta}>
                          Max Capacity : <strong>{m.maxCapacity}</strong>
                        </span>
                        <span className={styles.progMeta}>
                          Over capacity limit :{' '}
                          <span className={m.overCapacityLimit > 0 ? styles.progMetaWarn : undefined}>
                            {m.overCapacityLimit}
                          </span>
                        </span>
                      </div>
                    </td>
                    {m.weekSeats.map((seats, i) => (
                      <td key={i} className={seats == null ? styles.dashCell : seatClass(seats, m.maxCapacity)}>
                        {seats == null ? '-' : `${seats} seats`}
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={page} pageSize={pageSize} total={detailRows.length} onPage={setPage} onPageSize={setPageSize} />
        </ProgramReveal>
      </div>
    );
  }

  if (view === 'occupancy') {
    const months = MONTH_LABELS.slice(0, Math.max(1, Math.min(12, monthCount)));
    return (
      <div className={`mod-page ${styles.page}`}>
        <div className={styles.ambient} aria-hidden />
        <ProgramReveal className={styles.head}>
          <div className={styles.headTitle}>
            <button type="button" className={styles.backBtn} onClick={backHome} aria-label="Back">
              ←
            </button>
            <h1 className={styles.title}>Occupancy report</h1>
          </div>
          <SegmentToggle value={occupancyScope} onChange={setOccupancyScope} />
        </ProgramReveal>

        <ProgramReveal delayMs={80} className={`${styles.panel} ${styles.panelPad}`}>
          <div className={`${styles.filters} ${styles.filtersFive}`}>
            <div className={styles.field}>
              <label htmlFor="or-search">Search</label>
              <input
                id="or-search"
                className="ui-filter"
                placeholder="Search by program name"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="or-split">Split By</label>
              <select id="or-split" className="ui-filter" value={occSplit} onChange={(e) => setOccSplit(e.target.value)}>
                <option>Month</option>
                <option>Week</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="or-start">Start From</label>
              <select id="or-start" className="ui-filter" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                {MONTH_LABELS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="or-months">Number Of Months</label>
              <input
                id="or-months"
                className="ui-filter"
                type="number"
                min={1}
                max={12}
                value={monthCount}
                onChange={(e) => setMonthCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="or-status">Program Status</label>
              <select
                id="or-status"
                className="ui-filter"
                value={detailStatus}
                onChange={(e) => {
                  setDetailStatus(e.target.value as ProgramStatus);
                  setPage(1);
                }}
              >
                <option>All</option>
                <option>Active</option>
                <option>Expired</option>
                <option>Upcoming</option>
              </select>
            </div>
          </div>

          <p className={styles.helper}>
            You are looking at {occupancyScope.toLowerCase()} occupancy data for the next {monthCount} months starting
            from 01/08/2026.
          </p>

          <div className={styles.legendRow}>
            <span />
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#f59e0b' }} /> {'< 80% (under utilised)'}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#16a34a' }} /> 80% - 100% (moderately utilised)
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: '#dc2626' }} /> {'> 100% (over utilised)'}
              </span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Program Name</th>
                  {months.map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedDetail.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={months.length + 1}>No Data</td>
                  </tr>
                ) : (
                  pagedDetail.map((row, index) => {
                    const metrics = scopedMetrics(row, occupancyScope);
                    return (
                    <tr
                      key={row.id}
                      className={motion.rowEnter}
                      style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                    >
                      <td>
                        <div className={styles.progCell}>
                          <span className={styles.progName}>{row.name}</span>
                          <span className={styles.progMeta}>
                            Max occupancy : <strong>{metrics.maxOccupancy}</strong>
                          </span>
                          <span className={styles.progMeta}>
                            Over capacity limit :{' '}
                            <span className={metrics.overCapacityLimit > 0 ? styles.progMetaWarn : undefined}>
                              {metrics.overCapacityLimit}
                            </span>
                          </span>
                        </div>
                      </td>
                      {months.map((monthLabel, i) => {
                        const value = metrics.occupancyByMonth[i] ?? 0;
                        return (
                          <td key={monthLabel} className={occupancyClass(value)}>
                            {value}%
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pager page={page} pageSize={pageSize} total={detailRows.length} onPage={setPage} onPageSize={setPageSize} />
        </ProgramReveal>
      </div>
    );
  }

  if (view === 'monthly') {
    const months = MONTH_LABELS.slice(0, Math.max(1, Math.min(12, monthCount)));
    return (
      <div className={`mod-page ${styles.page}`}>
        <div className={styles.ambient} aria-hidden />
        <ProgramReveal className={styles.head}>
          <div className={styles.headTitle}>
            <button type="button" className={styles.backBtn} onClick={backHome} aria-label="Back">
              ←
            </button>
            <h1 className={styles.title}>Monthly Occupancy Comparison report</h1>
          </div>
        </ProgramReveal>

        <ProgramReveal delayMs={80} className={`${styles.panel} ${styles.panelPad}`}>
          <div className={`${styles.filters} ${styles.filtersWide}`}>
            <div className={styles.field}>
              <label htmlFor="mo-week">Week Of Month</label>
              <select id="mo-week" className="ui-filter" value={weekOfMonth} onChange={(e) => setWeekOfMonth(e.target.value)}>
                <option>End week</option>
                <option>Start week</option>
                <option>Mid week</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="mo-start">Start Month</label>
              <select id="mo-start" className="ui-filter" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                {MONTH_LABELS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="mo-months">Number Of Months</label>
              <input
                id="mo-months"
                className="ui-filter"
                type="number"
                min={1}
                max={12}
                value={monthCount}
                onChange={(e) => setMonthCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="mo-rooms">Rooms</label>
              <select id="mo-rooms" className="ui-filter" value={rooms} onChange={(e) => setRooms(e.target.value)}>
                {roomOptions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <p className={styles.helper}>
            You&apos;re looking at occupancy during the {weekOfMonth.toLowerCase()} over {monthCount} months starting
            from {startMonth.split('-')[0]} in {rooms} in various programs.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Program Name</th>
                  {months.map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedDetail.map((row, index) => {
                  const m = scopedMetrics(row, occupancyScope);
                  return (
                  <tr
                    key={row.id}
                    className={motion.rowEnter}
                    style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                  >
                    <td>
                      <div className={styles.progCell}>
                        <span className={styles.progName}>{row.name}</span>
                        <span className={styles.progMeta}>
                          Max occupancy : <strong>{m.maxOccupancy}</strong>
                        </span>
                        <span className={styles.progMeta}>
                          Over capacity limit :{' '}
                          <span className={m.overCapacityLimit > 0 ? styles.progMetaWarn : undefined}>
                            {m.overCapacityLimit}
                          </span>
                        </span>
                      </div>
                    </td>
                    {months.map((monthLabel, i) => (
                      <td key={monthLabel} className={occupancyClass(m.occupancyByMonth[i] ?? 0)}>
                        {m.occupancyByMonth[i] ?? 0}%
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={page} pageSize={pageSize} total={detailRows.length} onPage={setPage} onPageSize={setPageSize} />
        </ProgramReveal>
      </div>
    );
  }

  return (
    <div className={`mod-page ${styles.page}`}>
      <div className={styles.ambient} aria-hidden />

      <ProgramPageHeader
        title="Program Dashboard"
        description="Track occupancy, forecasts, and capacity across programs."
        icon={<LayoutDashboard />}
      />

      <div className={styles.kpis} role="list" aria-label="Program dashboard stats">
        {kpi.map((item, index) => {
          const content = (
            <>
              <div className={styles.kpiLeft}>
                <span className={styles.kpiIcon} aria-hidden>
                  <KpiIcon kind={item.icon} />
                </span>
                <div className={styles.kpiCopy}>
                  <span className={styles.kpiLabel}>{item.label}</span>
                  <span className={styles.kpiHint}>{item.hint}</span>
                </div>
              </div>
              <div className={styles.kpiRight}>
                <strong>{item.value}</strong>
              </div>
            </>
          );

          if ('insight' in item && item.insight) {
            return (
              <button
                key={item.label}
                type="button"
                className={`${styles.kpi} ${styles.kpiClickable} ${item.tone} ${motion.kpiEnter}`}
                style={{ '--stagger': `${index * 70}ms` } as CSSProperties}
                role="listitem"
                onClick={() => setStudentInsight(item.insight)}
                aria-label={`View ${item.label}`}
              >
                {content}
              </button>
            );
          }

          return (
            <article
              key={item.label}
              className={`${styles.kpi} ${item.tone} ${motion.kpiEnter}`}
              style={{ '--stagger': `${index * 70}ms` } as CSSProperties}
              role="listitem"
            >
              {content}
            </article>
          );
        })}
      </div>

      <ProgramReveal delayMs={80} className={styles.filters}>
        <ProgramMultiSelect options={PROGRAMS} selected={selectedProgramIds} onChange={setSelectedProgramIds} />
        <div className={styles.field}>
          <label htmlFor="pd-status">Program status</label>
          <select id="pd-status" className="ui-filter" value={status} onChange={(e) => setStatus(e.target.value as ProgramStatus)}>
            <option>All</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Upcoming</option>
          </select>
        </div>
        <div className={`${styles.field} ${styles.dateField}`}>
          <label htmlFor="pd-date">Date</label>
          <FieldDatePicker
            value={dateStr}
            onChange={setDateStr}
            ariaLabel="Date"
            placeholder="dd/mm/yyyy"
            displayFormat="dd-mm-yyyy"
          />
        </div>
      </ProgramReveal>

      <ProgramReveal delayMs={140} as="section" className={`${styles.panel} ${styles.panelPad}`}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <h2 className={styles.panelTitle}>Attendance Forecast</h2>
            <p className={styles.panelDesc}>
              Forecast attendance to anticipate demand and plan staffing and resources accordingly.
            </p>
          </div>
          <button type="button" className={styles.viewLink} onClick={() => openDetail('attendance')}>
            View All
          </button>
        </div>
        <ForecastTable rows={homeRows} />
      </ProgramReveal>

      <ProgramReveal delayMs={200} as="section" className={`${styles.panel} ${styles.panelPad}`}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <h2 className={styles.panelTitle}>Capacity Planner</h2>
            <p className={styles.panelDesc}>
              Visualize student and staff utilised capacity by day to efficiently manage enrollment and staffing at the
              childcare center.
            </p>
          </div>
          <button type="button" className={styles.viewLink} onClick={() => openDetail('capacity')}>
            View for all dates
          </button>
        </div>
        <div className={styles.toolbar}>
          <SegmentToggle value={capacityScope} onChange={setCapacityScope} />
        </div>
        <CapacityChart rows={homeRows.length ? homeRows : PROGRAMS.slice(0, 1)} scope={capacityScope} />
      </ProgramReveal>

      <ProgramReveal delayMs={260} as="section" className={`${styles.panel} ${styles.panelPad}`}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <h2 className={styles.panelTitle}>Occupancy Report</h2>
            <p className={styles.panelDesc}>
              Track current occupancy rates across different time windows to optimize resource allocation at the center.
            </p>
          </div>
          <button type="button" className={styles.viewLink} onClick={() => openDetail('occupancy')}>
            View All
          </button>
        </div>
        <div className={styles.toolbar}>
          <SegmentToggle value={occupancyScope} onChange={setOccupancyScope} />
        </div>
        <div className={`${styles.filters} ${styles.filtersWide}`} style={{ marginBottom: 12 }}>
          <div className={styles.field}>
            <label htmlFor="home-split">Split By</label>
            <select id="home-split" className="ui-filter" value={occSplit} onChange={(e) => setOccSplit(e.target.value)}>
              <option>Month</option>
              <option>Week</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="home-start">Start From</label>
            <select id="home-start" className="ui-filter" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
              {MONTH_LABELS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="home-months">Number Of Months</label>
            <input
              id="home-months"
              className="ui-filter"
              type="number"
              min={1}
              max={12}
              value={monthCount}
              onChange={(e) => setMonthCount(Number(e.target.value) || 1)}
            />
          </div>
          <div />
        </div>
        <p className={styles.helper}>
          You are looking at {occupancyScope.toLowerCase()} occupancy data for the next {monthCount} months starting from
          01/08/2026.
        </p>
        <div className={styles.legendRow}>
          <p className={styles.legendTitle}>{occupancyScope} Occupancy</p>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: '#f59e0b' }} /> {'< 80% (under utilised)'}
            </span>
            <span className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: '#16a34a' }} /> 80% - 100% (moderately utilised)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: '#dc2626' }} /> {'> 100% (over utilised)'}
            </span>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Program Name</th>
                {MONTH_LABELS.slice(0, monthCount).map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {homeRows.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={monthCount + 1}>No Data</td>
                </tr>
              ) : (
                homeRows.map((row, index) => {
                  const m = scopedMetrics(row, occupancyScope);
                  return (
                  <tr
                    key={row.id}
                    className={motion.rowEnter}
                    style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                  >
                    <td>
                      <div className={styles.progCell}>
                        <span className={styles.progName}>{row.name}</span>
                        <span className={styles.progMeta}>
                          Max occupancy : <strong>{m.maxOccupancy}</strong>
                        </span>
                        <span className={styles.progMeta}>
                          Over capacity limit :{' '}
                          <span className={m.overCapacityLimit > 0 ? styles.progMetaWarn : undefined}>
                            {m.overCapacityLimit}
                          </span>
                        </span>
                      </div>
                    </td>
                    {MONTH_LABELS.slice(0, monthCount).map((monthLabel, i) => {
                      const value = m.occupancyByMonth[i] ?? 0;
                      return (
                        <td key={monthLabel} className={occupancyClass(value)}>
                          {value}%
                        </td>
                      );
                    })}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ProgramReveal>

      <ProgramReveal delayMs={320} as="section" className={`${styles.panel} ${styles.panelPad}`}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeadLeft}>
            <h2 className={styles.panelTitle}>Monthly Occupancy Comparison report</h2>
            <p className={styles.panelDesc}>Analyze monthly occupancy rate across all programs over multiple months</p>
          </div>
          <button type="button" className={styles.viewLink} onClick={() => openDetail('monthly')}>
            View All
          </button>
        </div>
        <div className={`${styles.filters} ${styles.filtersWide}`} style={{ marginBottom: 12 }}>
          <div className={styles.field}>
            <label htmlFor="home-week">Week Of Month</label>
            <select id="home-week" className="ui-filter" value={weekOfMonth} onChange={(e) => setWeekOfMonth(e.target.value)}>
              <option>End week</option>
              <option>Start week</option>
              <option>Mid week</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="home-mo-start">Start Month</label>
            <select id="home-mo-start" className="ui-filter" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
              {MONTH_LABELS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="home-mo-months">Number Of Months</label>
            <input
              id="home-mo-months"
              className="ui-filter"
              type="number"
              min={1}
              max={12}
              value={monthCount}
              onChange={(e) => setMonthCount(Number(e.target.value) || 1)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="home-rooms">Rooms</label>
            <select id="home-rooms" className="ui-filter" value={rooms} onChange={(e) => setRooms(e.target.value)}>
              {roomOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <p className={styles.helper}>
          You&apos;re looking at occupancy during the {weekOfMonth.toLowerCase()} over {monthCount} months starting from{' '}
          {startMonth.split('-')[0]} in {rooms} in various programs.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Program Name</th>
                {MONTH_LABELS.slice(0, monthCount).map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {homeRows.map((row, index) => {
                const m = scopedMetrics(row, occupancyScope);
                return (
                <tr
                  key={row.id}
                  className={motion.rowEnter}
                  style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                >
                  <td>
                    <div className={styles.progCell}>
                      <span className={styles.progName}>{row.name}</span>
                      <span className={styles.progMeta}>
                        Max occupancy : <strong>{m.maxOccupancy}</strong>
                      </span>
                      <span className={styles.progMeta}>
                        Over capacity limit :{' '}
                        <span className={m.overCapacityLimit > 0 ? styles.progMetaWarn : undefined}>
                          {m.overCapacityLimit}
                        </span>
                      </span>
                    </div>
                  </td>
                  {MONTH_LABELS.slice(0, monthCount).map((monthLabel, i) => (
                    <td key={monthLabel} className={occupancyClass(m.occupancyByMonth[i] ?? 0)}>
                      {m.occupancyByMonth[i] ?? 0}%
                    </td>
                  ))}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ProgramReveal>

      <Drawer
        open={Boolean(studentInsight)}
        title={insightTitle}
        meta={`${insightStudents.length} student${insightStudents.length === 1 ? '' : 's'}`}
        plainHeader
        onClose={() => setStudentInsight(null)}
      >
        {insightStudents.length === 0 ? (
          <EmptyState title="No Data" description="No students in this list right now." />
        ) : (
          <ul className={styles.insightList}>
            {insightStudents.map((student) => (
              <li key={student.id} className={styles.insightRow}>
                <span className={styles.insightAvatar} aria-hidden>
                  {student.name.charAt(0).toUpperCase()}
                </span>
                <span className={styles.insightName}>{student.name}</span>
                {student.date ? <span className={styles.insightDate}>{student.date}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  );
}

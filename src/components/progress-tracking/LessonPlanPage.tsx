'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { LESSON_CATEGORIES } from '@/lib/mock/lessonCatalog';
import {
  LESSON_SETS,
  PROGRESS_ROOMS,
  PROGRESS_STUDENTS,
} from '@/lib/mock/mockProgressTracking';
import type { ProgressRecordDraft } from '@/types/progressTracking';
import { AddRecordModal } from './AddRecordModal';
import { AssignLessonsDrawer, type AssignLessonsPayload } from './AssignLessonsDrawer';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

type ViewMode = 'today' | 'weekly';
type DisplayMode = 'student' | 'lesson';

type PlannedItem = {
  id: string;
  dateKey: string;
  lessonId: string;
  lessonTitle: string;
  room: string;
  studentIds: string[];
  notes: string;
  staffName?: string;
};

const PLAN_STORAGE_KEY = 'panacea.lessonPlan.v1';

const AREA_OPTIONS = [
  { value: 'all', label: 'All Areas' },
  ...LESSON_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => ({
    value: c,
    label: c,
  })),
];

const GROUP_OPTIONS = [
  { value: 'all', label: 'All Groups' },
  { value: 'group-a', label: 'Group A' },
  { value: 'group-b', label: 'Group B' },
];

const AGE_BAND_OPTIONS = [
  { value: 'all', label: 'All Age Bands' },
  { value: '0-3', label: '0-3' },
  { value: '3-6', label: '3-6' },
  { value: '6-12', label: '6-12' },
];

const STAFF_OPTIONS = [
  { value: 'all', label: 'All Staff' },
  { value: 'malika', label: 'Malika Thimisetty' },
  { value: 'me', label: 'Assigned to me' },
];

function loadPlannedItems(): PlannedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlannedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatWeekRange(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' as const }),
  });
  const right = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${left} - ${right}`;
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday start, matching Illumine week strip. */
function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function LessonPlanPage() {
  const [cursor, setCursor] = useState(() => new Date(2026, 7, 3));
  const [room, setRoom] = useState('demo-room');
  const [lessonSet, setLessonSet] = useState('all');
  const [view, setView] = useState<ViewMode>('weekly');
  const [display, setDisplay] = useState<DisplayMode>('student');
  const [assignOpen, setAssignOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [assignDay, setAssignDay] = useState<Date | null>(null);
  const [presetStudentId, setPresetStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [ageBandFilter, setAgeBandFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [items, setItems] = useState<PlannedItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadPlannedItems());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const roomName =
    PROGRESS_ROOMS.find((r) => r.id === room)?.name ?? 'Demo Room';

  const roomStudents = useMemo(() => {
    if (room === 'all') return PROGRESS_STUDENTS;
    return PROGRESS_STUDENTS.filter((s) => s.room === roomName);
  }, [room, roomName]);

  const dayKey = toKey(cursor);

  const weekDays = useMemo(() => {
    const start = startOfWeekMonday(cursor);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const weekStart = weekDays[0]!;
  const weekEnd = weekDays[4]!;
  const weekKeys = useMemo(() => new Set(weekDays.map(toKey)), [weekDays]);

  const scopedItems = useMemo(
    () =>
      items.filter((it) => {
        if (room !== 'all' && it.room !== roomName) return false;
        if (view === 'today') {
          if (it.dateKey !== dayKey) return false;
        } else if (!weekKeys.has(it.dateKey)) {
          return false;
        }
        if (staffFilter === 'me' || staffFilter === 'malika') {
          const name = (it.staffName ?? '').toLowerCase();
          if (!name.includes('malika')) return false;
        }
        if (areaFilter !== 'all') {
          const hay = it.lessonTitle.toLowerCase();
          if (!hay.includes(areaFilter.toLowerCase().split(' ')[0] ?? '')) {
            // soft match: keep if area token appears; otherwise allow through for mock data
            void hay;
          }
        }
        void groupFilter;
        void ageBandFilter;
        void lessonSet;
        return true;
      }),
    [
      items,
      room,
      roomName,
      view,
      dayKey,
      weekKeys,
      staffFilter,
      areaFilter,
      groupFilter,
      ageBandFilter,
      lessonSet,
    ],
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return roomStudents;
    return roomStudents.filter((s) => s.name.toLowerCase().includes(q));
  }, [roomStudents, studentSearch]);

  const dayItems = useMemo(
    () => scopedItems.filter((it) => it.dateKey === dayKey),
    [scopedItems, dayKey],
  );

  const stats = useMemo(() => {
    const relevant = view === 'today' ? dayItems : scopedItems;
    const plannedCount = relevant.length;
    const covered = new Set(relevant.flatMap((i) => i.studentIds));
    const leftOut = roomStudents.filter((s) => !covered.has(s.id)).length;
    return [
      {
        id: 'students',
        label: 'Total students',
        value: roomStudents.length,
        icon: Users,
        tone: 'indigo',
      },
      {
        id: 'planned',
        label: 'Total lessons planned',
        value: plannedCount,
        icon: BookOpen,
        tone: 'lavender',
      },
      {
        id: 'left',
        label: 'Students left out',
        value: leftOut,
        icon: Bell,
        tone: 'amber',
      },
    ];
  }, [view, dayItems, scopedItems, roomStudents]);

  const lessonRows = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    const map = new Map<string, { id: string; title: string; byDay: Record<string, string[]> }>();
    for (const it of scopedItems) {
      if (q && !it.lessonTitle.toLowerCase().includes(q)) continue;
      const row = map.get(it.lessonId) ?? {
        id: it.lessonId,
        title: it.lessonTitle,
        byDay: {},
      };
      const names = it.studentIds
        .map((id) => PROGRESS_STUDENTS.find((s) => s.id === id)?.shortName ?? id)
        .filter(Boolean);
      row.byDay[it.dateKey] = [...(row.byDay[it.dateKey] ?? []), ...names];
      map.set(it.lessonId, row);
    }
    return Array.from(map.values());
  }, [scopedItems, lessonSearch]);

  const shift = (delta: number) => {
    setCursor((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + (view === 'weekly' ? delta * 7 : delta));
      return next;
    });
  };

  const clearSearches = () => {
    setStudentSearch('');
    setLessonSearch('');
  };

  const clearAllFilters = () => {
    setRoom('demo-room');
    setLessonSet('all');
    setAreaFilter('all');
    setGroupFilter('all');
    setAgeBandFilter('all');
    setStaffFilter('all');
    setStudentSearch('');
    setLessonSearch('');
  };

  const moreFilterCount =
    (areaFilter !== 'all' ? 1 : 0) +
    (groupFilter !== 'all' ? 1 : 0) +
    (ageBandFilter !== 'all' ? 1 : 0) +
    (staffFilter !== 'all' ? 1 : 0);

  const openAssign = (day?: Date, studentId?: string | null) => {
    setAssignDay(day ?? cursor);
    setPresetStudentId(studentId ?? null);
    setAssignOpen(true);
  };

  const handleAssign = (payload: AssignLessonsPayload) => {
    const next: PlannedItem[] = payload.lessonIds.map((lessonId, i) => ({
      id: `plan-${Date.now()}-${i}`,
      dateKey: payload.dateKey,
      lessonId,
      lessonTitle: payload.lessonTitles[i] ?? 'Lesson',
      room: payload.room,
      studentIds: payload.studentIds,
      notes: '',
      staffName: payload.staffName,
    }));
    setItems((prev) => [...next, ...prev]);
    setAssignOpen(false);
    setAssignDay(null);
    setPresetStudentId(null);
    flash(
      next.length === 1
        ? '1 lesson assigned'
        : `${next.length} lessons assigned`,
    );
  };

  const handleRecord = (_draft: ProgressRecordDraft) => {
    setRecordOpen(false);
    flash('Record saved');
  };

  const downloadPdf = () => {
    const relevant = view === 'today' ? dayItems : scopedItems;
    const title =
      view === 'weekly'
        ? `Lesson Plan · ${formatWeekRange(weekStart, weekEnd)}`
        : `Lesson Plan · ${formatDayLabel(cursor)}`;
    const rows =
      relevant.length === 0
        ? '<tr><td colspan="4">No lessons planned for this period.</td></tr>'
        : relevant
            .map((it) => {
              const students = it.studentIds
                .map((id) => PROGRESS_STUDENTS.find((s) => s.id === id)?.name ?? id)
                .join(', ');
              return `<tr>
                <td>${it.dateKey}</td>
                <td>${it.lessonTitle}</td>
                <td>${students || '—'}</td>
                <td>${it.room}${it.staffName ? ` · ${it.staffName}` : ''}</td>
              </tr>`;
            })
            .join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  body{font-family:Poppins,Segoe UI,sans-serif;color:#1f2937;padding:32px}
  h1{font-size:20px;margin:0 0 8px}
  p{color:#64748b;margin:0 0 20px;font-size:13px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{border:1px solid #e8edf5;padding:10px 12px;text-align:left}
  th{background:#5d5fef;color:#fff}
</style></head><body>
  <h1>${title}</h1>
  <p>Room: ${roomName} · Panacea Childcare</p>
  <table>
    <thead><tr><th>Date</th><th>Lesson</th><th>Students</th><th>Details</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload=function(){window.print()}<\/script>
</body></html>`;

    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) {
      flash('Allow pop-ups to download PDF');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    flash('Opening print dialog for PDF');
  };

  const itemsForStudentDay = (studentId: string, key: string) =>
    scopedItems.filter(
      (it) => it.dateKey === key && it.studentIds.includes(studentId),
    );

  const dateLabel =
    view === 'weekly' ? formatWeekRange(weekStart, weekEnd) : formatDayLabel(cursor);

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Lesson Plan"
        description="Plan, deliver, and record each child's daily lessons."
        icon={<BookOpen size={22} strokeWidth={2.1} />}
        actions={
          <div className="pt-header-actions lp-header-actions">
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => openAssign()}>
              Assign Lesson
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setRecordOpen(true)}
            >
              Add record
            </button>
            <button type="button" className="ui-btn ui-btn-outline" onClick={downloadPdf}>
              <Download size={15} aria-hidden />
              Download PDF
            </button>
          </div>
        }
      />

      {toast ? <p className="lp-toast">{toast}</p> : null}

      <div className="lp-filters-block">
          <div className="lp-toolbar">
            <div className="lp-date-nav" aria-label="Date">
              <button type="button" className="lp-date-arrow" onClick={() => shift(-1)} aria-label="Previous">
                <ChevronLeft size={18} />
              </button>
              <div className="lp-date-label">
                <CalendarDays size={16} aria-hidden />
                <span>{dateLabel}</span>
              </div>
              <button type="button" className="lp-date-arrow" onClick={() => shift(1)} aria-label="Next">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="lp-field">
              <span className="lp-field-label">Room</span>
              <OdFilterDropdown
                className="lp-dd"
                value={room}
                onChange={setRoom}
                options={PROGRESS_ROOMS.map((r) => ({
                  value: r.id,
                  label: r.name === 'All Classrooms' ? 'All Rooms' : r.name,
                }))}
                ariaLabel="Room"
              />
            </div>

            <div className="lp-field">
              <span className="lp-field-label">Lesson set</span>
              <OdFilterDropdown
                className="lp-dd"
                value={lessonSet}
                onChange={setLessonSet}
                options={LESSON_SETS.map((s) => ({
                  value: s.id,
                  label: s.id === 'all' ? 'All Sets' : s.name,
                }))}
                ariaLabel="Lesson set"
              />
            </div>

            <button
              type="button"
              className={`lp-filters-btn${filtersOpen ? ' is-open' : ''}`}
              aria-expanded={filtersOpen}
              aria-controls="lp-more-filters"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <Filter size={15} aria-hidden />
              Filters
              {moreFilterCount > 0 ? <i>{moreFilterCount}</i> : null}
            </button>

            <div className="lp-view-toggle" role="group" aria-label="Plan view">
              <button
                type="button"
                className={`lp-view-btn${view === 'today' ? ' is-active' : ''}`}
                onClick={() => setView('today')}
              >
                Today
              </button>
              <button
                type="button"
                className={`lp-view-btn${view === 'weekly' ? ' is-active' : ''}`}
                onClick={() => setView('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>

          {filtersOpen ? (
            <div className="lp-filters-more" id="lp-more-filters">
              <OdFilterDropdown
                className="lp-dd-more"
                value={areaFilter}
                onChange={setAreaFilter}
                options={AREA_OPTIONS}
                ariaLabel="Area"
              />
              <OdFilterDropdown
                className="lp-dd-more"
                value={groupFilter}
                onChange={setGroupFilter}
                options={GROUP_OPTIONS}
                ariaLabel="Group"
              />
              <OdFilterDropdown
                className="lp-dd-more"
                value={ageBandFilter}
                onChange={setAgeBandFilter}
                options={AGE_BAND_OPTIONS}
                ariaLabel="Age band"
              />
              <OdFilterDropdown
                className="lp-dd-more"
                value={staffFilter}
                onChange={setStaffFilter}
                options={STAFF_OPTIONS}
                ariaLabel="Staff"
              />
              {moreFilterCount > 0 ? (
                <button type="button" className="al-link" onClick={clearAllFilters}>
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : null}
      </div>

      <div className="lp-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.id} className={`lp-stat-card tone-${s.tone}`}>
              <span className={`lp-stat-icon tone-${s.tone}`} aria-hidden>
                <Icon size={18} />
              </span>
              <div>
                <p className="lp-stat-label">{s.label}</p>
                <p className="lp-stat-value">{s.value}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="pt-shell lp-shell">
        <div className="lp-search-bar">
          <div className="lp-search">
            <Search size={15} aria-hidden />
            <input
              className="ui-input"
              type="search"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>
          <div className="lp-search">
            <Search size={15} aria-hidden />
            <input
              className="ui-input"
              type="search"
              placeholder="Search lessons..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              aria-label="Search lessons"
            />
          </div>
          <button type="button" className="al-link" onClick={clearSearches}>
            Clear all
          </button>
          <div className="lp-view-toggle lp-display-toggle" role="group" aria-label="Display">
            <button
              type="button"
              className={`lp-view-btn${display === 'student' ? ' is-active' : ''}`}
              onClick={() => setDisplay('student')}
            >
              By Student
            </button>
            <button
              type="button"
              className={`lp-view-btn${display === 'lesson' ? ' is-active' : ''}`}
              onClick={() => setDisplay('lesson')}
            >
              By Lesson
            </button>
          </div>
        </div>

        {view === 'today' ? (
          <section className="lp-panel">
            {dayItems.length === 0 ? (
              <div className="lp-empty">
                <p>Nothing planned for today yet.</p>
                <button type="button" className="ui-btn ui-btn-primary" onClick={() => openAssign()}>
                  <Plus size={16} aria-hidden />
                  Plan today&apos;s work
                </button>
              </div>
            ) : (
              <ul className="lp-plan-list">
                {dayItems.map((item) => (
                  <li key={item.id} className="lp-plan-item">
                    <div>
                      <strong>{item.lessonTitle}</strong>
                      <span>
                        {item.room} · {item.studentIds.length} students
                        {item.staffName ? ` · ${item.staffName}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline lp-small-btn"
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="lp-grid-wrap">
            <div className="lp-grid" role="table" aria-label="Weekly lesson plan">
              <div className="lp-grid-head" role="row">
                <div className="lp-grid-corner" role="columnheader">
                  {display === 'student' ? 'Student' : 'Lesson'}
                </div>
                {weekDays.map((d) => {
                  const key = toKey(d);
                  const isToday = key === dayKey;
                  return (
                    <div
                      key={key}
                      className={`lp-grid-dayhead${isToday ? ' is-today' : ''}`}
                      role="columnheader"
                    >
                      <span>
                        {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        className="lp-day-add"
                        aria-label={`Assign on ${formatDayLabel(d)}`}
                        onClick={() => openAssign(d)}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>

              {display === 'student' ? (
                filteredStudents.length === 0 ? (
                  <div className="lp-grid-empty">No students match your search.</div>
                ) : scopedItems.length === 0 && !studentSearch && !lessonSearch ? (
                  <div className="lp-grid-empty">
                    <p>No lessons planned this week.</p>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary"
                      onClick={() => openAssign(weekStart)}
                    >
                      <Plus size={16} aria-hidden />
                      Assign Lesson
                    </button>
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div key={s.id} className="lp-grid-row" role="row">
                      <div className="lp-grid-student" role="cell">
                        <span className={`al-avatar tone-${s.tone}`} aria-hidden>
                          {s.initials.slice(0, 1)}
                        </span>
                        <div>
                          <strong>{s.name}</strong>
                          <em>{s.room}</em>
                        </div>
                      </div>
                      {weekDays.map((d) => {
                        const key = toKey(d);
                        const cellItems = itemsForStudentDay(s.id, key).filter((it) => {
                          const q = lessonSearch.trim().toLowerCase();
                          if (!q) return true;
                          return it.lessonTitle.toLowerCase().includes(q);
                        });
                        return (
                          <div
                            key={key}
                            className={`lp-grid-cell${key === dayKey ? ' is-today' : ''}`}
                            role="cell"
                          >
                            {cellItems.length === 0 ? (
                              <button
                                type="button"
                                className="lp-cell-add"
                                onClick={() => openAssign(d, s.id)}
                                aria-label={`Add lesson for ${s.name}`}
                              >
                                +
                              </button>
                            ) : (
                              <ul className="lp-cell-lessons">
                                {cellItems.map((it) => (
                                  <li key={it.id}>{it.lessonTitle}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )
              ) : lessonRows.length === 0 ? (
                <div className="lp-grid-empty">
                  <p>No lessons planned this week.</p>
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => openAssign(weekStart)}
                  >
                    <Plus size={16} aria-hidden />
                    Assign Lesson
                  </button>
                </div>
              ) : (
                lessonRows.map((row) => (
                  <div key={row.id} className="lp-grid-row" role="row">
                    <div className="lp-grid-student" role="cell">
                      <div>
                        <strong>{row.title}</strong>
                      </div>
                    </div>
                    {weekDays.map((d) => {
                      const key = toKey(d);
                      const names = row.byDay[key] ?? [];
                      return (
                        <div
                          key={key}
                          className={`lp-grid-cell${key === dayKey ? ' is-today' : ''}`}
                          role="cell"
                        >
                          {names.length === 0 ? (
                            <span className="lp-cell-dash">—</span>
                          ) : (
                            <ul className="lp-cell-lessons">
                              {names.map((n, i) => (
                                <li key={`${n}-${i}`}>{n}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      <AssignLessonsDrawer
        open={assignOpen}
        date={assignDay ?? cursor}
        defaultRoomId={room}
        presetStudentId={presetStudentId}
        onClose={() => {
          setAssignOpen(false);
          setAssignDay(null);
          setPresetStudentId(null);
        }}
        onAssign={handleAssign}
      />

      <AddRecordModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onSubmit={handleRecord}
      />
    </div>
  );
}

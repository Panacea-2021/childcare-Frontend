'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Columns3, List, Sparkles, TrendingUp, Users } from 'lucide-react';
import {
  flattenLessons,
  LESSON_SETS,
  PROGRESS_CATEGORIES,
  PROGRESS_ROOMS,
  PROGRESS_STUDENTS,
  STATUS_META,
} from '@/lib/mock/mockProgressTracking';
import type { ProgressStatus } from '@/types/progressTracking';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

type SortKey = 'name' | 'planned' | 'introduced' | 'practiced' | 'mastered' | 'none';
type ViewMode = 'columns' | 'list';

type StudentStats = {
  id: string;
  name: string;
  initials: string;
  tone: string;
  room: string;
  planned: number;
  introduced: number;
  practiced: number;
  mastered: number;
  none: number;
};

const AREAS = [
  { id: 'all', name: 'All Areas' },
  ...PROGRESS_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
];

const GROUPS = [
  { id: 'all', name: 'All Groups' },
  { id: 'group-a', name: 'Group A' },
  { id: 'group-b', name: 'Group B' },
];

const STATUSES: Array<{ id: string; name: string }> = [
  { id: 'all', name: 'All Statuses' },
  { id: 'planned', name: 'Planned' },
  { id: 'introduced', name: 'Introduced' },
  { id: 'practiced', name: 'Practiced' },
  { id: 'mastered', name: 'Mastered' },
  { id: 'none', name: 'Not started' },
];

function buildStats(): StudentStats[] {
  const lessons = flattenLessons();
  return PROGRESS_STUDENTS.map((s) => {
    const counts = { planned: 0, introduced: 0, practiced: 0, mastered: 0, none: 0 };
    for (const lesson of lessons) {
      const st = (lesson.statuses[s.id] ?? 'none') as ProgressStatus;
      if (st in counts) counts[st as keyof typeof counts] += 1;
    }
    return {
      id: s.id,
      name: s.name,
      initials: s.initials,
      tone: s.tone,
      room: s.room,
      planned: counts.planned,
      introduced: counts.introduced,
      practiced: counts.practiced,
      mastered: counts.mastered,
      none: counts.none,
    };
  });
}

export function StudentProgressPage() {
  const [view, setView] = useState<ViewMode>('columns');
  const [room, setRoom] = useState('demo-room');
  const [studentId, setStudentId] = useState('all');
  const [lessonSet, setLessonSet] = useState('all');
  const [area, setArea] = useState('all');
  const [group, setGroup] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const allStats = useMemo(() => buildStats(), []);
  const gridLessonCount = useMemo(() => flattenLessons().length, []);

  const students = useMemo(() => {
    let list = allStats.filter((s) => {
      if (studentId !== 'all' && s.id !== studentId) return false;
      if (room !== 'all') {
        const r = PROGRESS_ROOMS.find((x) => x.id === room);
        if (r && s.room !== r.name) return false;
      }
      return true;
    });

    // Soft filters for demo (area/group/lessonSet/status don't hide all rows)
    void lessonSet;
    void area;
    void group;

    if (status !== 'all') {
      list = list.filter((s) => {
        if (status === 'none') return s.none > 0;
        return s[status as keyof StudentStats] as number > 0;
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
    });
    return list;
  }, [allStats, studentId, room, lessonSet, area, group, status, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const pct = (n: number) => {
    if (!gridLessonCount) return '0%';
    return `${Math.min(100, Math.round((n / gridLessonCount) * 100))}%`;
  };

  const overview = useMemo(() => {
    const totals = students.reduce(
      (acc, s) => {
        acc.planned += s.planned;
        acc.introduced += s.introduced;
        acc.practiced += s.practiced;
        acc.mastered += s.mastered;
        return acc;
      },
      { planned: 0, introduced: 0, practiced: 0, mastered: 0 },
    );
    return [
      { id: 'students', label: 'Students', value: students.length, tone: 'indigo', icon: Users },
      { id: 'planned', label: 'Planned', value: totals.planned, tone: 'lavender', icon: List },
      { id: 'introduced', label: 'Introduced', value: totals.introduced, tone: 'sky', icon: Sparkles },
      { id: 'practiced', label: 'Practiced', value: totals.practiced, tone: 'amber', icon: Columns3 },
      { id: 'mastered', label: 'Mastered', value: totals.mastered, tone: 'mint', icon: TrendingUp },
    ];
  }, [students]);

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Student Progress"
        description="View per-child lesson progress by room and status."
        icon={<TrendingUp size={22} strokeWidth={2.1} />}
        actions={
          <div className="sp-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`sp-view-btn${view === 'columns' ? ' is-active' : ''}`}
              onClick={() => setView('columns')}
            >
              <Columns3 size={15} aria-hidden />
              Columns
            </button>
            <button
              type="button"
              className={`sp-view-btn${view === 'list' ? ' is-active' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={15} aria-hidden />
              List
            </button>
          </div>
        }
      />

      <div className="sp-filters">
          <OdFilterDropdown
            className="sp-dd"
            value={room}
            onChange={setRoom}
            options={PROGRESS_ROOMS.map((r) => ({
              value: r.id,
              label: r.name === 'All Classrooms' ? 'All Rooms' : r.name,
            }))}
            ariaLabel="Filter room"
          />

          <OdFilterDropdown
            className="sp-dd"
            value={studentId}
            onChange={setStudentId}
            options={[
              { value: 'all', label: 'All students' },
              ...PROGRESS_STUDENTS.map((s) => ({ value: s.id, label: s.name })),
            ]}
            ariaLabel="Filter students"
          />

          <OdFilterDropdown
            className="sp-dd"
            value={lessonSet}
            onChange={setLessonSet}
            options={LESSON_SETS.map((s) => ({ value: s.id, label: s.name }))}
            ariaLabel="Filter lesson sets"
          />

          <OdFilterDropdown
            className="sp-dd"
            value={area}
            onChange={setArea}
            options={AREAS.map((a) => ({ value: a.id, label: a.name }))}
            ariaLabel="Filter areas"
          />

          <OdFilterDropdown
            className="sp-dd"
            value={group}
            onChange={setGroup}
            options={GROUPS.map((g) => ({ value: g.id, label: g.name }))}
            ariaLabel="Filter groups"
          />

          <OdFilterDropdown
            className="sp-dd"
            value={status}
            onChange={setStatus}
            options={STATUSES.map((s) => ({ value: s.id, label: s.name }))}
            ariaLabel="Filter statuses"
          />
      </div>

      <section className="sp-stats" aria-label="Student progress overview">
        {overview.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.id} className={`sp-stat-card tone-${card.tone}`}>
              <span className={`sp-stat-icon tone-${card.tone}`} aria-hidden>
                <Icon size={18} />
              </span>
              <div>
                <p className="sp-stat-label">{card.label}</p>
                <p className="sp-stat-value">{card.value.toLocaleString()}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="pt-shell sp-shell">
        <div className="sp-meta-row">
          <div className="sp-legend" aria-label="Progress legend">
            {(
              ['planned', 'introduced', 'practiced', 'mastered'] as const
            ).map((key) => (
              <span key={key} className="sp-legend-item">
                <span className={`sp-dot ${STATUS_META[key].className}`}>
                  {STATUS_META[key].code}
                </span>
                {STATUS_META[key].label}
              </span>
            ))}
          </div>
          <span className="sp-count">
            {students.length} students · {gridLessonCount.toLocaleString()} lessons
          </span>
        </div>

        {view === 'columns' ? (
          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('name')}>
                      Student
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('planned')}>
                      <span className={`sp-dot is-planned`}>P</span>
                      Planned
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('introduced')}>
                      <span className={`sp-dot is-introduced`}>I</span>
                      Introduced
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('practiced')}>
                      <span className={`sp-dot is-practiced`}>P</span>
                      Practiced
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('mastered')}>
                      <span className={`sp-dot is-mastered`}>M</span>
                      Mastered
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sp-sort" onClick={() => toggleSort('none')}>
                      Not started
                      <ArrowUpDown size={13} aria-hidden />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="sp-student">
                        <span className={`pt-avatar ${s.tone}`}>{s.initials}</span>
                        <strong>{s.name}</strong>
                      </span>
                    </td>
                    <td>{s.planned}</td>
                    <td>{s.introduced}</td>
                    <td>{s.practiced}</td>
                    <td>{s.mastered}</td>
                    <td>
                      <span className="sp-not-started">
                        {s.none.toLocaleString()}
                        <em>{pct(s.none)}</em>
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="sp-empty">
                      No students match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="sp-list">
            {students.map((s) => (
              <li key={s.id} className="sp-list-card">
                <span className="sp-student">
                  <span className={`pt-avatar ${s.tone}`}>{s.initials}</span>
                  <strong>{s.name}</strong>
                </span>
                <div className="sp-list-stats">
                  <span>
                    <i className="sp-dot is-planned">P</i> {s.planned}
                  </span>
                  <span>
                    <i className="sp-dot is-introduced">I</i> {s.introduced}
                  </span>
                  <span>
                    <i className="sp-dot is-practiced">P</i> {s.practiced}
                  </span>
                  <span>
                    <i className="sp-dot is-mastered">M</i> {s.mastered}
                  </span>
                  <span className="sp-not-started">
                    Not started {s.none.toLocaleString()} <em>{pct(s.none)}</em>
                  </span>
                </div>
              </li>
            ))}
            {students.length === 0 ? (
              <li className="sp-empty">No students match the current filters.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}

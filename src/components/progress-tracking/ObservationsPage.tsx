'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  EyeOff,
  Filter,
  LayoutList,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { resolveLessonTitle } from '@/lib/mock/lessonResolve';
import {
  draftToObservation,
  loadObservations,
  saveObservations,
  type ObservationRecord,
} from '@/lib/mock/mockObservations';
import {
  PROGRESS_ROOMS,
  PROGRESS_STUDENTS,
  STATUS_META,
} from '@/lib/mock/mockProgressTracking';
import type { ProgressRecordDraft } from '@/types/progressTracking';
import { AddRecordModal } from './AddRecordModal';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

const RECORD_TYPE_OPTIONS = [
  { value: 'all', label: 'All Record Types' },
  { value: 'observation', label: 'Observations' },
];

const DATE_PRESET_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All dates' },
];

const SORT_OPTIONS = [
  { value: 'created', label: 'Created date' },
  { value: 'date', label: 'Record date' },
];

const STAGE_OPTIONS = [
  { value: 'all', label: 'All Progress' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'practiced', label: 'Practiced' },
  { value: 'mastered', label: 'Mastered' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'All visibility' },
  { value: 'parents', label: 'Visible to parents' },
  { value: 'staff', label: 'Staff only' },
];

type DatePreset = 'today' | 'week' | 'month' | 'all';
type SortKey = 'created' | 'date';
type StageFilter = 'all' | 'introduced' | 'practiced' | 'mastered';
type VisibilityFilter = 'all' | 'parents' | 'staff';

function formatDisplayDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isInPreset(dateStr: string, preset: DatePreset) {
  if (preset === 'all') return true;
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date(2026, 7, 3);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === 'today') {
    return d.toDateString() === start.toDateString();
  }
  if (preset === 'week') {
    const from = new Date(start);
    from.setDate(from.getDate() - 7);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return d >= from && d <= end;
  }
  if (preset === 'month') {
    return d.getMonth() === start.getMonth() && d.getFullYear() === start.getFullYear();
  }
  return true;
}

export function ObservationsPage() {
  const [records, setRecords] = useState<ObservationRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [classroom, setClassroom] = useState('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');

  useEffect(() => {
    setRecords(loadObservations());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveObservations(records);
  }, [records, ready]);

  const moreFilterCount =
    (stageFilter !== 'all' ? 1 : 0) + (visibility !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const roomName =
      PROGRESS_ROOMS.find((r) => r.id === classroom)?.name ?? '';

    let list = records.filter((r) => {
      if (recordType !== 'all' && r.recordType !== recordType) return false;
      if (classroom !== 'all' && r.classroom !== roomName) return false;
      if (!isInPreset(r.date, datePreset)) return false;
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (visibility === 'parents' && r.hiddenFromParents) return false;
      if (visibility === 'staff' && !r.hiddenFromParents) return false;

      if (q) {
        const students = r.studentIds
          .map((id) => PROGRESS_STUDENTS.find((s) => s.id === id)?.name ?? '')
          .join(' ')
          .toLowerCase();
        const lessons = r.lessonIds
          .map((id) => resolveLessonTitle(id))
          .filter((t) => t && t !== 'Lesson')
          .join(' ')
          .toLowerCase();
        const hay = `${r.note} ${students} ${lessons}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'date') return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [
    records,
    search,
    recordType,
    classroom,
    datePreset,
    sortKey,
    stageFilter,
    visibility,
  ]);

  const stats = useMemo(() => {
    const total = records.length;
    const introduced = records.filter((r) => r.stage === 'introduced').length;
    const practiced = records.filter((r) => r.stage === 'practiced').length;
    const hidden = records.filter((r) => r.hiddenFromParents).length;
    return { total, introduced, practiced, hidden };
  }, [records]);

  const handleSubmit = (draft: ProgressRecordDraft) => {
    const row = draftToObservation(draft);
    if (!row) return;
    const student = PROGRESS_STUDENTS.find((s) => draft.studentIds.includes(s.id));
    if (student) row.classroom = student.room;
    setRecords((prev) => [row, ...prev]);
    setAddOpen(false);
    setDatePreset('all');
  };

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Observations"
        description={`${filtered.length} record${filtered.length === 1 ? '' : 's'} found — capture and review student observations.`}
        icon={<ClipboardList size={22} strokeWidth={2.1} />}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} aria-hidden />
            Add Record
          </button>
        }
      />

      <section className="od-stats" aria-label="Observation statistics">
        <article className="od-stat-card tone-indigo">
          <div className="od-stat-top">
            <span className="od-stat-label">Total</span>
            <span className="od-stat-icon tone-indigo">
              <ClipboardList size={18} aria-hidden />
            </span>
          </div>
          <strong className="od-stat-value">{stats.total}</strong>
        </article>
        <article className="od-stat-card tone-sky">
          <div className="od-stat-top">
            <span className="od-stat-label">Introduced</span>
            <span className="od-stat-icon tone-sky">
              <Sparkles size={18} aria-hidden />
            </span>
          </div>
          <strong className="od-stat-value">{stats.introduced}</strong>
        </article>
        <article className="od-stat-card tone-amber">
          <div className="od-stat-top">
            <span className="od-stat-label">Practiced</span>
            <span className="od-stat-icon tone-amber">
              <LayoutList size={18} aria-hidden />
            </span>
          </div>
          <strong className="od-stat-value">{stats.practiced}</strong>
        </article>
        <article className="od-stat-card tone-blush">
          <div className="od-stat-top">
            <span className="od-stat-label">Staff only</span>
            <span className="od-stat-icon tone-blush">
              <EyeOff size={18} aria-hidden />
            </span>
          </div>
          <strong className="od-stat-value">{stats.hidden}</strong>
        </article>
      </section>

      <div className="od-toolbar">
          <div className="od-search">
            <Search size={15} aria-hidden />
            <input
              className="ui-input"
              type="search"
              placeholder="Search by title or student name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search records"
            />
          </div>

          <OdFilterDropdown
            className="od-select-type"
            value={recordType}
            onChange={setRecordType}
            options={RECORD_TYPE_OPTIONS}
            ariaLabel="Record type"
          />

          <OdFilterDropdown
            className="od-select-room"
            value={classroom}
            onChange={setClassroom}
            options={PROGRESS_ROOMS.map((r) => ({
              value: r.id,
              label: r.id === 'all' ? 'Filter by classroom...' : r.name,
            }))}
            ariaLabel="Classroom"
          />

          <OdFilterDropdown
            className="od-select-date"
            value={datePreset}
            onChange={(v) => setDatePreset(v as DatePreset)}
            options={DATE_PRESET_OPTIONS}
            ariaLabel="Date range"
          />

          <OdFilterDropdown
            className="od-select-sort"
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={SORT_OPTIONS}
            ariaLabel="Sort"
          />

          <button type="button" className="od-view-btn" aria-label="List view" aria-pressed>
            <LayoutList size={16} />
          </button>

          <button
            type="button"
            className={`lp-filters-btn od-filters-btn${filtersOpen ? ' is-open' : ''}`}
            aria-expanded={filtersOpen}
            aria-controls="od-more-filters"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Filter size={15} aria-hidden />
            Filters
            {moreFilterCount > 0 ? <i>{moreFilterCount}</i> : null}
          </button>
      </div>

      {filtersOpen ? (
        <div className="od-filters-more od-filters-more-panel" id="od-more-filters">
          <OdFilterDropdown
            className="od-select-more"
            value={stageFilter}
            onChange={(v) => setStageFilter(v as StageFilter)}
            options={STAGE_OPTIONS}
            ariaLabel="Progress stage"
          />
          <OdFilterDropdown
            className="od-select-more"
            value={visibility}
            onChange={(v) => setVisibility(v as VisibilityFilter)}
            options={VISIBILITY_OPTIONS}
            ariaLabel="Visibility"
          />
          {moreFilterCount > 0 ? (
            <button
              type="button"
              className="al-link"
              onClick={() => {
                setStageFilter('all');
                setVisibility('all');
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      <section className="od-panel">
          {filtered.length === 0 ? (
            <div className="od-empty">
              <div className="od-empty-icon" aria-hidden>
                <Search size={22} />
              </div>
              <h2>No records found</h2>
              <p>Try adjusting your filters or date range</p>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={16} aria-hidden />
                Add Record
              </button>
              <span className="od-empty-foot">No more observations</span>
            </div>
          ) : (
            <ul className="od-list">
              {filtered.map((r) => {
                const stage = STATUS_META[r.stage];
                const students = r.studentIds
                  .map((id) => PROGRESS_STUDENTS.find((s) => s.id === id)?.shortName)
                  .filter(Boolean);
                const lessons = r.lessonIds
                  .map((id) => resolveLessonTitle(id))
                  .filter((t) => t && t !== 'Lesson');
                return (
                  <li key={r.id} className={`od-card is-${r.stage}`}>
                    <div className="od-card-head">
                      <span className={`pb-stage-badge is-${r.stage}`} aria-hidden>
                        {stage.code}
                      </span>
                      <div>
                        <strong className={`od-stage is-${r.stage}`}>{stage.label}</strong>
                        <span>
                          {formatDisplayDate(r.date)}
                          {r.hiddenFromParents ? ' · Hidden from parents' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline od-remove"
                        onClick={() =>
                          setRecords((prev) => prev.filter((x) => x.id !== r.id))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    {lessons[0] ? <p className="od-lesson">{lessons[0]}</p> : null}
                    <div className="od-tags">
                      {students.map((s) => (
                        <span key={s} className="pb-student-tag">
                          @{s}
                        </span>
                      ))}
                      {lessons.slice(1).map((l) => (
                        <span key={l} className="od-lesson-tag">
                          #{l}
                        </span>
                      ))}
                    </div>
                    {r.note ? <p className="od-note">{r.note}</p> : null}
                  </li>
                );
              })}
              <li className="od-list-end">No more observations</li>
            </ul>
          )}
      </section>

      <AddRecordModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

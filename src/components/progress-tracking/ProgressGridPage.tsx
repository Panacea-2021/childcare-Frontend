'use client';

import { Fragment, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Filter, LayoutGrid, Plus, Search } from 'lucide-react';
import { LESSON_CATALOG } from '@/lib/mock/lessonCatalog';
import {
  ageBandMatchesSet,
  ageLabelForLessonSet,
  hasAnyClassroomMapped,
  loadLessonSetMappings,
  MAPPABLE_CLASSROOMS,
  roomIdsForLessonSet,
  lessonSetFilterOptions,
} from '@/lib/mock/mockLessonSetMapping';
import type { LessonSetMapping } from '@/types/lessonSetMapping';
import { loadActiveCenterGroups } from '@/lib/center-management/programCatalog';
import {
  flattenLessons,
  PROGRESS_CATEGORIES,
  PROGRESS_ROOMS,
  PROGRESS_STUDENTS,
  STATUS_META,
} from '@/lib/mock/mockProgressTracking';
import type { ProgressRecordDraft, ProgressStatus } from '@/types/progressTracking';
import { AddRecordModal } from './AddRecordModal';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import { SetStagePopover, type StageMenuAnchor } from './SetStagePopover';
import './progress.css';

const AREA_OPTIONS = [
  { value: 'all', label: 'All Areas' },
  ...PROGRESS_CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
];

const AGE_BAND_OPTIONS = [
  { value: 'all', label: 'All Age Bands' },
  { value: '3-6', label: '3-6' },
  { value: '6-12', label: '6-12' },
];

const PROGRESS_OPTIONS = [
  { value: 'all', label: 'All Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'practiced', label: 'Practiced' },
  { value: 'mastered', label: 'Mastered' },
  { value: 'none', label: 'Not started' },
];

const PLANNED_BY_OPTIONS = [
  { value: 'anyone', label: 'Planned By Anyone' },
  { value: 'me', label: 'Planned By Me' },
  { value: 'others', label: 'Planned By Others' },
];

function roomNameById(id: string) {
  return MAPPABLE_CLASSROOMS.find((r) => r.id === id)?.name ?? id;
}

export function ProgressGridPage() {
  const router = useRouter();
  const studentOptions = useMemo(
    () => [
      { value: 'all', label: 'All Students' },
      ...PROGRESS_STUDENTS.map((s) => ({ value: s.id, label: s.name })),
    ],
    [],
  );
  const roomOptions = useMemo(
    () =>
      PROGRESS_ROOMS.map((r) => ({
        value: r.id,
        label: r.name === 'All Classrooms' ? 'All Classrooms' : r.name,
      })),
    [],
  );
  const groupOptions = useMemo(
    () => [
      { value: 'all', label: 'All Groups' },
      ...loadActiveCenterGroups().map((g) => ({ value: g.id, label: g.name })),
    ],
    [],
  );
  const [mappings, setMappings] = useState<LessonSetMapping[]>([]);
  const [mappingsReady, setMappingsReady] = useState(false);
  const [studentFilter, setStudentFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [lessonSet, setLessonSet] = useState('all');
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [ageBandFilter, setAgeBandFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [plannedByFilter, setPlannedByFilter] = useState('anyone');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ art: true });
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({ 'art-history': true });
  const [statuses, setStatuses] = useState(() => {
    const map: Record<string, ProgressStatus> = {};
    for (const cat of PROGRESS_CATEGORIES) {
      for (const sub of cat.subcategories) {
        for (const lesson of sub.lessons) {
          for (const [studentId, status] of Object.entries(lesson.statuses)) {
            map[`${lesson.id}:${studentId}`] = status;
          }
        }
      }
    }
    return map;
  });
  const [actionsOpen, setActionsOpen] = useState(false);
  const [stageMenu, setStageMenu] = useState<StageMenuAnchor | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [presetStudentId, setPresetStudentId] = useState<string | null>(null);
  const [presetLessonId, setPresetLessonId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMappings(loadLessonSetMappings());
    setMappingsReady(true);
  }, []);

  // Keep in sync when returning from Lesson Set Mapping (same tab focus).
  useEffect(() => {
    const refresh = () => setMappings(loadLessonSetMappings());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const lessonSetOptions = useMemo(
    () => lessonSetFilterOptions(mappings).map((s) => ({ value: s.id, label: s.name })),
    [mappings],
  );

  const showMapBanner = mappingsReady && !hasAnyClassroomMapped(mappings);

  const students = useMemo(() => {
    const allowedRoomIds = roomIdsForLessonSet(lessonSet, mappings);
    const allowedRoomNames = new Set(allowedRoomIds.map(roomNameById));

    return PROGRESS_STUDENTS.filter((s) => {
      if (studentFilter !== 'all' && s.id !== studentFilter) return false;
      if (roomFilter !== 'all') {
        const room = PROGRESS_ROOMS.find((r) => r.id === roomFilter);
        if (room && s.room !== room.name) return false;
      }
      if (lessonSet !== 'all' && allowedRoomNames.size > 0 && !allowedRoomNames.has(s.room)) {
        return false;
      }
      return true;
    });
  }, [studentFilter, roomFilter, lessonSet, mappings]);

  const categories = useMemo(() => {
    const q = search.trim().toLowerCase();
    const setAge = ageLabelForLessonSet(lessonSet, mappings);
    // When a classroom is selected (and no set), restrict lessons to ages mapped to that room.
    const roomMappedAges =
      roomFilter !== 'all' && lessonSet === 'all'
        ? mappings
            .filter((m) => m.classroomIds.includes(roomFilter))
            .map((m) => m.ageLabel)
            .filter(Boolean)
        : [];

    return PROGRESS_CATEGORIES.filter((cat) => areaFilter === 'all' || cat.id === areaFilter)
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories
          .map((sub) => ({
            ...sub,
            lessons: sub.lessons.filter((l) => {
              if (
                q &&
                !l.title.toLowerCase().includes(q) &&
                !sub.name.toLowerCase().includes(q) &&
                !cat.name.toLowerCase().includes(q)
              ) {
                return false;
              }
              if (ageBandFilter !== 'all' && l.ageBand !== ageBandFilter) return false;
              if (setAge && !ageBandMatchesSet(l.ageBand, setAge)) return false;
              if (
                roomMappedAges.length > 0 &&
                !roomMappedAges.some((age) => ageBandMatchesSet(l.ageBand, age))
              ) {
                return false;
              }
              if (progressFilter !== 'all') {
                const visibleIds =
                  studentFilter === 'all'
                    ? PROGRESS_STUDENTS.map((s) => s.id)
                    : [studentFilter];
                const hit = visibleIds.some((id) => {
                  const key = `${l.id}:${id}`;
                  const st = statuses[key] ?? l.statuses[id] ?? 'none';
                  return st === progressFilter;
                });
                if (!hit) return false;
              }
              void groupFilter;
              void plannedByFilter;
              return true;
            }),
          }))
          .filter((sub) => sub.lessons.length > 0),
      }))
      .filter((cat) => cat.subcategories.length > 0);
  }, [
    search,
    areaFilter,
    ageBandFilter,
    progressFilter,
    studentFilter,
    statuses,
    lessonSet,
    mappings,
    roomFilter,
    groupFilter,
    plannedByFilter,
  ]);

  const totalLessons = useMemo(
    () =>
      categories.reduce(
        (sum, c) => sum + c.subcategories.reduce((s, sub) => s + sub.lessons.length, 0),
        0,
      ),
    [categories],
  );

  const moreFilterCount =
    (areaFilter !== 'all' ? 1 : 0) +
    (groupFilter !== 'all' ? 1 : 0) +
    (ageBandFilter !== 'all' ? 1 : 0) +
    (progressFilter !== 'all' ? 1 : 0) +
    (plannedByFilter !== 'anyone' ? 1 : 0);

  const activeFilters =
    (studentFilter !== 'all' ? 1 : 0) +
    (roomFilter !== 'all' ? 1 : 0) +
    (lessonSet !== 'all' ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    moreFilterCount;

  const clearAll = () => {
    setStudentFilter('all');
    setRoomFilter('all');
    setLessonSet('all');
    setSearch('');
    setAreaFilter('all');
    setGroupFilter('all');
    setAgeBandFilter('all');
    setProgressFilter('all');
    setPlannedByFilter('anyone');
  };

  const expandAll = () => {
    const cats: Record<string, boolean> = {};
    const subs: Record<string, boolean> = {};
    for (const cat of categories) {
      cats[cat.id] = true;
      for (const sub of cat.subcategories) subs[sub.id] = true;
    }
    setExpandedCats(cats);
    setExpandedSubs(subs);
  };

  const collapseAll = () => {
    setExpandedCats({});
    setExpandedSubs({});
  };

  const openStageMenu = (
    event: MouseEvent<HTMLButtonElement>,
    lessonId: string,
    studentId: string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setStageMenu({
      lessonId,
      studentId,
      top: rect.bottom + 8,
      left: Math.max(12, rect.left + rect.width / 2 - 96),
    });
  };

  const setStage = (status: ProgressStatus) => {
    if (!stageMenu) return;
    const key = `${stageMenu.lessonId}:${stageMenu.studentId}`;
    setStatuses((prev) => ({ ...prev, [key]: status }));
    setStageMenu(null);
  };

  const openRecord = (studentId?: string, lessonId?: string) => {
    setStageMenu(null);
    setPresetStudentId(studentId ?? null);
    setPresetLessonId(lessonId ?? null);
    setRecordOpen(true);
  };

  const onSubmitRecord = (draft: ProgressRecordDraft) => {
    if (!draft.stage) return;
    const gridLessons = flattenLessons();
    setStatuses((prev) => {
      const next = { ...prev };
      for (const lessonId of draft.lessonIds) {
        const catalog = LESSON_CATALOG.find((l) => l.id === lessonId);
        const mapped = catalog
          ? gridLessons.filter((g) => g.title.toLowerCase() === catalog.title.toLowerCase())
          : gridLessons.filter((g) => g.id === lessonId);
        const ids = mapped.length > 0 ? mapped.map((g) => g.id) : [lessonId];
        for (const id of ids) {
          for (const studentId of draft.studentIds) {
            next[`${id}:${studentId}`] = draft.stage!;
          }
        }
      }
      return next;
    });
    setRecordOpen(false);
    setToast('Progress record saved');
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="pt-page">
      {showMapBanner ? (
        <div className="pt-banner">
          <p>
            Map your classrooms to lesson sets. No classroom is mapped to a lesson set yet. Map each
            classroom so the Progress Grid opens scoped to the right lessons for that room.
          </p>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => router.push('/progress-tracking/lesson-set-mapping')}
          >
            Map classrooms →
          </button>
        </div>
      ) : null}

      <ProgressTrackingPageHeader
        title="Progress Grid"
        description="Track lesson progress across students and classrooms."
        icon={<LayoutGrid size={22} strokeWidth={2.1} />}
        actions={
          <>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => openRecord()}>
              <Plus size={16} aria-hidden />
              Add record
            </button>
            <div className="pt-actions-menu">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                aria-expanded={actionsOpen}
                onClick={() => setActionsOpen((v) => !v)}
              >
                Actions
                <ChevronDown size={15} aria-hidden />
              </button>
              {actionsOpen ? (
                <div className="pt-actions-pop" role="menu">
                  <button type="button" role="menuitem" onClick={() => { expandAll(); setActionsOpen(false); }}>
                    Expand all
                  </button>
                  <button type="button" role="menuitem" onClick={() => { collapseAll(); setActionsOpen(false); }}>
                    Collapse all
                  </button>
                  <button type="button" role="menuitem" onClick={() => { clearAll(); setActionsOpen(false); }}>
                    Reset filters
                  </button>
                </div>
              ) : null}
            </div>
          </>
        }
      />

      <div className="pt-filters-block">
          <div className="pt-filters">
            <OdFilterDropdown
              className="pt-dd-students"
              value={studentFilter}
              onChange={setStudentFilter}
              options={studentOptions}
              ariaLabel="Filter students"
            />

            <div className="pt-search-wrap">
              <Search size={15} aria-hidden />
              <input
                className="ui-input pt-search"
                type="search"
                placeholder="Search Lessons By..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search lessons"
              />
            </div>

            <OdFilterDropdown
              className="pt-dd-rooms"
              value={roomFilter}
              onChange={setRoomFilter}
              options={roomOptions}
              ariaLabel="Filter classroom"
            />

            <OdFilterDropdown
              className="pt-dd-sets"
              value={lessonSet}
              onChange={setLessonSet}
              options={lessonSetOptions}
              ariaLabel="Filter lesson set"
            />

            {activeFilters > 0 ? (
              <button type="button" className="pt-clear" onClick={clearAll}>
                Clear all
              </button>
            ) : null}

            <button
              type="button"
              className={`pt-filter-chip${filtersOpen ? ' is-open' : ''}`}
              aria-expanded={filtersOpen}
              aria-controls="pt-more-filters"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <Filter size={14} aria-hidden />
              Filters
              {activeFilters > 0 ? <i>{activeFilters}</i> : null}
            </button>
          </div>

          {filtersOpen ? (
            <div className="pt-filters pt-filters-more" id="pt-more-filters">
              <OdFilterDropdown
                className="pt-dd-more"
                value={areaFilter}
                onChange={setAreaFilter}
                options={AREA_OPTIONS}
                ariaLabel="Filter areas"
              />
              <OdFilterDropdown
                className="pt-dd-more"
                value={groupFilter}
                onChange={setGroupFilter}
                options={groupOptions}
                ariaLabel="Filter groups"
              />
              <OdFilterDropdown
                className="pt-dd-more"
                value={ageBandFilter}
                onChange={setAgeBandFilter}
                options={AGE_BAND_OPTIONS}
                ariaLabel="Filter age bands"
              />
              <OdFilterDropdown
                className="pt-dd-more"
                value={progressFilter}
                onChange={setProgressFilter}
                options={PROGRESS_OPTIONS}
                ariaLabel="Filter progress"
              />
              <OdFilterDropdown
                className="pt-dd-planned"
                value={plannedByFilter}
                onChange={setPlannedByFilter}
                options={PLANNED_BY_OPTIONS}
                ariaLabel="Planned by"
              />
            </div>
          ) : null}
      </div>

      <div className="pt-shell">
        <div className="pt-meta-row">
          <div className="pt-legend" aria-label="Progress legend">
            {(Object.keys(STATUS_META) as ProgressStatus[]).map((key) => {
              const meta = STATUS_META[key];
              return (
                <span key={key} className="pt-legend-item">
                  <span className={`pt-status ${meta.className}`}>{meta.code}</span>
                  {meta.label}
                </span>
              );
            })}
          </div>
          <div className="pt-meta-right">
            <span>
              {students.length} students · {totalLessons} lessons
            </span>
            <button type="button" className="pt-link" onClick={expandAll}>
              Expand all
            </button>
            <button type="button" className="pt-link" onClick={collapseAll}>
              Collapse all
            </button>
          </div>
        </div>

        <div className="pt-grid-wrap">
          {categories.length === 0 || students.length === 0 ? (
            <div className="pt-empty">No lessons match the current filters.</div>
          ) : (
            <table className="pt-grid">
              <thead>
                <tr>
                  <th>LESSON</th>
                  {students.map((s) => (
                    <th key={s.id}>
                      <span className="pt-student-head">
                        <span className={`pt-avatar ${s.tone}`}>{s.initials}</span>
                        <span>{s.shortName}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const catOpen = Boolean(expandedCats[cat.id]);
                  return (
                    <Fragment key={cat.id}>
                      <tr className="pt-cat-row">
                        <td colSpan={students.length + 1}>
                          <button
                            type="button"
                            className={`pt-cat-btn ${catOpen ? 'is-open' : ''}`}
                            onClick={() => {
                              const nextOpen = !catOpen;
                              setExpandedCats((prev) => ({ ...prev, [cat.id]: nextOpen }));
                              setExpandedSubs((prev) => {
                                const next = { ...prev };
                                for (const sub of cat.subcategories) {
                                  next[sub.id] = nextOpen;
                                }
                                return next;
                              });
                            }}
                            aria-expanded={catOpen}
                          >
                            <ChevronRight size={16} aria-hidden />
                            <span className="pt-cat-name">{cat.name}</span>
                            <span className="pt-cat-count">{cat.displayCount}</span>
                          </button>
                        </td>
                      </tr>

                      {catOpen
                        ? cat.subcategories.map((sub) => {
                            const subOpen = Boolean(expandedSubs[sub.id]);
                            return (
                              <Fragment key={sub.id}>
                                <tr className="pt-sub-row">
                                  <td colSpan={students.length + 1}>
                                    <button
                                      type="button"
                                      className={`pt-sub-btn ${subOpen ? 'is-open' : ''}`}
                                      onClick={() =>
                                        setExpandedSubs((prev) => ({
                                          ...prev,
                                          [sub.id]: !prev[sub.id],
                                        }))
                                      }
                                      aria-expanded={subOpen}
                                    >
                                      <ChevronRight size={14} aria-hidden />
                                      <span>{sub.name}</span>
                                      <span className="pt-sub-count">{sub.lessons.length}</span>
                                    </button>
                                  </td>
                                </tr>
                                {subOpen
                                  ? sub.lessons.map((lesson) => (
                                      <tr key={lesson.id} className="pt-lesson-row">
                                        <td>
                                          <div className="pt-lesson-cell">
                                            <span>{lesson.title}</span>
                                            {lesson.ageBand ? (
                                              <em className="pt-age">{lesson.ageBand}</em>
                                            ) : null}
                                          </div>
                                        </td>
                                        {students.map((s) => {
                                          const key = `${lesson.id}:${s.id}`;
                                          const status = statuses[key] ?? 'none';
                                          const meta = STATUS_META[status];
                                          const menuOpen =
                                            stageMenu?.lessonId === lesson.id &&
                                            stageMenu?.studentId === s.id;
                                          return (
                                            <td key={s.id}>
                                              <button
                                                type="button"
                                                className={`pt-status is-btn ${meta.className}${menuOpen ? ' is-open' : ''}`}
                                                title={`${s.name}: ${meta.label}`}
                                                aria-haspopup="dialog"
                                                aria-expanded={menuOpen}
                                                onClick={(e) => openStageMenu(e, lesson.id, s.id)}
                                              >
                                                {meta.code}
                                              </button>
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))
                                  : null}
                              </Fragment>
                            );
                          })
                        : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {stageMenu ? (
        <SetStagePopover
          anchor={stageMenu}
          current={statuses[`${stageMenu.lessonId}:${stageMenu.studentId}`] ?? 'none'}
          onSelect={setStage}
          onAddRecord={() => openRecord(stageMenu.studentId, stageMenu.lessonId)}
          onClose={() => setStageMenu(null)}
        />
      ) : null}

      <AddRecordModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onSubmit={onSubmitRecord}
        presetStudentId={presetStudentId}
        presetLessonId={presetLessonId}
      />

      {toast ? <div className="pt-toast">{toast}</div> : null}
    </div>
  );
}

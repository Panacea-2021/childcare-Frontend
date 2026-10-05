'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Columns3, Filter, MoreVertical, Plus, Search } from 'lucide-react';
import {
  DEFAULT_BOARD_CARDS,
  loadBoardCards,
  saveBoardCards,
} from '@/lib/mock/mockProgressBoard';
import {
  ageBandMatchesSet,
  ageLabelForLessonSet,
  DEFAULT_LESSON_SET_MAPPINGS,
  loadLessonSetMappings,
  lessonSetFilterOptions,
} from '@/lib/mock/mockLessonSetMapping';
import type { LessonSetMapping } from '@/types/lessonSetMapping';
import {
  PROGRESS_ROOMS,
  PROGRESS_STUDENTS,
  STATUS_META,
} from '@/lib/mock/mockProgressTracking';
import { LESSON_CATALOG } from '@/lib/mock/lessonCatalog';
import type { BoardCard, BoardStage } from '@/types/progressBoard';
import type { ProgressRecordDraft } from '@/types/progressTracking';
import { AddRecordModal } from './AddRecordModal';
import { LessonDetailDrawer } from './LessonDetailDrawer';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

const COLUMNS: BoardStage[] = ['planned', 'introduced', 'practiced', 'mastered'];

const COLUMN_EMPTY: Record<BoardStage, string> = {
  planned: "No lessons in the 'Planned' stage yet.",
  introduced: "No lessons in the 'Introduced' stage yet.",
  practiced: "No lessons in the 'Practiced' stage yet.",
  mastered: "No lessons in the 'Mastered' stage yet.",
};

export function ProgressBoardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<BoardCard[]>(DEFAULT_BOARD_CARDS);
  const [ready, setReady] = useState(false);
  const [mappings, setMappings] = useState<LessonSetMapping[]>(DEFAULT_LESSON_SET_MAPPINGS);
  const [studentFilter, setStudentFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('demo-room');
  const [lessonSet, setLessonSet] = useState('all');
  const [lessonSearch, setLessonSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [ageBandFilter, setAgeBandFilter] = useState('all');
  const [recordOpen, setRecordOpen] = useState(false);
  const [detailCard, setDetailCard] = useState<BoardCard | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<BoardStage | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setCards(loadBoardCards());
    setMappings(loadLessonSetMappings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveBoardCards(cards);
  }, [cards, ready]);

  useEffect(() => {
    if (!menuId) return;
    const close = () => setMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuId]);

  const roomName =
    PROGRESS_ROOMS.find((r) => r.id === roomFilter)?.name ?? 'Demo Room';

  const lessonSetOptions = useMemo(
    () => lessonSetFilterOptions(mappings).map((s) => ({ value: s.id, label: s.name })),
    [mappings],
  );

  const activeFilterCount =
    (studentFilter !== 'all' ? 1 : 0) +
    (roomFilter !== 'demo-room' ? 1 : 0) +
    (lessonSet !== 'all' ? 1 : 0) +
    (lessonSearch.trim() ? 1 : 0) +
    (areaFilter !== 'all' ? 1 : 0) +
    (groupFilter !== 'all' ? 1 : 0) +
    (ageBandFilter !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    const setAge = ageLabelForLessonSet(lessonSet, mappings);
    return cards.filter((c) => {
      const student = PROGRESS_STUDENTS.find((s) => s.id === c.studentId);
      if (studentFilter !== 'all' && c.studentId !== studentFilter) return false;
      if (roomFilter !== 'all' && student?.room !== roomName) return false;
      if (setAge && !ageBandMatchesSet(c.ageBand, setAge)) return false;
      if (areaFilter !== 'all' && c.category.toLowerCase() !== areaFilter.toLowerCase()) {
        return false;
      }
      if (groupFilter !== 'all' && c.group.toLowerCase() !== groupFilter.toLowerCase()) {
        return false;
      }
      if (ageBandFilter !== 'all' && !c.ageBand.includes(ageBandFilter)) {
        return false;
      }
      if (q && !c.lessonTitle.toLowerCase().includes(q) && !c.note.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [
    cards,
    studentFilter,
    roomFilter,
    roomName,
    lessonSet,
    lessonSearch,
    areaFilter,
    groupFilter,
    ageBandFilter,
    mappings,
  ]);

  const byStage = useMemo(() => {
    const map: Record<BoardStage, BoardCard[]> = {
      planned: [],
      introduced: [],
      practiced: [],
      mastered: [],
    };
    for (const c of filtered) map[c.stage].push(c);
    return map;
  }, [filtered]);

  const clearFilters = () => {
    setStudentFilter('all');
    setRoomFilter('demo-room');
    setLessonSet('all');
    setLessonSearch('');
    setAreaFilter('all');
    setGroupFilter('all');
    setAgeBandFilter('all');
  };

  const moveCard = (id: string, stage: BoardStage) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (detailCard?.id === id) setDetailCard(null);
  };

  const handleAddRecord = (draft: ProgressRecordDraft) => {
    if (!draft.stage) return;
    const author = 'Malika Thimisetty';
    const updatedLabel = 'Updated today';
    const next: BoardCard[] = [];
    for (const studentId of draft.studentIds) {
      for (const lessonId of draft.lessonIds) {
        const lesson = LESSON_CATALOG.find((l) => l.id === lessonId);
        next.push({
          id: `bc-${Date.now()}-${studentId}-${lessonId}`,
          studentId,
          lessonId,
          lessonTitle: lesson?.title ?? 'Lesson',
          ageBand: lesson?.ageBand ?? '',
          category: 'Art',
          group: 'General',
          stage: draft.stage,
          note: draft.note,
          author,
          updatedLabel,
          date: draft.date,
          hiddenFromParents: draft.hiddenFromParents,
        });
      }
    }
    setCards((prev) => [...next, ...prev]);
    setRecordOpen(false);
  };

  const detailObservations = useMemo(() => {
    if (!detailCard) return [];
    return cards.filter((c) => c.lessonId === detailCard.lessonId);
  }, [cards, detailCard]);

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Progress Boards"
        description="Drag cards between columns to update student progress."
        icon={<Columns3 size={22} strokeWidth={2.1} />}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setRecordOpen(true)}
          >
            <Plus size={16} aria-hidden />
            Add record
          </button>
        }
      />

      <div className="pb-toolbar">
          <OdFilterDropdown
            className="pb-dd-students"
            value={studentFilter}
            onChange={setStudentFilter}
            options={[
              { value: 'all', label: 'All Students' },
              ...PROGRESS_STUDENTS.map((s) => ({ value: s.id, label: s.name })),
            ]}
            ariaLabel="Students"
          />

          <div className="pb-search">
            <Search size={15} aria-hidden />
            <input
              className="ui-input"
              type="search"
              placeholder="Search Lessons..."
              value={lessonSearch}
              onChange={(e) => setLessonSearch(e.target.value)}
              aria-label="Search lessons"
            />
          </div>

          <OdFilterDropdown
            className="pb-dd-rooms"
            value={roomFilter}
            onChange={setRoomFilter}
            options={PROGRESS_ROOMS.map((r) => ({
              value: r.id,
              label: r.name === 'All Classrooms' ? 'All Rooms' : r.name,
            }))}
            ariaLabel="Room"
          />

          <OdFilterDropdown
            className="pb-dd-sets"
            value={lessonSet}
            onChange={setLessonSet}
            options={lessonSetOptions}
            ariaLabel="Lesson set"
          />

          <button type="button" className="al-link" onClick={clearFilters}>
            Clear all
          </button>

          <button
            type="button"
            className={`lp-filters-btn pb-filters-btn${filtersOpen ? ' is-open' : ''}`}
            aria-expanded={filtersOpen}
            aria-controls="pb-more-filters"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Filter size={15} aria-hidden />
            Filters
            {activeFilterCount > 0 ? (
              <span className="pb-filter-badge">{activeFilterCount}</span>
            ) : null}
          </button>
      </div>

        {filtersOpen ? (
          <div className="pb-filters-more pb-filters-more-panel" id="pb-more-filters">
            <OdFilterDropdown
              className="pb-dd-more"
              value={areaFilter}
              onChange={setAreaFilter}
              options={[
                { value: 'all', label: 'All Areas' },
                { value: 'Art', label: 'Art' },
                { value: 'Biology', label: 'Biology' },
                { value: 'Botany', label: 'Botany' },
                { value: 'Practical Life', label: 'Practical Life' },
              ]}
              ariaLabel="Area"
            />
            <OdFilterDropdown
              className="pb-dd-more"
              value={groupFilter}
              onChange={setGroupFilter}
              options={[
                { value: 'all', label: 'All Groups' },
                { value: 'General', label: 'General' },
                { value: 'Art History', label: 'Art History' },
                { value: 'Art Making', label: 'Art Making' },
              ]}
              ariaLabel="Group"
            />
            <OdFilterDropdown
              className="pb-dd-more"
              value={ageBandFilter}
              onChange={setAgeBandFilter}
              options={[
                { value: 'all', label: 'All Age Bands' },
                { value: '3-6', label: '3-6' },
                { value: '6-12', label: '6-12' },
              ]}
              ariaLabel="Age band"
            />
          </div>
        ) : null}

      <div className="pt-shell pb-shell">
        <div className="pb-board" role="list">
          {COLUMNS.map((stage) => {
            const list = byStage[stage];
            const meta = STATUS_META[stage];
            return (
              <section
                key={stage}
                className={`pb-col${dragOver === stage ? ' is-drop' : ''}`}
                aria-label={meta.label}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(stage);
                }}
                onDragLeave={() => setDragOver((cur) => (cur === stage ? null : cur))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/board-card') || draggingId;
                  if (id) moveCard(id, stage);
                  setDragOver(null);
                  setDraggingId(null);
                }}
              >
                <header className="pb-col-head">
                  <span className={`pt-stage-dot ${meta.className}`} aria-hidden />
                  <h2>{meta.label}</h2>
                  <span className="pb-col-count">{list.length}</span>
                  <button
                    type="button"
                    className="pb-col-add"
                    aria-label={`Add to ${meta.label}`}
                    onClick={() => setRecordOpen(true)}
                  >
                    <Plus size={16} />
                  </button>
                </header>

                <div className="pb-col-body">
                  {list.length === 0 ? (
                    <p className="pb-col-empty">
                      No students yet. {COLUMN_EMPTY[stage]}
                    </p>
                  ) : (
                    list.map((card) => {
                      const student = PROGRESS_STUDENTS.find((s) => s.id === card.studentId);
                      return (
                        <article
                          key={card.id}
                          className={`pb-card${draggingId === card.id ? ' is-dragging' : ''}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/board-card', card.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingId(card.id);
                            setMenuId(null);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDragOver(null);
                          }}
                        >
                          <div className="pb-card-top">
                            <div className="pb-card-student">
                              <span
                                className={`al-avatar tone-${student?.tone ?? 'sky'}`}
                                aria-hidden
                              >
                                {(student?.initials ?? '?').slice(0, 1)}
                              </span>
                              <strong>{student?.name ?? 'Student'}</strong>
                            </div>
                            <div className="pb-card-menu-wrap">
                              <button
                                type="button"
                                className="pb-icon-btn"
                                aria-label="Card menu"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuId((id) => (id === card.id ? null : card.id));
                                }}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {menuId === card.id ? (
                                <div className="pb-card-menu" role="menu">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setDetailCard(card);
                                      setMenuId(null);
                                    }}
                                  >
                                    Open lesson
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setMenuId(null);
                                      router.push(
                                        `/progress-tracking/progress-boards/edit/${encodeURIComponent(card.lessonId)}`,
                                      );
                                    }}
                                  >
                                    Edit lesson
                                  </button>
                                  {COLUMNS.filter((s) => s !== card.stage).map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        moveCard(card.id, s);
                                        setMenuId(null);
                                      }}
                                    >
                                      Move to {STATUS_META[s].label}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="is-danger"
                                    onClick={() => {
                                      removeCard(card.id);
                                      setMenuId(null);
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="pb-card-lesson"
                            onClick={() => setDetailCard(card)}
                          >
                            {card.lessonTitle}
                          </button>
                          {card.ageBand ? (
                            <span className="pb-card-tag">{card.ageBand}</span>
                          ) : null}
                          {card.note ? <p className="pb-card-note">{card.note}</p> : null}
                          <p className="pb-card-author">by {card.author}</p>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <AddRecordModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onSubmit={handleAddRecord}
      />

      <LessonDetailDrawer
        open={Boolean(detailCard)}
        card={detailCard}
        observations={detailObservations}
        onClose={() => setDetailCard(null)}
        onEditObservation={() => {
          setDetailCard(null);
          setRecordOpen(true);
        }}
        onEditLesson={(card) => {
          setDetailCard(null);
          router.push(
            `/progress-tracking/progress-boards/edit/${encodeURIComponent(card.lessonId)}`,
          );
        }}
        onDeleteLesson={(card) => {
          setCards((prev) => prev.filter((c) => c.lessonId !== card.lessonId));
          setDetailCard(null);
        }}
      />
    </div>
  );
}

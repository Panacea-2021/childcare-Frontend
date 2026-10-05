'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Import,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { LearningAssessmentPageHeader } from '../LearningAssessmentPageHeader';
import { loadRooms } from '@/lib/center-management/roomsStore';
import { AGE_BANDS, LESSON_SETS } from './constants';
import {
  formatLessonDate,
  loadDevelopmentAreas,
  loadLessons,
  saveLessons,
} from './store';
import type { Lesson, LessonFormState, LessonSort, LessonStatus } from './types';
import '@/components/ui/module.css';
import '@/components/modules/calendar/calendar.css';
import '@/components/modules/calendar/school/school-calendar.css';
import './lessons.css';

const LessonFormModal = dynamic(
  () => import('./LessonFormModal').then((m) => m.LessonFormModal),
  { ssr: false },
);
const LessonAiModal = dynamic(
  () => import('./LessonAiModal').then((m) => m.LessonAiModal),
  { ssr: false },
);
const LessonViewModal = dynamic(
  () => import('./LessonViewModal').then((m) => m.LessonViewModal),
  { ssr: false },
);
const LessonDeleteDialog = dynamic(
  () => import('./LessonDeleteDialog').then((m) => m.LessonDeleteDialog),
  { ssr: false },
);
const LessonImportModal = dynamic(
  () => import('./LessonImportModal').then((m) => m.LessonImportModal),
  { ssr: false },
);

type Toast = { type: 'ok' | 'err'; message: string };

const PAGE_SIZES = [10, 25, 50, 100] as const;

function statusClass(status: LessonStatus) {
  return `les-status les-status-${status.toLowerCase()}`;
}

function resolveDuration(form: LessonFormState) {
  if (form.duration === 'Custom') return form.customDuration.trim() || 'Custom';
  return form.duration;
}

export function LessonsPage() {
  const [ready, setReady] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState<LessonSort>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [toast, setToast] = useState<Toast | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiApply, setAiApply] = useState<((html: string) => void) | null>(null);
  const [aiPrefill, setAiPrefill] = useState<Partial<LessonFormState> | null>(null);
  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const rooms = useMemo(() => (ready ? loadRooms() : []), [ready]);
  const areas = useMemo(() => (ready ? loadDevelopmentAreas() : []), [ready, lessons]);

  useEffect(() => {
    setLessons(loadLessons());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const persist = useCallback((next: Lesson[]) => {
    setLessons(next);
    saveLessons(next);
  }, []);

  const showToast = (message: string, type: Toast['type'] = 'ok') => setToast({ message, type });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = lessons.filter((l) => {
      if (roomFilter && l.roomId !== roomFilter) return false;
      if (setFilter && l.lessonSet !== setFilter) return false;
      if (areaFilter && !l.developmentAreas.includes(areaFilter)) return false;
      if (ageFilter && l.ageBand !== ageFilter) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${l.title} ${l.developmentAreas.join(' ')} ${l.roomName} ${l.lessonSet}`.toLowerCase();
      return hay.includes(q);
    });

    rows = [...rows].sort((a, b) => {
      if (sort === 'alpha') return a.title.localeCompare(b.title);
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'updated') return b.updatedAt.localeCompare(a.updatedAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [lessons, search, roomFilter, setFilter, areaFilter, ageFilter, statusFilter, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, roomFilter, setFilter, areaFilter, ageFilter, statusFilter, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);
  const allPageSelected = paged.length > 0 && paged.every((l) => selectedIds.includes(l.id));
  const somePageSelected = paged.some((l) => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const pageIds = new Set(paged.map((l) => l.id));
      setSelectedIds((ids) => ids.filter((id) => !pageIds.has(id)));
      return;
    }
    setSelectedIds((ids) => Array.from(new Set([...ids, ...paged.map((l) => l.id)])));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    setActiveRowId(id);
  };

  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setFormMode('edit');
    setEditing(lesson);
    setFormOpen(true);
    setViewLesson(null);
  };

  const handleSave = async (form: LessonFormState) => {
    const room = rooms.find((r) => r.id === form.roomId);
    const now = new Date().toISOString();
    const duration = resolveDuration(form);

    if (formMode === 'edit' && editing) {
      const next = lessons.map((l) =>
        l.id === editing.id
          ? {
              ...l,
              title: form.title.trim(),
              lessonSet: form.lessonSet,
              roomId: form.roomId,
              roomName: room?.name ?? l.roomName,
              ageBand: form.ageBand,
              developmentAreas: form.developmentAreas,
              labels: form.labels,
              duration,
              customDuration: form.duration === 'Custom' ? form.customDuration.trim() : '',
              descriptionHtml: form.descriptionHtml,
              youtubeUrl: form.youtubeUrl.trim(),
              attachments: form.attachments,
              status: form.status,
              updatedAt: now,
            }
          : l,
      );
      persist(next);
      showToast('Lesson updated successfully');
      return;
    }

    const created: Lesson = {
      id: `les-${Date.now()}`,
      title: form.title.trim(),
      lessonSet: form.lessonSet,
      roomId: form.roomId,
      roomName: room?.name ?? 'Room',
      ageBand: form.ageBand,
      developmentAreas: form.developmentAreas,
      labels: form.labels,
      duration,
      customDuration: form.duration === 'Custom' ? form.customDuration.trim() : '',
      descriptionHtml: form.descriptionHtml,
      youtubeUrl: form.youtubeUrl.trim(),
      attachments: form.attachments,
      status: form.status,
      createdBy: 'Center Administrator',
      createdAt: now,
      updatedAt: now,
    };
    persist([created, ...lessons]);
    showToast('Lesson saved successfully');
  };

  const duplicate = (lesson: Lesson) => {
    const now = new Date().toISOString();
    const copy: Lesson = {
      ...lesson,
      id: `les-${Date.now()}`,
      title: `${lesson.title} (Copy)`,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      attachments: lesson.attachments.map((a) => ({ ...a, id: `${a.id}-copy-${Date.now()}` })),
      labels: [...lesson.labels],
      developmentAreas: [...lesson.developmentAreas],
    };
    persist([copy, ...lessons]);
    showToast('Lesson duplicated');
  };

  const archive = (lesson: Lesson) => {
    persist(
      lessons.map((l) =>
        l.id === lesson.id
          ? { ...l, status: 'Archived', updatedAt: new Date().toISOString() }
          : l,
      ),
    );
    showToast('Lesson archived');
  };

  const confirmDelete = async () => {
    if (!deleteLesson) return;
    persist(lessons.filter((l) => l.id !== deleteLesson.id));
    showToast('Lesson deleted');
  };

  const handleImport = (imported: Lesson[]) => {
    persist([...imported, ...lessons]);
    setImportOpen(false);
    showToast(`${imported.length} lesson${imported.length === 1 ? '' : 's'} imported from catalog`);
  };

  if (!ready) {
    return (
      <div className="mod-page cal-page les-page">
        <div className="cal-ambient" aria-hidden>
          <span className="cal-blob b1" />
          <span className="cal-blob b2" />
          <span className="cal-blob b3" />
          <span className="cal-mesh" />
        </div>
        <div className="cal-page-inner">
          <div className="les-skeleton" aria-busy="true" aria-label="Loading lessons">
            <div className="les-skel-bar" />
            <div className="les-skel-bar short" />
            <div className="les-skel-table" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mod-page cal-page les-page">
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
        <motion.span
          className="les-float-orb o1"
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="les-float-orb o2"
          animate={{ y: [0, 14, 0], x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <motion.span
          className="les-float-orb o3"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="cal-page-inner">
        <LearningAssessmentPageHeader
          title="Lessons"
          description="Manage and organize lesson plans."
          icon={<BookOpen size={22} strokeWidth={2.1} />}
          actions={
            <>
              <button
                type="button"
                className="ui-btn ui-btn-outline les-import-btn"
                onClick={() => setImportOpen(true)}
              >
                <Import size={16} aria-hidden />
                Import from Catalog
              </button>
              <button type="button" className="ui-btn ui-btn-primary les-new-btn" onClick={openCreate}>
                <Plus size={16} aria-hidden />
                New Lesson
              </button>
            </>
          }
        />

        {selectedIds.length > 0 ? (
          <motion.div
            className="les-bulk-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>
              <strong>{selectedIds.length}</strong> selected
            </span>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                const now = new Date().toISOString();
                persist(
                  lessons.map((l) =>
                    selectedIds.includes(l.id) ? { ...l, status: 'Archived', updatedAt: now } : l,
                  ),
                );
                setSelectedIds([]);
                showToast('Selected lessons archived');
              }}
            >
              <Archive size={14} /> Archive
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>
          </motion.div>
        ) : null}

        <motion.div
          className="mod-panel les-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="ui-table-toolbar les-toolbar">
            <div className="ui-search">
              <span aria-hidden>⌕</span>
              <input
                placeholder="Search title, area, room, lesson set…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search lessons"
              />
            </div>

            <PremiumSelect
              placeholder="Classroom"
              value={roomFilter}
              searchable
              onChange={setRoomFilter}
              options={[
                { value: '', label: 'All classrooms' },
                ...rooms.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            <PremiumSelect
              placeholder="Lesson Set"
              value={setFilter}
              searchable
              onChange={setSetFilter}
              options={[
                { value: '', label: 'All lesson sets' },
                ...LESSON_SETS.map((s) => ({ value: s, label: s })),
              ]}
            />
            <PremiumSelect
              placeholder="Development Area"
              value={areaFilter}
              searchable
              onChange={setAreaFilter}
              options={[
                { value: '', label: 'All areas' },
                ...areas.map((a) => ({ value: a, label: a })),
              ]}
            />
            <PremiumSelect
              placeholder="Age Band"
              value={ageFilter}
              searchable
              onChange={setAgeFilter}
              options={[
                { value: '', label: 'All age bands' },
                ...AGE_BANDS.map((a) => ({ value: a, label: a })),
              ]}
            />
            <PremiumSelect
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Published', label: 'Published' },
                { value: 'Archived', label: 'Archived' },
              ]}
            />
            <PremiumSelect
              placeholder="Sort"
              value={sort}
              onChange={(v) => setSort(v as LessonSort)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'alpha', label: 'Alphabetical' },
                { value: 'updated', label: 'Recently Updated' },
              ]}
            />
          </div>

          {!filtered.length ? (
            <EmptyState
              title="No lessons found"
              description="Try adjusting filters or create a new lesson plan."
              action={
                <button type="button" className="ui-btn ui-btn-primary" onClick={openCreate}>
                  + New Lesson
                </button>
              }
            />
          ) : (
            <div className="les-table-card">
              <div className="mod-scroll les-table-wrap">
                <table className="ui-table les-table">
                  <thead>
                    <tr>
                      <th className="les-th-check">
                        <label className="les-check">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = !allPageSelected && somePageSelected;
                            }}
                            onChange={toggleSelectAll}
                            aria-label="Select all lessons on this page"
                          />
                        </label>
                      </th>
                      <th>Lesson Title</th>
                      <th>Lesson Set</th>
                      <th>Room</th>
                      <th>Age Band</th>
                      <th>Development Areas</th>
                      <th>Duration</th>
                      <th>Created By</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((lesson) => {
                      const selected = selectedIds.includes(lesson.id);
                      const active = activeRowId === lesson.id;
                      return (
                        <tr
                          key={lesson.id}
                          className={`les-row ${selected ? 'is-selected' : ''} ${active ? 'is-active' : ''}`}
                          onClick={() => setActiveRowId(lesson.id)}
                        >
                          <td className="les-td-check" onClick={(e) => e.stopPropagation()}>
                            <label className="les-check">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelect(lesson.id)}
                                aria-label={`Select ${lesson.title}`}
                              />
                            </label>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="les-title-link"
                              onClick={() => setViewLesson(lesson)}
                            >
                              {lesson.title}
                            </button>
                          </td>
                          <td>{lesson.lessonSet}</td>
                          <td>{lesson.roomName}</td>
                          <td>{lesson.ageBand}</td>
                          <td>
                            <div className="les-areas-cell">
                              {lesson.developmentAreas.slice(0, 2).map((a) => (
                                <span key={a} className="les-chip compact">
                                  {a}
                                </span>
                              ))}
                              {lesson.developmentAreas.length > 2 ? (
                                <span className="les-chip compact">
                                  +{lesson.developmentAreas.length - 2}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td>{lesson.customDuration || lesson.duration}</td>
                          <td>{lesson.createdBy}</td>
                          <td>{formatLessonDate(lesson.createdAt)}</td>
                          <td>
                            <span className={statusClass(lesson.status)}>{lesson.status}</span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="les-actions" role="group" aria-label={`Actions for ${lesson.title}`}>
                              <button
                                type="button"
                                className="les-icon-btn"
                                aria-label={`View ${lesson.title}`}
                                title="View"
                                onClick={() => setViewLesson(lesson)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                className="les-icon-btn"
                                aria-label={`Edit ${lesson.title}`}
                                title="Edit"
                                onClick={() => openEdit(lesson)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="les-icon-btn"
                                aria-label={`Duplicate ${lesson.title}`}
                                title="Duplicate"
                                onClick={() => duplicate(lesson)}
                              >
                                <Copy size={15} />
                              </button>
                              <button
                                type="button"
                                className="les-icon-btn"
                                aria-label={`Archive ${lesson.title}`}
                                title="Archive"
                                disabled={lesson.status === 'Archived'}
                                onClick={() => archive(lesson)}
                              >
                                <Archive size={15} />
                              </button>
                              <button
                                type="button"
                                className="les-icon-btn is-danger"
                                aria-label={`Delete ${lesson.title}`}
                                title="Delete"
                                onClick={() => setDeleteLesson(lesson)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="les-pagination">
                <div className="les-page-size">
                  <span className="les-page-size-label">Rows</span>
                  <select
                    className="les-page-size-select"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
                    aria-label="Rows per page"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="les-page-meta">
                    {filtered.length === 0
                      ? '0-0 of 0'
                      : `${(pageSafe - 1) * pageSize + 1}-${Math.min(pageSafe * pageSize, filtered.length)} of ${filtered.length}`}
                  </span>
                </div>
                <div className="les-pager" role="navigation" aria-label="Pagination">
                  <button
                    type="button"
                    className="les-page-btn"
                    disabled={pageSafe <= 1}
                    onClick={() => setPage(pageSafe - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2.25} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      return Math.abs(p - pageSafe) <= 1;
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const gap = prev && p - prev > 1;
                      return (
                        <span key={p} className="les-page-chunk">
                          {gap ? <span className="les-page-ellipsis">…</span> : null}
                          <button
                            type="button"
                            className={`les-page-btn${p === pageSafe ? ' is-active' : ''}`}
                            onClick={() => setPage(p)}
                            aria-current={p === pageSafe ? 'page' : undefined}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}
                  <button
                    type="button"
                    className="les-page-btn"
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage(pageSafe + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} strokeWidth={2.25} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <LessonFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onOpenAi={(apply, prefill) => {
          setAiApply(() => apply);
          setAiPrefill(prefill ?? null);
          setAiOpen(true);
        }}
      />

      <LessonAiModal
        open={aiOpen}
        prefill={aiPrefill}
        onClose={() => setAiOpen(false)}
        onGenerate={(html) => {
          aiApply?.(html);
          showToast('AI lesson description generated');
        }}
      />

      <LessonViewModal
        open={Boolean(viewLesson)}
        lesson={viewLesson}
        onClose={() => setViewLesson(null)}
        onEdit={() => viewLesson && openEdit(viewLesson)}
      />

      <LessonDeleteDialog
        open={Boolean(deleteLesson)}
        lesson={deleteLesson}
        onClose={() => setDeleteLesson(null)}
        onConfirm={confirmDelete}
      />

      <LessonImportModal
        open={importOpen}
        existingLessonIds={new Set(lessons.map((l) => l.id))}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`les-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

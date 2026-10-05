'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { LESSON_CATALOG, LESSON_CATEGORIES } from '@/lib/mock/lessonCatalog';
import {
  ageBandMatchesSet,
  ageLabelForLessonSet,
  DEFAULT_LESSON_SET_MAPPINGS,
  loadLessonSetMappings,
  lessonSetFilterOptions,
} from '@/lib/mock/mockLessonSetMapping';
import { PROGRESS_ROOMS, PROGRESS_STUDENTS } from '@/lib/mock/mockProgressTracking';
import type { LessonSetMapping } from '@/types/lessonSetMapping';
import { OdFilterDropdown } from './OdFilterDropdown';

export type AssignLessonsPayload = {
  dateKey: string;
  studentIds: string[];
  lessonIds: string[];
  lessonTitles: string[];
  room: string;
  staffName: string;
};

type Props = {
  open: boolean;
  date: Date;
  defaultRoomId?: string;
  /** Prefill this student when opening from a student cell. */
  presetStudentId?: string | null;
  onClose: () => void;
  onAssign: (payload: AssignLessonsPayload) => void;
};

const STAFF_DEFAULT = 'Malika Thimisetty';
const STAGE_OPTIONS = ['Any Stage', 'Introduced', 'Practiced', 'Mastered'] as const;
const GROUP_OPTIONS = ['All Groups', 'Practical Life', 'Sensorial', 'Language', 'Math', 'Culture'] as const;

function formatLongDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AssignLessonsDrawer({
  open,
  date,
  defaultRoomId = 'demo-room',
  presetStudentId = null,
  onClose,
  onAssign,
}: Props) {
  const [mappings, setMappings] = useState<LessonSetMapping[]>(DEFAULT_LESSON_SET_MAPPINGS);
  const [studentQuery, setStudentQuery] = useState('');
  const [lessonQuery, setLessonQuery] = useState('');
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [lessonSet, setLessonSet] = useState('all');
  const [area, setArea] = useState<string>('All Categories');
  const [group, setGroup] = useState<string>('All Groups');
  const [stage, setStage] = useState<string>('Any Stage');
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [staffName, setStaffName] = useState(STAFF_DEFAULT);

  useEffect(() => {
    if (!open) return;
    setMappings(loadLessonSetMappings());
    setStudentQuery('');
    setLessonQuery('');
    setRoomId(defaultRoomId === 'all' ? 'demo-room' : defaultRoomId);
    setLessonSet('all');
    setArea('All Categories');
    setGroup('All Groups');
    setStage('Any Stage');
    setStudentIds(presetStudentId ? [presetStudentId] : []);
    setLessonIds([]);
    setStaffName(STAFF_DEFAULT);
  }, [open, defaultRoomId, presetStudentId]);

  const roomName =
    PROGRESS_ROOMS.find((r) => r.id === roomId)?.name ?? 'Demo Room';

  const lessonSetOptions = useMemo(
    () => lessonSetFilterOptions(mappings).map((s) => ({ value: s.id, label: s.name })),
    [mappings],
  );

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    return PROGRESS_STUDENTS.filter((s) => {
      if (roomId !== 'all' && s.room !== roomName) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.room.toLowerCase().includes(q);
    });
  }, [studentQuery, roomId, roomName]);

  const filteredLessons = useMemo(() => {
    const q = lessonQuery.trim().toLowerCase();
    const setAge = ageLabelForLessonSet(lessonSet, mappings);
    return LESSON_CATALOG.filter((l) => {
      if (area !== 'All Categories' && l.ageBand !== area) return false;
      if (setAge && !ageBandMatchesSet(l.ageBand, setAge)) return false;
      // Group/stage filters keep Illumine parity; catalog is ageBand-indexed only.
      void group;
      void stage;
      if (!q) return true;
      return l.title.toLowerCase().includes(q) || l.ageBand.toLowerCase().includes(q);
    });
  }, [lessonQuery, area, lessonSet, group, stage, mappings]);

  const allStudentsSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => studentIds.includes(s.id));

  const canAssign = studentIds.length > 0 && lessonIds.length > 0;

  const toggleStudent = (id: string) => {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleLesson = (id: string) => {
    setLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllStudents = () => {
    const ids = filteredStudents.map((s) => s.id);
    if (allStudentsSelected) {
      setStudentIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setStudentIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleAssign = () => {
    if (!canAssign) return;
    const selected = LESSON_CATALOG.filter((l) => lessonIds.includes(l.id));
    onAssign({
      dateKey: toKey(date),
      studentIds: [...studentIds],
      lessonIds: selected.map((l) => l.id),
      lessonTitles: selected.map((l) => l.title),
      room: roomName,
      staffName,
    });
  };

  return (
    <Drawer
      open={open}
      title="Assign Lessons"
      subtitle={formatLongDate(date)}
      wide
      bodyClassName="al-drawer-body"
      onClose={onClose}
      footer={
        <div className="al-footer-wrap">
          <div className="ui-field al-staff-field">
            <label className="ui-label" htmlFor="al-staff">
              Assigned staff
            </label>
            <div className="al-staff-box">
              {staffName ? (
                <span className="al-staff-chip">
                  {staffName}
                  <button
                    type="button"
                    aria-label="Remove staff"
                    onClick={() => setStaffName('')}
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : (
                <input
                  id="al-staff"
                  className="al-staff-input"
                  placeholder="Add staff…"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              )}
              <span className="al-staff-caret" aria-hidden>
                ▾
              </span>
            </div>
          </div>
          <div className="al-footer-row">
            <p className="al-footer-hint">
              {canAssign
                ? `Assign ${lessonIds.length} lesson${lessonIds.length === 1 ? '' : 's'} to ${studentIds.length} student${studentIds.length === 1 ? '' : 's'}`
                : 'Select students and lessons to assign'}
            </p>
            <div className="al-footer-actions">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={!canAssign}
                onClick={handleAssign}
              >
                Assign Lessons
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="al-assign">
        <section className="al-col al-col-students">
          <div className="al-col-head">
            <h3>Students ({filteredStudents.length})</h3>
          </div>
          <div className="al-col-tools">
            <div className="al-search">
              <Search size={15} aria-hidden />
              <input
                className="ui-input"
                type="search"
                placeholder="Search..."
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                aria-label="Search students"
              />
            </div>
            <OdFilterDropdown
              className="al-dd"
              value={roomId}
              onChange={setRoomId}
              options={PROGRESS_ROOMS.filter((r) => r.id !== 'all').map((r) => ({
                value: r.id,
                label: r.name,
              }))}
              ariaLabel="Room"
            />
            <button type="button" className="al-link" onClick={selectAllStudents}>
              {allStudentsSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <ul className="al-list">
            {filteredStudents.map((s) => {
              const checked = studentIds.includes(s.id);
              return (
                <li key={s.id}>
                  <label className={`al-row${checked ? ' is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(s.id)}
                    />
                    <span className={`al-avatar tone-${s.tone}`} aria-hidden>
                      {s.initials.slice(0, 1)}
                    </span>
                    <span className="al-row-text">
                      <strong>{s.name}</strong>
                      <em>· {s.room}</em>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="al-col al-col-lessons">
          <div className="al-col-head">
            <h3>
              Lessons ({lessonIds.length} selected)
            </h3>
            <span className="al-found">{filteredLessons.length} found</span>
          </div>
          <div className="al-col-tools">
            <div className="al-search">
              <Search size={15} aria-hidden />
              <input
                className="ui-input"
                type="search"
                placeholder="Search lessons..."
                value={lessonQuery}
                onChange={(e) => setLessonQuery(e.target.value)}
                aria-label="Search lessons"
                disabled={studentIds.length === 0}
              />
            </div>
            <OdFilterDropdown
              className="al-dd"
              value={lessonSet}
              onChange={setLessonSet}
              options={lessonSetOptions}
              ariaLabel="Lesson set"
            />
            <OdFilterDropdown
              className="al-dd"
              value={area}
              onChange={setArea}
              options={LESSON_CATEGORIES.map((c) => ({
                value: c,
                label: c === 'All Categories' ? 'All Areas' : c,
              }))}
              ariaLabel="Area"
            />
            <OdFilterDropdown
              className="al-dd"
              value={group}
              onChange={setGroup}
              options={GROUP_OPTIONS.map((g) => ({ value: g, label: g }))}
              ariaLabel="Group"
            />
            <OdFilterDropdown
              className="al-dd"
              value={stage}
              onChange={setStage}
              options={STAGE_OPTIONS.map((s) => ({ value: s, label: s }))}
              ariaLabel="Stage"
            />
          </div>

          {studentIds.length === 0 ? (
            <div className="al-empty">
              <p>Select students first</p>
              <span>Choose one or more students from the left panel</span>
            </div>
          ) : (
            <ul className="al-list">
              {filteredLessons.map((l) => {
                const checked = lessonIds.includes(l.id);
                return (
                  <li key={l.id}>
                    <label className={`al-row${checked ? ' is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLesson(l.id)}
                      />
                      <span className="al-row-text">
                        <strong>{l.title}</strong>
                        <em>{l.ageBand}</em>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}

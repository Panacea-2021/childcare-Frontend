'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, ChevronDown, Link2, Plus, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  DEFAULT_LESSON_SET_MAPPINGS,
  loadLessonSetMappings,
  MAPPABLE_CLASSROOMS,
  saveLessonSetMappings,
} from '@/lib/mock/mockLessonSetMapping';
import type { LessonSetMapping } from '@/types/lessonSetMapping';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

type SortDir = 'asc' | 'desc';

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/** Pull age band from names like "Elementary (6-12)" → "6-12". */
function extractAgeLabel(name: string) {
  const m = name.match(/\(([^)]+)\)\s*$/);
  return m?.[1]?.trim() ?? '';
}

function classroomLabel(ids: string[]) {
  if (!ids.length) return 'No classrooms';
  return ids
    .map((id) => MAPPABLE_CLASSROOMS.find((r) => r.id === id)?.name ?? id)
    .join(', ');
}

export function LessonSetMappingPage() {
  const [rows, setRows] = useState<LessonSetMapping[]>(DEFAULT_LESSON_SET_MAPPINGS);
  const [ready, setReady] = useState(false);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRooms, setDraftRooms] = useState<string[]>([]);
  const [roomQuery, setRoomQuery] = useState('');
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const addInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setRows(loadLessonSetMappings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLessonSetMappings(rows);
  }, [rows, ready]);

  useEffect(() => {
    if (!roomMenuOpen || !editingId) return;

    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 240);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      const spaceBelow = window.innerHeight - r.bottom;
      const menuH = 260;
      const top =
        spaceBelow < menuH && r.top > spaceBelow
          ? Math.max(8, r.top - menuH - 6)
          : r.bottom + 6;
      setMenuPos({ top, left, width });
    };

    // Trigger mounts with the editing row — place after paint.
    const raf = window.requestAnimationFrame(place);

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setRoomMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRoomMenuOpen(false);
    };

    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [roomMenuOpen, editingId]);

  useEffect(() => {
    if (!addOpen) return;
    const t = window.setTimeout(() => addInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [addOpen]);

  const sortedRows = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [rows, sortDir]);

  const roomOptions = useMemo(() => {
    const q = roomQuery.trim().toLowerCase();
    return MAPPABLE_CLASSROOMS.filter((r) => !q || r.name.toLowerCase().includes(q));
  }, [roomQuery]);

  const startEdit = (row: LessonSetMapping) => {
    setEditingId(row.id);
    setDraftRooms([...row.classroomIds]);
    setRoomQuery('');
    setRoomMenuOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftRooms([]);
    setRoomQuery('');
    setRoomMenuOpen(false);
    setMenuPos(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setRows((prev) =>
      prev.map((r) => (r.id === editingId ? { ...r, classroomIds: [...draftRooms] } : r)),
    );
    cancelEdit();
  };

  const removeSet = () => {
    if (!editingId) return;
    setRows((prev) => prev.filter((r) => r.id !== editingId));
    cancelEdit();
  };

  const toggleRoom = (id: string) => {
    setDraftRooms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canAdd = newName.trim().length > 0;

  const closeAdd = () => {
    setAddOpen(false);
    setNewName('');
  };

  const addLessonSet = () => {
    const name = newName.trim();
    if (!name) return;
    const id = `ls-${slugify(name) || 'set'}-${Date.now().toString(36)}`;
    setRows((prev) => [
      { id, name, ageLabel: extractAgeLabel(name), classroomIds: [] },
      ...prev,
    ]);
    closeAdd();
  };

  const toggleSort = () => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Lesson Set Mapping"
        description="Map lesson sets to classrooms — drives filters across Progress Tracking."
        icon={<Link2 size={22} strokeWidth={2.1} />}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} aria-hidden />
            Add lesson set
          </button>
        }
      />

      <div className="pt-shell lsm-shell">
        <div className="lsm-list" role="table" aria-label="Lesson set mapping">
          <div className="lsm-list-head" role="row">
            <button
              type="button"
              className="lsm-sort-head"
              onClick={toggleSort}
              aria-label={`Sort by lesson set ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
            >
              Lesson Set
              <ArrowDownUp size={13} aria-hidden />
            </button>
            <span className="lsm-col-rooms" role="columnheader">
              Classrooms
            </span>
            <span className="lsm-col-actions" role="columnheader" />
          </div>

          {sortedRows.length === 0 ? (
            <div className="lsm-empty">
              <p>No lesson sets yet.</p>
              <button type="button" className="ui-btn ui-btn-primary" onClick={() => setAddOpen(true)}>
                <Plus size={16} aria-hidden />
                Add lesson set
              </button>
            </div>
          ) : (
            sortedRows.map((row) => {
              const isEditing = editingId === row.id;

              if (isEditing) {
                return (
                  <div key={row.id} className="lsm-row is-editing" role="row">
                    <div className="lsm-col-set" role="cell">
                      <div className="lsm-set-cell">
                        <strong>{row.name}</strong>
                        {row.ageLabel ? <span>· {row.ageLabel}</span> : null}
                      </div>
                    </div>

                    <div className="lsm-col-rooms" role="cell">
                      <div className="lsm-picker">
                        <button
                          ref={triggerRef}
                          type="button"
                          className={`lsm-select${roomMenuOpen ? ' is-open' : ''}`}
                          onClick={() => {
                            setRoomMenuOpen((v) => !v);
                            setRoomQuery('');
                          }}
                          aria-haspopup="listbox"
                          aria-expanded={roomMenuOpen}
                        >
                          <span className={draftRooms.length ? '' : 'is-placeholder'}>
                            {draftRooms.length
                              ? classroomLabel(draftRooms)
                              : 'Select classrooms'}
                          </span>
                          <ChevronDown size={16} aria-hidden />
                        </button>
                      </div>
                    </div>

                    <div className="lsm-col-actions" role="cell">
                      <button
                        type="button"
                        className="ui-btn ui-btn-primary lsm-btn"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline lsm-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                      <button type="button" className="lsm-remove" onClick={removeSet}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={row.id} className="lsm-row" role="row">
                  <div className="lsm-col-set" role="cell">
                    <div className="lsm-set-cell">
                      <strong>{row.name}</strong>
                      {row.ageLabel ? <span>· {row.ageLabel}</span> : null}
                    </div>
                  </div>
                  <div className="lsm-col-rooms" role="cell">
                    <button
                      type="button"
                      className={`lsm-rooms-link${row.classroomIds.length ? ' is-mapped' : ''}`}
                      onClick={() => startEdit(row)}
                    >
                      {classroomLabel(row.classroomIds)}
                    </button>
                  </div>
                  <div className="lsm-col-actions" role="cell">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline lsm-edit-btn"
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {mounted &&
        roomMenuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="lsm-dropdown lsm-dropdown-portal"
            role="listbox"
            style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
          >
            <div className="lsm-dropdown-search">
              <Search size={14} aria-hidden />
              <input
                className="ui-input"
                type="search"
                placeholder="Search classrooms..."
                value={roomQuery}
                autoFocus
                onChange={(e) => setRoomQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Search classrooms"
              />
            </div>
            <div className="lsm-dropdown-list">
              {roomOptions.map((r) => {
                const checked = draftRooms.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={`lsm-room-option${checked ? ' is-selected' : ''}`}
                    onClick={() => toggleRoom(r.id)}
                  >
                    <span className="lsm-check" aria-hidden>
                      {checked ? '✓' : ''}
                    </span>
                    {r.name}
                  </button>
                );
              })}
              {roomOptions.length === 0 ? (
                <p className="lsm-room-empty">No classrooms found</p>
              ) : null}
            </div>
          </div>,
          document.body,
        )}

      <Modal
        open={addOpen}
        title="Add lesson set"
        onClose={closeAdd}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeAdd}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!canAdd}
              onClick={addLessonSet}
            >
              Add
            </button>
          </>
        }
      >
        <p className="lsm-add-hint">
          Creates the lesson set and its matching category. You can map classrooms to it afterwards
          with Edit.
        </p>
        <div className="ui-field">
          <input
            ref={addInputRef}
            id="lsm-new-name"
            className="ui-input"
            placeholder="Lesson set name"
            value={newName}
            aria-label="Lesson set name"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canAdd) addLessonSet();
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

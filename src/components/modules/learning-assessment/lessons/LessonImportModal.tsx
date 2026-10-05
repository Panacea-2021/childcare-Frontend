'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { Import } from 'lucide-react';
import { LESSON_CATALOG, LESSON_CATEGORIES } from '@/lib/mock/lessonCatalog';
import type { CatalogLesson } from '@/lib/mock/lessonCatalog';
import { loadRooms } from '@/lib/center-management/roomsStore';
import type { Lesson } from './types';
import './lessons.css';

type Props = {
  open: boolean;
  existingLessonIds: Set<string>;
  onClose: () => void;
  onImport: (lessons: Lesson[]) => void;
};

/** Map a Montessori catalog age band to the closest app age-band vocabulary. */
function mapAgeBand(catalogBand: string): string {
  if (catalogBand.startsWith('Toddler')) return '1-2 Years';
  if (catalogBand.startsWith('Primary')) return '3-4 Years';
  return '5-6 Years'; // Elementary
}

function toLesson(c: CatalogLesson, roomId: string, roomName: string, now: string): Lesson {
  return {
    id: `les-cat-${c.id}`,
    title: c.title,
    lessonSet: 'Morning Session',
    roomId,
    roomName,
    ageBand: mapAgeBand(c.ageBand),
    developmentAreas: c.developmentAreas.length ? c.developmentAreas : ['Montessori'],
    labels: [],
    duration: '30 mins',
    customDuration: '',
    descriptionHtml: c.description
      ? `<h3>Lesson Overview</h3><p>${c.description.replace(/\n/g, '<br/>')}</p>`
      : '',
    youtubeUrl: '',
    attachments: c.mediaThumbUrl
      ? [
          {
            id: `att-${c.id}`,
            name: `${c.title} thumbnail`,
            type: 'image',
            url: c.mediaThumbUrl,
            size: '',
            thumbnail: c.mediaThumbUrl,
          },
        ]
      : [],
    status: 'Draft',
    createdBy: 'Center Administrator',
    createdAt: now,
    updatedAt: now,
  };
}

export function LessonImportModal({ open, existingLessonIds, onClose, onImport }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [roomId, setRoomId] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const rooms = useMemo(() => (typeof window === 'undefined' ? [] : loadRooms()), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LESSON_CATALOG.filter((l) => {
      if (category !== 'All Categories' && l.ageBand !== category) return false;
      if (existingLessonIds.has(`les-cat-${l.id}`)) return false;
      if (!q) return true;
      return `${l.title} ${l.developmentAreas.join(' ')}`.toLowerCase().includes(q);
    });
  }, [search, category, existingLessonIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const reset = () => {
    setSearch('');
    setCategory('All Categories');
    setSelected(new Set());
    setRoomId('');
    setPage(1);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = () => {
    const now = new Date().toISOString();
    const room = rooms.find((r) => r.id === roomId);
    const lessons = LESSON_CATALOG.filter((l) => selected.has(l.id)).map((l) =>
      toLesson(l, roomId, room?.name ?? 'Unassigned', now),
    );
    onImport(lessons);
    reset();
  };

  return (
    <Modal
      open={open}
      title="Import lessons from catalog"
      subtitle={`${LESSON_CATALOG.length.toLocaleString()} Montessori lessons · imported as Draft`}
      wide
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <span className="les-import-count">
            {selected.size} selected
          </span>
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => { reset(); onClose(); }}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={selected.size === 0}
            onClick={handleImport}
          >
            <Import size={15} /> Import {selected.size || ''}
          </button>
        </>
      }
    >
      <div className="les-import-toolbar">
        <div className="ui-search">
          <span aria-hidden>⌕</span>
          <input
            placeholder="Search lessons…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search catalog lessons"
          />
        </div>
        <select
          className="ui-filter"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          aria-label="Filter by age band"
        >
          {LESSON_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="ui-filter"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          aria-label="Assign imported lessons to a room"
        >
          <option value="">Assign to room… (optional)</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="les-import-grid">
        {paged.length === 0 ? (
          <div className="les-import-empty">
            {search || category !== 'All Categories'
              ? 'No lessons match your filters.'
              : 'All catalog lessons have been imported.'}
          </div>
        ) : (
          paged.map((l) => {
            const checked = selected.has(l.id);
            return (
              <button
                key={l.id}
                type="button"
                className={`les-import-card${checked ? ' is-selected' : ''}`}
                onClick={() => toggle(l.id)}
                aria-pressed={checked}
              >
                <span className="les-import-check" aria-hidden>
                  {checked ? '✓' : ''}
                </span>
                <span className="les-import-card-title">{l.title}</span>
                <span className="les-import-card-band">{l.ageBand}</span>
                <span className="les-import-card-areas">
                  {l.developmentAreas.slice(0, 3).join(' · ')}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="les-pagination">
        <span className="les-page-meta">
          {filtered.length === 0
            ? '0'
            : `${(pageSafe - 1) * PAGE_SIZE + 1}–${Math.min(pageSafe * PAGE_SIZE, filtered.length)}`}{' '}
          of {filtered.length}
        </span>
        <div className="ui-pagination">
          <button
            type="button"
            className="ui-page-btn"
            disabled={pageSafe <= 1}
            onClick={() => setPage(pageSafe - 1)}
            aria-label="Previous page"
          >
            ‹
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
                    className={`ui-page-btn ${p === pageSafe ? 'is-active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
          <button
            type="button"
            className="ui-page-btn"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage(pageSafe + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </Modal>
  );
}

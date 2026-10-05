'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '@/components/parent-communication/shared/EmptyState';
import { NotesHeader } from '@/components/parent-communication/notes/NotesHeader';
import { NotesStats } from '@/components/parent-communication/notes/NotesStats';
import { NotesFilters } from '@/components/parent-communication/notes/NotesFilters';
import { NotesCard } from '@/components/parent-communication/notes/NotesCard';
import { NotesViewModal } from '@/components/parent-communication/notes/NotesViewModal';
import { NotesTabs, type NotesListView } from '@/components/parent-communication/notes/NotesTabs';
import { NotesToast, type NotesToastItem } from '@/components/parent-communication/notes/NotesToast';
import { NotesAmbient } from '@/components/parent-communication/notes/NotesAmbient';
import { LoadingSkeleton } from '@/components/parent-communication/notes/LoadingSkeleton';
import { MOCK_NOTES } from '@/lib/mock/mockNotes';
import type { NoteFilterState, ParentNote } from '@/types/note';
import '@/components/parent-communication/shared/shared.css';
import '@/components/parent-communication/parent-communication-page.css';
import '@/components/parent-communication/notes/notes.css';

const TODAY = '2026-08-02';
const THIS_WEEK = new Set([
  '2026-07-27',
  '2026-07-28',
  '2026-07-29',
  '2026-07-30',
  '2026-07-31',
  '2026-08-01',
  '2026-08-02',
]);

const DEFAULT_FILTERS: NoteFilterState = {
  search: '',
  sort: 'newest',
  readStatus: 'all',
  category: 'all',
  date: '',
};

export function NotesPage() {
  const [notes, setNotes] = useState<ParentNote[]>(() => MOCK_NOTES.map((n) => ({ ...n })));
  const [filters, setFilters] = useState<NoteFilterState>(DEFAULT_FILTERS);
  const [listView, setListView] = useState<NotesListView>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<NotesToastItem[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const pushToast = useCallback((title: string, message: string, type: NotesToastItem['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const handleResetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleRefresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 500);
    pushToast('Refreshed', 'Notes list updated.', 'info');
  };

  const handleMarkRead = useCallback(
    (id: string) => {
      let didUpdate = false;
      setNotes((prev) => {
        const target = prev.find((n) => n.id === id);
        if (!target || target.isRead) return prev;
        didUpdate = true;
        return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      });
      if (didUpdate) {
        pushToast('Marked as read', 'This parent note is now marked as read.');
      }
    },
    [pushToast],
  );

  const handleArchive = useCallback(
    (id: string) => {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isArchived: true } : n)));
      setSelectedId((cur) => (cur === id ? null : cur));
      pushToast('Archived', 'Note moved to Archives. Open the Archives tab to view it.');
    },
    [pushToast],
  );

  const handleRestore = useCallback(
    (id: string) => {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isArchived: false } : n)));
      setSelectedId((cur) => (cur === id ? null : cur));
      pushToast('Restored', 'Note restored to Inbox.');
    },
    [pushToast],
  );

  const handleView = useCallback(
    (note: ParentNote) => {
      setSelectedId(note.id);
      if (!note.isRead && !note.isArchived) {
        handleMarkRead(note.id);
      }
    },
    [handleMarkRead],
  );

  const inboxNotes = useMemo(() => notes.filter((n) => !n.isArchived), [notes]);
  const archivedNotes = useMemo(() => notes.filter((n) => n.isArchived), [notes]);
  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const filtered = useMemo(() => {
    const source = listView === 'archived' ? archivedNotes : inboxNotes;
    const q = filters.search.trim().toLowerCase();
    let list = source.filter((note) => {
      if (listView === 'inbox') {
        if (filters.readStatus === 'unread' && note.isRead) return false;
        if (filters.readStatus === 'read' && !note.isRead) return false;
      }
      if (filters.category !== 'all' && note.category !== filters.category) return false;
      if (filters.date && note.date !== filters.date) return false;
      if (!q) return true;
      return (
        note.studentName.toLowerCase().includes(q) ||
        note.parentName.toLowerCase().includes(q) ||
        note.room.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) =>
      filters.sort === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );
    return list;
  }, [archivedNotes, filters, inboxNotes, listView]);

  const stats = useMemo(
    () => ({
      total: inboxNotes.length,
      unread: inboxNotes.filter((n) => !n.isRead).length,
      today: inboxNotes.filter((n) => n.date === TODAY).length,
      thisWeek: inboxNotes.filter((n) => THIS_WEEK.has(n.date)).length,
    }),
    [inboxNotes],
  );

  return (
    <div className="pc-page pc-page--notes notes-container">
      <NotesHeader archivedCount={archivedNotes.length} />
      <NotesStats
        total={stats.total}
        unread={stats.unread}
        today={stats.today}
        thisWeek={stats.thisWeek}
      />
      <NotesTabs
        view={listView}
        inboxCount={inboxNotes.length}
        archivedCount={archivedNotes.length}
        onChange={setListView}
      />
      <NotesFilters filters={filters} onChange={setFilters} />

      <div className="notes-list-shell pc-panel">
        <NotesAmbient />

        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            theme="notes"
            title={listView === 'archived' ? 'No archived notes' : 'No notes available'}
            description={
              listView === 'archived'
                ? 'Archived notes will appear here. Archive a note from the Inbox to move it here.'
                : 'Try adjusting filters or refresh to reload parent-submitted notes.'
            }
            onRefresh={handleRefresh}
            onClearFilters={handleResetFilters}
          />
        ) : (
          <motion.div className="notes-grid" layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((note, index) => (
                <NotesCard
                  key={note.id}
                  note={note}
                  index={index}
                  mode={listView}
                  onView={handleView}
                  onMarkRead={handleMarkRead}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <NotesViewModal
        note={selected}
        allNotes={notes}
        onClose={() => setSelectedId(null)}
        onMarkRead={handleMarkRead}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      <NotesToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

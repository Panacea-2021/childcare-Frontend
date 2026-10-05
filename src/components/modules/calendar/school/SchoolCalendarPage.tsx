'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarPlus } from 'lucide-react';
import { SchoolDecor } from './SchoolDecor';
import { SchoolCalendarHeader } from './SchoolCalendarHeader';
import { SchoolFilters } from './SchoolFilters';
import { SchoolMonthGrid } from './SchoolMonthGrid';
import { SchoolEventList } from './SchoolEventList';
import { SchoolCalendarSkeleton } from './SchoolCalendarSkeleton';
import type { SchoolEvent, SchoolEventFormState, SchoolFiltersState, SchoolViewMode } from './types';
import { filterEvents, formToEvent, seedSchoolEvents } from './mockData';
import '../calendar.css';
import './school-calendar.css';
import '@/components/ui/module.css';

const EventFormModal = dynamic(
  () => import('./EventFormModal').then((mod) => mod.EventFormModal),
  { ssr: false },
);
const EventDetailModal = dynamic(
  () => import('./EventDetailModal').then((mod) => mod.EventDetailModal),
  { ssr: false },
);
const DeleteEventDialog = dynamic(
  () => import('./DeleteEventDialog').then((mod) => mod.DeleteEventDialog),
  { ssr: false },
);
const DayEventsModal = dynamic(
  () => import('./DayEventsModal').then((mod) => mod.DayEventsModal),
  { ssr: false },
);

export function SchoolCalendarPage() {
  const today = useMemo(() => {
    const d = new Date(2026, 6, 20);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [booting, setBooting] = useState(true);
  const [events, setEvents] = useState<SchoolEvent[]>(seedSchoolEvents);
  const [viewMonth, setViewMonth] = useState(() => new Date(2026, 6, 1));
  const [view, setView] = useState<SchoolViewMode>('calendar');
  const [filters, setFilters] = useState<SchoolFiltersState>({
    search: '',
    classroom: 'all',
    category: 'all',
    date: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const [detail, setDetail] = useState<SchoolEvent | null>(null);
  const [deleting, setDeleting] = useState<SchoolEvent | null>(null);
  const [dayModal, setDayModal] = useState<{ date: Date; events: SchoolEvent[] } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () => filterEvents(events, filters, view === 'calendar' ? viewMonth : undefined),
    [events, filters, view, viewMonth],
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormMode('add');
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((event: SchoolEvent) => {
    setEditing(event);
    setFormMode('edit');
    setFormOpen(true);
  }, []);

  const onSubmit = useCallback(
    async (form: SchoolEventFormState) => {
      await new Promise((r) => setTimeout(r, 320));
      if (formMode === 'edit' && editing) {
        setEvents((list) =>
          list.map((e) => (e.id === editing.id ? formToEvent(form, editing) : e)),
        );
      } else {
        setEvents((list) => [formToEvent(form), ...list]);
      }
    },
    [editing, formMode],
  );

  const onDelete = useCallback(async () => {
    if (!deleting) return;
    await new Promise((r) => setTimeout(r, 220));
    setEvents((list) => list.filter((e) => e.id !== deleting.id));
  }, [deleting]);

  const empty = !booting && filtered.length === 0;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page cal-page sc-page">
          <div className="cal-ambient" aria-hidden>
            <span className="cal-blob b1" />
            <span className="cal-blob b2" />
            <span className="cal-blob b3" />
            <span className="cal-mesh" />
          </div>
          <SchoolDecor />

          <m.div
            className="cal-page-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <SchoolCalendarHeader onAdd={openAdd} />

            {booting ? (
              <SchoolCalendarSkeleton />
            ) : (
              <>
                <SchoolFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  view={view}
                  onViewChange={setView}
                />

                <AnimatePresence mode="wait">
                  {empty ? (
                    <m.div
                      key="empty"
                      className="cal-empty sc-empty"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="cal-empty-art" aria-hidden>
                        📅
                      </div>
                      <h3>No School Events Found</h3>
                      <p>Start by creating your first school event.</p>
                      <m.button
                        type="button"
                        className="cal-btn-add"
                        onClick={openAdd}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="cal-btn-save-shine" aria-hidden />
                        <CalendarPlus size={16} aria-hidden />
                        Add Event
                      </m.button>
                    </m.div>
                  ) : view === 'calendar' ? (
                    <m.div
                      key="calendar"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      <SchoolMonthGrid
                        viewMonth={viewMonth}
                        onMonthChange={setViewMonth}
                        events={filtered}
                        today={today}
                        onEventClick={setDetail}
                        onMoreClick={(date, dayEvents) => setDayModal({ date, events: dayEvents })}
                      />
                    </m.div>
                  ) : (
                    <m.div
                      key="list"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                    >
                      <SchoolEventList
                        events={filtered}
                        onView={setDetail}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                      />
                    </m.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </m.div>

          <EventFormModal
            open={formOpen}
            mode={formMode}
            editing={editing}
            onClose={() => setFormOpen(false)}
            onSubmit={onSubmit}
          />
          <EventDetailModal
            open={Boolean(detail)}
            event={detail}
            onClose={() => setDetail(null)}
            onEdit={openEdit}
          />
          <DeleteEventDialog
            open={Boolean(deleting)}
            event={deleting}
            onClose={() => setDeleting(null)}
            onConfirm={onDelete}
          />
          <DayEventsModal
            open={Boolean(dayModal)}
            date={dayModal?.date ?? null}
            events={dayModal?.events ?? []}
            onClose={() => setDayModal(null)}
            onSelect={setDetail}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

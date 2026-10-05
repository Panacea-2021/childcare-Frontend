'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentPageHeader } from '../shared';
import { useParentStudent } from '../ParentStudentContext';
import { ParentCalendarFilters } from './ParentCalendarFilters';
import { ParentCalendarMonthGrid } from './ParentCalendarMonthGrid';
import { ParentCalendarList } from './ParentCalendarList';
import { ParentCalendarSkeleton } from './ParentCalendarSkeleton';
import { ParentEventDetailModal } from './ParentEventDetailModal';
import { ParentDayEventsPopover } from './ParentDayEventsPopover';
import type { ParentCalendarEvent, ParentCalendarFiltersState, ParentCalendarViewMode } from './types';
import {
  DEFAULT_PARENT_CALENDAR_FILTERS,
  PARENT_CALENDAR_TODAY,
  filterParentCalendarEvents,
  hasActiveFilters,
  seedParentCalendarEvents,
} from './mockData';
import './parent-calendar.css';

export function ParentCalendarPage() {
  const { selectedStudent, students } = useParentStudent();

  const today = useMemo(() => {
    const d = new Date(PARENT_CALENDAR_TODAY);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [booting, setBooting] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => new Date(2026, 7, 1));
  const [view, setView] = useState<ParentCalendarViewMode>('month');
  const [filters, setFilters] = useState<ParentCalendarFiltersState>(DEFAULT_PARENT_CALENDAR_FILTERS);
  const [detail, setDetail] = useState<ParentCalendarEvent | null>(null);
  const [dayPopover, setDayPopover] = useState<{
    date: Date;
    events: ParentCalendarEvent[];
    anchor: DOMRect | null;
  } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () =>
      filterParentCalendarEvents(
        seedParentCalendarEvents,
        filters,
        today,
        selectedStudent?.id ?? null,
      ),
    [filters, today, selectedStudent?.id],
  );

  const monthEvents = useMemo(() => {
    if (view !== 'month') return filtered;
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    return filtered.filter((e) => e.date >= startKey && e.date <= endKey);
  }, [filtered, view, viewMonth]);

  const totalCount = filtered.length;
  const filtersActive = hasActiveFilters(filters);

  const detailStudentName = useMemo(() => {
    if (!detail?.studentId) return selectedStudent?.name ?? null;
    return students.find((s) => s.id === detail.studentId)?.name ?? selectedStudent?.name ?? null;
  }, [detail, students, selectedStudent]);

  const empty = !booting && filtered.length === 0;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="pc-page">
          <ParentPageHeader
            title="School Calendar"
            description={
              selectedStudent
                ? `Stay up to date with classes, events and important school activities for ${selectedStudent.name}.`
                : 'Stay up to date with classes, events and important school activities.'
            }
            icon={<ParentModuleIcon id="school-calendar" />}
          />

          {booting ? (
            <ParentCalendarSkeleton />
          ) : (
            <>
              <ParentCalendarFilters
                filters={filters}
                onFiltersChange={setFilters}
                view={view}
                onViewChange={setView}
                total={totalCount}
              />

              <AnimatePresence mode="wait">
                {empty ? (
                  <m.div
                    key="empty"
                    className="pc-empty"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <span className="pc-empty-icon" aria-hidden>
                      <CalendarDays size={26} strokeWidth={1.75} />
                    </span>
                    <h3>No events found</h3>
                    <p>There are no calendar events matching your current filters.</p>
                    {filtersActive ? (
                      <m.button
                        type="button"
                        className="ui-btn ui-btn-outline pc-empty-clear"
                        onClick={() => setFilters(DEFAULT_PARENT_CALENDAR_FILTERS)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Clear Filters
                      </m.button>
                    ) : null}
                  </m.div>
                ) : view === 'month' ? (
                  <m.div
                    key="month"
                    initial={{ opacity: 0, y: 12, scale: 0.992 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.995 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ParentCalendarMonthGrid
                      viewMonth={viewMonth}
                      onMonthChange={setViewMonth}
                      events={monthEvents}
                      today={today}
                      onEventClick={setDetail}
                      onMoreClick={(date, dayEvents, anchor) =>
                        setDayPopover({ date, events: dayEvents, anchor })
                      }
                    />
                  </m.div>
                ) : (
                  <m.div
                    key="list"
                    initial={{ opacity: 0, y: 12, scale: 0.992 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.995 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ParentCalendarList events={filtered} onEventClick={setDetail} />
                  </m.div>
                )}
              </AnimatePresence>
            </>
          )}

          <ParentEventDetailModal
            open={Boolean(detail)}
            event={detail}
            studentName={detailStudentName}
            onClose={() => setDetail(null)}
          />
          <ParentDayEventsPopover
            open={Boolean(dayPopover)}
            date={dayPopover?.date ?? null}
            events={dayPopover?.events ?? []}
            anchor={dayPopover?.anchor ?? null}
            onClose={() => setDayPopover(null)}
            onSelect={setDetail}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

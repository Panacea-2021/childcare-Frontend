'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { StudentScheduleHeader } from './StudentScheduleHeader';
import { StudentSummaryCards } from './StudentSummaryCards';
import { StudentScheduleFiltersBar } from './StudentScheduleFilters';
import { StudentScheduleGrid } from './StudentScheduleGrid';
import { StudentScheduleSkeleton } from './StudentScheduleSkeleton';
import type { StudentActivity, StudentActivityFormState, StudentScheduleFilters } from './types';
import {
  STUDENT_SEED_WEEK_START,
  filterActivities,
  formToActivity,
  generateTodayActivities,
  scheduleStaff,
  seedStudentActivities,
  staffNames,
  startOfWeek,
  summarizeActivities,
  toISODate,
} from './mockData';
import '../calendar.css';
import './student-schedule.css';
import '@/components/ui/module.css';

const ActivityFormModal = dynamic(
  () => import('./ActivityFormModal').then((mod) => mod.ActivityFormModal),
  { ssr: false },
);

const ActivityDetailDrawer = dynamic(
  () => import('./ActivityDetailDrawer').then((mod) => mod.ActivityDetailDrawer),
  { ssr: false },
);

const DEFAULT_FILTERS: StudentScheduleFilters = {
  room: 'all',
  type: 'all',
  staffId: 'all',
  search: '',
};

export function StudentSchedulePage() {
  const [booting, setBooting] = useState(true);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(STUDENT_SEED_WEEK_START));
  const [weekDirection, setWeekDirection] = useState(0);
  const [filters, setFilters] = useState<StudentScheduleFilters>(DEFAULT_FILTERS);
  const [activities, setActivities] = useState<StudentActivity[]>(seedStudentActivities);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentActivity | null>(null);
  const [selected, setSelected] = useState<StudentActivity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDayIndex, setMobileDayIndex] = useState(1); // Mon in Sun-start week seed
  const prevWeekRef = useRef(weekStart.getTime());

  const todayIso = useMemo(() => {
    // Align "today" with the demo seed week so summary cards feel alive offline.
    return '2026-07-22';
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 520);
    return () => window.clearTimeout(t);
  }, []);

  const handleWeekChange = useCallback((next: Date) => {
    const nextTime = next.getTime();
    setWeekDirection(nextTime >= prevWeekRef.current ? 1 : -1);
    prevWeekRef.current = nextTime;
    setWeekStart(next);
  }, []);

  const weekActivities = useMemo(
    () => filterActivities(activities, weekStart, filters),
    [activities, weekStart, filters],
  );

  const stats = useMemo(
    () => summarizeActivities(weekActivities, todayIso),
    [weekActivities, todayIso],
  );

  const onExport = useCallback(async () => {
    const rows = [
      ['Date', 'Start', 'End', 'Title', 'Type', 'Room', 'Staff', 'Duration (min)', 'Notes'],
      ...weekActivities.map((a) => [
        a.date,
        a.startTime,
        a.endTime,
        a.title,
        a.type,
        a.room,
        staffNames(a.staffIds),
        String(a.durationMinutes),
        a.notes ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-schedule-${toISODate(weekStart)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [weekActivities, weekStart]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((activity: StudentActivity) => {
    setDrawerOpen(false);
    setEditing(activity);
    setModalOpen(true);
  }, []);

  const onSave = useCallback(
    async (form: StudentActivityFormState) => {
      await new Promise((r) => setTimeout(r, 280));
      const next = formToActivity(form, editing?.id);
      if (!next) return;
      setActivities((list) => {
        if (editing) return list.map((a) => (a.id === editing.id ? next : a));
        return [...list, next];
      });
    },
    [editing],
  );

  const onDelete = useCallback((activity: StudentActivity) => {
    setActivities((list) => list.filter((a) => a.id !== activity.id));
    setDrawerOpen(false);
    setSelected(null);
  }, []);

  const onSelect = useCallback((activity: StudentActivity) => {
    setSelected(activity);
    setDrawerOpen(true);
  }, []);

  const onReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const onGenerateToday = useCallback(() => {
    const generated = generateTodayActivities(todayIso);
    setActivities((list) => {
      const withoutGenerated = list.filter((a) => !a.id.startsWith('gen-') || a.date !== todayIso);
      return [...withoutGenerated, ...generated];
    });
    // Jump to seed week containing todayIso if needed
    const day = new Date(2026, 6, 22);
    handleWeekChange(startOfWeek(day));
  }, [todayIso, handleWeekChange]);

  const showEmpty = !booting && weekActivities.length === 0;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page cal-page ss-page">
          <div className="cal-ambient" aria-hidden>
            <span className="cal-blob b1" />
            <span className="cal-blob b2" />
            <span className="cal-blob b3" />
            <span className="cal-mesh" />
          </div>

          <m.div
            className="cal-page-inner"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {booting ? (
              <StudentScheduleSkeleton />
            ) : (
              <>
                <StudentScheduleHeader onExport={onExport} onAdd={openAdd} />
                <StudentSummaryCards {...stats} />
                <StudentScheduleFiltersBar
                  weekStart={weekStart}
                  onWeekChange={handleWeekChange}
                  filters={filters}
                  onFiltersChange={setFilters}
                  staff={scheduleStaff}
                  onReset={onReset}
                  onGenerateToday={onGenerateToday}
                />

                {showEmpty ? (
                  <m.div
                    className="ss-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <m.div
                      className="ss-empty-art"
                      aria-hidden
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <CalendarDays size={36} />
                    </m.div>
                    <h3>No Schedule Found</h3>
                    <p>Start by creating your first classroom activity schedule.</p>
                    <m.button
                      type="button"
                      className="ss-btn ss-btn-primary"
                      onClick={openAdd}
                      whileHover={{ y: -5, scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="ss-btn-shine" aria-hidden />
                      Add Schedule
                    </m.button>
                  </m.div>
                ) : (
                  <StudentScheduleGrid
                    weekStart={weekStart}
                    activities={weekActivities}
                    weekDirection={weekDirection}
                    todayIso={todayIso}
                    mobileDayIndex={mobileDayIndex}
                    onMobileDayChange={setMobileDayIndex}
                    onSelect={onSelect}
                  />
                )}
              </>
            )}
          </m.div>

          <ActivityFormModal
            open={modalOpen}
            editing={editing}
            initialDate={toISODate(weekStart)}
            onClose={() => setModalOpen(false)}
            onSave={onSave}
          />

          <ActivityDetailDrawer
            open={drawerOpen}
            activity={selected}
            onClose={() => setDrawerOpen(false)}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

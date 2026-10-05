'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { BirthdaysDecor } from './BirthdaysDecor';
import { BirthdayHeader } from './BirthdayHeader';
import { SummaryCards } from './SummaryCards';
import { BirthdayFilters } from './BirthdayFilters';
import { TodayCelebration } from './TodayCelebration';
import { BirthdayCalendarGrid } from './BirthdayCalendarGrid';
import { UpcomingSidebar } from './UpcomingSidebar';
import type { BirthdayEntry, BirthdayFilter, BirthdayFormState } from './types';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import { filterBirthdays, isBirthdayToday, loadCenterBirthdays, summarize } from './mockData';
import '../calendar.css';
import '../holidays/staff-holidays.css';
import './birthday-calendar.css';
import '@/components/ui/module.css';

const BirthdayModal = dynamic(
  () => import('./BirthdayModal').then((mod) => mod.BirthdayModal),
  { ssr: false },
);

export function BirthdayCalendarPage() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [entries, setEntries] = useState<BirthdayEntry[]>(() => {
    const live = loadCenterBirthdays();
    return live.length > 0 ? live : [];
  });
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [filter, setFilter] = useState<BirthdayFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BirthdayEntry | null>(null);

  const stats = useMemo(() => summarize(entries, today), [entries, today]);

  const todays = useMemo(
    () => entries.filter((e) => isBirthdayToday(e.birthDate, today)),
    [entries, today],
  );

  const filtered = useMemo(
    () => filterBirthdays(entries, filter, search, viewMonth, today),
    [entries, filter, search, viewMonth, today],
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const submitBirthday = useCallback(
    async (form: BirthdayFormState) => {
      await new Promise((r) => setTimeout(r, 320));
      if (editing) {
        setEntries((list) =>
          list.map((e) =>
            e.id === editing.id
              ? {
                  ...e,
                  name: form.name,
                  type: form.type,
                  birthDate: form.birthDate,
                  profileColor: form.profileColor,
                  notes: form.notes || undefined,
                  relationship: form.relationship || undefined,
                }
              : e,
          ),
        );
      } else {
        setEntries((list) => [
          {
            id: `bd-${Date.now()}`,
            name: form.name,
            type: form.type,
            birthDate: form.birthDate,
            profileColor: form.profileColor,
            notes: form.notes || undefined,
            relationship: form.relationship || undefined,
            role: form.type === 'staff' ? 'Staff' : undefined,
            room: form.type === 'student' ? (loadActiveCenterRooms()[0]?.name ?? '') : undefined,
          },
          ...list,
        ]);
      }
    },
    [editing],
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page cal-page bc-page">
          <div className="cal-ambient" aria-hidden>
            <span className="cal-blob b1" />
            <span className="cal-blob b2" />
            <span className="cal-blob b3" />
            <span className="cal-mesh" />
          </div>
          <BirthdaysDecor />

          <m.div
            className="cal-page-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <BirthdayHeader />

            <SummaryCards
              todayCount={stats.todayCount}
              upcoming7={stats.upcoming7}
              students={stats.students}
              staff={stats.staff}
            />

            <TodayCelebration todays={todays} />

            <BirthdayFilters
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
            />

            <div className="bc-main">
              <BirthdayCalendarGrid
                viewMonth={viewMonth}
                onMonthChange={setViewMonth}
                entries={filtered}
                today={today}
                onAdd={openAdd}
              />
              <UpcomingSidebar entries={entries} today={today} />
            </div>
          </m.div>

          <BirthdayModal
            open={modalOpen}
            editing={editing}
            onClose={() => setModalOpen(false)}
            onSubmit={submitBirthday}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

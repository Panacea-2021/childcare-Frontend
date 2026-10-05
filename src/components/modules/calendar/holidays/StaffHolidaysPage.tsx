'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { HolidaysDecor } from './HolidaysDecor';
import { HolidaysHeader } from './HolidaysHeader';
import { HolidaysTabs } from './HolidaysTabs';
import { HolidayCalendarTab } from './HolidayCalendarTab';
import { LeavePolicyTab } from './LeavePolicyTab';
import { WeekendConfigTab } from './WeekendConfigTab';
import type { Holiday, HolidayFormState, HolidaysTabId, LeavePolicyGroup, WeekendDayConfig } from './types';
import { seedHolidays, seedLeavePolicies, seedWeekendConfig } from './mockData';
import '../calendar.css';
import './staff-holidays.css';
import '@/components/ui/module.css';

const HolidayModal = dynamic(
  () => import('./HolidayModal').then((mod) => mod.HolidayModal),
  { ssr: false },
);

export function StaffHolidaysPage() {
  const [tab, setTab] = useState<HolidaysTabId>('holiday-calendar');
  const [holidays, setHolidays] = useState<Holiday[]>(seedHolidays);
  const [policies, setPolicies] = useState<LeavePolicyGroup[]>(seedLeavePolicies);
  const [weekend, setWeekend] = useState<WeekendDayConfig[]>(seedWeekendConfig);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((holiday: Holiday) => {
    setEditing(holiday);
    setModalOpen(true);
  }, []);

  const removeHoliday = useCallback((id: string) => {
    setHolidays((list) => list.filter((h) => h.id !== id));
  }, []);

  const submitHoliday = useCallback(
    async (form: HolidayFormState) => {
      if (editing) {
        setHolidays((list) =>
          list.map((h) =>
            h.id === editing.id
              ? { ...h, name: form.name, startDate: form.startDate, endDate: form.endDate }
              : h,
          ),
        );
      } else {
        setHolidays((list) => [
          {
            id: `hol-${Date.now()}`,
            name: form.name,
            startDate: form.startDate,
            endDate: form.endDate,
          },
          ...list,
        ]);
      }
    },
    [editing],
  );

  const saveWeekend = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 420));
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mod-page cal-page sh-page">
          <div className="cal-ambient" aria-hidden>
            <span className="cal-blob b1" />
            <span className="cal-blob b2" />
            <span className="cal-blob b3" />
            <span className="cal-mesh" />
          </div>
          <HolidaysDecor />

          <div className="cal-page-inner">
            <HolidaysHeader />
            <HolidaysTabs active={tab} onChange={setTab} />

            <AnimatePresence mode="wait">
              <m.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {tab === 'holiday-calendar' ? (
                  <HolidayCalendarTab
                    holidays={holidays}
                    onAdd={openAdd}
                    onEdit={openEdit}
                    onDelete={removeHoliday}
                  />
                ) : null}
                {tab === 'leave-policy' ? (
                  <LeavePolicyTab policies={policies} onChange={setPolicies} />
                ) : null}
                {tab === 'weekend-config' ? (
                  <WeekendConfigTab config={weekend} onChange={setWeekend} onSave={saveWeekend} />
                ) : null}
              </m.div>
            </AnimatePresence>
          </div>

          <HolidayModal
            open={modalOpen}
            editing={editing}
            onClose={() => setModalOpen(false)}
            onSubmit={submitHoliday}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

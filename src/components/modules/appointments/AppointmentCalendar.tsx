'use client';

import { memo, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Clock3, Sparkles } from 'lucide-react';
import type { AppointmentRecord } from '@/lib/appointments/types';
import { FACULTY } from '@/lib/appointments/mockData';
import {
  addDays,
  monthBadge,
  startOfWeek,
  toISODate,
  weekdayShort,
} from '@/components/modules/calendar/mockData';
import { CalendarNavigation } from '@/components/modules/calendar/CalendarNavigation';
import '@/components/modules/calendar/calendar.css';

type Props = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
  items: AppointmentRecord[];
  onOpen: (item: AppointmentRecord) => void;
};

function shiftTone(startTime: string): 'morning' | 'afternoon' | 'evening' {
  const h = Number(startTime.split(':')[0] || 12);
  if (h < 12) return 'morning';
  if (h < 16) return 'afternoon';
  return 'evening';
}

function toDisplayTime(t: string) {
  const [hh, mm] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const ApptShiftCard = memo(function ApptShiftCard({
  item,
  index,
  onOpen,
}: {
  item: AppointmentRecord;
  index: number;
  onOpen: (item: AppointmentRecord) => void;
}) {
  const reduce = useReducedMotion();
  const tone = shiftTone(item.startTime);
  const [sparkle, setSparkle] = useState(false);

  return (
    <motion.button
      type="button"
      className={`cal-shift cal-shift-${tone}`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.04,
              y: -2,
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.14)',
            }
      }
      onHoverStart={() => {
        if (reduce) return;
        setSparkle(true);
        window.setTimeout(() => setSparkle(false), 700);
      }}
      onClick={() => onOpen(item)}
      aria-label={`${item.studentName}, ${item.startTime} to ${item.endTime}`}
    >
      {!reduce && sparkle ? (
        <motion.span
          className="cal-shift-sparkle"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.8] }}
          transition={{ duration: 0.65 }}
          aria-hidden
        >
          <Sparkles size={11} />
        </motion.span>
      ) : null}
      <div className="cal-shift-top">
        <Clock3 size={12} aria-hidden />
        <span>{item.studentName}</span>
      </div>
      <div className="cal-shift-time">
        {toDisplayTime(item.startTime)} – {toDisplayTime(item.endTime)}
      </div>
      <div className="cal-shift-room">
        <BookOpen size={10} aria-hidden /> {item.appointmentType}
      </div>
      <div className="cal-shift-room">{item.calendarName}</div>
      <div className="cal-shift-foot">
        <span className={`cal-shift-status ${item.status === 'Confirmed' ? 'confirmed' : 'pending'}`}>
          {item.status}
        </span>
      </div>
    </motion.button>
  );
});

export const AppointmentCalendar = memo(function AppointmentCalendar({
  weekStart,
  onWeekChange,
  items,
  onOpen,
}: Props) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const todayIso = toISODate(new Date());
  const weekStartIso = toISODate(weekStart);
  const weekEndIso = toISODate(addDays(weekStart, 6));

  const weekItems = useMemo(
    () => items.filter((a) => a.date >= weekStartIso && a.date <= weekEndIso),
    [items, weekStartIso, weekEndIso],
  );

  const staffRows = useMemo(
    () =>
      FACULTY.map((f) => ({
        id: f.id,
        name: f.name,
        department: f.department,
        initials: f.initials,
      })),
    [],
  );

  return (
    <motion.section
      className="cal-board cal-board--alive appt-cal-board"
      aria-label="Tour appointment schedule"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="cal-board-scroll">
        <div className="cal-board-grid" role="table" aria-label="Weekly tour schedule">
          <div className="cal-corner" role="columnheader">
            <span className="cal-month-badge">
              <span className="cal-month-badge-ico" aria-hidden>
                <Sparkles size={11} />
              </span>
              {monthBadge(weekStart)}
            </span>
            <CalendarNavigation weekStart={weekStart} onWeekChange={onWeekChange} />
            <button
              type="button"
              className="ui-btn ui-btn-outline appt-cal-today-btn"
              onClick={() => onWeekChange(startOfWeek(new Date()))}
            >
              Today
            </button>
          </div>

          {days.map((day, i) => {
            const iso = toISODate(day);
            const isToday = iso === todayIso;
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div
                key={iso}
                className={`cal-day-head${isToday ? ' is-today' : ''}${weekend ? ' is-weekend' : ''}`}
                role="columnheader"
              >
                {isToday ? <span className="cal-today-col-wash" aria-hidden /> : null}
                <motion.div
                  className={`cal-day-circle${isToday ? ' is-today-circle' : ''}`}
                  initial={false}
                  animate={{ opacity: 1 }}
                >
                  {day.getDate()}
                </motion.div>
                <span className="cal-day-dow">{weekdayShort(day)}</span>
              </div>
            );
          })}

          {staffRows.map((person) => (
            <FragmentRow
              key={person.id}
              person={person}
              days={days}
              todayIso={todayIso}
              items={weekItems}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
});

const FragmentRow = memo(function FragmentRow({
  person,
  days,
  todayIso,
  items,
  onOpen,
}: {
  person: { id: string; name: string; department: string; initials: string };
  days: Date[];
  todayIso: string;
  items: AppointmentRecord[];
  onOpen: (item: AppointmentRecord) => void;
}) {
  const count = items.filter((a) => a.facultyName === person.name).length;
  return (
    <>
      <div className="cal-staff-cell">
        <div className="cal-staff-card">
          <span className="cal-staff-avatar" aria-hidden>
            {person.initials}
          </span>
          <div className="cal-staff-meta">
            <h3>{person.name}</h3>
            <p>{person.department}</p>
            <div className="cal-staff-stats">
              <span>{count} tour{count === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>
      {days.map((day) => {
        const iso = toISODate(day);
        const weekend = day.getDay() === 0 || day.getDay() === 6;
        const isToday = iso === todayIso;
        const dayItems = items
          .filter((a) => a.facultyName === person.name && a.date === iso)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <div
            key={`${person.id}-${iso}`}
            className={`cal-cell${weekend ? ' is-weekend' : ''}${isToday ? ' is-today' : ''}`}
          >
            {isToday ? <span className="cal-today-glow" aria-hidden /> : null}
            <div className="cal-cell-stack">
              {dayItems.map((item, i) => (
                <ApptShiftCard key={item.id} item={item} index={i} onOpen={onOpen} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
});

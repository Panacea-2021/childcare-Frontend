'use client';

import { memo, useMemo } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import type { StudentActivity } from './types';
import { ACTIVITY_TYPE_META, ACTIVITY_TYPE_OPTIONS } from './types';
import { ActivityChip } from './ActivityChip';
import { addDays, scheduleRooms, toISODate, weekdayShort } from './mockData';

type Props = {
  weekStart: Date;
  activities: StudentActivity[];
  weekDirection: number;
  todayIso: string;
  mobileDayIndex: number;
  onMobileDayChange: (index: number) => void;
  onSelect: (activity: StudentActivity) => void;
};

function dayLabel(d: Date) {
  return {
    weekday: weekdayShort(d),
    date: `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`,
    iso: toISODate(d),
  };
}

export const StudentScheduleGrid = memo(function StudentScheduleGrid({
  weekStart,
  activities,
  weekDirection,
  todayIso,
  mobileDayIndex,
  onMobileDayChange,
  onSelect,
}: Props) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayLabel(addDays(weekStart, i))),
    [weekStart],
  );

  const byRoomDate = useMemo(() => {
    const map = new Map<string, StudentActivity[]>();
    for (const a of activities) {
      const key = `${a.room}__${a.date}`;
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [activities]);

  const mobileIso = days[mobileDayIndex]?.iso ?? days[0]?.iso;
  const mobileItems = useMemo(
    () => activities.filter((a) => a.date === mobileIso),
    [activities, mobileIso],
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="ss-legend" aria-label="Activity type legend">
          {ACTIVITY_TYPE_OPTIONS.map((t) => (
            <span key={t.id} className="ss-legend-chip">
              <span
                className="ss-legend-dot"
                style={{ background: `var(--ss-${ACTIVITY_TYPE_META[t.id].tone})` }}
                aria-hidden
              />
              {t.label}
            </span>
          ))}
        </div>

        <div className="ss-mobile-days" role="tablist" aria-label="Select day">
          {days.map((d, i) => (
            <button
              key={d.iso}
              type="button"
              role="tab"
              aria-selected={i === mobileDayIndex}
              className={`ss-mobile-day${i === mobileDayIndex ? ' is-active' : ''}${d.iso === todayIso ? ' is-today' : ''}`}
              onClick={() => onMobileDayChange(i)}
            >
              <strong>{d.weekday}</strong>
              <span>{d.date}</span>
            </button>
          ))}
        </div>

        <div className="ss-mobile-list" role="list" aria-label="Day activities">
          {mobileItems.length === 0 ? (
            <div className="ss-mobile-card">
              <div className="ss-cell-empty">No activities this day</div>
            </div>
          ) : (
            mobileItems.map((a, i) => (
              <div key={a.id} className="ss-mobile-card" role="listitem">
                <ActivityChip activity={a} index={i} onClick={onSelect} />
              </div>
            ))
          )}
        </div>

        <AnimatePresence mode="wait" custom={weekDirection}>
          <m.div
            key={toISODate(weekStart)}
            className="ss-board-wrap"
            custom={weekDirection}
            initial={{ opacity: 0, x: weekDirection >= 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: weekDirection >= 0 ? -48 : 48 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ss-board-scroll">
              <div className="ss-grid" role="grid" aria-label="Weekly student schedule">
                <div className="ss-grid-corner" role="columnheader">
                  Rooms
                </div>
                {days.map((d) => (
                  <div
                    key={d.iso}
                    className={`ss-grid-day${d.iso === todayIso ? ' is-today' : ''}`}
                    role="columnheader"
                  >
                    <strong>{d.weekday}</strong>
                    <span>{d.date}</span>
                  </div>
                ))}

                {scheduleRooms.map((room, rowIdx) => {
                  const rowClass = rowIdx % 2 === 1 ? ' ss-grid-row-alt' : '';
                  const roomCount = activities.filter((a) => a.room === room).length;
                  return (
                    <div key={room} className={`ss-grid-row${rowClass}`} style={{ display: 'contents' }}>
                      <div className="ss-grid-room" role="rowheader">
                        <strong>{room}</strong>
                        <span>
                          {roomCount} activit{roomCount === 1 ? 'y' : 'ies'}
                        </span>
                      </div>
                      {days.map((d) => {
                        const items = byRoomDate.get(`${room}__${d.iso}`) ?? [];
                        return (
                          <div
                            key={`${room}-${d.iso}`}
                            className={`ss-grid-cell${d.iso === todayIso ? ' is-today' : ''}`}
                            role="gridcell"
                            aria-label={`${room}, ${d.weekday}`}
                          >
                            {items.length === 0 ? (
                              <div className="ss-cell-empty">Free</div>
                            ) : (
                              items.map((a, i) => (
                                <ActivityChip key={a.id} activity={a} index={i} onClick={onSelect} />
                              ))
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </m.div>
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
});

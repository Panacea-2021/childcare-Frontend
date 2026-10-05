'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ChevronRight, Clock3, MapPin } from 'lucide-react';
import type { ParentCalendarEvent } from './types';
import { CATEGORY_TONE } from './types';
import { formatDisplayDate, formatTimeRange, groupEventsByDate } from './mockData';
import { ParentCategoryIcon } from './ParentCategoryIcon';

type Props = {
  events: ParentCalendarEvent[];
  onEventClick: (event: ParentCalendarEvent) => void;
};

export function ParentCalendarList({ events, onEventClick }: Props) {
  const groups = groupEventsByDate(events);
  let stagger = 0;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="pc-list-panel"
          aria-label="School events list"
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {groups.map((group) => (
            <div key={group.date} className="pc-list-group">
              <h3 className="pc-list-date">
                <span className="pc-list-date-badge">{formatDisplayDate(group.date)}</span>
              </h3>
              <ul className="pc-list-items">
                {group.events.map((ev) => {
                  const tone = CATEGORY_TONE[ev.category];
                  const delay = Math.min(stagger * 0.035, 0.28);
                  stagger += 1;
                  return (
                    <m.li
                      key={ev.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.24 }}
                    >
                      <button
                        type="button"
                        className={`pc-list-card pc-list-card--${tone}`}
                        onClick={() => onEventClick(ev)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEventClick(ev);
                          }
                        }}
                      >
                        <ParentCategoryIcon category={ev.category} size={14} />
                        <span className="pc-list-body">
                          <span className="pc-list-title-row">
                            <span className="pc-list-title">{ev.title}</span>
                            <span className={`pc-cat-badge pc-cat-badge--${tone}`}>
                              {ev.category}
                            </span>
                          </span>
                          <span className="pc-list-meta">
                            <span className="pc-list-time">
                              <Clock3 size={12} aria-hidden />
                              {formatTimeRange(ev.startTime, ev.endTime)}
                            </span>
                            {ev.room ? (
                              <span className="pc-list-room">
                                <MapPin size={12} aria-hidden />
                                {ev.room}
                              </span>
                            ) : null}
                          </span>
                          {ev.description ? (
                            <span className="pc-list-desc">{ev.description}</span>
                          ) : null}
                        </span>
                        <span className="pc-list-action" aria-hidden>
                          View
                          <ChevronRight size={14} />
                        </span>
                      </button>
                    </m.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}

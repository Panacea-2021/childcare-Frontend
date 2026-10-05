'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { SchoolEvent } from './types';
import { formatDisplayDate, formatTimeRange } from './mockData';
import { CategoryBadge, EventCover } from './EventCover';

type Props = {
  events: SchoolEvent[];
  onView: (event: SchoolEvent) => void;
  onEdit: (event: SchoolEvent) => void;
  onDelete: (event: SchoolEvent) => void;
};

export function SchoolEventList({ events, onView, onEdit, onDelete }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="sc-table-card"
          aria-label="School events list"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sc-table-scroll">
            <table className="sc-table">
              <thead>
                <tr>
                  <th scope="col">Cover</th>
                  <th scope="col">Event Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Classrooms</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Time</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <m.tr
                    key={ev.id}
                    className="sc-row"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    whileHover={{ y: -1 }}
                  >
                    <td>
                      <EventCover event={ev} size="sm" className="sc-table-cover" />
                    </td>
                    <td>
                      <button type="button" className="sc-table-name" onClick={() => onView(ev)}>
                        {ev.name}
                      </button>
                    </td>
                    <td>
                      <CategoryBadge category={ev.category} />
                    </td>
                    <td>
                      <div className="sc-chip-row">
                        {ev.classrooms.slice(0, 2).map((c) => (
                          <span key={c} className="sc-room-chip">
                            {c}
                          </span>
                        ))}
                        {ev.classrooms.length > 2 ? (
                          <span className="sc-room-chip sc-room-chip--more">
                            +{ev.classrooms.length - 2}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{formatDisplayDate(ev.startDate)}</td>
                    <td>{formatDisplayDate(ev.endDate)}</td>
                    <td>{formatTimeRange(ev.startTime, ev.endTime)}</td>
                    <td>
                      <span className={`sc-status sc-status--${ev.status}`}>{ev.status}</span>
                    </td>
                    <td>
                      <div className="sc-actions" role="group" aria-label={`Actions for ${ev.name}`}>
                        <button
                          type="button"
                          className="sc-action-btn"
                          aria-label={`View ${ev.name}`}
                          title="View"
                          onClick={() => onView(ev)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="sc-action-btn"
                          aria-label={`Edit ${ev.name}`}
                          title="Edit"
                          onClick={() => onEdit(ev)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="sc-action-btn sc-action-btn--danger"
                          aria-label={`Delete ${ev.name}`}
                          title="Delete"
                          onClick={() => onDelete(ev)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </m.tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}

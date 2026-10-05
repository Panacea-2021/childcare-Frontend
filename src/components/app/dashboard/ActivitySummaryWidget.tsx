'use client';

import { useState } from 'react';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import type { ActivitySummary, AttendanceScope } from './types';
import { Reveal } from './Reveal';

type Props = {
  data: ActivitySummary;
};

const ROWS: { key: keyof ActivitySummary; label: string; icon: string; tone: string }[] = [
  { key: 'incidents', label: 'Incidents', icon: '❗', tone: 'danger' },
  { key: 'photos', label: 'Photos', icon: '🖼️', tone: 'warning' },
  { key: 'videos', label: 'Videos', icon: '▶️', tone: 'info' },
  { key: 'announcements', label: 'Announcements', icon: '📢', tone: 'blush' },
  { key: 'approvalPending', label: 'Approval Pending', icon: '✅', tone: 'success' },
];

export function ActivitySummaryWidget({ data }: Props) {
  const [scope, setScope] = useState<AttendanceScope>('center');
  const { rooms } = useCenterCatalog();
  const total =
    data.incidents + data.photos + data.videos + data.announcements + data.approvalPending;

  return (
    <Reveal as="article" className="dash-widget" delayMs={50}>
      <div className="dash-widgetHead dash-widgetHeadStack">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            📋
          </span>
          Daily Activities
        </h3>
        <div className="dash-activityControls">
          <div className="dash-toggle dash-toggleSm" role="group" aria-label="Activity scope">
            <button
              type="button"
              className={scope === 'center' ? 'dash-toggleActive' : ''}
              aria-pressed={scope === 'center'}
              onClick={() => setScope('center')}
            >
              Center
            </button>
            <button
              type="button"
              className={scope === 'class' ? 'dash-toggleActive' : ''}
              aria-pressed={scope === 'class'}
              onClick={() => setScope('class')}
            >
              Class
            </button>
          </div>
          <select
            className="ui-select dash-classroomSelect"
            disabled={scope === 'center'}
            aria-label="Classroom"
            defaultValue=""
          >
            <option value="" disabled>
              Classroom
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dash-totalPosts">
        <p>Total Posts</p>
        <strong className="dash-metricPulse">{total}</strong>
      </div>

      <ul className="dash-activityList">
        {ROWS.map((row) => (
          <li key={row.key} className={`dash-activityItem dash-tone-${row.tone}`}>
            <span className="dash-activityIcon" aria-hidden>
              {row.icon}
            </span>
            <span className="dash-activityLabel">{row.label}</span>
            <strong>{data[row.key]}</strong>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

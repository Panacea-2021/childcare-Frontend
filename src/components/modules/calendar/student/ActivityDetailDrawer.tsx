'use client';

import { memo } from 'react';
import { CalendarDays, Clock3, DoorOpen, StickyNote, Users } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import type { StudentActivity } from './types';
import { ACTIVITY_TYPE_META } from './types';
import { formatDuration, staffNames, toDisplayTime } from './mockData';

type Props = {
  open: boolean;
  activity: StudentActivity | null;
  onClose: () => void;
  onEdit: (activity: StudentActivity) => void;
  onDelete: (activity: StudentActivity) => void;
};

export const ActivityDetailDrawer = memo(function ActivityDetailDrawer({
  open,
  activity,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const meta = activity ? ACTIVITY_TYPE_META[activity.type] : null;

  return (
    <Drawer
      open={open && !!activity}
      title={activity?.title ?? 'Activity'}
      subtitle="Activity details"
      onClose={onClose}
      plainHeader
      footer={
        activity ? (
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => onDelete(activity)}
            >
              Delete
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => onEdit(activity)}
            >
              Edit
            </button>
          </>
        ) : null
      }
    >
      {activity && meta ? (
        <div className="ss-detail">
          <span className={`ss-detail-badge ss-chip--${meta.tone}`}>{meta.label}</span>

          <div className="ss-detail-grid">
            <div className="ss-detail-item">
              <span>
                <CalendarDays size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
                Date
              </span>
              <strong>{activity.date}</strong>
            </div>
            <div className="ss-detail-item">
              <span>
                <Clock3 size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
                Time
              </span>
              <strong>
                {toDisplayTime(activity.startTime)} – {toDisplayTime(activity.endTime)}
              </strong>
            </div>
            <div className="ss-detail-item">
              <span>Duration</span>
              <strong>{formatDuration(activity.durationMinutes)}</strong>
            </div>
            <div className="ss-detail-item">
              <span>
                <DoorOpen size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
                Room
              </span>
              <strong>{activity.room}</strong>
            </div>
            <div className="ss-detail-item" style={{ gridColumn: '1 / -1' }}>
              <span>
                <Users size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
                Assigned Staff
              </span>
              <strong>{staffNames(activity.staffIds) || 'Unassigned'}</strong>
            </div>
          </div>

          <div className="ss-detail-notes">
            <span>
              <StickyNote size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
              Notes
            </span>
            <p>{activity.notes?.trim() || 'No notes for this activity.'}</p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
});

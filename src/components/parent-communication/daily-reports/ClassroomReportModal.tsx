'use client';

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/modules/enquiries/SearchableSelect';
import type { RoomDailyReport } from '@/types/dailyReport';
import { DAILY_REPORT_ROOMS } from '@/lib/mock/mockDailyReports';

type Props = {
  open: boolean;
  reports: RoomDailyReport[];
  onClose: () => void;
  onSend: (room: string, reportIds: string[]) => void;
};

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'app', label: 'App Notification' },
] as const;

export function ClassroomReportModal({ open, reports, onClose, onSend }: Props) {
  const [room, setRoom] = useState(() => DAILY_REPORT_ROOMS[0]?.name ?? '');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'app'>('whatsapp');

  const roomOptions = useMemo(
    () => DAILY_REPORT_ROOMS.map((r) => ({ value: r.name, label: r.name })),
    [],
  );

  const roomReports = useMemo(
    () => reports.filter((r) => r.room === room),
    [reports, room],
  );

  return (
    <Modal
      open={open}
      title="Send Classroom Report"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={roomReports.length === 0}
            onClick={() => onSend(room, roomReports.map((r) => r.id))}
          >
            <Send size={16} />
            Send to Parents
          </button>
        </>
      }
    >
      <div className="ui-grid-2 dr-modal-fields">
        <div className="ui-field">
          <label className="ui-label" htmlFor="dr-classroom-room">
            Select Room
          </label>
          <SearchableSelect
            id="dr-classroom-room"
            value={room}
            onChange={setRoom}
            options={roomOptions}
            placeholder="Select room…"
            searchable
          />
        </div>
        <div className="ui-field">
          <label className="ui-label" htmlFor="dr-classroom-channel">
            Channel
          </label>
          <SearchableSelect
            id="dr-classroom-channel"
            value={channel}
            onChange={(value) => setChannel(value as typeof channel)}
            options={[...CHANNEL_OPTIONS]}
            placeholder="Select channel…"
          />
        </div>
      </div>

      <p className="dr-section-label" style={{ marginTop: 16 }}>
        Preview ({roomReports.length} room report{roomReports.length === 1 ? '' : 's'})
      </p>
      <div className="dr-class-list">
        {roomReports.length === 0 ? (
          <div className="dr-timeline-card">No report found for this room.</div>
        ) : (
          roomReports.map((r) => (
            <div key={r.id} className="dr-class-row">
              <span className="dr-avatar dr-room-avatar">
                {r.room
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <div style={{ flex: 1 }}>
                <div className="dr-student-name">{r.room}</div>
                <div className="dr-student-meta">
                  {r.presentCount}/{r.studentCount} present · {r.completionPercent}% complete
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

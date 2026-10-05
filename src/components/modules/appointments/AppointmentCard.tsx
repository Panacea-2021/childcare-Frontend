'use client';

import { memo } from 'react';
import type { AppointmentRecord, AppointmentTask } from '@/lib/appointments/types';
import { initialsOf } from '@/lib/appointments/mockData';
import { LeadCard } from '@/components/modules/enquiries/board/enquiry-card';
import { EnquiryActions } from '@/components/modules/enquiries/board/enquiry-actions';
import '@/components/modules/enquiries/enquiries.css';

type Props = {
  item: AppointmentRecord;
  tasks?: AppointmentTask[];
  onOpen: (item: AppointmentRecord) => void;
  onTask: (item: AppointmentRecord) => void;
  onContextMenu?: (e: React.MouseEvent, item: AppointmentRecord) => void;
};

function formatDisplayDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function nextFollowUp(item: AppointmentRecord, tasks?: AppointmentTask[]) {
  const open = (tasks ?? [])
    .filter((t) => t.appointmentId === item.id && t.status === 'Open' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (open[0]?.dueDate) return formatDisplayDate(open[0].dueDate);
  return '—';
}

function statusAccent(status: AppointmentRecord['status']) {
  switch (status) {
    case 'Completed':
      return '#16a34a';
    case 'Cancelled':
    case 'No Show':
      return '#dc2626';
    case 'Confirmed':
      return '#2563eb';
    default:
      return 'var(--color-accent)';
  }
}

export const AppointmentCard = memo(function AppointmentCard({
  item,
  tasks,
  onOpen,
  onTask,
  onContextMenu,
}: Props) {
  return (
    <div
      className="appt-lead-card-wrap"
      onContextMenu={(e) => onContextMenu?.(e, item)}
    >
      <LeadCard
        accentColor={statusAccent(item.status)}
        displayName={item.parentName || item.studentName}
        avatarText={initialsOf(item.parentName || item.studentName)}
        dateLabel={formatDisplayDate(item.date)}
        timeLabel={`${item.startTime} – ${item.endTime}`}
        email={item.parentEmail}
        phone={item.parentPhone}
        infoRows={[
          {
            label: 'Assigned Faculty',
            value: item.facultyName || '—',
          },
          {
            label: 'Appointment Status',
            value: (
              <span className={`appt-badge appt-badge-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.status}
              </span>
            ),
          },
          {
            label: 'Next Follow-up',
            value: nextFollowUp(item, tasks),
          },
        ]}
        actions={
          <EnquiryActions
            variant="appointment"
            onAppointment={() => onOpen(item)}
            onTask={() => onTask(item)}
          />
        }
      />
    </div>
  );
});

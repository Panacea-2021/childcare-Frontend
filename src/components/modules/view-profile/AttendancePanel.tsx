'use client';

import { useMemo, useState } from 'react';
import { CalendarOff, CheckCircle2, Percent, Plane } from 'lucide-react';
import { PillDatePicker } from '@/components/modules/view-profile/PillDatePicker';
import {
  ProfileTablePagination,
  useClientPagination,
} from '@/components/modules/center-management/ui';
import '@/components/ui/module.css';
import './attendance-panel.css';

type AttendanceRow = {
  id: string;
  room: string;
  date: string; // DD-MM-YYYY
  checkIn: string;
  checkOut: string;
  absent: boolean;
  leave: boolean;
  leaveReason: string;
};

/** Static sample attendance records */
const STATIC_ROWS: AttendanceRow[] = [
  {
    id: '1',
    room: 'Sunshine Room',
    date: '03-08-2026',
    checkIn: '08:45 AM',
    checkOut: '05:10 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '2',
    room: 'Sunshine Room',
    date: '04-08-2026',
    checkIn: '08:52 AM',
    checkOut: '05:05 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '3',
    room: 'Rainbow Room',
    date: '05-08-2026',
    checkIn: '—',
    checkOut: '—',
    absent: true,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '4',
    room: 'Sunshine Room',
    date: '06-08-2026',
    checkIn: '—',
    checkOut: '—',
    absent: false,
    leave: true,
    leaveReason: 'Medical appointment',
  },
  {
    id: '5',
    room: 'Sunshine Room',
    date: '07-08-2026',
    checkIn: '09:05 AM',
    checkOut: '04:55 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '6',
    room: 'Rainbow Room',
    date: '10-08-2026',
    checkIn: '08:40 AM',
    checkOut: '05:20 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '7',
    room: 'Sunshine Room',
    date: '11-08-2026',
    checkIn: '—',
    checkOut: '—',
    absent: false,
    leave: true,
    leaveReason: 'Family emergency',
  },
  {
    id: '8',
    room: 'Sunshine Room',
    date: '12-08-2026',
    checkIn: '08:48 AM',
    checkOut: '05:00 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '9',
    room: 'Rainbow Room',
    date: '14-07-2026',
    checkIn: '08:55 AM',
    checkOut: '05:15 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '10',
    room: 'Sunshine Room',
    date: '15-07-2026',
    checkIn: '—',
    checkOut: '—',
    absent: true,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '11',
    room: 'Sunshine Room',
    date: '16-07-2026',
    checkIn: '08:50 AM',
    checkOut: '05:05 PM',
    absent: false,
    leave: false,
    leaveReason: '—',
  },
  {
    id: '12',
    room: 'Rainbow Room',
    date: '18-07-2026',
    checkIn: '—',
    checkOut: '—',
    absent: false,
    leave: true,
    leaveReason: 'Personal leave',
  },
];

function monthKeyFromDate(date: string) {
  const [dd, mm, yyyy] = date.split('-');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}`;
}

export function AttendancePanel() {
  const [month, setMonth] = useState('2026-08');

  const rows = useMemo(
    () => STATIC_ROWS.filter((row) => monthKeyFromDate(row.date) === month),
    [month],
  );

  const stats = useMemo(() => {
    const present = rows.filter((r) => !r.absent && !r.leave).length;
    const absent = rows.filter((r) => r.absent).length;
    const leaves = rows.filter((r) => r.leave).length;
    const total = rows.length;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { present, absent, leaves, pct };
  }, [rows]);

  const { page, setPage, pageSize, setPageSize, totalItems, pageItems } = useClientPagination(rows, 10);

  return (
    <section className="att-panel" aria-label="Attendance">
      <div className="att-toolbar">
        <PillDatePicker
          mode="month"
          value={month}
          onChange={setMonth}
          ariaLabel="Select attendance month"
        />
      </div>

      <div className="mod-stats att-stats">
        <article className="mod-stat">
          <div className="mod-statIcon lavender" aria-hidden>
            <Percent size={20} />
          </div>
          <div>
            <p>Attendance %</p>
            <strong>{stats.pct}%</strong>
          </div>
        </article>
        <article className="mod-stat">
          <div className="mod-statIcon mint" aria-hidden>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p>Days Present</p>
            <strong>{stats.present}</strong>
          </div>
        </article>
        <article className="mod-stat">
          <div className="mod-statIcon blush" aria-hidden>
            <CalendarOff size={20} />
          </div>
          <div>
            <p>Days Absent</p>
            <strong>{stats.absent}</strong>
          </div>
        </article>
        <article className="mod-stat">
          <div className="mod-statIcon beige" aria-hidden>
            <Plane size={20} />
          </div>
          <div>
            <p>Leave Count</p>
            <strong>{stats.leaves}</strong>
          </div>
        </article>
      </div>

      <div className="att-tableCard">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Leave Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="att-empty">No Attendance Record Found</div>
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.id}>
                    <td>{row.room}</td>
                    <td>{row.date}</td>
                    <td>{row.checkIn}</td>
                    <td>{row.checkOut}</td>
                    <td>
                      <span className={`att-badge ${row.absent ? 'att-badge--yes' : 'att-badge--no'}`}>
                        {row.absent ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`att-badge ${row.leave ? 'att-badge--leave' : 'att-badge--no'}`}>
                        {row.leave ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className="att-reason">{row.leaveReason}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 ? (
          <ProfileTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Plane,
  XCircle,
} from 'lucide-react';
import CountUp from 'react-countup';
import type { Student } from '@/lib/center-management/types';
import { MonthPicker, ProfileTablePagination, useClientPagination } from '@/components/modules/center-management/ui';
import { ParentEmptyState } from '../shared';
import '../shared/parent-shared.css';
import './parent-attendance.css';

/** Parent-facing attendance view — same student data as admin AttendanceTab. */
export function ParentAttendanceTab({ student }: { student: Student }) {
  const [month, setMonth] = useState({ year: 2026, month: 7 });
  const records = student.attendanceRecords ?? [];
  const present = records.filter((r) => !r.markedAbsent && !r.leave).length;
  const absent = records.filter((r) => r.markedAbsent).length;
  const leaves = records.filter((r) => r.leave).length;
  const late = records.filter((r) => {
    if (r.markedAbsent || r.leave || !r.checkIn) return false;
    const [hh, mm] = r.checkIn.split(':').map(Number);
    return Number.isFinite(hh) && (hh > 9 || (hh === 9 && (mm ?? 0) > 0));
  }).length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 0;

  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(records, 30, `${month.year}-${month.month}`);

  const monthDays = useMemo(() => {
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
    const startDow = new Date(month.year, month.month, 1).getDay();
    const cells: Array<{ day: number | null; tone: string; label: string }> = [];
    for (let i = 0; i < startDow; i++) cells.push({ day: null, tone: '', label: '' });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${String(d).padStart(2, '0')}/${String(month.month + 1).padStart(2, '0')}/${month.year}`;
      const rec = records.find((r) => r.date.includes(String(d)) || r.date === key);
      let tone = 'none';
      let label = 'No record';
      if (rec) {
        if (rec.leave) {
          tone = 'leave';
          label = 'Leave';
        } else if (rec.markedAbsent) {
          tone = 'absent';
          label = 'Absent';
        } else {
          const isLate = (() => {
            if (!rec.checkIn) return false;
            const [hh, mm] = rec.checkIn.split(':').map(Number);
            return Number.isFinite(hh) && (hh > 9 || (hh === 9 && (mm ?? 0) > 0));
          })();
          tone = isLate ? 'late' : 'present';
          label = isLate ? `Late · ${rec.checkIn}` : `Present · ${rec.checkIn || '—'}`;
        }
      }
      cells.push({ day: d, tone, label });
    }
    return cells;
  }, [month, records]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="pat-page">
          <m.div
            className="psh-stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <article className="psh-stat psh-stat--accent">
              <span className="psh-stat-icon" aria-hidden>
                <CircleDashed size={18} />
              </span>
              <div className="psh-stat-body">
                <span className="psh-stat-label">Overall</span>
                <span className="psh-stat-value">
                  <CountUp end={pct} duration={0.9} />%
                </span>
                <span className="psh-stat-hint">Attendance rate</span>
              </div>
            </article>
            <article className="psh-stat psh-stat--success">
              <span className="psh-stat-icon" aria-hidden>
                <CheckCircle2 size={18} />
              </span>
              <div className="psh-stat-body">
                <span className="psh-stat-label">Present</span>
                <span className="psh-stat-value">
                  <CountUp end={present} duration={0.8} />
                </span>
                <span className="psh-stat-hint">Days present</span>
              </div>
            </article>
            <article className="psh-stat psh-stat--danger">
              <span className="psh-stat-icon" aria-hidden>
                <XCircle size={18} />
              </span>
              <div className="psh-stat-body">
                <span className="psh-stat-label">Absent</span>
                <span className="psh-stat-value">
                  <CountUp end={absent} duration={0.8} />
                </span>
                <span className="psh-stat-hint">Days absent</span>
              </div>
            </article>
            <article className="psh-stat psh-stat--pending">
              <span className="psh-stat-icon" aria-hidden>
                <Plane size={18} />
              </span>
              <div className="psh-stat-body">
                <span className="psh-stat-label">Leave</span>
                <span className="psh-stat-value">
                  <CountUp end={leaves} duration={0.8} />
                </span>
                <span className="psh-stat-hint">Approved leave · {late} late</span>
              </div>
            </article>
          </m.div>

          <div className="pat-progress" aria-hidden>
            <div className="pat-progress-bar">
              <span className="pat-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="pat-progress-label">{pct}% attendance this period</p>
          </div>

          <section className="psh-surface pat-cal-card">
            <div className="pat-card-head">
              <div className="pat-card-title">
                <CalendarDays size={16} aria-hidden />
                <strong>Attendance calendar</strong>
              </div>
              <MonthPicker value={month} onChange={setMonth} />
            </div>
            <div className="pat-legend">
              <span className="pat-leg pat-leg--present">Present</span>
              <span className="pat-leg pat-leg--late">Late</span>
              <span className="pat-leg pat-leg--absent">Absent</span>
              <span className="pat-leg pat-leg--leave">Leave</span>
            </div>
            <div className="pat-cal-grid" role="grid" aria-label="Attendance month">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="pat-cal-dow">
                  {d}
                </div>
              ))}
              {monthDays.map((cell, i) =>
                cell.day == null ? (
                  <div key={`e-${i}`} className="pat-cal-cell is-empty" />
                ) : (
                  <div
                    key={cell.day}
                    className={`pat-cal-cell is-${cell.tone}`}
                    title={cell.label}
                  >
                    <span>{cell.day}</span>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="psh-surface pat-table-card">
            <div className="pat-card-head">
              <div className="pat-card-title">
                <Clock3 size={16} aria-hidden />
                <strong>Attendance records</strong>
              </div>
            </div>
            {pageItems.length === 0 ? (
              <ParentEmptyState
                icon={<CalendarDays size={26} />}
                title="No attendance records yet"
                description="When the school marks attendance for your child, it will show up here."
              />
            ) : (
              <>
                <div className="cm-table-wrap">
                  <table className="ui-table cm-tab-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Room</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((r) => {
                        const status = r.leave
                          ? 'Leave'
                          : r.markedAbsent
                            ? 'Absent'
                            : 'Present';
                        const tone = r.leave
                          ? 'pending'
                          : r.markedAbsent
                            ? 'danger'
                            : 'success';
                        return (
                          <tr key={r.id}>
                            <td>{r.date}</td>
                            <td>{r.room}</td>
                            <td>{r.checkIn || '—'}</td>
                            <td>{r.checkOut || '—'}</td>
                            <td>
                              <span className={`psh-badge psh-badge--${tone}`}>{status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ProfileTablePagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </section>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

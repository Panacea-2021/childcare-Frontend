'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Baby, Gauge, Users, UsersRound } from 'lucide-react';
import { AttendanceLeavePageHeader } from './AttendanceLeavePageHeader';
import { AppSelect, ProfileTablePagination } from '@/components/modules/center-management/ui';
import { ROOM_OPTIONS, loadStudents } from '@/lib/center-management/studentsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import '@/components/modules/center-management/students.css';
import './student-staff-ratio.css';

const ease = [0.22, 1, 0.36, 1] as const;
/** Soft target: students per one staff (lower = better coverage) */
const TARGET_PER_STAFF = 8;

type CoverLevel = 'good' | 'watch' | 'tight' | 'empty';

type RoomRatio = {
  id: string;
  name: string;
  students: number;
  staff: number;
  perStaff: number | null;
  level: CoverLevel;
};

const LEVEL_COPY: Record<CoverLevel, { label: string; tip: string }> = {
  good: {
    label: 'Well staffed',
    tip: 'Comfortably within the care target',
  },
  watch: {
    label: 'Near limit',
    tip: 'Approaching ~8 students per staff',
  },
  tight: {
    label: 'Needs staff',
    tip: 'Above target — add coverage if possible',
  },
  empty: {
    label: 'No activity',
    tip: 'No students or staff assigned yet',
  },
};

function coverLevel(students: number, staff: number): CoverLevel {
  if (students === 0 && staff === 0) return 'empty';
  if (staff === 0) return students > 0 ? 'tight' : 'empty';
  const ratio = students / staff;
  if (ratio <= TARGET_PER_STAFF * 0.75) return 'good';
  if (ratio <= TARGET_PER_STAFF) return 'watch';
  return 'tight';
}

function formatPerStaff(students: number, staff: number) {
  if (staff <= 0) return students > 0 ? `${students} : 0` : '— : —';
  const n = students / staff;
  const rounded = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${rounded} : 1`;
}

export function StudentStaffRatioPage() {
  const [ready, setReady] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setReady(true);
  }, []);

  const rooms = useMemo(() => {
    const students = loadStudents().filter((s) => s.status === 'Active' || s.status === 'Signed up');
    const staff = loadStaff().filter((s) => s.status === 'Active');

    return ROOM_OPTIONS.filter((r) => r.status === 'Active').map((room): RoomRatio => {
      const studentCount = students.filter((s) => s.roomIds.includes(room.id)).length;
      const staffCount = staff.filter((s) => s.rooms.includes(room.name)).length;
      return {
        id: room.id,
        name: room.name,
        students: studentCount,
        staff: staffCount,
        perStaff: staffCount > 0 ? studentCount / staffCount : null,
        level: coverLevel(studentCount, staffCount),
      };
    });
  }, []);

  const roomOptions = useMemo(
    () => [{ value: 'all', label: 'All Rooms' }, ...rooms.map((r) => ({ value: r.id, label: r.name }))],
    [rooms],
  );

  const totals = useMemo(() => {
    const students = rooms.reduce((n, r) => n + r.students, 0);
    const staff = rooms.reduce((n, r) => n + r.staff, 0);
    return {
      students,
      staff,
      perStaffLabel: formatPerStaff(students, staff),
    };
  }, [rooms]);

  const filtered = useMemo(() => {
    if (roomFilter === 'all') return rooms;
    return rooms.filter((r) => r.id === roomFilter);
  }, [rooms, roomFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    return filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [roomFilter, pageSize]);

  const covered = rooms.filter((r) => r.students > 0 || r.staff > 0).length;

  if (!ready) {
    return (
      <div className="ssr-root">
        <div className="ssr-skel">
          <span className="ssr-skel-hero" />
          <div className="ssr-skel-stats">
            <span />
            <span />
            <span />
          </div>
          <div className="ssr-skel-grid">
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="ssr-root"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <AttendanceLeavePageHeader
        title="Student To Staff Ratio"
        description={`Compare students and staff in each room. Soft care target is about ${TARGET_PER_STAFF} students per staff member.`}
        icon={<Gauge />}
        actions={
          <div className="ssr-hero-chip">
            <Gauge size={18} />
            <div>
              <strong>{covered}</strong>
              <em>rooms active</em>
            </div>
          </div>
        }
      />

      <div className="ssr-stats">
        {(
          [
            {
              id: 'students',
              label: 'Total Students',
              value: String(totals.students),
              hint: 'Active & signed up',
              icon: <Baby size={20} />,
              tone: 'students',
            },
            {
              id: 'staff',
              label: 'Total Staff',
              value: String(totals.staff),
              hint: 'Assigned to rooms',
              icon: <Users size={20} />,
              tone: 'staff',
            },
            {
              id: 'ratio',
              label: 'Total Student Per Staff',
              value: totals.perStaffLabel,
              hint: totals.staff ? 'Center-wide average' : 'Add staff to rooms',
              icon: <UsersRound size={20} />,
              tone: 'ratio',
            },
          ] as const
        ).map((card, i) => (
          <motion.article
            key={card.id}
            className={`ssr-stat ssr-stat-${card.tone}`}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.07, duration: 0.38, ease }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <span className="ssr-stat-ico">{card.icon}</span>
            <div className="ssr-stat-body">
              <em>{card.label}</em>
              <strong>{card.value}</strong>
              <span>{card.hint}</span>
            </div>
            <span className="ssr-stat-glow" aria-hidden />
          </motion.article>
        ))}
      </div>

      <div className="ssr-toolbar">
        <div className="ssr-toolbar-left">
          <label className="ui-label ssr-filter-label">Rooms</label>
          <AppSelect
            value={roomFilter}
            onChange={(v) => {
              setRoomFilter(v);
              setPage(1);
            }}
            options={roomOptions}
            className="ssr-room-dd"
            triggerClassName="ssr-room-dd-trigger"
          />
        </div>
        <p className="ssr-legend" title={`Based on ~${TARGET_PER_STAFF} students per staff`}>
          <span className="is-good" /> Well staffed
          <span className="is-watch" /> Near limit
          <span className="is-tight" /> Needs staff
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="ssr-empty">No rooms match this filter.</div>
      ) : (
        <div className="ssr-table-card">
      <div className="ssr-list">
        <AnimatePresence mode="popLayout">
          {pageRows.map((room, i) => {
            const copy = LEVEL_COPY[room.level];
            const load = room.perStaff ?? (room.students > 0 ? TARGET_PER_STAFF + 4 : 0);
            const pct = Math.min(100, Math.round((load / (TARGET_PER_STAFF + 4)) * 100));
            return (
              <motion.article
                key={room.id}
                className={`ssr-banner is-${room.level}`}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.35, ease }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
              >
                <div className="ssr-banner-ratio">
                  <em>Students per staff</em>
                  <strong>{formatPerStaff(room.students, room.staff)}</strong>
                  <span className={`ssr-level is-${room.level}`}>{copy.label}</span>
                  <small>{copy.tip}</small>
                  <div className="ssr-meter" aria-hidden>
                    <motion.span
                      className={`ssr-meter-fill is-${room.level}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease, delay: 0.12 }}
                    />
                  </div>
                </div>

                <div className="ssr-banner-main">
                  <div className="ssr-banner-head">
                    <h3>{room.name}</h3>
                    <span className="ssr-room-tag">Room coverage</span>
                  </div>

                  <div className="ssr-split">
                    <div className="ssr-split-col is-students">
                      <Baby size={18} />
                      <div>
                        <strong>
                          <motion.span
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.03 }}
                          >
                            {room.students}
                          </motion.span>
                        </strong>
                        <em>Students</em>
                      </div>
                    </div>
                    <div className="ssr-split-divider" aria-hidden />
                    <div className="ssr-split-col is-staff">
                      <Users size={18} />
                      <div>
                        <strong>
                          <motion.span
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.03 }}
                          >
                            {room.staff}
                          </motion.span>
                        </strong>
                        <em>Staff</em>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <ProfileTablePagination
        page={safePage}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      </div>
      )}
    </motion.div>
  );
}

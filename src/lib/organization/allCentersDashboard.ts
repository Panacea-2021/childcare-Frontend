import { DASHBOARD_DATA } from '@/data/dashboard';
import type { AttendanceSnapshot, DashboardBundle, RoomRecord } from '@/data/dashboard.types';
import { CENTER_STATS, DEMO_ORGANIZATION, getOrgRollupStats } from './centers';

function scale(n: number, factor: number) {
  return Math.max(0, Math.round(n * factor));
}

function scaleAttendance(snap: AttendanceSnapshot, factor: number): AttendanceSnapshot {
  return {
    studentLeave: scale(snap.studentLeave, factor),
    staffLeave: scale(snap.staffLeave, factor),
    absentFrom3Days: scale(snap.absentFrom3Days, factor),
    students: {
      in: scale(snap.students.in, factor),
      out: scale(snap.students.out, factor),
      absent: scale(snap.students.absent, factor),
      pending: scale(snap.students.pending, factor),
    },
    staff: {
      in: scale(snap.staff.in, factor),
      out: scale(snap.staff.out, factor),
      absent: scale(snap.staff.absent, factor),
      pending: scale(snap.staff.pending, factor),
    },
  };
}

/** Build full dashboard bundle aggregated across all org centers (same widgets as a single center). */
export function buildAllCentersDashboard(): DashboardBundle {
  const base = DASHBOARD_DATA;
  const rollup = getOrgRollupStats();
  const hams = CENTER_STATS.find((s) => s.centerId === 'ctr-hams');
  const studentFactor = hams?.students ? rollup.students / hams.students : DEMO_ORGANIZATION.centers.length;
  const staffFactor = hams?.staff ? rollup.staff / hams.staff : DEMO_ORGANIZATION.centers.length;
  const roomFactor = hams?.rooms ? rollup.rooms / hams.rooms : DEMO_ORGANIZATION.centers.length;
  const avgFactor = (studentFactor + staffFactor) / 2;

  const rooms: RoomRecord[] = DEMO_ORGANIZATION.centers.flatMap((center, cIdx) =>
    base.rooms.map((room, rIdx) => {
      const students = scale(room.students, 0.85 + (cIdx % 3) * 0.12);
      const staff = Math.max(1, scale(room.staff, 0.9 + (rIdx % 2) * 0.1));
      const capacity = Math.max(students, scale(room.capacity, 1));
      const occupancyPct = Math.min(100, Math.round((students / capacity) * 100));
      return {
        ...room,
        id: `${center.id}-${room.id}`,
        name: `${room.name} · ${center.shortName}`,
        students,
        staff,
        capacity,
        occupancyPct,
        status: occupancyPct >= 90 ? 'full' : occupancyPct <= 45 ? 'quiet' : 'active',
      };
    }),
  );

  const ratio =
    rollup.staff === 0 ? '—' : `${(rollup.students / rollup.staff).toFixed(1)}:1`;

  return {
    ...base,
    kpis: [
      { id: 'rooms', label: 'Rooms', value: rollup.rooms, animateNumber: rollup.rooms, icon: '📘', tone: 'pink' },
      { id: 'staff', label: 'Staff', value: rollup.staff, animateNumber: rollup.staff, icon: '👥', tone: 'purple' },
      {
        id: 'students',
        label: 'Students',
        value: rollup.students,
        animateNumber: rollup.students,
        icon: '🧒',
        tone: 'green',
      },
      { id: 'ratio', label: 'Student/Staff', value: ratio, tone: 'coral', icon: '🔎' },
    ],
    attendance: {
      center: scaleAttendance(base.attendance.center, studentFactor),
      class: scaleAttendance(base.attendance.class, studentFactor * 0.35),
    },
    rooms,
    staff: DEMO_ORGANIZATION.centers.flatMap((center, i) =>
      base.staff.slice(0, 4).map((s, j) => ({
        ...s,
        id: `${center.id}-${s.id}`,
        name: s.name,
        room: `${s.room} · ${center.shortName}`,
        initials: s.initials,
        status: j === 1 && i === 1 ? 'On Leave' : s.status,
      })),
    ),
    students: DEMO_ORGANIZATION.centers.flatMap((center) =>
      base.students.slice(0, 4).map((s) => ({
        ...s,
        id: `${center.id}-${s.id}`,
        room: `${s.room} · ${center.shortName}`,
      })),
    ),
    activity: {
      incidents: scale(base.activity.incidents, avgFactor),
      photos: scale(base.activity.photos, avgFactor),
      videos: scale(base.activity.videos, avgFactor),
      announcements: scale(base.activity.announcements, avgFactor),
      approvalPending: scale(base.activity.approvalPending, avgFactor),
    },
    parentCommunication: {
      concernsPending: scale(base.parentCommunication.concernsPending, avgFactor),
      concernsReportedToday: scale(base.parentCommunication.concernsReportedToday, avgFactor),
      notesPending: scale(base.parentCommunication.notesPending, avgFactor),
      notesCreatedToday: scale(base.parentCommunication.notesCreatedToday, avgFactor),
      leavesPending: scale(base.parentCommunication.leavesPending, avgFactor),
      leavesOutToday: scale(base.parentCommunication.leavesOutToday, avgFactor),
    },
    enquiries: {
      ...base.enquiries,
      newEnquiries: scale(base.enquiries.newEnquiries, avgFactor),
      totalAdmissions: scale(base.enquiries.totalAdmissions, avgFactor),
      followupOverdue: scale(base.enquiries.followupOverdue, avgFactor),
      periodLabel: 'All Centers · This Month',
    },
    billing: {
      ...base.billing,
      totalBilled: scale(base.billing.totalBilled, avgFactor),
      totalCollected: scale(base.billing.totalCollected, avgFactor),
      periodLabel: 'All Centers · This Month',
      ageing: base.billing.ageing.map((a) => ({ ...a, value: scale(a.value, avgFactor) })),
    },
    installations: {
      parentsInstalled: scale(base.installations.parentsInstalled, studentFactor),
      parentsNotInstalled: scale(base.installations.parentsNotInstalled, studentFactor),
      staffInstalled: scale(base.installations.staffInstalled, staffFactor),
      staffNotInstalled: scale(base.installations.staffNotInstalled, staffFactor),
    },
    weeklyAttendance: base.weeklyAttendance.map((d) => ({
      day: d.day,
      present: scale(d.present, studentFactor),
      absent: scale(d.absent, studentFactor),
    })),
    ageGroups: base.ageGroups.map((g) => ({ ...g, count: scale(g.count, studentFactor) })),
    recentActivities: [
      {
        id: 'org-sync',
        title: 'Cross-center attendance synced',
        meta: `${DEMO_ORGANIZATION.centers.length} centers · Org rollup`,
        time: '5m ago',
        tone: 'success',
      },
      ...base.recentActivities.map((a, i) => ({
        ...a,
        id: `org-act-${a.id}`,
        meta: `${a.meta} · ${DEMO_ORGANIZATION.centers[i % DEMO_ORGANIZATION.centers.length]!.shortName}`,
      })),
    ],
    announcements: base.announcements.map((a) => ({
      ...a,
      id: `org-${a.id}`,
      body: `${a.body} (All centers)`,
    })),
    notifications: [
      {
        id: 'org-n0',
        title: `${rollup.enquiriesOpen} open enquiries across centers`,
        when: 'Just now',
        unread: true,
      },
      ...base.notifications.map((n) => ({ ...n, id: `org-${n.id}` })),
    ],
    upcomingBirthdays: DEMO_ORGANIZATION.centers.flatMap((center, i) =>
      base.upcomingBirthdays.slice(0, 1).map((b) => ({
        ...b,
        room: `${b.room} · ${center.shortName}`,
        when: base.upcomingBirthdays[i % base.upcomingBirthdays.length]?.when ?? b.when,
      })),
    ),
    upcomingEvents: DEMO_ORGANIZATION.centers.flatMap((center) =>
      base.upcomingEvents.slice(0, 1).map((e) => ({
        ...e,
        title: `${e.title} · ${center.shortName}`,
        room: `${e.room} · ${center.shortName}`,
      })),
    ),
    todaySummary: {
      checkIns: scale(base.todaySummary.checkIns, studentFactor),
      checkOuts: scale(base.todaySummary.checkOuts, studentFactor),
      posts: scale(base.todaySummary.posts, avgFactor),
      messages: scale(base.todaySummary.messages, avgFactor),
      utilization: Math.min(
        99,
        Math.round(
          CENTER_STATS.reduce((sum, s) => sum + (s.attendanceIn / Math.max(1, s.students)) * 100, 0) /
            CENTER_STATS.length,
        ),
      ),
    },
    ratioInsights: {
      target: '1:4',
      current: `1:${(rollup.students / Math.max(1, rollup.staff)).toFixed(1)}`,
      compliantRooms: scale(base.ratioInsights.compliantRooms, roomFactor),
      watchRooms: scale(base.ratioInsights.watchRooms, roomFactor),
      byRoom: rooms.slice(0, 8).map((r) => ({
        room: r.name,
        ratio: `1:${(r.students / Math.max(1, r.staff)).toFixed(1)}`,
        status: r.occupancyPct >= 90 ? ('watch' as const) : ('ok' as const),
      })),
    },
  };
}

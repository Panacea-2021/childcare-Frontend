'use client';

import type {
  DashboardBundle,
  RoomRecord,
  StaffRecord,
  StudentRecord,
} from '@/data/dashboard.types';
import { loadRooms } from '@/lib/center-management/roomsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import { initials, loadStudents, roomName } from '@/lib/center-management/studentsStore';

function studentRoomNames(roomIds: string[]): string {
  return roomIds.map(roomName).filter((n) => n && n !== '—').join(', ') || 'Unassigned';
}

function mapStudentStatus(status: string): StudentRecord['status'] {
  if (status === 'On Hold') return 'On Leave';
  if (status === 'Signed up' || status === 'Inactive') return 'Pending';
  return 'Active';
}

function yearsFromAgeLabel(ageLabel: string): number | null {
  const yearMatch = ageLabel.match(/(\d+)\s*y(?:ear)?/i);
  if (yearMatch) return Number(yearMatch[1]);
  return null;
}

function ageBand(ageLabel: string): string {
  const years = yearsFromAgeLabel(ageLabel);
  if (years == null) return 'Other';
  if (years < 1) return '0–1y';
  if (years < 2) return '1–2y';
  if (years < 3) return '2–3y';
  if (years < 4) return '3–4y';
  if (years < 5) return '4–5y';
  return '5y+';
}

const AGE_BANDS = ['0–1y', '1–2y', '2–3y', '3–4y', '4–5y', '5y+'] as const;

/** Overlay Center Management rooms, staff, and students onto the dashboard bundle. */
export function applyCenterManagementDashboard(base: DashboardBundle): DashboardBundle {
  const rooms = loadRooms().filter((r) => r.status !== 'Inactive');
  const staff = loadStaff().filter((s) => s.status !== 'Inactive');
  const students = loadStudents().filter(
    (s) => s.status === 'Active' || s.status === 'Signed up' || s.status === 'On Hold',
  );
  const activeStudents = students.filter((s) => s.status === 'Active');
  const pendingStudents = students.filter((s) => s.status === 'Signed up');
  const leaveStudents = students.filter((s) => s.status === 'On Hold');

  const studentsByRoomId = new Map<string, number>();
  for (const student of students) {
    for (const roomId of student.roomIds) {
      studentsByRoomId.set(roomId, (studentsByRoomId.get(roomId) ?? 0) + 1);
    }
  }

  const staffByRoomName = new Map<string, number>();
  for (const member of staff) {
    for (const room of member.rooms) {
      staffByRoomName.set(room, (staffByRoomName.get(room) ?? 0) + 1);
    }
  }

  const roomRecords: RoomRecord[] = rooms.map((room) => {
    const studentCount = studentsByRoomId.get(room.id) ?? 0;
    const staffCount = staffByRoomName.get(room.name) ?? 0;
    const capacity = Math.max(1, room.capacity || 0);
    const occupancyPct = Math.min(100, Math.round((studentCount / capacity) * 100));
    return {
      id: room.id,
      name: room.name,
      students: studentCount,
      staff: staffCount,
      capacity: room.capacity,
      ageRange: room.ageRange || '—',
      occupancyPct,
      status: occupancyPct >= 90 ? 'full' : occupancyPct <= 40 ? 'quiet' : 'active',
    };
  });

  const staffRecords: StaffRecord[] = staff.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    room: member.rooms[0] || 'Unassigned',
    status: 'Active',
    initials: initials(member.name),
  }));

  const studentRecords: StudentRecord[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    age: student.ageLabel,
    room: studentRoomNames(student.roomIds),
    status: mapStudentStatus(student.status),
    initials: initials(student.name),
  }));

  const ageGroups = AGE_BANDS.map((label) => ({
    label,
    count: students.filter((s) => ageBand(s.ageLabel) === label).length,
  }));

  const ratioValue =
    staff.length === 0 ? '—' : `${(activeStudents.length / staff.length).toFixed(1)}:1`;
  const currentInsight =
    staff.length === 0 ? '—' : `1:${(activeStudents.length / staff.length).toFixed(1)}`;

  const byRoom = roomRecords.map((room) => {
    const perStaff = room.staff === 0 ? Number.POSITIVE_INFINITY : room.students / room.staff;
    return {
      room: room.name,
      ratio: room.staff === 0 ? '—' : `1:${perStaff.toFixed(1)}`,
      status: perStaff > 4 ? ('watch' as const) : ('ok' as const),
    };
  });

  const attendanceFromCenter = {
    studentLeave: leaveStudents.length,
    staffLeave: 0,
    absentFrom3Days: 0,
    students: {
      in: activeStudents.length,
      out: 0,
      absent: 0,
      pending: pendingStudents.length,
    },
    staff: {
      in: staff.length,
      out: 0,
      absent: 0,
      pending: 0,
    },
  };

  return {
    ...base,
    attendance: {
      center: attendanceFromCenter,
      class: attendanceFromCenter,
    },
    kpis: base.kpis.map((kpi) => {
      if (kpi.id === 'rooms') return { ...kpi, value: rooms.length, animateNumber: rooms.length };
      if (kpi.id === 'staff') return { ...kpi, value: staff.length, animateNumber: staff.length };
      if (kpi.id === 'students') {
        return { ...kpi, value: students.length, animateNumber: students.length };
      }
      if (kpi.id === 'ratio') return { ...kpi, value: ratioValue };
      return kpi;
    }),
    rooms: roomRecords,
    staff: staffRecords,
    students: studentRecords,
    ageGroups,
    ratioInsights: {
      ...base.ratioInsights,
      current: currentInsight,
      compliantRooms: byRoom.filter((row) => row.status === 'ok').length,
      watchRooms: byRoom.filter((row) => row.status === 'watch').length,
      byRoom,
    },
  };
}

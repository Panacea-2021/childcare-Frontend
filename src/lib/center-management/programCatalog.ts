'use client';

import { useEffect, useState } from 'react';
import { loadGroups, type GroupItem } from '@/lib/center-management/groupsStore';
import { loadLabels, type LabelItem } from '@/lib/center-management/labelsStore';
import { loadRooms, type RoomItem } from '@/lib/center-management/roomsStore';
import { loadStaff, type StaffMember } from '@/lib/center-management/staffStore';
import { loadStudents } from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';

export function loadActiveCenterRooms(): RoomItem[] {
  return loadRooms().filter((r) => r.status !== 'Inactive');
}

export function loadActiveCenterGroups(): GroupItem[] {
  return loadGroups().filter((g) => g.status !== 'Inactive');
}

export function loadActiveProgramLabels(): LabelItem[] {
  return loadLabels().filter((l) => l.feature === 'Program' && l.status === 'Active');
}

export function loadEnrolledCenterStudents(): Student[] {
  return loadStudents().filter(
    (s) => s.status === 'Active' || s.status === 'Signed up' || s.status === 'On Hold',
  );
}

export function loadActiveCenterStaff(): StaffMember[] {
  return loadStaff().filter((s) => s.status !== 'Inactive');
}

export function countStudentsInRoom(roomId: string, students = loadEnrolledCenterStudents()): number {
  return students.filter((s) => s.roomIds.includes(roomId)).length;
}

export function countStaffInRoom(roomName: string, staff = loadActiveCenterStaff()): number {
  return staff.filter((s) => s.rooms.includes(roomName)).length;
}

/** Active Center Management rooms, groups, students, staff, and Program labels. */
export function useCenterCatalog() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const refresh = () => {
      setRooms(loadActiveCenterRooms());
      setGroups(loadActiveCenterGroups());
      setLabels(loadActiveProgramLabels());
      setStudents(loadEnrolledCenterStudents());
      setStaff(loadActiveCenterStaff());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('panacea.center.students.changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('panacea.center.students.changed', refresh);
    };
  }, []);

  return {
    rooms,
    groups,
    labels,
    students,
    staff,
    roomNames: rooms.map((r) => r.name),
    groupNames: groups.map((g) => g.name),
    labelNames: labels.map((l) => l.name),
  };
}

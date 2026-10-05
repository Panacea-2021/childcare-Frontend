import type { StudentOption } from '@/types/activity';
import { liveArray } from '@/lib/center-management/liveList';
import { loadEnrolledCenterStudents } from '@/lib/center-management/programCatalog';
import { roomName } from '@/lib/center-management/studentsStore';

const colors = [
  '#5D5FEF',
  '#2563EB',
  '#0891B2',
  '#0D9488',
  '#059669',
  '#D97706',
  '#DB2777',
  '#7C3AED',
];

export const MOCK_STUDENTS: StudentOption[] = liveArray(() =>
  loadEnrolledCenterStudents().map((student, index) => ({
    id: student.id,
    name: student.name,
    room: roomName(student.roomIds[0] || ''),
    avatarColor: colors[index % colors.length],
  })),
);

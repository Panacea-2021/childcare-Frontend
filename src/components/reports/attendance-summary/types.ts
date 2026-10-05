import { liveArray } from '@/lib/center-management/liveList';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import { initials, loadStudents, roomName } from '@/lib/center-management/studentsStore';

export type FilterBy = 'classroom' | 'student' | 'department' | 'staff';

export type StudentStatus =
  | 'Active'
  | 'Inactive'
  | 'On Hold'
  | 'Withdrawn'
  | 'Transferred'
  | 'Signed Up'
  | 'Graduated';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export type MockStudent = {
  id: string;
  name: string;
  admissionNo: string;
  room: string;
  status: StudentStatus;
  initials: string;
  tone: 'lavender' | 'mint' | 'blush' | 'beige';
};

export type AttendanceRow = {
  studentName: string;
  admissionNo: string;
  room: string;
  attendanceDate: string;
  attendanceStatus: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  studentStatus: StudentStatus;
};

export type GeneratedAttendanceReport = {
  id: string;
  name: string;
  generatedBy: string;
  generatedAt: string; // ISO
  startDate: string; // YYYY-MM-DD
  endDate: string;
  filterBy: FilterBy;
  selectedRooms: string[];
  selectedStudentId: string | null;
  selectedStudentLabel: string;
  studentStatuses: StudentStatus[];
  recordCount: number;
  status: 'Generated';
  rows: AttendanceRow[];
};

export type AttendanceFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  statuses: StudentStatus[];
};

export const STUDENT_STATUSES: StudentStatus[] = [
  'Active',
  'Inactive',
  'On Hold',
  'Withdrawn',
  'Transferred',
  'Signed Up',
  'Graduated',
];

const REPORT_TONES: MockStudent['tone'][] = ['lavender', 'mint', 'blush', 'beige'];

function mapReportStatus(status: string): StudentStatus {
  if (status === 'Signed up') return 'Signed Up';
  return status as StudentStatus;
}

export const CLASSROOMS = liveArray(() => loadActiveCenterRooms().map((room) => room.name));

export const MOCK_STUDENTS: MockStudent[] = liveArray(() =>
  loadStudents().map((student, index) => ({
    id: student.id,
    name: student.name,
    admissionNo: student.admissionNumber || student.id,
    room: roomName(student.roomIds[0] || ''),
    status: mapReportStatus(student.status),
    initials: initials(student.name),
    tone: REPORT_TONES[index % REPORT_TONES.length],
  })),
);

export const LAST_GENERATED_MOCK = {
  dateLabel: '04/08/2026',
  timeLabel: '12:37 PM',
  by: 'Malika Thimisetty',
  iso: '2026-08-04T12:37:00',
};

export const CURRENT_USER = 'Malika Thimisetty';

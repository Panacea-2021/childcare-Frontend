import {
  CLASSROOMS,
  MOCK_STUDENTS,
  type AttendanceFormValues,
  type AttendanceRow,
  type AttendanceStatus,
  type GeneratedAttendanceReport,
  type MockStudent,
} from './types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadRecordCsv } from '@/components/reports/shared/generatedReport';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toDisplayDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function toFileDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '—', time: '—' };
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { date, time: `${pad(h)}:${m} ${ampm}` };
}

function eachDate(start: string, end: string) {
  const out: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

const STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Half Day'];

function mockStatus(seed: number): AttendanceStatus {
  return STATUSES[seed % STATUSES.length];
}

function mockTimes(status: AttendanceStatus, seed: number) {
  if (status === 'Absent') return { checkIn: '—', checkOut: '—', totalHours: '0.0' };
  const inH = 8 + (seed % 2);
  const inM = seed % 2 === 0 ? '05' : '22';
  const outH = status === 'Half Day' ? 12 : 15 + (seed % 2);
  const outM = seed % 3 === 0 ? '00' : '30';
  const total =
    status === 'Half Day' ? '4.0' : status === 'Late' ? '6.5' : `${(outH - inH + (Number(outM) - Number(inM)) / 60).toFixed(1)}`;
  return {
    checkIn: `${pad(inH)}:${inM} AM`,
    checkOut: `${pad(outH > 12 ? outH - 12 : outH)}:${outM} ${outH >= 12 ? 'PM' : 'AM'}`,
    totalHours: total,
  };
}

function filterStudents(values: AttendanceFormValues): MockStudent[] {
  let list = [...MOCK_STUDENTS];

  if (values.statuses.length) {
    list = list.filter((s) => values.statuses.includes(s.status));
  }

  if (values.filterBy === 'student') {
    if (!values.studentId) return [];
    list = list.filter((s) => s.id === values.studentId);
    return list;
  }

  if (values.rooms.length) {
    list = list.filter((s) => values.rooms.includes(s.room));
  }

  return list;
}

export function buildAttendanceRows(values: AttendanceFormValues): AttendanceRow[] {
  const students = filterStudents(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: AttendanceRow[] = [];

  students.forEach((student, si) => {
    dates.forEach((date, di) => {
      // Skip weekends for realism
      const [y, m, d] = date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      if (dow === 0 || dow === 6) return;

      const status = mockStatus(si * 7 + di);
      const times = mockTimes(status, si + di);
      rows.push({
        studentName: student.name,
        admissionNo: student.admissionNo,
        room: student.room,
        attendanceDate: toDisplayDate(date),
        attendanceStatus: status,
        checkIn: times.checkIn,
        checkOut: times.checkOut,
        totalHours: times.totalHours,
        studentStatus: student.status,
      });
    });
  });

  return rows;
}

export function buildReportName(start: string, end: string) {
  return `Attendance_Report_${toFileDate(start)}_to_${toFileDate(end)}`;
}

export function createGeneratedReport(values: AttendanceFormValues, by: string): GeneratedAttendanceReport {
  const rows = buildAttendanceRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `asr-${now.getTime()}`,
    name: `${buildReportName(values.startDate, values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: values.filterBy,
    selectedRooms: values.filterBy === 'classroom' ? values.rooms : [],
    selectedStudentId: values.filterBy === 'student' ? values.studentId : null,
    selectedStudentLabel:
      values.filterBy === 'student'
        ? student
          ? `${student.name} (${student.admissionNo})`
          : '—'
        : values.rooms.length
          ? values.rooms.join(', ')
          : 'All classrooms',
    studentStatuses: values.statuses,
    recordCount: rows.length,
    status: 'Generated',
    rows,
  };
}

const ATTENDANCE_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Room',
  'Attendance Date',
  'Attendance Status',
  'Check In',
  'Check Out',
  'Total Hours',
  'Student Status',
];

export function attendanceToExcelReport(report: GeneratedAttendanceReport): GeneratedExcelReport {
  return {
    id: report.id,
    kind: 'attendance-summary',
    name: report.name,
    generatedBy: report.generatedBy,
    generatedAt: report.generatedAt,
    startDate: report.startDate,
    endDate: report.endDate,
    filterBy: report.filterBy,
    selectedLabel: report.selectedStudentLabel,
    selectedColumns: ATTENDANCE_COLUMNS,
    recordCount: report.recordCount,
    status: 'Generated',
    columns: ATTENDANCE_COLUMNS,
    rows: report.rows.map((r) => ({
      'Student Name': r.studentName,
      'Admission Number': r.admissionNo,
      Room: r.room,
      'Attendance Date': r.attendanceDate,
      'Attendance Status': r.attendanceStatus,
      'Check In': r.checkIn,
      'Check Out': r.checkOut,
      'Total Hours': r.totalHours,
      'Student Status': r.studentStatus,
    })),
  };
}

export function downloadCsv(filename: string, rows: AttendanceRow[]) {
  downloadRecordCsv(
    filename,
    ATTENDANCE_COLUMNS,
    rows.map((r) => ({
      'Student Name': r.studentName,
      'Admission Number': r.admissionNo,
      Room: r.room,
      'Attendance Date': r.attendanceDate,
      'Attendance Status': r.attendanceStatus,
      'Check In': r.checkIn,
      'Check Out': r.checkOut,
      'Total Hours': r.totalHours,
      'Student Status': r.studentStatus,
    })),
  );
}

export function defaultFormValues(): AttendanceFormValues {
  const end = new Date(2026, 7, 4);
  const start = new Date(2026, 6, 29);
  return {
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    statuses: ['Active'],
  };
}

export { CLASSROOMS };

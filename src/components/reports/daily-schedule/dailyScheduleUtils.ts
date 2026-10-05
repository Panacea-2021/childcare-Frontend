import {
  CLASSROOMS,
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const DAILY_SCHEDULE_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Schedule Date',
  'Activity',
  'Activity Time',
  'Teacher',
  'Room',
  'Notes',
] as const;

const ACTIVITIES = [
  { name: 'Circle Time', time: '09:00 AM', notes: 'Story and songs' },
  { name: 'Outdoor Play', time: '10:00 AM', notes: 'Playground Block A' },
  { name: 'Snack Time', time: '10:45 AM', notes: 'Allergy-aware table' },
  { name: 'Learning Centers', time: '11:15 AM', notes: 'Literacy & math corners' },
  { name: 'Art & Craft', time: '01:00 PM', notes: 'Bring smocks' },
  { name: 'Music & Movement', time: '02:00 PM', notes: 'Hall mirror room' },
  { name: 'Quiet Reading', time: '02:45 PM', notes: 'Rest mats for Infants / Toddlers' },
  { name: 'Closing Circle', time: '03:15 PM', notes: 'Review and goodbye song' },
];

const TEACHERS = [
  'Priya Nair',
  'Rahul Mehta',
  'Anita Kapoor',
  'Neha Sharma',
  'Malika Thimisetty',
  'Ritu Singh',
];

export function buildDailyScheduleRows(room: string): Record<string, string>[] {
  const students = MOCK_STUDENTS.filter(
    (s) => s.room === room && (s.status === 'Active' || s.status === 'On Hold' || s.status === 'Signed Up'),
  );
  const list = students.length
    ? students
    : MOCK_STUDENTS.filter((s) => s.status === 'Active')
        .slice(0, 4)
        .map((s) => ({ ...s, room }));

  const scheduleDate = toDisplayDate(new Date().toISOString().slice(0, 10));
  const rows: Record<string, string>[] = [];

  list.forEach((student, si) => {
    ACTIVITIES.forEach((activity, ai) => {
      // Keep exports readable: rotate a subset of activities per student
      if ((si + ai) % 2 !== 0 && ai > 4) return;
      rows.push({
        'Student Name': student.name,
        'Admission Number': student.admissionNo,
        Classroom: room,
        'Schedule Date': scheduleDate,
        Activity: activity.name,
        'Activity Time': activity.time,
        Teacher: TEACHERS[(si + ai) % TEACHERS.length],
        Room: room,
        Notes: activity.notes,
      });
    });
  });

  return rows;
}

export function createDailyScheduleReport(room: string, by = CURRENT_USER): GeneratedExcelReport {
  const columns = [...DAILY_SCHEDULE_COLUMNS];
  const rows = buildDailyScheduleRows(room);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  return {
    id: `dsr-${now.getTime()}`,
    kind: 'daily-schedule',
    name: 'Daily_Schedule_Report.csv',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: room,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}

export { CLASSROOMS };

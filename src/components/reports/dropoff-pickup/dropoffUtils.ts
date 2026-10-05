import {
  CLASSROOMS,
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const DROPOFF_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Drop-off Time',
  'Picked Up Time',
  'Picked Up By',
  'Authorized Guardian',
  'Signature',
  'Status',
] as const;

const GUARDIANS = [
  'Neha Sharma',
  'Amit Patel',
  'Ritu Singh',
  'Priya Nair',
  'Rahul Mehta',
  'Anita Kapoor',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function buildDropoffRows(room: string): Record<string, string>[] {
  const students = MOCK_STUDENTS.filter((s) => s.room === room && (s.status === 'Active' || s.status === 'On Hold'));
  const list = students.length
    ? students
    : MOCK_STUDENTS.filter((s) => s.status === 'Active').slice(0, 4).map((s) => ({ ...s, room }));

  return list.map((student, i) => {
    const pickedUp = i % 5 !== 0;
    const dropH = 8;
    const dropM = i % 2 === 0 ? 5 : 20;
    const pickH = 3 + (i % 2);
    const pickM = i % 3 === 0 ? 0 : 30;
    const guardian = GUARDIANS[i % GUARDIANS.length];

    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      Classroom: room,
      'Drop-off Time': `${pad(dropH)}:${pad(dropM)} AM`,
      'Picked Up Time': pickedUp ? `${pad(pickH)}:${pad(pickM)} PM` : '—',
      'Picked Up By': pickedUp ? guardian : '—',
      'Authorized Guardian': guardian,
      Signature: pickedUp ? 'Captured' : 'Pending',
      Status: pickedUp ? 'Picked Up' : 'Awaiting Pickup',
    };
  });
}

export function createDropoffPickupReport(room: string, by = CURRENT_USER): GeneratedExcelReport {
  const columns = [...DROPOFF_COLUMNS];
  const rows = buildDropoffRows(room);
  const now = new Date();

  return {
    id: `dop-${now.getTime()}`,
    kind: 'dropoff-pickup',
    name: 'Drop_Off_And_Pickup_Report.csv',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: now.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
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

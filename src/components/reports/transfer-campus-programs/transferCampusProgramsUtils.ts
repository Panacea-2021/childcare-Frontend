import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type TransferCampusProgramsFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
};

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Kindergarten Ready',
];

const CAMPUSES = [
  'Panacea Little Stars',
  'Panacea Green Valley',
  'Panacea Riverside',
  'Panacea Oakwood',
];

export const TRANSFER_CAMPUS_PROGRAMS_COLUMNS = [
  'Student Name',
  'Admission Number',
  'From Campus',
  'To Campus',
  'From Program',
  'To Program',
  'Transfer Date',
  'Classroom',
  'Status',
] as const;

export function defaultTransferCampusProgramsForm(): TransferCampusProgramsFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    rooms: [],
  };
}

export function buildTransferCampusProgramsRows(
  values: TransferCampusProgramsFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];
  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  return students.map((student, i) => {
    const [y, m, d] = values.startDate.split('-').map(Number);
    const transfer = new Date(y, m - 1, Math.min(d + (i % 12), 28));
    const transferIso = `${transfer.getFullYear()}-${String(transfer.getMonth() + 1).padStart(2, '0')}-${String(transfer.getDate()).padStart(2, '0')}`;
    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      'From Campus': CAMPUSES[i % CAMPUSES.length],
      'To Campus': CAMPUSES[(i + 1) % CAMPUSES.length],
      'From Program': PROGRAMS[i % PROGRAMS.length],
      'To Program': PROGRAMS[(i + 2) % PROGRAMS.length],
      'Transfer Date': toDisplayDate(transferIso),
      Classroom: student.room,
      Status: i % 4 === 0 ? 'Pending' : 'Completed',
    };
  });
}

export function createTransferCampusProgramsReport(
  values: TransferCampusProgramsFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...TRANSFER_CAMPUS_PROGRAMS_COLUMNS];
  const rows = buildTransferCampusProgramsRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';

  return {
    id: `xfer-prog-${now.getTime()}`,
    kind: 'transfer-campus-programs',
    name: `Transfer_Campus_List_With_Programs_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: roomsLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}

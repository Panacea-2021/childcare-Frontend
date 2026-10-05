import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type TransferCampusListFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
};

const CAMPUSES = [
  'Panacea Little Stars',
  'Panacea Green Valley',
  'Panacea Riverside',
  'Panacea Oakwood',
];

export const TRANSFER_CAMPUS_LIST_COLUMNS = [
  'Student Name',
  'Admission Number',
  'From Campus',
  'To Campus',
  'Transfer Date',
  'Classroom',
  'Status',
] as const;

export function defaultTransferCampusListForm(): TransferCampusListFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    rooms: [],
  };
}

export function buildTransferCampusListRows(
  values: TransferCampusListFormValues,
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
      'Transfer Date': toDisplayDate(transferIso),
      Classroom: student.room,
      Status: i % 3 === 0 ? 'Pending' : 'Completed',
    };
  });
}

export function createTransferCampusListReport(
  values: TransferCampusListFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...TRANSFER_CAMPUS_LIST_COLUMNS];
  const rows = buildTransferCampusListRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';

  return {
    id: `xfer-campus-${now.getTime()}`,
    kind: 'transfer-campus-list',
    name: `Transfer_Campus_List_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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

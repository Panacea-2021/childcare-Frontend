import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type AppointmentColumnMode = 'all' | 'custom';

export type AppointmentColumnId =
  | 'calendarName'
  | 'clientName'
  | 'date'
  | 'startTime'
  | 'endTime'
  | 'status'
  | 'leadCreated'
  | 'leadId'
  | 'appointedTo';

export const APPOINTMENT_COLUMNS: { id: AppointmentColumnId; label: string }[] = [
  { id: 'calendarName', label: 'Calendar Name' },
  { id: 'clientName', label: 'Client Name' },
  { id: 'date', label: 'Date' },
  { id: 'startTime', label: 'Start Time' },
  { id: 'endTime', label: 'End Time' },
  { id: 'status', label: 'Status' },
  { id: 'leadCreated', label: 'Lead Created' },
  { id: 'leadId', label: 'Lead ID' },
  { id: 'appointedTo', label: 'Appointed To' },
];

export type AppointmentReportFormValues = {
  startDate: string;
  endDate: string;
  columnMode: AppointmentColumnMode;
  selectedColumns: AppointmentColumnId[];
};

type AppointmentSeed = {
  calendarName: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  leadCreated: string;
  leadId: string;
  appointedTo: string;
};

const SEED: AppointmentSeed[] = [
  {
    calendarName: 'Campus Tours',
    clientName: 'Sneha Kapoor',
    date: '2026-07-28',
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    status: 'Completed',
    leadCreated: '2026-07-20',
    leadId: 'LD-24081',
    appointedTo: 'Malika Thimisetty',
  },
  {
    calendarName: 'Parent Meet',
    clientName: 'Vikram Desai',
    date: '2026-07-29',
    startTime: '11:00 AM',
    endTime: '11:45 AM',
    status: 'Scheduled',
    leadCreated: '2026-07-22',
    leadId: 'LD-24092',
    appointedTo: 'Priya Nair',
  },
  {
    calendarName: 'Campus Tours',
    clientName: 'Leena Banerjee',
    date: '2026-07-30',
    startTime: '02:00 PM',
    endTime: '02:30 PM',
    status: 'No Show',
    leadCreated: '2026-07-18',
    leadId: 'LD-24055',
    appointedTo: 'Rahul Mehta',
  },
  {
    calendarName: 'Admission Counselling',
    clientName: 'Arjun Mehta',
    date: '2026-07-31',
    startTime: '09:30 AM',
    endTime: '10:15 AM',
    status: 'Completed',
    leadCreated: '2026-07-15',
    leadId: 'LD-24041',
    appointedTo: 'Front Desk',
  },
  {
    calendarName: 'Campus Tours',
    clientName: 'Nisha Reddy',
    date: '2026-08-01',
    startTime: '03:00 PM',
    endTime: '03:30 PM',
    status: 'Cancelled',
    leadCreated: '2026-07-25',
    leadId: 'LD-24102',
    appointedTo: 'Malika Thimisetty',
  },
  {
    calendarName: 'Weekend Open Day',
    clientName: 'Farhan Ali',
    date: '2026-08-02',
    startTime: '11:30 AM',
    endTime: '12:15 PM',
    status: 'Scheduled',
    leadCreated: '2026-07-27',
    leadId: 'LD-24118',
    appointedTo: 'Priya Nair',
  },
  {
    calendarName: 'Parent Meet',
    clientName: 'Meera Iyer',
    date: '2026-08-03',
    startTime: '04:00 PM',
    endTime: '04:30 PM',
    status: 'Scheduled',
    leadCreated: '2026-07-30',
    leadId: 'LD-24125',
    appointedTo: 'Rahul Mehta',
  },
  {
    calendarName: 'Admission Counselling',
    clientName: 'Kabir Shah',
    date: '2026-08-04',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    status: 'Completed',
    leadCreated: '2026-07-21',
    leadId: 'LD-24070',
    appointedTo: 'Malika Thimisetty',
  },
];

export function defaultAppointmentReportForm(): AppointmentReportFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    columnMode: 'custom',
    selectedColumns: [
      'calendarName',
      'clientName',
      'date',
      'startTime',
      'endTime',
      'status',
      'appointedTo',
    ],
  };
}

function activeColumns(values: AppointmentReportFormValues) {
  if (values.columnMode === 'all') return APPOINTMENT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return APPOINTMENT_COLUMNS.filter((c) => set.has(c.id));
}

export function buildAppointmentReportRows(
  values: AppointmentReportFormValues,
): Record<string, string>[] {
  const cols = activeColumns(values);

  return SEED.filter((row) => {
    if (values.startDate && row.date < values.startDate) return false;
    if (values.endDate && row.date > values.endDate) return false;
    return true;
  }).map((row) => {
    const full: Record<AppointmentColumnId, string> = {
      calendarName: row.calendarName,
      clientName: row.clientName,
      date: toDisplayDate(row.date),
      startTime: row.startTime,
      endTime: row.endTime,
      status: row.status,
      leadCreated: toDisplayDate(row.leadCreated),
      leadId: row.leadId,
      appointedTo: row.appointedTo,
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createAppointmentReport(
  values: AppointmentReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildAppointmentReportRows(values);
  const now = new Date();

  return {
    id: `tour-appointment-${now.getTime()}`,
    kind: 'appointment-report',
    name: `Appointment_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${toDisplayDate(values.startDate)} → ${toDisplayDate(values.endDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}

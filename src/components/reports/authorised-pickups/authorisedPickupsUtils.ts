import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type PickupColumnMode = 'all' | 'custom';

export type PickupColumnId =
  | 'studentName'
  | 'name'
  | 'number'
  | 'relation'
  | 'preferredName'
  | 'admissionNumber'
  | 'email'
  | 'address';

export const PICKUP_COLUMNS: { id: PickupColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'name', label: 'Name' },
  { id: 'number', label: 'Number' },
  { id: 'relation', label: 'Relation' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'email', label: 'Email' },
  { id: 'address', label: 'Address' },
];

export type AuthorisedPickupsFormValues = {
  rooms: string[];
  columnMode: PickupColumnMode;
  selectedColumns: PickupColumnId[];
};

type PickupContact = {
  name: string;
  number: string;
  relation: string;
  email: string;
  address: string;
  preferredName: string;
};

const PICKUPS: Record<string, PickupContact[]> = {
  s1: [
    {
      name: 'Robert Watson',
      number: '+1 415 555 0142',
      relation: 'Father',
      email: 'robert.watson@email.com',
      address: '12 Maple Street, Suite 4',
      preferredName: 'Emma',
    },
    {
      name: 'Helen Watson',
      number: '+1 415 555 0198',
      relation: 'Mother',
      email: 'helen.watson@email.com',
      address: '12 Maple Street, Suite 4',
      preferredName: 'Emma',
    },
  ],
  s2: [
    {
      name: 'Priya Sharma',
      number: '+91 98765 44120',
      relation: 'Mother',
      email: 'priya.sharma@email.com',
      address: '88 Palm Grove Apartments',
      preferredName: 'Aarav',
    },
  ],
  s3: [
    {
      name: 'Ravi Patel',
      number: '+91 98200 11844',
      relation: 'Father',
      email: 'ravi.patel@email.com',
      address: '5 Orchid Lane',
      preferredName: 'Mia',
    },
    {
      name: 'Neha Patel',
      number: '+91 98200 11845',
      relation: 'Mother',
      email: 'neha.patel@email.com',
      address: '5 Orchid Lane',
      preferredName: 'Mia',
    },
    {
      name: 'Anita Desai',
      number: '+91 98111 22033',
      relation: 'Grandmother',
      email: 'anita.desai@email.com',
      address: '5 Orchid Lane',
      preferredName: 'Mia',
    },
  ],
  s4: [
    {
      name: 'Wei Chen',
      number: '+65 8123 4401',
      relation: 'Father',
      email: 'wei.chen@email.com',
      address: '220 Harbour View',
      preferredName: 'Liam',
    },
  ],
  s5: [
    {
      name: 'Carlos Mendes',
      number: '+55 11 99887 2211',
      relation: 'Father',
      email: 'carlos.mendes@email.com',
      address: '41 Sunset Boulevard',
      preferredName: 'Sofia',
    },
    {
      name: 'Lucia Mendes',
      number: '+55 11 99887 2212',
      relation: 'Mother',
      email: 'lucia.mendes@email.com',
      address: '41 Sunset Boulevard',
      preferredName: 'Sofia',
    },
  ],
  s6: [
    {
      name: 'Anil Kapoor',
      number: '+91 99001 33445',
      relation: 'Father',
      email: 'anil.kapoor@email.com',
      address: '17 Cedar Residency',
      preferredName: 'Noah',
    },
  ],
  s7: [
    {
      name: 'Meera Joshi',
      number: '+91 97654 11220',
      relation: 'Mother',
      email: 'meera.joshi@email.com',
      address: '9 Lakeview Road',
      preferredName: 'Ava',
    },
    {
      name: 'Sanjay Joshi',
      number: '+91 97654 11221',
      relation: 'Uncle',
      email: 'sanjay.joshi@email.com',
      address: '9 Lakeview Road',
      preferredName: 'Ava',
    },
  ],
  s8: [
    {
      name: 'Deepa Rao',
      number: '+91 98440 77881',
      relation: 'Mother',
      email: 'deepa.rao@email.com',
      address: '66 Green Park',
      preferredName: 'Ethan',
    },
  ],
  s9: [
    {
      name: 'Arjun Das',
      number: '+91 97111 55660',
      relation: 'Father',
      email: 'arjun.das@email.com',
      address: '3 Jasmine Court',
      preferredName: 'Olivia',
    },
  ],
  s12: [
    {
      name: 'Kavita Verma',
      number: '+91 98989 33440',
      relation: 'Mother',
      email: 'kavita.verma@email.com',
      address: '150 Hillside Avenue',
      preferredName: 'Mason',
    },
    {
      name: 'Rohan Verma',
      number: '+91 98989 33441',
      relation: 'Father',
      email: 'rohan.verma@email.com',
      address: '150 Hillside Avenue',
      preferredName: 'Mason',
    },
  ],
};

export function defaultAuthorisedPickupsForm(): AuthorisedPickupsFormValues {
  return {
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: AuthorisedPickupsFormValues) {
  if (values.columnMode === 'all') return PICKUP_COLUMNS;
  const set = new Set(values.selectedColumns);
  return PICKUP_COLUMNS.filter((c) => set.has(c.id));
}

export function buildAuthorisedPickupsRows(
  values: AuthorisedPickupsFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => PICKUPS[s.id]?.length);

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);
  const rows: Record<string, string>[] = [];

  students.forEach((student) => {
    (PICKUPS[student.id] ?? []).forEach((pickup) => {
      const full: Record<PickupColumnId, string> = {
        studentName: student.name,
        name: pickup.name,
        number: pickup.number,
        relation: pickup.relation,
        preferredName: pickup.preferredName,
        admissionNumber: student.admissionNo,
        email: pickup.email,
        address: pickup.address,
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      rows.push(row);
    });
  });

  return rows;
}

export function createAuthorisedPickupsReport(
  values: AuthorisedPickupsFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildAuthorisedPickupsRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    id: `apk-${now.getTime()}`,
    kind: 'authorised-pickups',
    name: 'Authorised_Pickups_Report.xlsx',
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: values.rooms.length ? values.rooms.join(', ') : 'All classrooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}

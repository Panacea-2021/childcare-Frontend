import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport, ReportExportFormat } from '@/components/reports/shared/generatedReport';

export type EmergencyColumnMode = 'all' | 'custom';

export type EmergencyColumnId =
  | 'name'
  | 'emergencyContactName'
  | 'emergencyContactNumber'
  | 'emergencyContactCountryCode'
  | 'emergencyContactEmail'
  | 'emergencyContactAddress'
  | 'isPrimary'
  | 'emergencyContactRelationship'
  | 'classroom'
  | 'admissionNumber';

export const EMERGENCY_COLUMNS: { id: EmergencyColumnId; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'emergencyContactName', label: 'Emergency Contact Name' },
  { id: 'emergencyContactNumber', label: 'Emergency Contact Number' },
  { id: 'emergencyContactCountryCode', label: 'Emergency Contact Country Code' },
  { id: 'emergencyContactEmail', label: 'Emergency Contact Email' },
  { id: 'emergencyContactAddress', label: 'Emergency Contact Address' },
  { id: 'isPrimary', label: 'Is Primary' },
  { id: 'emergencyContactRelationship', label: 'Emergency Contact Relationship' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'admissionNumber', label: 'Admission Number' },
];

/** Default Custom selection — matches “6 selected” in the reference UI. */
export const DEFAULT_EMERGENCY_COLUMNS: EmergencyColumnId[] = [
  'name',
  'emergencyContactName',
  'emergencyContactNumber',
  'emergencyContactCountryCode',
  'emergencyContactEmail',
  'emergencyContactAddress',
];

export type StudentsEmergencyFormValues = {
  rooms: string[];
  columnMode: EmergencyColumnMode;
  selectedColumns: EmergencyColumnId[];
  format: ReportExportFormat;
};

type ContactSeed = {
  contactName: string;
  number: string;
  countryCode: string;
  email: string;
  address: string;
  relationship: string;
  isPrimary: boolean;
};

const CONTACTS_BY_STUDENT: Record<string, ContactSeed[]> = {
  s1: [
    {
      contactName: 'Helen Watson',
      number: '9876543210',
      countryCode: '+91',
      email: 'helen.watson@email.com',
      address: '14 Oak Avenue, Bengaluru',
      relationship: 'Mother',
      isPrimary: true,
    },
    {
      contactName: 'James Watson',
      number: '9876501234',
      countryCode: '+91',
      email: 'james.watson@email.com',
      address: '14 Oak Avenue, Bengaluru',
      relationship: 'Father',
      isPrimary: false,
    },
  ],
  s2: [
    {
      contactName: 'Meera Sharma',
      number: '9823011122',
      countryCode: '+91',
      email: 'meera.sharma@email.com',
      address: '22 Lake Road, Pune',
      relationship: 'Mother',
      isPrimary: true,
    },
  ],
  s3: [
    {
      contactName: 'Ravi Patel',
      number: '9811122233',
      countryCode: '+91',
      email: 'ravi.patel@email.com',
      address: '9 Palm Street, Mumbai',
      relationship: 'Father',
      isPrimary: true,
    },
    {
      contactName: 'Anita Patel',
      number: '9811122244',
      countryCode: '+91',
      email: 'anita.patel@email.com',
      address: '9 Palm Street, Mumbai',
      relationship: 'Mother',
      isPrimary: false,
    },
  ],
  s4: [
    {
      contactName: 'Wei Chen',
      number: '9001112233',
      countryCode: '+91',
      email: 'wei.chen@email.com',
      address: '3 Maple Lane, Hyderabad',
      relationship: 'Father',
      isPrimary: true,
    },
  ],
  s5: [
    {
      contactName: 'Carla Mendes',
      number: '9988776655',
      countryCode: '+91',
      email: 'carla.mendes@email.com',
      address: '55 Coral Drive, Goa',
      relationship: 'Mother',
      isPrimary: true,
    },
    {
      contactName: 'Luis Mendes',
      number: '9988776644',
      countryCode: '+91',
      email: 'luis.mendes@email.com',
      address: '55 Coral Drive, Goa',
      relationship: 'Uncle',
      isPrimary: false,
    },
  ],
  s6: [
    {
      contactName: 'Priya Kapoor',
      number: '9700012345',
      countryCode: '+91',
      email: 'priya.kapoor@email.com',
      address: '18 Garden View, Delhi',
      relationship: 'Mother',
      isPrimary: true,
    },
  ],
  s7: [
    {
      contactName: 'Sanjay Joshi',
      number: '9654321098',
      countryCode: '+91',
      email: 'sanjay.joshi@email.com',
      address: '7 River Colony, Chennai',
      relationship: 'Father',
      isPrimary: true,
    },
  ],
  s8: [
    {
      contactName: 'Lakshmi Rao',
      number: '9543210987',
      countryCode: '+91',
      email: 'lakshmi.rao@email.com',
      address: '41 Hill Crest, Kochi',
      relationship: 'Mother',
      isPrimary: true,
    },
    {
      contactName: 'Arjun Rao',
      number: '9543210977',
      countryCode: '+91',
      email: 'arjun.rao@email.com',
      address: '41 Hill Crest, Kochi',
      relationship: 'Grandfather',
      isPrimary: false,
    },
  ],
  s9: [
    {
      contactName: 'Sunita Das',
      number: '9432109876',
      countryCode: '+91',
      email: 'sunita.das@email.com',
      address: '2 Orchid Court, Kolkata',
      relationship: 'Mother',
      isPrimary: true,
    },
  ],
  s10: [
    {
      contactName: 'Rajesh Nair',
      number: '9321098765',
      countryCode: '+91',
      email: 'rajesh.nair@email.com',
      address: '88 Jasmine Block, Trivandrum',
      relationship: 'Father',
      isPrimary: true,
    },
  ],
  s11: [
    {
      contactName: 'Farah Khan',
      number: '9210987654',
      countryCode: '+91',
      email: 'farah.khan@email.com',
      address: '16 Crescent Park, Lucknow',
      relationship: 'Mother',
      isPrimary: true,
    },
  ],
  s12: [
    {
      contactName: 'Vikram Verma',
      number: '9109876543',
      countryCode: '+91',
      email: 'vikram.verma@email.com',
      address: '27 Silver Street, Jaipur',
      relationship: 'Father',
      isPrimary: true,
    },
    {
      contactName: 'Neha Verma',
      number: '9109876533',
      countryCode: '+91',
      email: 'neha.verma@email.com',
      address: '27 Silver Street, Jaipur',
      relationship: 'Mother',
      isPrimary: false,
    },
  ],
};

export function defaultStudentsEmergencyForm(): StudentsEmergencyFormValues {
  return {
    rooms: [],
    columnMode: 'custom',
    selectedColumns: [...DEFAULT_EMERGENCY_COLUMNS],
    format: 'pdf',
  };
}

function activeColumns(values: StudentsEmergencyFormValues) {
  if (values.columnMode === 'all') return EMERGENCY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return EMERGENCY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStudentsEmergencyRows(
  values: StudentsEmergencyFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);
  const rows: Record<string, string>[] = [];

  students.forEach((student) => {
    const contacts = CONTACTS_BY_STUDENT[student.id] ?? [
      {
        contactName: 'Guardian',
        number: '9000000000',
        countryCode: '+91',
        email: 'guardian@email.com',
        address: 'Main Campus Area',
        relationship: 'Guardian',
        isPrimary: true,
      },
    ];

    contacts.forEach((contact) => {
      const full: Record<EmergencyColumnId, string> = {
        name: student.name,
        emergencyContactName: contact.contactName,
        emergencyContactNumber: contact.number,
        emergencyContactCountryCode: contact.countryCode,
        emergencyContactEmail: contact.email,
        emergencyContactAddress: contact.address,
        isPrimary: contact.isPrimary ? 'Yes' : 'No',
        emergencyContactRelationship: contact.relationship,
        classroom: student.room,
        admissionNumber: student.admissionNo,
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

export function createStudentsEmergencyReport(
  values: StudentsEmergencyFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStudentsEmergencyRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPdf = values.format === 'pdf';

  return {
    id: `emg-${now.getTime()}`,
    kind: 'students-emergency',
    name: isPdf
      ? 'Students_Emergency_Contacts_Report.pdf'
      : 'Students_Emergency_Contacts_Report.xlsx',
    format: values.format,
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

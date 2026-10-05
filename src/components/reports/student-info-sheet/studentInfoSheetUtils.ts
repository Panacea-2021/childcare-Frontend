import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type FilterBy,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport, ReportExportFormat } from '@/components/reports/shared/generatedReport';

export type InfoSheetFieldId =
  | 'dob'
  | 'gender'
  | 'bloodGroup'
  | 'status'
  | 'registrationDate'
  | 'admissionNumber'
  | 'admissionDate'
  | 'groups'
  | 'room'
  | 'programs'
  | 'address'
  | 'parentName'
  | 'countryCode'
  | 'phone'
  | 'email'
  | 'companyName'
  | 'allowChildPickup'
  | 'children'
  | 'emergencyContacts'
  | 'authorizedPickupList'
  | 'medication';

export type InfoSheetSectionId =
  | 'studentProfile'
  | 'parentProfile'
  | 'contactInformation'
  | 'healthInformation';

export type InfoSheetFieldDef = {
  id: InfoSheetFieldId;
  label: string;
  sectionId: InfoSheetSectionId;
};

export type InfoSheetSectionDef = {
  id: InfoSheetSectionId;
  label: string;
};

export const INFO_SHEET_SECTIONS: InfoSheetSectionDef[] = [
  { id: 'studentProfile', label: 'Student Profile' },
  { id: 'parentProfile', label: 'Parent Profile' },
  { id: 'contactInformation', label: 'Contact Information' },
  { id: 'healthInformation', label: 'Health Information' },
];

export const INFO_SHEET_FIELDS: InfoSheetFieldDef[] = [
  { id: 'dob', label: 'DOB', sectionId: 'studentProfile' },
  { id: 'gender', label: 'Gender', sectionId: 'studentProfile' },
  { id: 'bloodGroup', label: 'Blood Group', sectionId: 'studentProfile' },
  { id: 'status', label: 'Status', sectionId: 'studentProfile' },
  { id: 'registrationDate', label: 'Registration Date', sectionId: 'studentProfile' },
  { id: 'admissionNumber', label: 'Admission Number', sectionId: 'studentProfile' },
  { id: 'admissionDate', label: 'Admission Date', sectionId: 'studentProfile' },
  { id: 'groups', label: 'Groups', sectionId: 'studentProfile' },
  { id: 'room', label: 'Room', sectionId: 'studentProfile' },
  { id: 'programs', label: 'Programs', sectionId: 'studentProfile' },
  { id: 'address', label: 'Address', sectionId: 'studentProfile' },
  { id: 'parentName', label: 'Name', sectionId: 'parentProfile' },
  { id: 'countryCode', label: 'Country Code', sectionId: 'parentProfile' },
  { id: 'phone', label: 'Phone', sectionId: 'parentProfile' },
  { id: 'email', label: 'Email', sectionId: 'parentProfile' },
  { id: 'companyName', label: 'Company Name', sectionId: 'parentProfile' },
  { id: 'allowChildPickup', label: 'Allow Child Pickup', sectionId: 'parentProfile' },
  { id: 'children', label: 'Children', sectionId: 'parentProfile' },
  { id: 'emergencyContacts', label: 'Emergency Contacts', sectionId: 'contactInformation' },
  { id: 'authorizedPickupList', label: 'Authorized Pickup List', sectionId: 'contactInformation' },
  { id: 'medication', label: 'Medication', sectionId: 'healthInformation' },
];

export const ALL_INFO_SHEET_FIELD_IDS = INFO_SHEET_FIELDS.map((f) => f.id);

export type StudentInfoSheetFormValues = {
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  format: ReportExportFormat;
  selectedFields: InfoSheetFieldId[];
};

type ProfileSeed = Record<InfoSheetFieldId, string> & { studentName: string };

const PROFILES: Record<string, ProfileSeed> = {
  s1: {
    studentName: 'Emma Watson',
    dob: '15/03/2018',
    gender: 'Female',
    bloodGroup: 'O+',
    status: 'Active',
    registrationDate: '10/06/2024',
    admissionNumber: 'ADM-1025',
    admissionDate: '12/06/2024',
    groups: 'Reading Circle',
    room: 'Grade 2',
    programs: 'Full Day',
    address: '12 Maple Street, Suite 4',
    parentName: 'Helen Watson',
    countryCode: '+1',
    phone: '4155550198',
    email: 'helen.watson@email.com',
    companyName: 'Watson Design Co.',
    allowChildPickup: 'Yes',
    children: 'Emma Watson',
    emergencyContacts: 'Robert Watson (+1 4155550142)',
    authorizedPickupList: 'Helen Watson; Robert Watson',
    medication: 'None',
  },
  s2: {
    studentName: 'Aarav Sharma',
    dob: '22/11/2021',
    gender: 'Male',
    bloodGroup: 'B+',
    status: 'Active',
    registrationDate: '15/01/2025',
    admissionNumber: 'ADM-1042',
    admissionDate: '20/01/2025',
    groups: 'Toddlers Art',
    room: 'Nursery',
    programs: 'Half Day AM',
    address: '88 Palm Grove Apartments',
    parentName: 'Priya Sharma',
    countryCode: '+91',
    phone: '9876544120',
    email: 'priya.sharma@email.com',
    companyName: 'Sharma Consulting',
    allowChildPickup: 'Yes',
    children: 'Aarav Sharma',
    emergencyContacts: 'Vikram Sharma (+91 9876500111)',
    authorizedPickupList: 'Priya Sharma; Vikram Sharma',
    medication: 'Vitamin D drops',
  },
  s3: {
    studentName: 'Mia Patel',
    dob: '08/07/2023',
    gender: 'Female',
    bloodGroup: 'A+',
    status: 'Active',
    registrationDate: '02/04/2025',
    admissionNumber: 'ADM-1088',
    admissionDate: '05/04/2025',
    groups: 'Music Tots',
    room: 'Toddlers',
    programs: 'Full Day',
    address: '5 Orchid Lane',
    parentName: 'Neha Patel',
    countryCode: '+91',
    phone: '9820011845',
    email: 'neha.patel@email.com',
    companyName: 'Patel & Co.',
    allowChildPickup: 'Yes',
    children: 'Mia Patel',
    emergencyContacts: 'Ravi Patel (+91 9820011844); Anita Desai (+91 9811122033)',
    authorizedPickupList: 'Neha Patel; Ravi Patel; Anita Desai',
    medication: 'None',
  },
  s4: {
    studentName: 'Liam Chen',
    dob: '19/01/2020',
    gender: 'Male',
    bloodGroup: 'AB+',
    status: 'On Hold',
    registrationDate: '01/09/2024',
    admissionNumber: 'ADM-1101',
    admissionDate: '03/09/2024',
    groups: 'Sports Kids',
    room: 'Junior KG',
    programs: 'Full Day',
    address: '220 Harbour View',
    parentName: 'Wei Chen',
    countryCode: '+65',
    phone: '81234401',
    email: 'wei.chen@email.com',
    companyName: 'Chen Logistics',
    allowChildPickup: 'Yes',
    children: 'Liam Chen',
    emergencyContacts: 'Mei Chen (+65 81234402)',
    authorizedPickupList: 'Wei Chen; Mei Chen',
    medication: 'Inhaler (as needed)',
  },
  s5: {
    studentName: 'Sofia Mendes',
    dob: '03/09/2019',
    gender: 'Female',
    bloodGroup: 'O-',
    status: 'Active',
    registrationDate: '18/07/2024',
    admissionNumber: 'ADM-1115',
    admissionDate: '22/07/2024',
    groups: 'Dance Club',
    room: 'Senior KG',
    programs: 'Full Day',
    address: '41 Sunset Boulevard',
    parentName: 'Lucia Mendes',
    countryCode: '+55',
    phone: '11998872212',
    email: 'lucia.mendes@email.com',
    companyName: 'Mendes Studio',
    allowChildPickup: 'Yes',
    children: 'Sofia Mendes',
    emergencyContacts: 'Carlos Mendes (+55 11998872211)',
    authorizedPickupList: 'Lucia Mendes; Carlos Mendes',
    medication: 'None',
  },
  s6: {
    studentName: 'Noah Kapoor',
    dob: '27/05/2017',
    gender: 'Male',
    bloodGroup: 'B-',
    status: 'Inactive',
    registrationDate: '11/03/2024',
    admissionNumber: 'ADM-1120',
    admissionDate: '15/03/2024',
    groups: 'Chess Club',
    room: 'Grade 1',
    programs: 'After School',
    address: '17 Cedar Residency',
    parentName: 'Anil Kapoor',
    countryCode: '+91',
    phone: '9900133445',
    email: 'anil.kapoor@email.com',
    companyName: 'Kapoor Traders',
    allowChildPickup: 'No',
    children: 'Noah Kapoor',
    emergencyContacts: 'Sonia Kapoor (+91 9900133446)',
    authorizedPickupList: 'Anil Kapoor',
    medication: 'Allergy antihistamine',
  },
  s7: {
    studentName: 'Ava Joshi',
    dob: '11/12/2022',
    gender: 'Female',
    bloodGroup: 'A-',
    status: 'Active',
    registrationDate: '20/06/2025',
    admissionNumber: 'ADM-1133',
    admissionDate: '25/06/2025',
    groups: 'Story Time',
    room: 'Pre Nursery',
    programs: 'Half Day PM',
    address: '9 Lakeview Road',
    parentName: 'Meera Joshi',
    countryCode: '+91',
    phone: '9765411220',
    email: 'meera.joshi@email.com',
    companyName: 'Joshi Clinics',
    allowChildPickup: 'Yes',
    children: 'Ava Joshi',
    emergencyContacts: 'Sanjay Joshi (+91 9765411221)',
    authorizedPickupList: 'Meera Joshi; Sanjay Joshi',
    medication: 'None',
  },
  s8: {
    studentName: 'Ethan Rao',
    dob: '30/04/2016',
    gender: 'Male',
    bloodGroup: 'O+',
    status: 'Transferred',
    registrationDate: '28/08/2023',
    admissionNumber: 'ADM-1144',
    admissionDate: '01/09/2023',
    groups: 'Science Lab',
    room: 'Grade 3',
    programs: 'Full Day',
    address: '66 Green Park',
    parentName: 'Deepa Rao',
    countryCode: '+91',
    phone: '9844077881',
    email: 'deepa.rao@email.com',
    companyName: 'Rao Technologies',
    allowChildPickup: 'Yes',
    children: 'Ethan Rao',
    emergencyContacts: 'Kiran Rao (+91 9844077882)',
    authorizedPickupList: 'Deepa Rao; Kiran Rao',
    medication: 'None',
  },
  s9: {
    studentName: 'Olivia Das',
    dob: '14/02/2025',
    gender: 'Female',
    bloodGroup: 'AB-',
    status: 'Signed Up',
    registrationDate: '10/02/2026',
    admissionNumber: 'ADM-1156',
    admissionDate: '—',
    groups: '—',
    room: 'Infants',
    programs: 'Infant Care',
    address: '3 Jasmine Court',
    parentName: 'Arjun Das',
    countryCode: '+91',
    phone: '9711155660',
    email: 'arjun.das@email.com',
    companyName: 'Das Logistics',
    allowChildPickup: 'Yes',
    children: 'Olivia Das',
    emergencyContacts: 'Riya Das (+91 9711155661)',
    authorizedPickupList: 'Arjun Das; Riya Das',
    medication: 'None',
  },
  s12: {
    studentName: 'Mason Verma',
    dob: '02/06/2018',
    gender: 'Male',
    bloodGroup: 'A+',
    status: 'Active',
    registrationDate: '12/08/2024',
    admissionNumber: 'ADM-1180',
    admissionDate: '15/08/2024',
    groups: 'Football',
    room: 'Grade 2',
    programs: 'Full Day',
    address: '150 Hillside Avenue',
    parentName: 'Kavita Verma',
    countryCode: '+91',
    phone: '9898933440',
    email: 'kavita.verma@email.com',
    companyName: 'Verma Homes',
    allowChildPickup: 'Yes',
    children: 'Mason Verma',
    emergencyContacts: 'Rohan Verma (+91 9898933441)',
    authorizedPickupList: 'Kavita Verma; Rohan Verma',
    medication: 'None',
  },
};

export function defaultStudentInfoSheetForm(): StudentInfoSheetFormValues {
  return {
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    format: 'pdf',
    selectedFields: [...ALL_INFO_SHEET_FIELD_IDS],
  };
}

function columnLabel(field: InfoSheetFieldDef) {
  if (field.sectionId === 'parentProfile') {
    if (field.id === 'parentName') return 'Parent Name';
    return `Parent ${field.label}`;
  }
  if (field.id === 'room') return 'Classroom';
  return field.label;
}

export function buildStudentInfoSheetRows(
  values: StudentInfoSheetFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => PROFILES[s.id]);

  if (values.filterBy === 'student') {
    students = students.filter((s) => s.id === values.studentId);
  } else if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const selected = INFO_SHEET_FIELDS.filter((f) => values.selectedFields.includes(f.id));

  return students.map((student) => {
    const profile = PROFILES[student.id];
    const row: Record<string, string> = {
      'Student Name': profile.studentName,
    };
    selected.forEach((field) => {
      row[columnLabel(field)] = profile[field.id];
    });
    return row;
  });
}

export function createStudentInfoSheetReport(
  values: StudentInfoSheetFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const selected = INFO_SHEET_FIELDS.filter((f) => values.selectedFields.includes(f.id));
  const columns = ['Student Name', ...selected.map(columnLabel)];
  const rows = buildStudentInfoSheetRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const isPdf = values.format === 'pdf';

  return {
    id: `sis-${now.getTime()}`,
    kind: 'student-info-sheet',
    name: isPdf ? 'Student_Information_Sheet.pdf' : 'Student_Information_Sheet.xlsx',
    format: values.format,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: values.filterBy,
    selectedLabel:
      values.filterBy === 'student'
        ? student
          ? `${student.name} (${student.admissionNo})`
          : '—'
        : values.rooms.length
          ? values.rooms.join(', ')
          : 'All classrooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}

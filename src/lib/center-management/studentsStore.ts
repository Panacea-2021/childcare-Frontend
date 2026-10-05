import { assignCenterIdByIndex } from '@/lib/organization/centers';
import { loadGroups } from '@/lib/center-management/groupsStore';
import { liveArray } from '@/lib/center-management/liveList';
import { loadRooms } from '@/lib/center-management/roomsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import type {
  AddSiblingInput,
  AddStudentInput,
  AllergyRecord,
  GroupOption,
  ProgramEnrollment,
  ProgramOption,
  RoomOption,
  Student,
  StudentFormRecord,
  StudentParent,
  StudentStatus,
  WeekDay,
} from './types';

const STORAGE_KEY = 'panacea.center.students.v3';

/** In-memory cache — avoids re-parsing localStorage on every click/filter. */
let studentsCache: Student[] | null = null;

export const ROOM_OPTIONS: RoomOption[] = liveArray(() =>
  loadRooms()
    .filter((r) => r.status !== 'Inactive')
    .map((r) => ({ id: r.id, name: r.name, status: r.status ?? 'Active' })),
);

export const GROUP_OPTIONS: GroupOption[] = liveArray(() =>
  loadGroups()
    .filter((g) => g.status !== 'Inactive')
    .map((g) => ({ id: g.id, name: g.name })),
);

export const PROGRAM_OPTIONS: ProgramOption[] = [
  { id: 'prog-toddler', name: 'Toddler Discovery' },
  { id: 'prog-abc', name: 'ABC Foundations' },
  { id: 'prog-abcd', name: 'Pre-K Explorers' },
  { id: 'prog-art', name: 'Creative Arts' },
];

/** Staff used for Notes “Created By” and similar filters */
export const STAFF_OPTIONS = liveArray(() =>
  loadStaff()
    .filter((s) => s.status !== 'Inactive')
    .map((s) => ({ id: s.id, name: s.name })),
);

export const STUDENT_STATUSES: StudentStatus[] = [
  'Active',
  'Inactive',
  'On Hold',
  'Withdrawn',
  'Signed up',
  'Transferred',
  'Graduated',
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'] as const;

export const ALLERGY_CATEGORIES = [
  'Skin allergy',
  'Food allergy',
  'Respiratory',
  'Medication',
  'Other',
];

export const ALLERGY_SEVERITIES = ['Mild', 'Moderate', 'Severe'] as const;

function ageFromDob(dob: string): string {
  if (!dob) return '—';
  const [dd, mm, yyyy] = dob.split('/').map(Number);
  if (!dd || !mm || !yyyy) return '—';
  const birth = new Date(yyyy, mm - 1, dd);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} year ${months} month`;
}

function todayLabel() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function pin() {
  return String(1000 + Math.floor(Math.random() * 8000));
}

const PARENT_LIZEL: StudentParent = {
  id: 'p1',
  name: 'Lizel',
  role: 'Mother',
  phone: '+1 9999999999',
  email: 'lizel@email.com',
  company: 'illumine',
  allowPickup: true,
  kioskPin: '4821',
};

const PARENT_RYAN: StudentParent = {
  id: 'p2',
  name: 'Ryan',
  role: 'Father',
  phone: '+1 9191919191',
  email: 'ryan@email.com',
  company: 'illumine',
  allowPickup: true,
  kioskPin: '7159',
};

/** Sunshine Room mother — single-student parent portal demo */
const PARENT_DIVYA: StudentParent = {
  id: 'p-sun1',
  name: 'Divya Reddy',
  role: 'Mother',
  phone: '9811001122',
  email: 'divya.reddy@email.com',
  allowPickup: true,
  kioskPin: '3391',
};

const SEED_STUDENTS: Array<Partial<Student> & { id: string; name: string }> = [
  // ── Demo Room (room-1): 4 total, 3 active ──
  {
    id: 'st-alex',
    name: 'Alex Demo Student',
    gender: 'Male',
    status: 'Active',
    dob: '18/04/2017',
    ageLabel: ageFromDob('18/04/2017'),
    registrationDate: '03/02/2020',
    admissionDate: '03/02/2020',
    admissionNumber: 'ADM-001',
    address: 'Demo Address',
    roomIds: ['room-1'],
    groupIds: ['group-1', 'group-4'],
    programIds: ['prog-toddler', 'prog-abc'],
    upcomingProgramIds: [],
    programEnrollments: [
      { id: 'pe1', programId: 'prog-toddler', programName: 'Toddler Discovery', stage: 'Active', startDate: '01/07/2026', endDate: '01/08/2026', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], labels: [] },
    ],
    parents: [PARENT_LIZEL, PARENT_RYAN],
    siblingIds: ['st-demo-r1-2'],
    phone: '9876543210',
    bloodGroup: 'A+',
    medication: 'acetaminophen',
    allergies: [{ id: 'al1', name: 'Shell Fish', category: 'Skin allergy', severity: 'Mild', symptoms: 'Rashes', parentNotes: '', emergencyPlan: '' }],
    emergencyContacts: [{ id: 'ec1', name: 'Lizel', phone: '+1 9999999999', relation: 'Mother' }],
    authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: '4521',
  },
  {
    id: 'st-hold',
    name: 'Abhi',
    gender: 'Male',
    status: 'On Hold',
    dob: '12/08/2020',
    ageLabel: ageFromDob('12/08/2020'),
    registrationDate: '01/06/2023',
    admissionDate: '01/06/2023',
    admissionNumber: 'ADM-002',
    address: '',
    roomIds: ['room-1'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p5', name: 'Suresh', role: 'Father', phone: '9000000003', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9000000003', bloodGroup: 'B+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-demo-r1-2',
    name: 'Kavya Sharma',
    gender: 'Female',
    status: 'Active',
    dob: '05/03/2018',
    ageLabel: ageFromDob('05/03/2018'),
    registrationDate: '10/01/2021',
    admissionDate: '10/01/2021',
    admissionNumber: 'ADM-003',
    address: '12 MG Road, Hyderabad',
    roomIds: ['room-1'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [PARENT_LIZEL, PARENT_RYAN],
    siblingIds: ['st-alex'],
    phone: '9812345678',
    bloodGroup: 'O+',
    medication: '',
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
  {
    id: 'st-demo-r1-3',
    name: 'Arjun Mehta',
    gender: 'Male',
    status: 'Active',
    dob: '22/07/2019',
    ageLabel: ageFromDob('22/07/2019'),
    registrationDate: '15/03/2022',
    admissionDate: '15/03/2022',
    admissionNumber: 'ADM-004',
    address: '7 Park Lane, Bengaluru',
    roomIds: ['room-1'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-arj1', name: 'Rakesh Mehta', role: 'Father', phone: '9700001234', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9700001234', bloodGroup: 'B-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },

  // ── Demo Roomie (room-2): 2 total, 1 active ──
  {
    id: 'st-nara',
    name: 'Narasimha',
    gender: 'Male',
    status: 'Active',
    dob: '',
    ageLabel: '—',
    registrationDate: '15/03/2024',
    admissionDate: '15/03/2024',
    admissionNumber: 'ADM-005',
    address: '',
    roomIds: ['room-2'],
    groupIds: ['group-5'], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p3', name: 'ram', role: 'Father', phone: '9000000001', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9000000001', bloodGroup: '', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-with',
    name: 'Riya Kapoor',
    gender: 'Female',
    status: 'Withdrawn',
    dob: '05/11/2019',
    ageLabel: ageFromDob('05/11/2019'),
    registrationDate: '10/02/2022',
    admissionDate: '10/02/2022',
    admissionNumber: 'ADM-006',
    address: '',
    roomIds: ['room-2'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [
      { id: 'p6', name: 'Anita', role: 'Mother', phone: '9000000010', kioskPin: pin() },
      { id: 'p7', name: 'Vikram', role: 'Father', phone: '9000000011', kioskPin: pin() },
    ],
    siblingIds: [], phone: '9000000004', bloodGroup: '', medication: '',
    allergies: [{ id: 'al2', name: 'Peanuts', category: 'Food allergy', severity: 'Severe', symptoms: 'Swelling' }],
    emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },

  // ── Sunshine Room (room-3): 6 total, 5 active ──
  {
    id: 'st-sun-1',
    name: 'Ananya Reddy',
    gender: 'Female',
    status: 'Active',
    dob: '10/02/2022',
    ageLabel: ageFromDob('10/02/2022'),
    registrationDate: '01/03/2023',
    admissionDate: '01/03/2023',
    admissionNumber: 'ADM-007',
    address: '45 Sunshine Lane, Pune',
    roomIds: ['room-3'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [PARENT_DIVYA],
    siblingIds: [], phone: '9811001122', bloodGroup: 'A+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-sun-2',
    name: 'Rohan Iyer',
    gender: 'Male',
    status: 'Active',
    dob: '15/06/2022',
    ageLabel: ageFromDob('15/06/2022'),
    registrationDate: '05/07/2023',
    admissionDate: '05/07/2023',
    admissionNumber: 'ADM-008',
    address: '8 Lotus Street, Chennai',
    roomIds: ['room-3'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-sun2', name: 'Arun Iyer', role: 'Father', phone: '9922334455', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9922334455', bloodGroup: 'B+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-sun-3',
    name: 'Pooja Nair',
    gender: 'Female',
    status: 'Active',
    dob: '20/09/2021',
    ageLabel: ageFromDob('20/09/2021'),
    registrationDate: '10/10/2022',
    admissionDate: '10/10/2022',
    admissionNumber: 'ADM-009',
    address: 'Kerala Nivas, Kochi',
    roomIds: ['room-3'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [{ id: 'p-sun3', name: 'Meena Nair', role: 'Mother', phone: '9733445566', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9733445566', bloodGroup: 'O-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-sun-4',
    name: 'Vikram Bose',
    gender: 'Male',
    status: 'Active',
    dob: '01/01/2022',
    ageLabel: ageFromDob('01/01/2022'),
    registrationDate: '15/01/2023',
    admissionDate: '15/01/2023',
    admissionNumber: 'ADM-010',
    address: '22 Raja Road, Kolkata',
    roomIds: ['room-3'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-sun4', name: 'Sujit Bose', role: 'Father', phone: '9644556677', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9644556677', bloodGroup: 'AB+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-sun-5',
    name: 'Sara Patel',
    gender: 'Female',
    status: 'Active',
    dob: '12/04/2022',
    ageLabel: ageFromDob('12/04/2022'),
    registrationDate: '01/05/2023',
    admissionDate: '01/05/2023',
    admissionNumber: 'ADM-011',
    address: '5 Patel Nagar, Ahmedabad',
    roomIds: ['room-3'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [{ id: 'p-sun5', name: 'Neha Patel', role: 'Mother', phone: '9555667788', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9555667788', bloodGroup: 'A-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-sun-6',
    name: 'Dev Kumar',
    gender: 'Male',
    status: 'On Hold',
    dob: '03/08/2021',
    ageLabel: ageFromDob('03/08/2021'),
    registrationDate: '20/09/2022',
    admissionDate: '20/09/2022',
    admissionNumber: 'ADM-012',
    address: '9 Kumar Street, Delhi',
    roomIds: ['room-3'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-sun6', name: 'Raj Kumar', role: 'Father', phone: '9466778899', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9466778899', bloodGroup: 'O+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },

  // ── Rainbow Room (room-4): 5 total, 4 active ──
  {
    id: 'st-rain-1',
    name: 'Ishaan Chopra',
    gender: 'Male',
    status: 'Active',
    dob: '14/03/2019',
    ageLabel: ageFromDob('14/03/2019'),
    registrationDate: '01/04/2022',
    admissionDate: '01/04/2022',
    admissionNumber: 'ADM-013',
    address: '3 Rainbow Colony, Mumbai',
    roomIds: ['room-4'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [{ id: 'p-rain1', name: 'Sunita Chopra', role: 'Mother', phone: '9377889900', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9377889900', bloodGroup: 'B+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-rain-2',
    name: 'Ritu Singh',
    gender: 'Female',
    status: 'Active',
    dob: '28/06/2018',
    ageLabel: ageFromDob('28/06/2018'),
    registrationDate: '10/07/2021',
    admissionDate: '10/07/2021',
    admissionNumber: 'ADM-014',
    address: '16 Singh Bhavan, Lucknow',
    roomIds: ['room-4'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [{ id: 'p-rain2', name: 'Ramesh Singh', role: 'Father', phone: '9288990011', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9288990011', bloodGroup: 'A+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-rain-3',
    name: 'Manish Verma',
    gender: 'Male',
    status: 'Active',
    dob: '05/01/2020',
    ageLabel: ageFromDob('05/01/2020'),
    registrationDate: '20/01/2023',
    admissionDate: '20/01/2023',
    admissionNumber: 'ADM-015',
    address: '30 Verma Nivas, Jaipur',
    roomIds: ['room-4'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-rain3', name: 'Kavita Verma', role: 'Mother', phone: '9199001122', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9199001122', bloodGroup: 'O+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-rain-4',
    name: 'Anjali Gupta',
    gender: 'Female',
    status: 'Active',
    dob: '19/10/2018',
    ageLabel: ageFromDob('19/10/2018'),
    registrationDate: '05/11/2021',
    admissionDate: '05/11/2021',
    admissionNumber: 'ADM-016',
    address: '88 Gupta Complex, Bhopal',
    roomIds: ['room-4'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [{ id: 'p-rain4', name: 'Sunil Gupta', role: 'Father', phone: '9100112233', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9100112233', bloodGroup: 'AB-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-rain-5',
    name: 'Yash Tiwari',
    gender: 'Male',
    status: 'Inactive',
    dob: '25/05/2019',
    ageLabel: ageFromDob('25/05/2019'),
    registrationDate: '01/06/2022',
    admissionDate: '01/06/2022',
    admissionNumber: 'ADM-017',
    address: '11 Tiwari Road, Varanasi',
    roomIds: ['room-4'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-rain5', name: 'Geeta Tiwari', role: 'Mother', phone: '9001122334', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9001122334', bloodGroup: 'B-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },

  // ── Star Room (room-5): 8 total, 8 active ──
  {
    id: 'st-star-1',
    name: 'Aarav Mehta',
    gender: 'Male',
    status: 'Active',
    dob: '07/07/2017',
    ageLabel: ageFromDob('07/07/2017'),
    registrationDate: '15/08/2021',
    admissionDate: '15/08/2021',
    admissionNumber: 'ADM-018',
    address: '5 Star Residency, Surat',
    roomIds: ['room-5'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [{ id: 'p-star1', name: 'Hema Mehta', role: 'Mother', phone: '9912233445', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9912233445', bloodGroup: 'A+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-2',
    name: 'Diya Joshi',
    gender: 'Female',
    status: 'Active',
    dob: '12/02/2018',
    ageLabel: ageFromDob('12/02/2018'),
    registrationDate: '01/03/2022',
    admissionDate: '01/03/2022',
    admissionNumber: 'ADM-019',
    address: '14 Joshi Villa, Nashik',
    roomIds: ['room-5'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-star2', name: 'Vikrant Joshi', role: 'Father', phone: '9823344556', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9823344556', bloodGroup: 'O+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-3',
    name: 'Kabir Shah',
    gender: 'Male',
    status: 'Active',
    dob: '30/11/2016',
    ageLabel: ageFromDob('30/11/2016'),
    registrationDate: '10/12/2020',
    admissionDate: '10/12/2020',
    admissionNumber: 'ADM-020',
    address: '2 Shah Manor, Rajkot',
    roomIds: ['room-5'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [{ id: 'p-star3', name: 'Nilam Shah', role: 'Mother', phone: '9734455667', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9734455667', bloodGroup: 'B+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-4',
    name: 'Zara Ansari',
    gender: 'Female',
    status: 'Active',
    dob: '04/04/2017',
    ageLabel: ageFromDob('04/04/2017'),
    registrationDate: '20/04/2021',
    admissionDate: '20/04/2021',
    admissionNumber: 'ADM-021',
    address: '19 Ansari Tower, Hyderabad',
    roomIds: ['room-5'],
    groupIds: [], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [{ id: 'p-star4', name: 'Irfan Ansari', role: 'Father', phone: '9645566778', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9645566778', bloodGroup: 'AB+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-5',
    name: 'Tanvi Desai',
    gender: 'Female',
    status: 'Active',
    dob: '18/08/2017',
    ageLabel: ageFromDob('18/08/2017'),
    registrationDate: '01/09/2021',
    admissionDate: '01/09/2021',
    admissionNumber: 'ADM-022',
    address: '6 Desai Apartments, Vadodara',
    roomIds: ['room-5'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-star5', name: 'Kirti Desai', role: 'Mother', phone: '9556677889', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9556677889', bloodGroup: 'O-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-6',
    name: 'Aryan Pandey',
    gender: 'Male',
    status: 'Active',
    dob: '09/03/2018',
    ageLabel: ageFromDob('09/03/2018'),
    registrationDate: '25/03/2022',
    admissionDate: '25/03/2022',
    admissionNumber: 'ADM-023',
    address: '7 Pandey Lane, Patna',
    roomIds: ['room-5'],
    groupIds: [], programIds: ['prog-abc'], upcomingProgramIds: [],
    parents: [{ id: 'p-star6', name: 'Smita Pandey', role: 'Mother', phone: '9467788990', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9467788990', bloodGroup: 'A-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-7',
    name: 'Nisha Malhotra',
    gender: 'Female',
    status: 'Active',
    dob: '22/06/2017',
    ageLabel: ageFromDob('22/06/2017'),
    registrationDate: '01/07/2021',
    admissionDate: '01/07/2021',
    admissionNumber: 'ADM-024',
    address: '11 Malhotra Heights, Chandigarh',
    roomIds: ['room-5'],
    groupIds: [], programIds: [], upcomingProgramIds: [],
    parents: [{ id: 'p-star7', name: 'Vivek Malhotra', role: 'Father', phone: '9378899001', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9378899001', bloodGroup: 'B-', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  {
    id: 'st-star-8',
    name: 'Siddharth Rao',
    gender: 'Male',
    status: 'Active',
    dob: '15/10/2016',
    ageLabel: ageFromDob('15/10/2016'),
    registrationDate: '01/11/2020',
    admissionDate: '01/11/2020',
    admissionNumber: 'ADM-025',
    address: '33 Rao Residency, Visakhapatnam',
    roomIds: ['room-5'],
    groupIds: ['group-6', 'group-8'], programIds: ['prog-toddler'], upcomingProgramIds: [],
    parents: [{ id: 'p-star8', name: 'Lakshmi Rao', role: 'Mother', phone: '9289900112', allowPickup: true, kioskPin: pin() }],
    siblingIds: [], phone: '9289900112', bloodGroup: 'O+', medication: '',
    allergies: [], emergencyContacts: [], authorizedPickups: [], vaccines: [], attendanceRecords: [], notes: [], forms: [], gallery: [], kioskCode: pin(),
  },
  // ── Nest Room + Garden Room demos ──
  {
    id: 'st-nest-1',
    name: 'Mira Joshi',
    gender: 'Female',
    status: 'Active',
    dob: '10/01/2025',
    ageLabel: ageFromDob('10/01/2025'),
    registrationDate: '01/03/2026',
    admissionDate: '01/03/2026',
    admissionNumber: 'ADM-026',
    address: '2 Nest Lane, Pune',
    roomIds: ['room-6'],
    groupIds: ['group-3'],
    programIds: ['prog-toddler'],
    upcomingProgramIds: [],
    parents: [{ id: 'p-nest1', name: 'Anika Joshi', role: 'Mother', phone: '9123409876', allowPickup: true, kioskPin: pin() }],
    siblingIds: [],
    phone: '9123409876',
    bloodGroup: 'B+',
    medication: '',
    allergies: [{ id: 'al-nest1', name: 'Dairy', category: 'Food allergy', severity: 'Moderate', symptoms: 'Rash', parentNotes: '', emergencyPlan: 'Epi ready' }],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
  {
    id: 'st-nest-2',
    name: 'Kabir Iyer',
    gender: 'Male',
    status: 'Active',
    dob: '22/08/2024',
    ageLabel: ageFromDob('22/08/2024'),
    registrationDate: '15/02/2026',
    admissionDate: '15/02/2026',
    admissionNumber: 'ADM-027',
    address: '9 Maple Nest, Chennai',
    roomIds: ['room-6'],
    groupIds: ['group-3', 'group-2'],
    programIds: ['prog-toddler'],
    upcomingProgramIds: [],
    parents: [{ id: 'p-nest2', name: 'Rohan Iyer', role: 'Father', phone: '9234510987', allowPickup: true, kioskPin: pin() }],
    siblingIds: [],
    phone: '9234510987',
    bloodGroup: 'O+',
    medication: '',
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
  {
    id: 'st-nest-3',
    name: 'Zoya Khan',
    gender: 'Female',
    status: 'Signed up',
    dob: '05/11/2024',
    ageLabel: ageFromDob('05/11/2024'),
    registrationDate: '20/05/2026',
    admissionDate: '',
    admissionNumber: 'ADM-028',
    address: '14 Orchid Nest, Hyderabad',
    roomIds: ['room-6'],
    groupIds: ['group-3'],
    programIds: [],
    upcomingProgramIds: ['prog-toddler'],
    parents: [{ id: 'p-nest3', name: 'Sara Khan', role: 'Mother', phone: '9345621098', allowPickup: true, kioskPin: pin() }],
    siblingIds: [],
    phone: '9345621098',
    bloodGroup: 'A+',
    medication: '',
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
  {
    id: 'st-garden-1',
    name: 'Vihaan Das',
    gender: 'Male',
    status: 'Active',
    dob: '14/03/2021',
    ageLabel: ageFromDob('14/03/2021'),
    registrationDate: '10/04/2025',
    admissionDate: '10/04/2025',
    admissionNumber: 'ADM-029',
    address: '6 Garden View, Kolkata',
    roomIds: ['room-8'],
    groupIds: ['group-5', 'group-6'],
    programIds: ['prog-abcd', 'prog-art'],
    upcomingProgramIds: [],
    parents: [{ id: 'p-gar1', name: 'Priya Das', role: 'Mother', phone: '9456732109', allowPickup: true, kioskPin: pin() }],
    siblingIds: [],
    phone: '9456732109',
    bloodGroup: 'AB+',
    medication: '',
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
  {
    id: 'st-garden-2',
    name: 'Aanya Bose',
    gender: 'Female',
    status: 'Graduated',
    dob: '30/09/2018',
    ageLabel: ageFromDob('30/09/2018'),
    registrationDate: '01/06/2022',
    admissionDate: '01/06/2022',
    admissionNumber: 'ADM-030',
    address: '18 Bose Gardens, Howrah',
    roomIds: ['room-8'],
    groupIds: ['group-4', 'group-8'],
    programIds: ['prog-abc'],
    upcomingProgramIds: [],
    parents: [{ id: 'p-gar2', name: 'Amit Bose', role: 'Father', phone: '9567843210', allowPickup: true, kioskPin: pin() }],
    siblingIds: [],
    phone: '9567843210',
    bloodGroup: 'B-',
    medication: '',
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    attendanceRecords: [],
    notes: [],
    forms: [],
    gallery: [],
    kioskCode: pin(),
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}


function normalizeStudent(raw: Partial<Student> & { id: string; name: string }): Student {
  const allergies = Array.isArray(raw.allergies)
    ? raw.allergies.map((a, i) =>
        typeof a === 'string'
          ? ({
              id: `al-migrated-${i}`,
              name: a,
              category: 'Other',
              severity: 'Mild',
              symptoms: '',
            } as AllergyRecord)
          : a,
      )
    : [];

  return {
    id: raw.id,
    name: raw.name,
    preferredName: raw.preferredName ?? '',
    gender: raw.gender ?? 'Prefer not to say',
    status: raw.status ?? 'Active',
    dob: raw.dob ?? '',
    ageLabel: raw.ageLabel ?? (raw.dob ? ageFromDob(raw.dob) : '—'),
    registrationDate: raw.registrationDate ?? '',
    admissionDate: raw.admissionDate ?? '',
    admissionNumber: raw.admissionNumber ?? '',
    address: raw.address ?? '',
    roomIds: raw.roomIds ?? [],
    groupIds: raw.groupIds ?? [],
    programIds: raw.programIds ?? [],
    upcomingProgramIds: raw.upcomingProgramIds ?? [],
    programEnrollments: raw.programEnrollments ?? [],
    parents: (raw.parents ?? [])
      .filter((p) => p.role === 'Mother' || p.role === 'Father')
      .map((p) => ({
        ...p,
        role: p.role as 'Mother' | 'Father',
        kioskPin: p.kioskPin ?? pin(),
        allowPickup: p.allowPickup ?? true,
      })),
    siblingIds: raw.siblingIds ?? [],
    phone: raw.phone ?? '',
    bloodGroup: raw.bloodGroup ?? '',
    medication: raw.medication ?? '',
    allergies,
    emergencyContacts: raw.emergencyContacts ?? [],
    authorizedPickups: raw.authorizedPickups ?? [],
    vaccines: Array.isArray(raw.vaccines) ? raw.vaccines : [],
    immunizationExemptAll: Boolean(raw.immunizationExemptAll),
    immunizationExemptReason: raw.immunizationExemptReason,
    immunizationExemptNote: raw.immunizationExemptNote,
    immunizationExemptDocumentName: raw.immunizationExemptDocumentName,
    attendanceRecords: raw.attendanceRecords ?? [],
    notes: raw.notes ?? [],
    forms: raw.forms ?? [],
    gallery: raw.gallery ?? [],
    photoUrl: raw.photoUrl,
    deactivatedOn: raw.deactivatedOn,
    kioskCode: raw.kioskCode ?? pin(),
    centerId: raw.centerId,
  };
}

export function loadStudents(): Student[] {
  if (studentsCache) return studentsCache;

  if (!canUseStorage()) {
    studentsCache = SEED_STUDENTS.map((s) => normalizeStudent(s));
    return studentsCache;
  }
  try {
    // Force-reset when seed data version changes (e.g. room IDs updated)
    const VERSION_KEY = 'panacea.center.students.seedVersion';
    const CURRENT_VERSION = '7';
    const storedVersion = window.localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      const seeded = SEED_STUDENTS.map((s, i) =>
        normalizeStudent({ ...s, centerId: s.centerId ?? assignCenterIdByIndex(i) }),
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      studentsCache = seeded;
      return studentsCache;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      studentsCache = SEED_STUDENTS.map((s) => normalizeStudent(s));
      return studentsCache;
    }
    const parsed = JSON.parse(raw) as Student[];
    if (!Array.isArray(parsed) || !parsed.length) {
      studentsCache = SEED_STUDENTS.map((s) => normalizeStudent(s));
      return studentsCache;
    }
    studentsCache = parsed.map((s) => normalizeStudent(s));
    return studentsCache;
  } catch {
    studentsCache = SEED_STUDENTS.map((s) => normalizeStudent(s));
    return studentsCache;
  }
}

export function saveStudents(students: Student[]) {
  studentsCache = students;
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export type ProgramEnrollmentInput = {
  studentId: string;
  programId: string;
  programName: string;
  startDate: string;
  endDate: string;
  days: WeekDay[];
  labels?: string[];
  stage?: ProgramEnrollment['stage'];
};

/** Mirror program assignments onto each student's Programs tab. */
export function enrollStudentsInProgram(rows: ProgramEnrollmentInput[]) {
  if (!rows.length) return;
  const byStudent = new Map<string, ProgramEnrollmentInput[]>();
  for (const row of rows) {
    if (!row.studentId) continue;
    const list = byStudent.get(row.studentId) ?? [];
    list.push(row);
    byStudent.set(row.studentId, list);
  }
  if (!byStudent.size) return;

  const students = loadStudents();
  const next = students.map((student) => {
    const adds = byStudent.get(student.id);
    if (!adds?.length) return student;

    let programEnrollments = [...(student.programEnrollments ?? [])];
    let programIds = [...student.programIds];

    for (const add of adds) {
      programEnrollments = programEnrollments.filter((e) => e.programId !== add.programId);
      programEnrollments.unshift({
        id: `pe-${add.programId}-${student.id}`,
        programId: add.programId,
        programName: add.programName,
        stage: add.stage ?? 'Active',
        startDate: add.startDate,
        endDate: add.endDate || '01/01/2031',
        days: add.days,
        labels: add.labels ?? [],
      });
      if (!programIds.includes(add.programId)) programIds.push(add.programId);
    }

    return { ...student, programEnrollments, programIds };
  });

  saveStudents(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('panacea.center.students.enrolled'));
  }
}

export function subscribeStudentEnrollments(cb: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => cb();
  window.addEventListener('panacea.center.students.enrolled', handler);
  window.addEventListener('panacea.center.students.changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('panacea.center.students.enrolled', handler);
    window.removeEventListener('panacea.center.students.changed', handler);
    window.removeEventListener('storage', handler);
  };
}

function notifyStudentsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('panacea.center.students.changed'));
  window.dispatchEvent(new CustomEvent('panacea.center.students.enrolled'));
}

export type ShareFormPayload = {
  id: string;
  name: string;
  openUntil?: string;
  category?: string;
};

function categoryToProcess(category?: string) {
  if (!category) return 'Enrollment';
  if (/medical/i.test(category)) return 'Medical';
  if (/staff/i.test(category)) return 'Medical';
  return 'Enrollment';
}

/** Attach a catalog form to selected student profiles (Forms tab). */
export function shareFormsWithStudents(form: ShareFormPayload, studentIds: string[]): number {
  if (!studentIds.length) return 0;
  const idSet = new Set(studentIds);
  const students = loadStudents();
  const date = todayLabel();
  const expiry = form.openUntil?.trim() || '—';
  const process = categoryToProcess(form.category);

  let sharedCount = 0;
  const next = students.map((student) => {
    if (!idSet.has(student.id)) return student;
    const prefix = `shared-${form.id}-`;
    const withoutDup = (student.forms ?? []).filter((f) => f.id !== `${prefix}${student.id}`);
    const record: StudentFormRecord = {
      id: `${prefix}${student.id}`,
      title: form.name,
      date,
      status: 'Pending',
      expiryDate: expiry,
      expirySchedule: form.openUntil ? 'Form expiry' : 'One-time',
      process,
      sourceFormId: form.id,
    };
    sharedCount += 1;
    return { ...student, forms: [record, ...withoutDup] };
  });

  saveStudents(next);
  notifyStudentsChanged();
  return sharedCount;
}

export function createStudent(input: AddStudentInput): Student {
  const student = normalizeStudent({
    id: `st-${Date.now()}`,
    name: input.name.trim(),
    preferredName: input.preferredName.trim(),
    gender: input.gender,
    status: input.status,
    registrationDate: todayLabel(),
    admissionDate: input.admissionDate || todayLabel(),
    roomIds: input.roomId ? [input.roomId] : [],
    parents: [],
    siblingIds: [],
    allergies: [],
    emergencyContacts: [],
    authorizedPickups: [],
    vaccines: [],
    kioskCode: pin(),
    centerId: input.centerId,
  });
  const existing = loadStudents();
  saveStudents([student, ...existing.filter((s) => s.id !== student.id)]);
  notifyStudentsChanged();
  return student;
}

export function createSibling(
  source: Student,
  input: AddSiblingInput,
  allStudents: Student[],
): { sibling: Student; updatedSource: Student; updatedParentsShared: Student[] } {
  const selectedParents = source.parents.filter((p) => input.parentIds.includes(p.id));
  const sibling = normalizeStudent({
    id: `st-${Date.now()}`,
    name: input.name.trim(),
    preferredName: input.preferredName.trim(),
    gender: input.gender,
    status: input.status,
    registrationDate: todayLabel(),
    admissionDate: input.admissionDate || todayLabel(),
    roomIds: input.roomId ? [input.roomId] : [...source.roomIds],
    parents: selectedParents,
    siblingIds: [source.id, ...source.siblingIds.filter((id) => id !== source.id)],
    emergencyContacts: input.copyEmergency ? [...source.emergencyContacts] : [],
    authorizedPickups: input.copyPickup
      ? (source.authorizedPickups ?? []).map((p) => ({ ...p, id: `pk-${Date.now()}-${p.id}` }))
      : [],
    allergies: [],
    vaccines: [],
    kioskCode: pin(),
    centerId: source.centerId,
  });

  const updatedSource: Student = {
    ...source,
    siblingIds: [...new Set([sibling.id, ...source.siblingIds])],
  };

  // Keep sibling links bidirectional across existing siblings
  const updatedParentsShared = allStudents.map((s) => {
    if (s.id === source.id) return updatedSource;
    if (source.siblingIds.includes(s.id)) {
      return { ...s, siblingIds: [...new Set([sibling.id, ...s.siblingIds])] };
    }
    return s;
  });

  return { sibling, updatedSource, updatedParentsShared };
}

export function linkSiblingOpenUrl(studentId: string) {
  return `/center-management/students/${studentId}`;
}

export function openStudentInNewPage(studentId: string) {
  if (typeof window === 'undefined') return;
  window.open(linkSiblingOpenUrl(studentId), '_blank', 'noopener,noreferrer');
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function roomName(id: string) {
  if (!id) return '—';
  const fromCenter = loadRooms().find((r) => r.id === id);
  if (fromCenter?.name) return fromCenter.name;
  return ROOM_OPTIONS.find((r) => r.id === id)?.name ?? '—';
}

export function programNames(ids: string[]) {
  if (!ids.length) return '—';
  return ids.map((id) => PROGRAM_OPTIONS.find((p) => p.id === id)?.name ?? id).join(', ');
}

export function groupNames(ids: string[]) {
  if (!ids.length) return '—';
  const groups = loadGroups();
  return ids
    .map(
      (id) =>
        groups.find((g) => g.id === id)?.name ??
        GROUP_OPTIONS.find((g) => g.id === id)?.name ??
        id,
    )
    .join(', ');
}

export function statusBadgeTone(status: StudentStatus) {
  switch (status) {
    case 'Active':
      return 'mint';
    case 'Inactive':
      return 'blush';
    case 'On Hold':
      return 'lavender';
    case 'Withdrawn':
      return 'amber';
    case 'Signed up':
      return 'coral';
    case 'Transferred':
      return 'sky';
    case 'Graduated':
      return 'indigo';
    default:
      return 'mint';
  }
}

export function severityTone(severity: AllergyRecord['severity']) {
  if (severity === 'Severe') return 'severe';
  if (severity === 'Moderate') return 'moderate';
  return 'mild';
}

export { ageFromDob, todayLabel, pin };

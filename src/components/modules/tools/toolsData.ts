import { liveArray } from '@/lib/center-management/liveList';
import {
  loadActiveCenterGroups,
  loadActiveCenterRooms,
  loadActiveCenterStaff,
  loadEnrolledCenterStudents,
} from '@/lib/center-management/programCatalog';
import { groupNames, programNames, roomName } from '@/lib/center-management/studentsStore';

export type IdCardAudience = 'Student' | 'Staff' | 'Authorized Pickup';

export type IdCardTheme = 'festive' | 'crimson' | 'geo' | 'wave' | 'landscape';

export type IdCardTemplate = {
  id: string;
  name: string;
  theme: IdCardTheme;
  sampleName: string;
  sampleRole: string;
  audiences: IdCardAudience[];
  orientation: 'portrait' | 'landscape';
};

export const ID_CARD_TEMPLATES: IdCardTemplate[] = [
  {
    id: 'tpl-festive',
    name: 'ID Card 1',
    theme: 'festive',
    sampleName: 'Jackson James',
    sampleRole: 'STUDENT',
    audiences: ['Student', 'Authorized Pickup'],
    orientation: 'portrait',
  },
  {
    id: 'tpl-crimson',
    name: 'ID Card 2',
    theme: 'crimson',
    sampleName: 'Olivia Wilson',
    sampleRole: 'STUDENT',
    audiences: ['Student', 'Authorized Pickup'],
    orientation: 'portrait',
  },
  {
    id: 'tpl-geo',
    name: 'ID Card 3',
    theme: 'geo',
    sampleName: 'Caroline Smith',
    sampleRole: 'STUDENT',
    audiences: ['Student', 'Authorized Pickup'],
    orientation: 'portrait',
  },
  {
    id: 'tpl-wave',
    name: 'ID Card 10',
    theme: 'wave',
    sampleName: 'Robert Mathews',
    sampleRole: 'SUPER ADMIN',
    audiences: ['Staff'],
    orientation: 'portrait',
  },
  {
    id: 'tpl-landscape',
    name: 'ID Card 11',
    theme: 'landscape',
    sampleName: 'Robert Mathews',
    sampleRole: 'Super Admin',
    audiences: ['Staff'],
    orientation: 'landscape',
  },
];

export type MockStudent = {
  id: string;
  name: string;
  admissionNo: string;
  bloodGroup: string;
  dob: string;
  father: string;
  mother: string;
  phone: string;
  room: string;
  email?: string;
  joinDate?: string;
  group?: string;
  program?: string;
};

export const CERT_ROOMS = liveArray(() => loadActiveCenterRooms().map((room) => room.name));

export const CERT_GROUPS = liveArray(() => loadActiveCenterGroups().map((group) => group.name));

export const CERT_PROGRAMS = [
  'Full Day',
  'Half Day',
  'After School',
  'Toddler Care',
  'Kindergarten',
] as const;

export const STAFF_DEPARTMENTS = [
  'Administration',
  'Teaching',
  'Kitchen',
  'Transport',
  'Healthcare',
] as const;

export const STAFF_ROLES = [
  'Super Admin',
  'Center Head',
  'Teacher',
  'Assistant Teacher',
  'Nurse',
  'Cook',
  'Driver',
] as const;

export const STAFF_EMPLOYMENT = ['Full Time', 'Part Time', 'Contract'] as const;

export const MOCK_STUDENTS: MockStudent[] = liveArray(() =>
  loadEnrolledCenterStudents().map((student) => {
    const father = student.parents.find((parent: { role: string }) => parent.role === 'Father');
    const mother = student.parents.find((parent: { role: string }) => parent.role === 'Mother');
    return {
      id: student.id,
      name: student.name,
      admissionNo: student.admissionNumber || student.id,
      bloodGroup: student.bloodGroup || '—',
      dob: student.dob || student.ageLabel,
      father: father?.name || '—',
      mother: mother?.name || '—',
      phone: student.phone || father?.phone || mother?.phone || '—',
      room: roomName(student.roomIds[0] || ''),
      email: father?.email || mother?.email,
      joinDate: student.admissionDate,
      group: groupNames(student.groupIds),
      program: programNames(student.programIds),
    };
  }),
);

export const MOCK_STAFF: MockStudent[] = liveArray(() =>
  loadActiveCenterStaff().map((member) => ({
    id: member.id,
    name: member.name,
    admissionNo: member.employeeCode || member.id,
    bloodGroup: '—',
    dob: member.dob || '—',
    father: 'Emergency Contact',
    mother: 'Emergency Contact',
    phone: member.phone,
    room: member.rooms[0] || member.role,
    email: member.email,
    joinDate: member.joiningDate,
    group: member.role,
    program: 'Full Time',
  })),
);

export const MOCK_PICKUPS: MockStudent[] = liveArray(() => {
  const rows: MockStudent[] = [];
  for (const student of loadEnrolledCenterStudents()) {
    for (const pickup of student.authorizedPickups ?? []) {
      rows.push({
        id: pickup.id,
        name: pickup.name,
        admissionNo: pickup.id,
        bloodGroup: '—',
        dob: '—',
        father: student.name,
        mother: student.name,
        phone: pickup.phone || '—',
        room: roomName(student.roomIds[0] || ''),
        email: pickup.email,
        joinDate: student.admissionDate,
        group: pickup.relation,
        program: student.name,
      });
    }
  }
  return rows;
});

export type CertificateAudience = 'Student' | 'Staff';

export type CertificateTheme =
  | 'pastel'
  | 'playful'
  | 'starry'
  | 'graduation'
  | 'geo'
  | 'chevron'
  | 'classic'
  | 'modern';

export type CertificateTemplate = {
  id: string;
  name: string;
  theme: CertificateTheme;
  title: string;
  description: string;
  audiences: CertificateAudience[];
  sampleName: string;
};

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-pastel',
    name: 'Certificate 1',
    theme: 'pastel',
    title: 'Certificate of Participation',
    description:
      'In Recognition For a Record of Outstanding Accomplishments. For your hard work and dedication.',
    audiences: ['Student'],
    sampleName: 'Olivia Wilson',
  },
  {
    id: 'cert-playful',
    name: 'Certificate 2',
    theme: 'playful',
    title: 'Certificate of Participation',
    description:
      'For inspiring children to learn and for your willingness to give your all beyond what you earn.',
    audiences: ['Student'],
    sampleName: 'Jackson James',
  },
  {
    id: 'cert-starry',
    name: 'Certificate 3',
    theme: 'starry',
    title: 'Certificate of Graduation',
    description: 'Proudly awarded for completing this term with excellence and curiosity.',
    audiences: ['Student'],
    sampleName: 'Olivia Wilson',
  },
  {
    id: 'cert-graduation',
    name: 'Certificate 4',
    theme: 'graduation',
    title: 'Certificate of Graduation',
    description: 'Celebrating a joyful milestone and ready for the next adventure in learning.',
    audiences: ['Student'],
    sampleName: 'Aarav Sharma',
  },
  {
    id: 'cert-geo',
    name: 'Certificate 5',
    theme: 'geo',
    title: 'Certificate of Appreciation',
    description: 'With sincere appreciation for dedication, kindness, and classroom leadership.',
    audiences: ['Student', 'Staff'],
    sampleName: 'Estelle Darcy',
  },
  {
    id: 'cert-chevron',
    name: 'Certificate 6',
    theme: 'chevron',
    title: 'Certificate of Appreciation',
    description: 'Recognized for outstanding contribution and positive spirit every day.',
    audiences: ['Student', 'Staff'],
    sampleName: 'Marceline Anderson',
  },
  {
    id: 'cert-classic',
    name: 'Certificate 7',
    theme: 'classic',
    title: 'Certificate of Achievement',
    description: 'Awarded for academic excellence and consistent effort throughout the year.',
    audiences: ['Student', 'Staff'],
    sampleName: 'Robert Mathews',
  },
  {
    id: 'cert-modern',
    name: 'Certificate 8',
    theme: 'modern',
    title: 'Certificate of Merit',
    description: 'Presented for remarkable progress, creativity, and collaborative learning.',
    audiences: ['Student', 'Staff'],
    sampleName: 'Diya Patel',
  },
];

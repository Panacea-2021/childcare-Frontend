'use client';

import { assignCenterIdByIndex } from '@/lib/organization/centers';
import { loadGroups } from '@/lib/center-management/groupsStore';
import { liveArray } from '@/lib/center-management/liveList';
import { loadRooms } from '@/lib/center-management/roomsStore';

export type StaffStatus = 'Active' | 'Inactive';

export type StaffRole =
  | 'Administrator'
  | 'Principal'
  | 'Super Admin'
  | 'Center Head'
  | 'Teacher'
  | 'Senior Teacher'
  | 'Head Teacher'
  | 'Super User'
  | 'Finance Admin';

export const STAFF_ROLES: StaffRole[] = [
  'Administrator',
  'Principal',
  'Super Admin',
  'Center Head',
  'Teacher',
  'Senior Teacher',
  'Head Teacher',
  'Super User',
  'Finance Admin',
];

export const STAFF_ROOM_OPTIONS = liveArray(() =>
  loadRooms()
    .filter((r) => r.status !== 'Inactive')
    .map((r) => r.name),
);

export const STAFF_GROUP_OPTIONS = liveArray(() =>
  loadGroups()
    .filter((g) => g.status !== 'Inactive')
    .map((g) => g.name),
);

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  dob?: string;
  email: string;
  phone: string;
  address: string;
  employeeCode: string;
  kioskPin: string;
  joiningDate?: string;
  rooms: string[];
  groups: string[];
  shiftStart: string;
  shiftEnd: string;
  avatarUrl?: string;
  lastUpdatedBy?: string;
  /** Multi-center scope — required for org-admin filtering */
  centerId?: string;
};

const STORAGE_KEY = 'panacea.cm.staff';

export const SEED_STAFF: StaffMember[] = [
  // ── Demo Room (room-1): 2 staff, 2 active ──
  {
    id: 'staff-malika',
    name: 'Malika Thimisetty',
    role: 'Super Admin',
    status: 'Active',
    gender: 'Female',
    dob: '1992-05-15',
    email: 'malika@panacea.care',
    phone: '9090998544',
    address: 'Panacea Center',
    employeeCode: 'EMP-1',
    kioskPin: '4921',
    joiningDate: '2025-01-10',
    rooms: ['Demo Room'],
    groups: ['Administration'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-darshan',
    name: 'Darshan',
    role: 'Finance Admin',
    status: 'Active',
    gender: 'Male',
    dob: '',
    email: 'admin@panacea.care',
    phone: '6300662566',
    address: 'MANCHADAVALASA',
    employeeCode: 'EMP-2',
    kioskPin: '8343',
    joiningDate: '2026-07-29',
    rooms: ['Demo Room'],
    groups: ['Administration'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },

  // ── Demo Roomie (room-2): 3 staff, 3 active ──
  {
    id: 'staff-simran',
    name: 'Simran Jain',
    role: 'Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1995-08-20',
    email: 'simran@panacea.care',
    phone: '9835783245',
    address: 'Panacea Center',
    employeeCode: 'EMP-3',
    kioskPin: '1084',
    joiningDate: '2026-02-01',
    rooms: ['Demo Roomie'],
    groups: ['Toddlers'],
    shiftStart: '08:30',
    shiftEnd: '16:30',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-preethi',
    name: 'Preethi Rao',
    role: 'Head Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1990-03-12',
    email: 'preethi@panacea.care',
    phone: '9811223344',
    address: '10 Green Park, Chennai',
    employeeCode: 'EMP-4',
    kioskPin: '3321',
    joiningDate: '2025-06-01',
    rooms: ['Demo Roomie'],
    groups: ['Toddlers'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-anand',
    name: 'Anand Kumar',
    role: 'Teacher',
    status: 'Active',
    gender: 'Male',
    dob: '1988-11-25',
    email: 'anand@panacea.care',
    phone: '9922334455',
    address: '5 Lake View, Bengaluru',
    employeeCode: 'EMP-5',
    kioskPin: '5512',
    joiningDate: '2026-01-15',
    rooms: ['Demo Roomie'],
    groups: ['Toddlers'],
    shiftStart: '08:00',
    shiftEnd: '16:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },

  // ── Sunshine Room (room-3): 4 staff, 4 active ──
  {
    id: 'staff-meera',
    name: 'Meera Pillai',
    role: 'Senior Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1993-07-08',
    email: 'meera@panacea.care',
    phone: '9733556677',
    address: '3 Sunrise Lane, Kochi',
    employeeCode: 'EMP-6',
    kioskPin: '6643',
    joiningDate: '2025-03-20',
    rooms: ['Sunshine Room'],
    groups: ['Toddlers'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-rajan',
    name: 'Rajan Nair',
    role: 'Teacher',
    status: 'Active',
    gender: 'Male',
    dob: '1991-04-15',
    email: 'rajan@panacea.care',
    phone: '9644667788',
    address: '7 Palm Court, Trivandrum',
    employeeCode: 'EMP-7',
    kioskPin: '7754',
    joiningDate: '2025-08-01',
    rooms: ['Sunshine Room'],
    groups: ['Toddlers'],
    shiftStart: '08:30',
    shiftEnd: '16:30',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-kavitha',
    name: 'Kavitha Suresh',
    role: 'Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1994-12-01',
    email: 'kavitha@panacea.care',
    phone: '9555778899',
    address: '15 Moonlight Ave, Mysuru',
    employeeCode: 'EMP-8',
    kioskPin: '8865',
    joiningDate: '2026-01-05',
    rooms: ['Sunshine Room'],
    groups: ['Toddlers'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-suresh-s',
    name: 'Suresh Babu',
    role: 'Administrator',
    status: 'Active',
    gender: 'Male',
    dob: '1985-06-20',
    email: 'sureshb@panacea.care',
    phone: '9466889900',
    address: '22 Olive Street, Coimbatore',
    employeeCode: 'EMP-9',
    kioskPin: '9976',
    joiningDate: '2024-09-10',
    rooms: ['Sunshine Room'],
    groups: ['Administration'],
    shiftStart: '10:00',
    shiftEnd: '18:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },

  // ── Rainbow Room (room-4): 3 staff, 3 active ──
  {
    id: 'staff-anjali',
    name: 'Anjali Desai',
    role: 'Head Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1989-02-14',
    email: 'anjali@panacea.care',
    phone: '9377990011',
    address: '8 Rainbow Nagar, Pune',
    employeeCode: 'EMP-10',
    kioskPin: '1087',
    joiningDate: '2025-04-01',
    rooms: ['Rainbow Room'],
    groups: ['Pre-K'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-vijay',
    name: 'Vijay Patil',
    role: 'Teacher',
    status: 'Active',
    gender: 'Male',
    dob: '1992-09-30',
    email: 'vijay@panacea.care',
    phone: '9288001122',
    address: '12 Patil Heights, Nashik',
    employeeCode: 'EMP-11',
    kioskPin: '2198',
    joiningDate: '2025-11-01',
    rooms: ['Rainbow Room'],
    groups: ['Pre-K'],
    shiftStart: '08:00',
    shiftEnd: '16:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-sheela',
    name: 'Sheela Menon',
    role: 'Senior Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1990-05-05',
    email: 'sheela@panacea.care',
    phone: '9199112233',
    address: '3 Menon Villa, Thrissur',
    employeeCode: 'EMP-12',
    kioskPin: '3209',
    joiningDate: '2024-12-01',
    rooms: ['Rainbow Room'],
    groups: ['Pre-K'],
    shiftStart: '09:30',
    shiftEnd: '17:30',
    lastUpdatedBy: 'Malika Thimisetty',
  },

  // ── Star Room (room-5): 4 staff, 4 active ──
  {
    id: 'staff-kiran',
    name: 'Kiran Sharma',
    role: 'Principal',
    status: 'Active',
    gender: 'Male',
    dob: '1984-08-18',
    email: 'kiran@panacea.care',
    phone: '9100223344',
    address: '1 Star Palace, Jaipur',
    employeeCode: 'EMP-13',
    kioskPin: '4310',
    joiningDate: '2024-06-15',
    rooms: ['Star Room'],
    groups: ['Administration'],
    shiftStart: '08:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-pooja',
    name: 'Pooja Verma',
    role: 'Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1995-01-22',
    email: 'pooja@panacea.care',
    phone: '9011334455',
    address: '9 Star Colony, Indore',
    employeeCode: 'EMP-14',
    kioskPin: '5421',
    joiningDate: '2025-07-01',
    rooms: ['Star Room'],
    groups: ['After School'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-rahul',
    name: 'Rahul Agarwal',
    role: 'Teacher',
    status: 'Active',
    gender: 'Male',
    dob: '1993-03-10',
    email: 'rahul@panacea.care',
    phone: '9922445566',
    address: '17 Agarwal Nagar, Bhopal',
    employeeCode: 'EMP-15',
    kioskPin: '6532',
    joiningDate: '2026-03-01',
    rooms: ['Star Room'],
    groups: ['After School'],
    shiftStart: '08:30',
    shiftEnd: '16:30',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-divya',
    name: 'Divya Krishnan',
    role: 'Senior Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1991-10-15',
    email: 'divya@panacea.care',
    phone: '9833556677',
    address: '6 Lotus Drive, Coimbatore',
    employeeCode: 'EMP-16',
    kioskPin: '7643',
    joiningDate: '2025-09-15',
    rooms: ['Star Room'],
    groups: ['After School'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },

  // ── Nest / Garden / Inactive demos ──
  {
    id: 'staff-niya',
    name: 'Niya Fernandez',
    role: 'Teacher',
    status: 'Active',
    gender: 'Female',
    dob: '1996-04-02',
    email: 'niya@panacea.care',
    phone: '9744112233',
    address: '22 Nest Lane, Goa',
    employeeCode: 'EMP-17',
    kioskPin: '8754',
    joiningDate: '2026-01-20',
    rooms: ['Nest Room'],
    groups: ['Infant Care'],
    shiftStart: '08:30',
    shiftEnd: '16:30',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-omar',
    name: 'Omar Siddiqui',
    role: 'Senior Teacher',
    status: 'Active',
    gender: 'Male',
    dob: '1987-12-09',
    email: 'omar@panacea.care',
    phone: '9655223344',
    address: '4 Garden Path, Hyderabad',
    employeeCode: 'EMP-18',
    kioskPin: '9865',
    joiningDate: '2025-08-12',
    rooms: ['Garden Room', 'Nest Room'],
    groups: ['Infant Care', 'Support Staff'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-leena',
    name: 'Leena Vasudev',
    role: 'Teacher',
    status: 'Inactive',
    gender: 'Female',
    dob: '1994-06-21',
    email: 'leena@panacea.care',
    phone: '9566334455',
    address: '15 Quiet Street, Kochi',
    employeeCode: 'EMP-19',
    kioskPin: '1976',
    joiningDate: '2024-09-01',
    rooms: ['Moon Room'],
    groups: ['Toddlers'],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
  {
    id: 'staff-harsh',
    name: 'Harsh Malhotra',
    role: 'Center Head',
    status: 'Inactive',
    gender: 'Male',
    dob: '1985-11-03',
    email: 'harsh@panacea.care',
    phone: '9477445566',
    address: '7 Admin Block, Delhi',
    employeeCode: 'EMP-20',
    kioskPin: '2087',
    joiningDate: '2023-04-18',
    rooms: ['Demo Room'],
    groups: ['Administration'],
    shiftStart: '08:00',
    shiftEnd: '18:00',
    lastUpdatedBy: 'Malika Thimisetty',
  },
];

function withCenterIds(list: StaffMember[]): StaffMember[] {
  return list.map((s, i) => ({ ...s, centerId: s.centerId ?? assignCenterIdByIndex(i) }));
}

/** In-memory cache — avoids re-parsing localStorage on every interaction. */
let staffCache: StaffMember[] | null = null;

export function loadStaff(): StaffMember[] {
  if (staffCache) return staffCache;
  if (typeof window === 'undefined') {
    staffCache = withCenterIds(SEED_STAFF);
    return staffCache;
  }
  try {
    // Always reset to latest SEED_STAFF to pick up new room assignments
    const VERSION_KEY = 'panacea.cm.staff.version';
    const CURRENT_VERSION = '4';
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      const seeded = withCenterIds(SEED_STAFF);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      staffCache = seeded;
      return staffCache;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = withCenterIds(SEED_STAFF);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      staffCache = seeded;
      return staffCache;
    }
    staffCache = withCenterIds(JSON.parse(raw) as StaffMember[]);
    return staffCache;
  } catch {
    staffCache = withCenterIds(SEED_STAFF);
    return staffCache;
  }
}

export function saveStaff(data: StaffMember[]): void {
  staffCache = data;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
}

export function generateKioskPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateEmployeeCode(count: number): string {
  return `EMP-${count + 1}`;
}

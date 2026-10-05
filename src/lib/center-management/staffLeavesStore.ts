import { ABSENT_TYPES, dateInputValue, formatAttDate, studentInitials } from './attendanceStore';
import { loadStaff, STAFF_ROOM_OPTIONS } from './staffStore';

export type LeaveStatus = 'Pending' | 'Approved' | 'Denied';

export type LeaveComment = {
  id: string;
  author: string;
  role: 'Staff' | 'Admin';
  text: string;
  createdAt: string;
  likes: number;
  staffOnly?: boolean;
};

export type StaffLeave = {
  id: string;
  staffId: string;
  staffName: string;
  roomId?: string;
  roomName: string;
  appliedOn: string;
  type: string;
  from: string;
  to: string;
  reason: string;
  status: LeaveStatus;
  fileName?: string;
  comments: LeaveComment[];
  reviewNote?: string;
};

const STORAGE_KEY = 'panacea.cm.staffLeaves';
const VERSION_KEY = 'panacea.cm.staffLeaves.version';
const VERSION = '1';
const PERMS_KEY = 'panacea.cm.staffLeavePerms';

export const STAFF_LEAVE_TYPES = [
  ...ABSENT_TYPES,
  'Sick Leave',
  'Medical Leave',
  'Vacation',
  'Personal',
].filter((v, i, a) => a.indexOf(v) === i);

export type LeaveRolePerm = {
  role: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
};

const DEFAULT_PERMS: LeaveRolePerm[] = [
  { role: 'Finance Admin', view: true, create: false, edit: false, approve: false },
  { role: 'Administrator', view: true, create: true, edit: true, approve: true },
  { role: 'Center Head', view: true, create: true, edit: true, approve: true },
  { role: 'Principal', view: true, create: true, edit: true, approve: true },
  { role: 'Super Admin', view: true, create: true, edit: true, approve: true },
  { role: 'Teacher', view: true, create: true, edit: false, approve: false },
  { role: 'Senior Teacher', view: true, create: true, edit: true, approve: false },
  { role: 'Head Teacher', view: true, create: true, edit: true, approve: true },
  { role: 'Super User', view: true, create: true, edit: true, approve: true },
];

export function loadStaffLeavePermissions(): LeaveRolePerm[] {
  if (typeof window === 'undefined') return DEFAULT_PERMS.map((p) => ({ ...p }));
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    if (!raw) return DEFAULT_PERMS.map((p) => ({ ...p }));
    return JSON.parse(raw) as LeaveRolePerm[];
  } catch {
    return DEFAULT_PERMS.map((p) => ({ ...p }));
  }
}

export function saveStaffLeavePermissions(rows: LeaveRolePerm[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PERMS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

function daysBetween(from: string, to: string) {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

export function leaveDurationLabel(from: string, to: string) {
  const n = daysBetween(from, to);
  return n === 1 ? '1 day' : `${n} days`;
}

function seedLeaves(): StaffLeave[] {
  const today = dateInputValue();
  const staff = loadStaff().filter((s) => s.status === 'Active');
  const a = staff.find((s) => s.name === 'Darshan') || staff[0];
  const b = staff.find((s) => s.name === 'Simran Jain') || staff[1] || staff[0];
  if (!a) return [];

  const roomOf = (s: typeof a) => s.rooms[0] || STAFF_ROOM_OPTIONS[0] || 'Demo Room';

  const rows: StaffLeave[] = [
    {
      id: 'staff-leave-1',
      staffId: a.id,
      staffName: a.name,
      roomId: roomOf(a),
      roomName: roomOf(a),
      appliedOn: today,
      type: 'Sick Leave',
      from: today,
      to: today,
      reason: 'Fever',
      status: 'Pending',
      comments: [],
    },
  ];

  if (b && b.id !== a.id) {
    rows.push({
      id: 'staff-leave-2',
      staffId: b.id,
      staffName: b.name,
      roomId: roomOf(b),
      roomName: roomOf(b),
      appliedOn: today,
      type: 'Medical Leave',
      from: today,
      to: today,
      reason: 'Fever',
      status: 'Pending',
      comments: [],
    });
  }

  return rows;
}

export function loadStaffLeaves(): StaffLeave[] {
  if (typeof window === 'undefined') return seedLeaves();
  try {
    if (localStorage.getItem(VERSION_KEY) !== VERSION) {
      const seeded = seedLeaves();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(VERSION_KEY, VERSION);
      return seeded;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedLeaves();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as StaffLeave[];
  } catch {
    return seedLeaves();
  }
}

export function saveStaffLeaves(rows: StaffLeave[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function upsertStaffLeave(leave: StaffLeave) {
  const rows = loadStaffLeaves();
  const next = [leave, ...rows.filter((r) => r.id !== leave.id)];
  saveStaffLeaves(next);
  return next;
}

export function deleteStaffLeave(id: string) {
  const next = loadStaffLeaves().filter((r) => r.id !== id);
  saveStaffLeaves(next);
  return next;
}

export function setStaffLeaveStatus(id: string, status: LeaveStatus, reviewNote?: string) {
  const next = loadStaffLeaves().map((r) =>
    r.id === id ? { ...r, status, reviewNote: reviewNote?.trim() || r.reviewNote } : r,
  );
  saveStaffLeaves(next);
  return next;
}

export function addStaffLeaveComment(
  leaveId: string,
  comment: Omit<LeaveComment, 'id' | 'createdAt' | 'likes'>,
) {
  const next = loadStaffLeaves().map((r) => {
    if (r.id !== leaveId) return r;
    const row: LeaveComment = {
      id: `slc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      ...comment,
    };
    return { ...r, comments: [row, ...r.comments] };
  });
  saveStaffLeaves(next);
  return next;
}

export function staffLeaveStats(rows: StaffLeave[], today = dateInputValue()) {
  const weekStart = (() => {
    const d = new Date(`${today}T12:00:00`);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return dateInputValue(d);
  })();
  const weekEnd = (() => {
    const d = new Date(`${weekStart}T12:00:00`);
    d.setDate(d.getDate() + 6);
    return dateInputValue(d);
  })();

  const overlaps = (r: StaffLeave, a: string, b: string) => r.from <= b && r.to >= a;

  return {
    all: rows.length,
    outToday: rows.filter((r) => r.status === 'Approved' && overlaps(r, today, today)).length,
    outWeek: rows.filter((r) => r.status === 'Approved' && overlaps(r, weekStart, weekEnd)).length,
    approved: rows.filter((r) => r.status === 'Approved').length,
    pending: rows.filter((r) => r.status === 'Pending').length,
  };
}

export { formatAttDate, studentInitials };

import { ABSENT_TYPES, dateInputValue, formatAttDate, studentInitials } from './attendanceStore';
import { loadStudents } from './studentsStore';

export type LeaveStatus = 'Pending' | 'Approved' | 'Denied';

export type LeaveComment = {
  id: string;
  author: string;
  role: 'Staff' | 'Parent';
  text: string;
  createdAt: string;
  likes: number;
  staffOnly?: boolean;
};

export type StudentLeave = {
  id: string;
  studentId: string;
  studentName: string;
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

const STORAGE_KEY = 'panacea.cm.studentLeaves';
const VERSION_KEY = 'panacea.cm.studentLeaves.version';
const VERSION = '1';

export const DEFAULT_LEAVE_TYPES = [...ABSENT_TYPES] as string[];

/** @deprecated use loadLeaveTypes() */
export const LEAVE_TYPES = DEFAULT_LEAVE_TYPES;

const TYPES_KEY = 'panacea.cm.leaveTypes';
const PERMS_KEY = 'panacea.cm.leavePerms';

export function loadLeaveTypes(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_LEAVE_TYPES];
  try {
    const raw = localStorage.getItem(TYPES_KEY);
    if (!raw) return [...DEFAULT_LEAVE_TYPES];
    const parsed = JSON.parse(raw) as string[];
    return parsed.length ? parsed : [...DEFAULT_LEAVE_TYPES];
  } catch {
    return [...DEFAULT_LEAVE_TYPES];
  }
}

export function saveLeaveTypes(types: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TYPES_KEY, JSON.stringify(types));
  } catch {
    /* ignore */
  }
}

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

export function loadLeavePermissions(): LeaveRolePerm[] {
  if (typeof window === 'undefined') return DEFAULT_PERMS.map((p) => ({ ...p }));
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    if (!raw) return DEFAULT_PERMS.map((p) => ({ ...p }));
    return JSON.parse(raw) as LeaveRolePerm[];
  } catch {
    return DEFAULT_PERMS.map((p) => ({ ...p }));
  }
}

export function saveLeavePermissions(rows: LeaveRolePerm[]) {
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

function seedLeaves(): StudentLeave[] {
  const today = dateInputValue();
  const students = loadStudents().filter((s) => s.status === 'Active' || s.status === 'Signed up');
  const first = students[0];
  if (!first) return [];
  return [
    {
      id: 'leave-1',
      studentId: first.id,
      studentName: first.name,
      roomId: first.roomIds[0],
      roomName: 'Demo Room',
      appliedOn: today,
      type: 'Fever',
      from: today,
      to: today,
      reason: 'Unable to Attend',
      status: 'Pending',
      comments: [],
    },
  ];
}

export function loadStudentLeaves(): StudentLeave[] {
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
    return JSON.parse(raw) as StudentLeave[];
  } catch {
    return seedLeaves();
  }
}

export function saveStudentLeaves(rows: StudentLeave[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function upsertStudentLeave(leave: StudentLeave) {
  const rows = loadStudentLeaves();
  const next = [leave, ...rows.filter((r) => r.id !== leave.id)];
  saveStudentLeaves(next);
  return next;
}

export function deleteStudentLeave(id: string) {
  const next = loadStudentLeaves().filter((r) => r.id !== id);
  saveStudentLeaves(next);
  return next;
}

export function setLeaveStatus(id: string, status: LeaveStatus, reviewNote?: string) {
  const next = loadStudentLeaves().map((r) =>
    r.id === id ? { ...r, status, reviewNote: reviewNote?.trim() || r.reviewNote } : r,
  );
  saveStudentLeaves(next);
  return next;
}

export function addLeaveComment(leaveId: string, comment: Omit<LeaveComment, 'id' | 'createdAt' | 'likes'>) {
  const next = loadStudentLeaves().map((r) => {
    if (r.id !== leaveId) return r;
    const row: LeaveComment = {
      id: `lc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      ...comment,
    };
    return { ...r, comments: [row, ...r.comments] };
  });
  saveStudentLeaves(next);
  return next;
}

export function leaveStats(rows: StudentLeave[], today = dateInputValue()) {
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

  const overlaps = (r: StudentLeave, a: string, b: string) => r.from <= b && r.to >= a;

  return {
    all: rows.length,
    outToday: rows.filter((r) => r.status === 'Approved' && overlaps(r, today, today)).length,
    outWeek: rows.filter((r) => r.status === 'Approved' && overlaps(r, weekStart, weekEnd)).length,
    approved: rows.filter((r) => r.status === 'Approved').length,
    pending: rows.filter((r) => r.status === 'Pending').length,
  };
}

export { formatAttDate, studentInitials };

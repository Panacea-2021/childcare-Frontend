import { getSession } from '@/lib/auth';
import { STAFF } from './mockData';

export type CurrentStaff = {
  name: string;
  department: string;
  initials: string;
  isAdmin: boolean;
};

/** Frontend-only identity used to filter My Tasks / gate All Tasks. */
export function getCurrentStaff(): CurrentStaff {
  const session = getSession();

  if (!session || session.method === 'phone') {
    const admin = STAFF.find((s) => s.name === 'Organization Admin') ?? STAFF[0];
    // Demo: map phone admin to Darshan so My Tasks has seed data, with admin privileges
    const darshan = STAFF.find((s) => s.name === 'Darshan') ?? admin;
    return {
      name: darshan.name,
      department: darshan.department,
      initials: darshan.initials,
      isAdmin: true,
    };
  }

  const local = session.identifier.includes('@')
    ? (session.identifier.split('@')[0] ?? '').replace(/[._-]/g, ' ')
    : session.identifier;

  const title = local
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');

  const match =
    STAFF.find((s) => s.name.toLowerCase() === title.toLowerCase()) ||
    STAFF.find((s) => title && s.name.toLowerCase().includes(title.toLowerCase()));

  if (match) {
    return {
      name: match.name,
      department: match.department,
      initials: match.initials,
      isAdmin: match.name === 'Organization Admin' || match.name === 'Darshan',
    };
  }

  return {
    name: 'Darshan',
    department: 'Admissions',
    initials: 'DA',
    isAdmin: true,
  };
}

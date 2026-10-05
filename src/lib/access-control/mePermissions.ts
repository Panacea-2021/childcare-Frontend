/**
 * Effective permissions for the authenticated staff member.
 * Mirrors GET /api/v1/me/permissions — local until backend exists.
 */

import { getSession, type AuthSession } from '@/lib/auth';
import { loadStaff, type StaffMember } from '@/lib/center-management/staffStore';
import { getEffectivePermissionIdsForRole, normalizeAccessRoleName } from './normalizeRole';
import { ensureRolePermissionsSeeded } from './rolePermissionStore';

export type MePermissionsPayload = {
  user: {
    id: string;
    staffId: string;
    roleId: string;
    roleName: string;
    centerId?: string;
    name: string;
    mobile: string;
    email: string;
  };
  permissions: string[];
};

export function findStaffByPhone(phone: string): StaffMember | null {
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (last10.length < 10) return null;
  const staff = loadStaff().find(
    (s) => s.status === 'Active' && s.phone.replace(/\D/g, '').slice(-10) === last10,
  );
  return staff ?? null;
}

export function findStaffByEmail(email: string): StaffMember | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return (
    loadStaff().find((s) => s.status === 'Active' && s.email.trim().toLowerCase() === normalized) ??
    null
  );
}

export function findStaffById(id: string): StaffMember | null {
  return loadStaff().find((s) => s.id === id) ?? null;
}

/** Resolve staff for social / identifier login — role always from staff record. */
export function resolveStaffForSession(session: AuthSession): StaffMember | null {
  if (session.staffId) {
    const byId = findStaffById(session.staffId);
    if (byId) return byId;
  }
  if (session.method === 'phone') {
    return findStaffByPhone(session.identifier);
  }
  if (session.identifier.includes('@')) {
    return findStaffByEmail(session.identifier);
  }
  // Social demo without email: use first Active Super Admin / Administrator from store
  const staff = loadStaff().filter((s) => s.status === 'Active');
  return (
    staff.find((s) => s.role === 'Super Admin' || s.role === 'Super User') ??
    staff.find((s) => s.role === 'Administrator') ??
    staff[0] ??
    null
  );
}

export function buildMePermissions(staff: StaffMember): MePermissionsPayload {
  ensureRolePermissionsSeeded();
  const roleName = normalizeAccessRoleName(staff.role);
  const permissions = getEffectivePermissionIdsForRole(roleName);
  return {
    user: {
      id: staff.id,
      staffId: staff.id,
      roleId: roleName,
      roleName,
      centerId: staff.centerId,
      name: staff.name,
      mobile: staff.phone,
      email: staff.email,
    },
    permissions,
  };
}

/** Client equivalent of GET /api/v1/me/permissions */
export async function fetchMePermissions(): Promise<MePermissionsPayload | null> {
  const session = getSession();
  if (!session) return null;
  // Simulate network boundary used by real API clients
  await Promise.resolve();
  const staff = resolveStaffForSession(session);
  if (!staff) return null;
  return buildMePermissions(staff);
}

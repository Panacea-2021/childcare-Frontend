import type { StaffRole } from '@/lib/center-management/staffStore';
import { ACCESS_CONTROL_ROLES } from './catalog';
import { getRolePermissions } from './rolePermissionStore';

/** Map staff profile roles onto Access Control role names. */
export function normalizeAccessRoleName(role: string | null | undefined): string {
  if (!role) return 'Teacher';
  const trimmed = role.trim();
  if (trimmed === 'Super User') return 'Super Admin';
  if ((ACCESS_CONTROL_ROLES as readonly string[]).includes(trimmed)) return trimmed;
  return trimmed;
}

export function getEffectivePermissionIdsForRole(roleName: string): string[] {
  return getRolePermissions(normalizeAccessRoleName(roleName));
}

export function isAccessControlRole(role: string): role is (typeof ACCESS_CONTROL_ROLES)[number] {
  return (ACCESS_CONTROL_ROLES as readonly string[]).includes(role);
}

export type StaffRoleCompatible = StaffRole | 'Finance Admin';

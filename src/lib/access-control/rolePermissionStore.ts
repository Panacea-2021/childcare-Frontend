/** Role → permission persistence (local store until backend APIs exist). */

import {
  ACCESS_CONTROL_ROLES,
  ALL_PERMISSION_IDS,
  defaultCheckedForRole,
} from './catalog';

const STORAGE_KEY = 'panacea.ac.rolePermissions';

export type RolePermissionMap = Record<string, string[]>;

function readMap(): RolePermissionMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RolePermissionMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: RolePermissionMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Ensure every known role has a seeded permission set. */
export function ensureRolePermissionsSeeded(): RolePermissionMap {
  const map = readMap();
  let dirty = false;
  for (const role of ACCESS_CONTROL_ROLES) {
    if (!Array.isArray(map[role])) {
      map[role] = Array.from(defaultCheckedForRole(role));
      dirty = true;
    }
  }
  if (dirty) writeMap(map);
  return map;
}

export function getRolePermissions(roleName: string): string[] {
  const map = ensureRolePermissionsSeeded();
  if (Array.isArray(map[roleName])) return [...map[roleName]];
  return Array.from(defaultCheckedForRole(roleName));
}

export function setRolePermissions(roleName: string, permissionIds: string[]): void {
  const map = ensureRolePermissionsSeeded();
  const allowed = new Set(ALL_PERMISSION_IDS);
  map[roleName] = permissionIds.filter((id) => allowed.has(id));
  writeMap(map);
}

export function getAllRolePermissionMap(): RolePermissionMap {
  return { ...ensureRolePermissionsSeeded() };
}

export function clearRolePermissionStore(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

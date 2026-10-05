/**
 * Simulated API authorization layer (until real backend exists).
 * Always derives permissions from authenticated staff session — never from request body.
 */

import { getSession } from '@/lib/auth';
import { resolveStaffForSession, buildMePermissions } from './mePermissions';
import { can, hasAnyPermission } from './authorization';

export type AuthzResult =
  | { ok: true; status: 200; permissions: string[]; roleName: string; staffId: string }
  | { ok: false; status: 401 | 403; message: string };

export function authorizePermission(permissionId: string): AuthzResult {
  const session = getSession();
  if (!session) {
    return { ok: false, status: 401, message: 'Unauthenticated' };
  }
  const staff = resolveStaffForSession(session);
  if (!staff) {
    return { ok: false, status: 401, message: 'Staff identity not resolved' };
  }
  const me = buildMePermissions(staff);
  if (!can(me.permissions, permissionId)) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }
  return {
    ok: true,
    status: 200,
    permissions: me.permissions,
    roleName: me.user.roleName,
    staffId: me.user.staffId,
  };
}

export function authorizeAny(permissionIds: string[]): AuthzResult {
  const session = getSession();
  if (!session) {
    return { ok: false, status: 401, message: 'Unauthenticated' };
  }
  const staff = resolveStaffForSession(session);
  if (!staff) {
    return { ok: false, status: 401, message: 'Staff identity not resolved' };
  }
  const me = buildMePermissions(staff);
  if (!hasAnyPermission(me.permissions, permissionIds)) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }
  return {
    ok: true,
    status: 200,
    permissions: me.permissions,
    roleName: me.user.roleName,
    staffId: me.user.staffId,
  };
}

/** Alias used by mutation handlers in the UI layer */
export function authorizeMutation(permissionId: string): AuthzResult {
  return authorizePermission(permissionId);
}

/** Persist role permissions — requires cm-ac-settings */
export function authorizeSaveRolePermissions(): AuthzResult {
  return authorizePermission('cm-ac-settings');
}

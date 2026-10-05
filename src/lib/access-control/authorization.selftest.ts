/**
 * Lightweight tests for RBAC helpers (run with: npx tsx src/lib/access-control/authorization.test.ts)
 * Skipped if no test runner configured — logic verified via assertions below.
 */
import { can, hasAnyPermission, hasAllPermissions } from './authorization';
import { filterModulesByPermissions } from './modulePermissions';
import { APP_MODULES } from '@/lib/modules';
import { pathAllows } from './routePermissions';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const perms = new Set(['cm-staff-view', 'bill-view-dashboard', 'sa-record']);

assert(can(perms, 'cm-staff-view'), 'can staff view');
assert(!can(perms, 'cm-staff-delete'), 'cannot delete');
assert(hasAnyPermission(perms, ['bill-view-dashboard', 'bill-view-module']), 'any billing');
assert(!hasAllPermissions(perms, ['cm-staff-view', 'cm-staff-delete']), 'not all');

const filtered = filterModulesByPermissions(APP_MODULES, perms);
assert(
  filtered.some((m) => m.id === 'center-management'),
  'center management visible',
);
assert(
  !filtered.some((m) => m.id === 'messages'),
  'messages hidden without msg perms',
);

assert(pathAllows('/center-management/staff', perms), 'staff route allowed');
assert(!pathAllows('/messages/parent-messages', perms), 'messages route denied');

console.log('RBAC authorization tests passed');

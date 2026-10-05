/**
 * Pure permission checks — use with effective permission id sets.
 * Prefer usePermissions() in React; use these in non-React helpers.
 */

export function can(permissions: Iterable<string>, permissionId: string): boolean {
  if (!permissionId) return false;
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  return set.has(permissionId);
}

export function hasAnyPermission(
  permissions: Iterable<string>,
  permissionIds: string[],
): boolean {
  if (!permissionIds.length) return true;
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  return permissionIds.some((id) => set.has(id));
}

export function hasAllPermissions(
  permissions: Iterable<string>,
  permissionIds: string[],
): boolean {
  if (!permissionIds.length) return true;
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  return permissionIds.every((id) => set.has(id));
}

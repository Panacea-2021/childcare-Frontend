import fs from 'fs';

const path = 'src/components/modules/SettingsAccessControlSection.tsx';
const src = fs.readFileSync(path, 'utf8');
const start = src.indexOf('const ROLES = [');
const end = src.indexOf('function CircleCheck');
if (start < 0 || end < 0) {
  console.error('markers not found', start, end);
  process.exit(1);
}
let chunk = src.slice(start, end);
chunk = chunk
  .replace('const ROLES', 'export const ACCESS_CONTROL_ROLES')
  .replace('const CATEGORIES', 'export const ACCESS_CONTROL_CATEGORIES')
  .replace('function allPermissionIds', 'export function allPermissionIds')
  .replace('const ALL_IDS = allPermissionIds();', 'export const ALL_PERMISSION_IDS = allPermissionIds();')
  .replace(/\bALL_IDS\b/g, 'ALL_PERMISSION_IDS')
  .replace('function defaultCheckedForRole', 'export function defaultCheckedForRole');

const header = `/** Canonical Access Control catalog — single source of truth. */
export type Permission = { id: string; label: string };
export type PermissionGroup = { id: string; label: string; permissions: Permission[] };
export type Category = {
  id: string;
  label: string;
  groups: PermissionGroup[];
  topLevel?: Permission[];
};

`;

fs.mkdirSync('src/lib/access-control', { recursive: true });
fs.writeFileSync('src/lib/access-control/catalog.ts', header + chunk);
console.log('wrote catalog', (header + chunk).length, 'chars');

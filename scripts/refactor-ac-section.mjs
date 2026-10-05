import fs from 'fs';

const path = 'src/components/modules/SettingsAccessControlSection.tsx';
const src = fs.readFileSync(path, 'utf8');
const start = src.indexOf('type Permission');
const end = src.indexOf('function CircleCheck');
if (start < 0 || end < 0) {
  console.error('fail', start, end);
  process.exit(1);
}

const importStart = src.indexOf("import { useEffect");
const importsBlock = src.slice(importStart, start);
const rest = src.slice(end);

const acImport = `import {
  ACCESS_CONTROL_CATEGORIES as CATEGORIES,
  ACCESS_CONTROL_ROLES as ROLES,
  ALL_PERMISSION_IDS as ALL_IDS,
  defaultCheckedForRole,
  getRolePermissions,
  setRolePermissions,
} from '@/lib/access-control';

`;

const out = `'use client';\n\n${importsBlock}${acImport}${rest}`;
fs.writeFileSync(path, out);
console.log('rewrote AC section', out.length);

/**
 * OneDrive + Turbopack fix (no junction — Turbopack rejects links outside the project root).
 *
 * 1) Ensures a real node_modules folder inside the project
 * 2) Pins it with attrib +P ("Always keep on this device")
 * 3) Strips package .map files that Turbopack tries to read and OneDrive often locks
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nm = path.join(projectRoot, 'node_modules');
const depsRoot = path.join(
  process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
  'childcare-frontend-deps',
);
const stagingNm = path.join(depsRoot, 'node_modules');

const IO_REPARSE_TAG_MOUNT_POINT = 0xa0000003;
const IO_REPARSE_TAG_SYMLINK = 0xa000000c;

function getReparseTag(p) {
  if (!fs.existsSync(p)) return null;
  try {
    const out = execSync(`fsutil reparsepoint query "${p}"`, { encoding: 'utf8' });
    const match = out.match(/Reparse Tag Value\s*:\s*(0x[0-9a-fA-F]+)/i);
    return match ? parseInt(match[1], 16) : null;
  } catch {
    return null;
  }
}

/** Junction/symlink only — OneDrive folders also have reparse tags but are not links. */
function isTurbopackIncompatibleLink(p) {
  const tag = getReparseTag(p);
  return tag === IO_REPARSE_TAG_MOUNT_POINT || tag === IO_REPARSE_TAG_SYMLINK;
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd || projectRoot,
    stdio: opts.stdio || 'inherit',
    env: process.env,
    shell: Boolean(opts.shell),
  });
  const code = res.status ?? 1;
  if (opts.allowCodes?.includes(code)) return res;
  if (code !== 0) throw new Error(`${cmd} failed (${code})`);
  return res;
}

function pin(p) {
  if (process.platform !== 'win32' || !fs.existsSync(p)) return;
  try {
    execSync(`attrib +P /S /D "${p}"`, { stdio: 'ignore' });
    console.log('[deps] Pinned (Always keep on this device):', p);
  } catch {
    console.warn('[deps] Could not attrib +P — pin the folder manually in Explorer.');
  }
}

function stripMaps(root) {
  if (!fs.existsSync(root)) return 0;
  let n = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === '.cache') continue;
        stack.push(full);
      } else if (ent.name.endsWith('.map')) {
        try {
          fs.unlinkSync(full);
          n += 1;
        } catch {
          // ignore locked maps
        }
      }
    }
  }
  return n;
}

console.log('[deps] Repairing OneDrive/Turbopack node_modules…');

// If junction → LocalAppData, replace with a real in-project folder.
if (isTurbopackIncompatibleLink(nm)) {
  console.log('[deps] Removing Turbopack-incompatible junction…');
  execSync(`cmd /c rmdir "${nm}"`, { stdio: 'inherit' });
}

if (!fs.existsSync(path.join(nm, 'next', 'package.json'))) {
  if (fs.existsSync(path.join(stagingNm, 'next', 'package.json'))) {
    console.log('[deps] Copying packages from LocalAppData staging into project…');
    fs.mkdirSync(nm, { recursive: true });
    run(
      'cmd',
      ['/c', 'robocopy', stagingNm, nm, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np'],
      { allowCodes: [0, 1, 2, 3, 4, 5, 6, 7], stdio: 'ignore' },
    );
  } else {
    console.log('[deps] Installing packages…');
    run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--no-fund', '--no-audit']);
  }
}

const nextCache = path.join(projectRoot, '.next');
if (fs.existsSync(nextCache)) {
  console.log('[deps] Clearing .next…');
  fs.rmSync(nextCache, { recursive: true, force: true });
}

pin(nm);
const removed = stripMaps(nm);
console.log('[deps] Removed %d source-map files (avoids OneDrive .map lock errors)', removed);

if (!fs.existsSync(path.join(nm, 'next', 'package.json'))) {
  throw new Error('next is still missing after repair');
}

console.log('[deps] Done. Restart with: npm run dev');
console.log('[deps] Also: right-click this project folder → Always keep on this device');

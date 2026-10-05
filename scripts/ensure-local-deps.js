/**
 * Guard used by predev/postinstall.
 * - Rejects out-of-tree junctions (Turbopack panics on them)
 * - Ensures next is present; otherwise runs full repair
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nm = path.join(projectRoot, 'node_modules');
const fixScript = path.join(__dirname, 'fix-onedrive-deps.js');

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

function needsRepair() {
  if (!fs.existsSync(nm)) return true;
  if (isTurbopackIncompatibleLink(nm)) return true; // Turbopack: "points out of the filesystem root"
  if (!fs.existsSync(path.join(nm, 'next', 'package.json'))) return true;
  return false;
}

if (!needsRepair()) process.exit(0);

console.warn('[deps] node_modules needs OneDrive/Turbopack repair…');
const res = spawnSync(process.execPath, [fixScript], {
  cwd: projectRoot,
  stdio: 'inherit',
});
process.exit(res.status || 0);

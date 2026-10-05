/**
 * Dev launcher optimized for fast compiles.
 *
 * - Turbopack by default (set NEXT_NO_TURBO=1 to use webpack)
 * - Native SWC by default (set FORCE_NEXT_WASM=1 if Windows WDAC blocks the .node binary)
 * - Frees port 3001 if something is already listening
 */
const { spawnSync, execSync } = require('child_process');
const path = require('path');

process.env.NEXT_TELEMETRY_DISABLED = '1';

const PORT = 3001;
const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const forceWasm = process.env.FORCE_NEXT_WASM === '1';
// Turbopack cannot run on WASM bindings.
let useTurbo = process.env.NEXT_NO_TURBO !== '1' && !forceWasm;

// Turbopack requires native bindings. WASM mode breaks with:
// `turbo.createProject is not supported by the wasm bindings.`
if (forceWasm) {
  process.env.NEXT_TEST_WASM = '1';
  console.log('[dev] FORCE_NEXT_WASM=1 → using WASM SWC without Turbopack (slower)');
} else {
  // Pin empty so Next does not re-enable WASM from .env.local (dotenv won't override).
  process.env.NEXT_DISABLE_SWC_WASM = '1';
  process.env.NEXT_TEST_WASM = '';
}

function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        if (!line.includes('LISTENING')) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`Freed port ${port} (killed PID ${pid})`);
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* nothing listening */
  }
}

freePort(PORT);

const args = ['dev', '-p', String(PORT)];
if (useTurbo) {
  args.push('--turbopack');
  console.log('[dev] Turbopack enabled for faster route compiles');
}

const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);

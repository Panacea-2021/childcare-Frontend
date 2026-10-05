/**
 * Build launcher.
 * Native SWC by default. Set FORCE_NEXT_WASM=1 if Windows WDAC blocks the native binary.
 */
const { spawn } = require('child_process');
const path = require('path');

process.env.NEXT_TELEMETRY_DISABLED = '1';

if (process.env.FORCE_NEXT_WASM === '1') {
  process.env.NEXT_TEST_WASM = '1';
  console.log('[build] FORCE_NEXT_WASM=1 → using WASM SWC');
} else {
  delete process.env.NEXT_TEST_WASM;
}

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..'),
});

child.on('exit', (code) => process.exit(code ?? 0));

/** Shared lock so nested Modal/Drawer keep page blur until the last overlay closes. */
let overlayLocks = 0;

export function lockUiOverlay() {
  overlayLocks += 1;
  document.documentElement.classList.add('ui-overlay-open');
  document.body.classList.add('ui-overlay-open');
}

export function unlockUiOverlay() {
  overlayLocks = Math.max(0, overlayLocks - 1);
  if (overlayLocks === 0) {
    document.documentElement.classList.remove('ui-overlay-open');
    document.body.classList.remove('ui-overlay-open');
  }
}

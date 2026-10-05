'use client';

/** Instant boot — no artificial delay before showing the dashboard. */
export function useDashboardBoot(_delayMs = 0): boolean {
  return true;
}

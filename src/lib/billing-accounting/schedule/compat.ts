/**
 * Backward-compatible aliases for older call sites / docs.
 */

import {
  cycleContaining,
  shiftCycle,
  selectionModeForFrequency,
  formatPreviewDate,
  weekStartKey,
  addDateDays,
} from './dateUtils';
import { findCurrentCycle } from './billingCycleGenerator';
import type { IsoBounds } from './types';

/** Raw Sunday–Saturday week containing the reference date. */
export function weekContaining(ref: Date | string = new Date()): IsoBounds {
  return cycleContaining(ref, 'Weekly', false);
}

/**
 * Current calendar billing cycle used for invoice schedule.
 * = cycle that contains today (confirmed client rule).
 */
export function getCurrentBillingCycle(referenceDate: Date | string = new Date()): IsoBounds {
  return findCurrentCycle(referenceDate, 'Weekly', false);
}

export function shiftWeek(bounds: IsoBounds, weeks: number): IsoBounds {
  return shiftCycle(bounds, weeks, 'Weekly', false);
}

export {
  selectionModeForFrequency,
  formatPreviewDate,
  cycleContaining,
  shiftCycle,
  weekStartKey,
  addDateDays,
};

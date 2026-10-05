/**
 * BillingCycleGenerator
 *
 * Frequency + Plan Start + Plan End → ordered list of billing cycles.
 * Cycles are service periods, not invoice dates.
 */

import type { PlanFrequency } from '../feePlansStore';
import {
  addDateDays,
  addMonths,
  boundsFromStart,
  cycleContaining,
  cycleMonthStep,
  cycleStartOf,
  cycleStepDays,
  monthStartIso,
  shiftCycle,
  toIso,
} from './dateUtils';
import type { IsoBounds } from './types';

function todayIso(referenceDate: Date | string = new Date()): string {
  return typeof referenceDate === 'string' ? referenceDate : toIso(referenceDate);
}

/**
 * Enumerate every billing cycle from plan start through plan end (inclusive).
 *
 * Weekly — Start 02 Aug, End 15 Aug → [02–08, 09–15]
 * Monthly — Start Aug, End Oct → [Aug, Sep, Oct]
 * If Start equals End, only one cycle exists → preview treats as Plan ended.
 */
export function generateBillingCycles(
  periodStart: string,
  periodEnd: string,
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
): IsoBounds[] {
  if (!periodStart) return [];

  const start = cycleStartOf(periodStart, frequency, customTerms);
  const endBound = periodEnd
    ? cycleStartOf(periodEnd, frequency, customTerms)
    : start;

  if (!start || endBound < start) return [];

  const cycles: IsoBounds[] = [];

  if (customTerms) {
    let cursor = start;
    for (let i = 0; i < 520 && cursor <= endBound; i += 1) {
      cycles.push({ start: cursor, end: cursor });
      cursor = addDateDays(cursor, 1);
    }
    return cycles;
  }

  if (frequency === 'Weekly' || frequency === 'Bi-Weekly') {
    const step = cycleStepDays(frequency, customTerms);
    let cursor = start;
    for (let i = 0; i < 520 && cursor <= endBound; i += 1) {
      cycles.push(boundsFromStart(cursor, frequency, customTerms));
      cursor = addDateDays(cursor, step);
    }
    return cycles;
  }

  // Monthly / Quarterly / Half Yearly / Yearly — calendar month blocks
  const monthStep = cycleMonthStep(frequency, customTerms) || 1;
  let cursor = monthStartIso(start);
  const endMonth = monthStartIso(endBound);
  for (let i = 0; i < 240 && cursor <= endMonth; i += 1) {
    cycles.push(boundsFromStart(cursor, frequency, customTerms));
    cursor = addMonths(cursor, monthStep);
  }
  return cycles;
}

/** @deprecated Prefer generateBillingCycles */
export function generateWeeklyBillingCycles(periodStart: string, periodEnd: string): IsoBounds[] {
  return generateBillingCycles(periodStart, periodEnd, 'Weekly', false);
}

export function cycleExistsInPlan(cycleStart: string, planCycles: IsoBounds[]): boolean {
  return planCycles.some((c) => c.start === cycleStart);
}

export function findCurrentCycle(
  referenceDate: Date | string = new Date(),
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
): IsoBounds {
  return cycleContaining(referenceDate, frequency, customTerms);
}

export function findPreviousCycle(
  current: IsoBounds,
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
): IsoBounds {
  return shiftCycle(current, -1, frequency, customTerms);
}

export function findNextCycle(
  current: IsoBounds,
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
): IsoBounds {
  return shiftCycle(current, 1, frequency, customTerms);
}

export function planHasNotStarted(
  planCycles: IsoBounds[],
  referenceDate: Date | string = new Date(),
): boolean {
  if (!planCycles.length) return false;
  return todayIso(referenceDate) < planCycles[0].start;
}

export function planHasEnded(
  planCycles: IsoBounds[],
  referenceDate: Date | string = new Date(),
): boolean {
  if (!planCycles.length) return false;
  return todayIso(referenceDate) > planCycles[planCycles.length - 1].end;
}

/** Start period equals End period (single cycle) → no further schedule. */
export function isSingleCyclePlan(planCycles: IsoBounds[]): boolean {
  return planCycles.length <= 1;
}

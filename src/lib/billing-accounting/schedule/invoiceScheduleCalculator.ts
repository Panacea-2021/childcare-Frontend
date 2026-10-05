/**
 * InvoiceScheduleCalculator
 *
 * Invoice Generation Day + Due After → Invoice Date + Due Date
 * from the PLAN-ALIGNED reference cycle (ActiveCycleResolver).
 *
 * Changing Billing Period must NEVER modify these dates.
 */

import type { PlanFrequency } from '../feePlansStore';
import { resolveReferenceCycle, traceReferenceCycle, type ReferenceCycleInput } from './activeCycleResolver';
import { generateBillingCycles } from './billingCycleGenerator';
import {
  addDateDays,
  daysInIsoMonth,
  inclusiveDayCount,
} from './dateUtils';
import {
  calculateGenerationDateOnCycle,
  generateGenerationDateOptions,
  generationOffset,
  getBillingPeriodLength,
  resolveGenerationDate,
  resolveGenerationOffset,
  weeklyGenerationOffset,
} from './generationDay';
import type { ScheduleOption } from './types';

export {
  generationOffset,
  weeklyGenerationOffset,
  calculateGenerationDateOnCycle,
  generateGenerationDateOptions,
  getBillingPeriodLength,
  resolveGenerationDate,
  resolveGenerationOffset,
};

function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export const WEEKLY_GENERATION_OPTIONS: ScheduleOption[] = [
  { value: '1st day', label: '1st day' },
  { value: '2nd day', label: '2nd day' },
  { value: '3rd day', label: '3rd day' },
  { value: '4th day', label: '4th day' },
  { value: '5th day', label: '5th day' },
  { value: '6th day', label: '6th day' },
  { value: 'last day', label: 'last day' },
];

export const BIWEEKLY_GENERATION_OPTIONS: ScheduleOption[] = [
  ...Array.from({ length: 13 }, (_, i) => ({
    value: `${i + 1}${ordinalSuffix(i + 1)} day`,
    label: `${i + 1}${ordinalSuffix(i + 1)} day`,
  })),
  { value: 'last day', label: 'last day' },
];

export const WEEKLY_DUE_AFTER_OPTIONS: ScheduleOption[] = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

export const BIWEEKLY_DUE_AFTER_OPTIONS: ScheduleOption[] = Array.from({ length: 14 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

export type InvoiceDateInput = ReferenceCycleInput;

/**
 * Invoice Date on the active reference cycle.
 * Returns '' when there is no upcoming schedule slot in the plan.
 */
export function calculateInvoiceDate(input: InvoiceDateInput): string {
  if (!input.generationDay || !input.periodStart) return '';
  const trace = traceReferenceCycle(input);
  if (!trace.referenceCycle) return '';
  return calculateGenerationDateOnCycle(
    trace.referenceCycle,
    trace.previousCycle,
    input.generationDay,
    input.frequency,
    input.customTerms,
  );
}

/** @deprecated Prefer calculateInvoiceDate({ ... }) */
export function calculateWeeklyInvoiceDate(
  generationDay: string,
  referenceDate: Date | string = new Date(),
  periodStart = '',
  periodEnd = '',
): string {
  return calculateInvoiceDate({
    generationDay,
    referenceDate,
    frequency: 'Weekly',
    customTerms: false,
    periodStart,
    periodEnd,
  });
}

/** Due Date = Invoice Date + Due After (days). */
export function calculateDueDate(generationIso: string, dueAfterDays: number) {
  if (!generationIso) return '';
  return addDateDays(generationIso, Math.max(0, Number(dueAfterDays) || 0));
}

export type ScheduleOptionsContext = {
  frequency: PlanFrequency;
  customTerms: boolean;
  /** Plan start (used for length when end missing). */
  periodStart?: string;
  /** Plan end — End Month / End Week used for day counts. */
  periodEnd?: string;
};

/** Resolve how many days drive generation / due-after options. */
export function resolveScheduleDayCount(ctx: ScheduleOptionsContext): number {
  const { frequency, customTerms, periodStart = '', periodEnd = '' } = ctx;
  if (customTerms) return 7;
  if (frequency === 'Weekly') return 7;
  if (frequency === 'Bi-Weekly') return 14;

  const cycles = generateBillingCycles(periodStart, periodEnd || periodStart, frequency, customTerms);
  const endCycle = cycles.length ? cycles[cycles.length - 1] : null;
  if (endCycle) return inclusiveDayCount(endCycle.start, endCycle.end);

  if (frequency === 'Monthly') {
    const iso = periodEnd || periodStart;
    return iso ? daysInIsoMonth(iso) : 31;
  }
  return 31;
}

export function getGenerationOptions(
  frequency: PlanFrequency,
  customTerms: boolean,
  periodStart = '',
  periodEnd = '',
): ScheduleOption[] {
  if (customTerms) return WEEKLY_GENERATION_OPTIONS;
  if (frequency === 'Weekly') return WEEKLY_GENERATION_OPTIONS;
  if (frequency === 'Bi-Weekly') return BIWEEKLY_GENERATION_OPTIONS;

  const days = resolveScheduleDayCount({ frequency, customTerms, periodStart, periodEnd });
  // Monthly+ : Illumine relative labels; values are numeric offsets.
  return generateGenerationDateOptions(days);
}

export function getDueAfterOptions(
  frequency: PlanFrequency,
  customTerms: boolean,
  periodStart = '',
  periodEnd = '',
): ScheduleOption[] {
  if (customTerms || frequency === 'Weekly') return WEEKLY_DUE_AFTER_OPTIONS;
  if (frequency === 'Bi-Weekly') return BIWEEKLY_DUE_AFTER_OPTIONS;

  const days = resolveScheduleDayCount({ frequency, customTerms, periodStart, periodEnd });
  return Array.from({ length: Math.max(1, days) }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));
}

/** Public facade helpers matching the product brief naming. */
export function calculateBillingSchedule(input: InvoiceDateInput) {
  return resolveReferenceCycle(input);
}

export function calculateGenerationDate(input: InvoiceDateInput) {
  return calculateInvoiceDate(input);
}

export function calculatePlanEnded(input: InvoiceDateInput): boolean {
  const trace = traceReferenceCycle(input);
  return (
    trace.noScheduleSlot ||
    !trace.referenceCycle ||
    trace.algorithm === 'single_cycle_ended'
  );
}

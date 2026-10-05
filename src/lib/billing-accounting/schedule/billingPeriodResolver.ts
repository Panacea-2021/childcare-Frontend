/**
 * BillingPeriodResolver
 *
 * Previous / Current / Next choose the invoice PERIOD only.
 * Offsets are relative to the plan-aligned reference cycle.
 * Never changes Invoice Date or Due Date.
 */

import type { BillingPeriodKind, PlanFrequency } from '../feePlansStore';
import { traceReferenceCycle } from './activeCycleResolver';
import {
  cycleExistsInPlan,
  findNextCycle,
  findPreviousCycle,
  generateBillingCycles,
  planHasEnded,
  planHasNotStarted,
} from './billingCycleGenerator';
import type { IsoBounds, SchedulePreviewEmptyCode } from './types';

export type PeriodResolveOk = {
  ok: true;
  period: IsoBounds;
};

export type PeriodResolveEmpty = {
  ok: false;
  code: SchedulePreviewEmptyCode;
  message: string;
};

export type PeriodResolveResult = PeriodResolveOk | PeriodResolveEmpty;

const MSG = {
  noPrevious: 'No previous billing period.',
  planEnded: 'Plan is ended.',
  planNotStarted: 'Billing plan has not started.',
  noActive: 'No active billing cycle found.',
  incomplete: '—',
} as const;

export function resolveBillingPeriod(input: {
  billingPeriod: BillingPeriodKind;
  periodStart: string;
  periodEnd: string;
  frequency: PlanFrequency;
  customTerms: boolean;
  generationDay: string;
  referenceDate?: Date | string;
}): PeriodResolveResult {
  const ref = input.referenceDate ?? new Date();
  if (!input.periodStart || !input.generationDay) {
    return { ok: false, code: 'incomplete', message: MSG.incomplete };
  }

  const planCycles = generateBillingCycles(
    input.periodStart,
    input.periodEnd,
    input.frequency,
    input.customTerms,
  );
  if (!planCycles.length) {
    return { ok: false, code: 'incomplete', message: MSG.incomplete };
  }

  const trace = traceReferenceCycle({
    referenceDate: ref,
    generationDay: input.generationDay,
    frequency: input.frequency,
    customTerms: input.customTerms,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
  });

  if (trace.algorithm === 'outside_plan' || trace.algorithm === 'single_cycle_ended') {
    if (trace.algorithm === 'single_cycle_ended' || planHasEnded(planCycles, ref) || trace.noScheduleSlot) {
      return { ok: false, code: 'plan_ended', message: MSG.planEnded };
    }
    if (planHasNotStarted(planCycles, ref)) {
      return { ok: false, code: 'plan_not_started', message: MSG.planNotStarted };
    }
    return { ok: false, code: 'no_active_cycle', message: MSG.noActive };
  }

  if (trace.noScheduleSlot || !trace.referenceCycle) {
    return { ok: false, code: 'plan_ended', message: MSG.planEnded };
  }

  const active = trace.referenceCycle;
  const target =
    input.billingPeriod === 'Previous'
      ? findPreviousCycle(active, input.frequency, input.customTerms)
      : input.billingPeriod === 'Next'
        ? findNextCycle(active, input.frequency, input.customTerms)
        : active;

  // Previous / Next: Illumine shows calendar neighbours even when outside the
  // Start–End fee-plan window (Next Invoice Details still previews them).
  if (input.billingPeriod === 'Previous' || input.billingPeriod === 'Next') {
    return { ok: true, period: target };
  }

  if (cycleExistsInPlan(target.start, planCycles)) {
    return { ok: true, period: target };
  }

  return { ok: false, code: 'plan_ended', message: MSG.planEnded };
}

export function getInvoicePeriod(
  billingPeriod: BillingPeriodKind,
  referenceDate: Date | string = new Date(),
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
  generationDay = '',
  periodStart = '',
  periodEnd = '',
): IsoBounds {
  const trace = traceReferenceCycle({
    referenceDate,
    generationDay,
    frequency,
    customTerms,
    periodStart,
    periodEnd,
  });
  if (!trace.referenceCycle) return { start: '', end: '' };
  const active = trace.referenceCycle;
  if (billingPeriod === 'Previous') return findPreviousCycle(active, frequency, customTerms);
  if (billingPeriod === 'Next') return findNextCycle(active, frequency, customTerms);
  return active;
}

/** @deprecated Prefer getInvoicePeriod with full plan args */
export function getWeeklyInvoicePeriod(
  billingPeriod: BillingPeriodKind,
  referenceDate: Date | string = new Date(),
): IsoBounds {
  return getInvoicePeriod(billingPeriod, referenceDate, 'Weekly', false, '', '', '');
}

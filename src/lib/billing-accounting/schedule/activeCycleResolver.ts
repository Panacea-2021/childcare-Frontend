/**
 * ActiveCycleResolver
 *
 * Chooses the plan-aligned reference billing cycle used for:
 *   - Invoice Date / Due Date
 *   - Previous / Current / Next period offsets
 *
 * Two modes:
 * 1) Start/End fee-plan pair (exactly 2 cycles) → End cycle is always the generation base
 *    (Illumine Create Fee Plan preview: First Day = End.start, Last Day = Start.end)
 * 2) Multi-cycle plans → plan-aligned next unpaid slot from today
 */

import type { PlanFrequency } from '../feePlansStore';
import { generateBillingCycles, isSingleCyclePlan } from './billingCycleGenerator';
import { toIso } from './dateUtils';
import { calculateGenerationDateOnCycle } from './generationDay';
import type { IsoBounds } from './types';

export type ReferenceCycleInput = {
  referenceDate?: Date | string;
  generationDay: string;
  frequency: PlanFrequency;
  customTerms: boolean;
  periodStart: string;
  periodEnd?: string;
};

export type ReferenceCycleTrace = {
  today: string;
  planCycles: IsoBounds[];
  containingCycle: IsoBounds | null;
  containingIndex: number;
  candidateInvoiceDate: string;
  rolledForward: boolean;
  referenceCycle: IsoBounds | null;
  referenceIndex: number;
  previousCycle: IsoBounds | null;
  noScheduleSlot: boolean;
  algorithm:
    | 'plan_pair_end_cycle'
    | 'plan_aligned_next_unpaid_slot'
    | 'incomplete'
    | 'outside_plan'
    | 'single_cycle_ended';
};

function todayIso(referenceDate: Date | string = new Date()): string {
  return typeof referenceDate === 'string' ? referenceDate : toIso(referenceDate);
}

function findContainingIndex(cycles: IsoBounds[], today: string): number {
  return cycles.findIndex((c) => today >= c.start && today <= c.end);
}

export function resolveReferenceCycle(input: ReferenceCycleInput): IsoBounds | null {
  return traceReferenceCycle(input).referenceCycle;
}

export function traceReferenceCycle(input: ReferenceCycleInput): ReferenceCycleTrace {
  const today = todayIso(input.referenceDate ?? new Date());
  const empty: ReferenceCycleTrace = {
    today,
    planCycles: [],
    containingCycle: null,
    containingIndex: -1,
    candidateInvoiceDate: '',
    rolledForward: false,
    referenceCycle: null,
    referenceIndex: -1,
    previousCycle: null,
    noScheduleSlot: false,
    algorithm: 'incomplete',
  };

  if (!input.periodStart || !input.generationDay) {
    return empty;
  }

  const planCycles = generateBillingCycles(
    input.periodStart,
    input.periodEnd ?? '',
    input.frequency,
    input.customTerms,
  );
  if (!planCycles.length) {
    return { ...empty, algorithm: 'incomplete' };
  }

  // Start period equals End period (single cycle) → Plan is ended.
  if (isSingleCyclePlan(planCycles)) {
    return {
      ...empty,
      planCycles,
      algorithm: 'single_cycle_ended',
      noScheduleSlot: true,
    };
  }

  // Exact Start + End fee-plan window (2 cycles) → End cycle is generation base.
  if (planCycles.length === 2) {
    const previousCycle = planCycles[0];
    const referenceCycle = planCycles[1];
    const candidateInvoiceDate = calculateGenerationDateOnCycle(
      referenceCycle,
      previousCycle,
      input.generationDay,
      input.frequency,
      input.customTerms,
    );
    return {
      today,
      planCycles,
      containingCycle: findContainingIndex(planCycles, today) >= 0
        ? planCycles[findContainingIndex(planCycles, today)]
        : null,
      containingIndex: findContainingIndex(planCycles, today),
      candidateInvoiceDate,
      rolledForward: false,
      referenceCycle,
      referenceIndex: 1,
      previousCycle,
      noScheduleSlot: false,
      algorithm: 'plan_pair_end_cycle',
    };
  }

  // Multi-cycle plans — roll from today's containing cycle.
  const containingIndex = findContainingIndex(planCycles, today);
  if (containingIndex < 0) {
    if (today < planCycles[0].start) {
      const first = planCycles[0];
      const gen = calculateGenerationDateOnCycle(
        first,
        null,
        input.generationDay,
        input.frequency,
        input.customTerms,
      );
      return {
        today,
        planCycles,
        containingCycle: null,
        containingIndex: -1,
        candidateInvoiceDate: gen,
        rolledForward: false,
        referenceCycle: first,
        referenceIndex: 0,
        previousCycle: null,
        noScheduleSlot: false,
        algorithm: 'plan_aligned_next_unpaid_slot',
      };
    }
    return {
      ...empty,
      planCycles,
      algorithm: 'outside_plan',
      noScheduleSlot: today > planCycles[planCycles.length - 1].end,
    };
  }

  const containingCycle = planCycles[containingIndex];
  const prevOfContaining = containingIndex > 0 ? planCycles[containingIndex - 1] : null;
  const candidateInvoiceDate = calculateGenerationDateOnCycle(
    containingCycle,
    prevOfContaining,
    input.generationDay,
    input.frequency,
    input.customTerms,
  );

  if (candidateInvoiceDate >= today) {
    return {
      today,
      planCycles,
      containingCycle,
      containingIndex,
      candidateInvoiceDate,
      rolledForward: false,
      referenceCycle: containingCycle,
      referenceIndex: containingIndex,
      previousCycle: prevOfContaining,
      noScheduleSlot: false,
      algorithm: 'plan_aligned_next_unpaid_slot',
    };
  }

  const nextIndex = containingIndex + 1;
  if (nextIndex < planCycles.length) {
    const next = planCycles[nextIndex];
    return {
      today,
      planCycles,
      containingCycle,
      containingIndex,
      candidateInvoiceDate,
      rolledForward: true,
      referenceCycle: next,
      referenceIndex: nextIndex,
      previousCycle: containingCycle,
      noScheduleSlot: false,
      algorithm: 'plan_aligned_next_unpaid_slot',
    };
  }

  return {
    today,
    planCycles,
    containingCycle,
    containingIndex,
    candidateInvoiceDate,
    rolledForward: false,
    referenceCycle: null,
    referenceIndex: -1,
    previousCycle: prevOfContaining,
    noScheduleSlot: true,
    algorithm: 'plan_aligned_next_unpaid_slot',
  };
}

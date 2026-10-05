/**
 * InvoicePreviewBuilder
 */

import type { BillingPeriodKind, PlanFrequency } from '../feePlansStore';
import { traceReferenceCycle } from './activeCycleResolver';
import { generateBillingCycles } from './billingCycleGenerator';
import { getInvoicePeriod, resolveBillingPeriod } from './billingPeriodResolver';
import { formatPreviewDate, toIso } from './dateUtils';
import { calculateDueDate, calculateInvoiceDate } from './invoiceScheduleCalculator';
import type { BillingPreview, SchedulePreviewInput, SchedulePreviewResult } from './types';

export function buildPreviewMessage(
  generationDate: string,
  dueDate: string,
  periodStart: string,
  periodEnd: string,
) {
  return (
    `Your invoice will be generated on ${formatPreviewDate(generationDate)} ` +
    `due on ${formatPreviewDate(dueDate)} ` +
    `for the period ${formatPreviewDate(periodStart)} ` +
    `to ${formatPreviewDate(periodEnd)}`
  );
}

export function buildSchedulePreview(input: SchedulePreviewInput): SchedulePreviewResult {
  if (input.status === 'Completed') {
    return { status: 'empty', code: 'plan_completed', message: 'No upcoming invoices.' };
  }

  if (input.status === 'Paused') {
    return { status: 'empty', code: 'plan_paused', message: 'Plan is paused.' };
  }

  if (!input.generationDay || !input.periodStart) {
    return { status: 'empty', code: 'incomplete', message: '—' };
  }

  const ref = input.referenceDate ?? new Date();
  const scheduleInput = {
    generationDay: input.generationDay,
    referenceDate: ref,
    frequency: input.frequency,
    customTerms: input.customTerms,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd ?? '',
  };

  const generationDate = calculateInvoiceDate(scheduleInput);
  if (!generationDate) {
    // No upcoming slot inside the plan (gen day passed on last cycle)
    return { status: 'empty', code: 'plan_ended', message: 'Plan is ended.' };
  }
  const dueDate = calculateDueDate(generationDate, input.dueAfter);

  const periodResult = resolveBillingPeriod({
    billingPeriod: input.billingPeriod,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd ?? '',
    frequency: input.frequency,
    customTerms: input.customTerms,
    generationDay: input.generationDay,
    referenceDate: ref,
  });

  if (!periodResult.ok) {
    return { status: 'empty', code: periodResult.code, message: periodResult.message };
  }

  return {
    status: 'ready',
    generationDate,
    dueDate,
    periodStart: periodResult.period.start,
    periodEnd: periodResult.period.end,
    message: buildPreviewMessage(
      generationDate,
      dueDate,
      periodResult.period.start,
      periodResult.period.end,
    ),
  };
}

/** Debug trail for audits — does not change behaviour. */
export function explainSchedulePreview(input: SchedulePreviewInput) {
  const ref = input.referenceDate ?? new Date();
  const today = typeof ref === 'string' ? ref : toIso(ref);
  const cycles = generateBillingCycles(
    input.periodStart ?? '',
    input.periodEnd ?? '',
    input.frequency,
    input.customTerms,
  );
  const trace = traceReferenceCycle({
    referenceDate: ref,
    generationDay: input.generationDay,
    frequency: input.frequency,
    customTerms: input.customTerms,
    periodStart: input.periodStart ?? '',
    periodEnd: input.periodEnd ?? '',
  });
  const preview = buildSchedulePreview(input);

  return {
    today,
    frequency: input.frequency,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    generationDay: input.generationDay,
    dueAfter: input.dueAfter,
    billingPeriod: input.billingPeriod,
    generatedCycles: cycles,
    referenceTrace: trace,
    referenceCycle: trace.referenceCycle,
    invoiceDate: preview.status === 'ready' ? preview.generationDate : null,
    dueDate: preview.status === 'ready' ? preview.dueDate : null,
    invoicePeriod:
      preview.status === 'ready'
        ? { start: preview.periodStart, end: preview.periodEnd }
        : null,
    preview,
    detectedAlgorithm: trace.algorithm,
  };
}

export function buildInvoicePreview(input: {
  generationDay: string;
  dueAfter: number;
  billingPeriod: BillingPeriodKind;
  referenceDate?: Date | string;
  frequency?: PlanFrequency;
  customTerms?: boolean;
  periodStart?: string;
  periodEnd?: string;
}): BillingPreview | null {
  if (!input.generationDay || !input.periodStart) return null;
  const ref = input.referenceDate ?? new Date();
  const frequency = input.frequency ?? 'Weekly';
  const customTerms = input.customTerms ?? false;
  const generationDate = calculateInvoiceDate({
    generationDay: input.generationDay,
    referenceDate: ref,
    frequency,
    customTerms,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd ?? '',
  });
  if (!generationDate) return null;
  const dueDate = calculateDueDate(generationDate, input.dueAfter);
  const period = getInvoicePeriod(
    input.billingPeriod,
    ref,
    frequency,
    customTerms,
    input.generationDay,
    input.periodStart,
    input.periodEnd ?? '',
  );
  if (!period.start) return null;
  return {
    generationDate,
    dueDate,
    periodStart: period.start,
    periodEnd: period.end,
  };
}

/** @deprecated Prefer buildInvoicePreview / buildSchedulePreview */
export function buildWeeklyPreview(input: {
  generationDay: string;
  dueAfter: number;
  billingPeriod: BillingPeriodKind;
  referenceDate?: Date | string;
  periodStart?: string;
  periodEnd?: string;
}): BillingPreview | null {
  return buildInvoicePreview(input);
}

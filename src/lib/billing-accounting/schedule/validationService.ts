/**
 * ValidationService — form-field validation (not schedule empty states).
 */

import { selectionRange } from './dateUtils';
import { WEEKLY_GENERATION_OPTIONS } from './invoiceScheduleCalculator';

export function validateWeeklySchedule(input: {
  periodStart: string;
  periodEnd: string;
  generationDay: string;
  dueAfter: number;
}) {
  if (!input.periodStart) return 'Please select start week.';
  if (input.periodEnd) {
    const s = selectionRange(input.periodStart, 'week').start;
    const e = selectionRange(input.periodEnd, 'week').start;
    if (e < s) return 'End week cannot be before start week.';
  }
  if (!input.generationDay) return 'Please select an invoice generation date.';
  if (!WEEKLY_GENERATION_OPTIONS.some((o) => o.value === input.generationDay)) {
    return 'Invalid invoice generation day for weekly billing.';
  }
  if (input.dueAfter < 1 || input.dueAfter > 7) {
    return 'Invoice due after must be between 1 and 7 for weekly billing.';
  }
  return '';
}

export function validatePlan(input: {
  periodStart: string;
  periodEnd: string;
  generationDay: string;
  dueAfter: number;
  frequency: string;
  customTerms: boolean;
}) {
  if (input.customTerms || input.frequency === 'Weekly') {
    return validateWeeklySchedule(input);
  }
  if (!input.periodStart) return 'Please select a start date.';
  if (!input.generationDay) return 'Please select an invoice generation date.';
  if (input.dueAfter < 1) return 'Invoice due after must be at least 1.';
  return '';
}

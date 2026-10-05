import {
  addDateDays,
  selectionRange,
  weekStartKey,
  type DateSelectionMode,
} from '@/components/modules/center-management/ui/DayDatePicker';
import type { PlanFrequency } from '../feePlansStore';
import type { IsoBounds } from './types';

export function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatPreviewDate(iso: string) {
  if (!iso) return '—';
  const d = parseIso(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

/** Inclusive day count between two ISO dates. */
export function inclusiveDayCount(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = parseIso(start).getTime();
  const b = parseIso(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

export function daysInIsoMonth(iso: string): number {
  const d = parseIso(iso);
  return daysInMonth(d.getFullYear(), d.getMonth());
}

export function addMonths(iso: string, months: number): string {
  const d = parseIso(iso);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const dim = daysInMonth(target.getFullYear(), target.getMonth());
  target.setDate(Math.min(day, dim));
  return toIso(target);
}

export function monthStartIso(iso: string): string {
  const d = parseIso(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function monthEndIso(iso: string): string {
  const d = parseIso(iso);
  const last = daysInMonth(d.getFullYear(), d.getMonth());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

/** How many calendar months one billing cycle spans for this frequency. */
export function cycleMonthStep(frequency: PlanFrequency, customTerms: boolean): number {
  if (customTerms) return 0;
  if (frequency === 'Monthly') return 1;
  if (frequency === 'Quarterly') return 3;
  if (frequency === 'Half Yearly') return 6;
  if (frequency === 'Yearly') return 12;
  return 0;
}

export function isWeekLikeFrequency(frequency: PlanFrequency, customTerms: boolean): boolean {
  return customTerms || frequency === 'Weekly' || frequency === 'Bi-Weekly';
}

/** Inclusive day span of one cycle minus 1 (offset of last day). Weekly = 6. */
export function cycleSpanDays(
  frequency: PlanFrequency,
  customTerms: boolean,
  referenceIso = '',
): number {
  if (customTerms) return 0;
  if (frequency === 'Weekly') return 6;
  if (frequency === 'Bi-Weekly') return 13;
  if (!referenceIso) {
    if (frequency === 'Monthly') return 27; // fallback until month known
    if (frequency === 'Quarterly') return 89;
    if (frequency === 'Half Yearly') return 181;
    if (frequency === 'Yearly') return 364;
    return 6;
  }
  const bounds = boundsFromStart(referenceIso, frequency, customTerms);
  return Math.max(0, inclusiveDayCount(bounds.start, bounds.end) - 1);
}

export function cycleStepDays(
  frequency: PlanFrequency,
  customTerms: boolean,
  referenceIso = '',
): number {
  return cycleSpanDays(frequency, customTerms, referenceIso) + 1;
}

export function selectionModeForFrequency(
  frequency: PlanFrequency,
  customTerms: boolean,
): DateSelectionMode {
  if (customTerms) return 'day';
  if (frequency === 'Bi-Weekly') return 'biweek';
  if (frequency === 'Weekly') return 'week';
  // Monthly+ use dedicated month math — picker still day-mode for custom only.
  return 'day';
}

/** Snap an ISO date to the cycle start for this frequency. */
export function cycleStartOf(iso: string, frequency: PlanFrequency, customTerms: boolean): string {
  if (!iso) return '';
  if (customTerms) return iso;
  if (frequency === 'Weekly' || frequency === 'Bi-Weekly') {
    const mode = selectionModeForFrequency(frequency, customTerms);
    return selectionRange(iso, mode).start;
  }
  const months = cycleMonthStep(frequency, customTerms);
  if (months <= 0) return iso;
  // Align to plan-month blocks starting from calendar month of iso for Monthly;
  // Quarterly/Half/Yearly start at month of iso (plan-relative, not calendar Q).
  return monthStartIso(iso);
}

export function boundsFromStart(
  start: string,
  frequency: PlanFrequency,
  customTerms: boolean,
): IsoBounds {
  if (!start) return { start: '', end: '' };
  if (customTerms) return { start, end: start };

  if (frequency === 'Weekly' || frequency === 'Bi-Weekly') {
    const mode = selectionModeForFrequency(frequency, customTerms);
    return selectionRange(start, mode);
  }

  const months = cycleMonthStep(frequency, customTerms);
  const cycleStart = monthStartIso(start);
  if (months <= 1) {
    return { start: cycleStart, end: monthEndIso(cycleStart) };
  }
  const lastMonthStart = addMonths(cycleStart, months - 1);
  return { start: cycleStart, end: monthEndIso(lastMonthStart) };
}

/** Cycle that contains the reference date. */
export function cycleContaining(
  ref: Date | string,
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
): IsoBounds {
  const iso = typeof ref === 'string' ? ref : toIso(ref);
  const start = cycleStartOf(iso, frequency, customTerms);
  return boundsFromStart(start, frequency, customTerms);
}

export function shiftCycle(
  bounds: IsoBounds,
  steps: number,
  frequency: PlanFrequency,
  customTerms: boolean,
): IsoBounds {
  if (!bounds.start) return { start: '', end: '' };
  if (customTerms) {
    return {
      start: addDateDays(bounds.start, steps),
      end: addDateDays(bounds.end, steps),
    };
  }
  if (frequency === 'Weekly' || frequency === 'Bi-Weekly') {
    const days = steps * cycleStepDays(frequency, customTerms);
    return {
      start: addDateDays(bounds.start, days),
      end: addDateDays(bounds.end, days),
    };
  }
  const months = cycleMonthStep(frequency, customTerms) * steps;
  const nextStart = addMonths(monthStartIso(bounds.start), months);
  return boundsFromStart(nextStart, frequency, customTerms);
}

export { addDateDays, weekStartKey, selectionRange };

/**
 * Illumine-style Invoice Generation Date options for Monthly / Quarterly /
 * Half-Yearly / Yearly: relative labels with numeric offsets.
 *
 * From-start half: First Day … Nth Day  → offset 0 .. split-1
 * From-end half:   Mth Last Day … Last Day → offset -M .. -1
 * where split = floor(totalDays / 2).
 */

import type { PlanFrequency } from '../feePlansStore';
import { addDateDays, inclusiveDayCount, isWeekLikeFrequency } from './dateUtils';
import type { IsoBounds } from './types';
import type { ScheduleOption } from './types';

export type { IsoBounds };
function ordinalSuffix(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function fromStartLabel(position1Based: number): string {
  return `${position1Based}${ordinalSuffix(position1Based)} day`;
}

function fromEndLabel(fromEnd1Based: number): string {
  if (fromEnd1Based <= 1) return 'last day';
  return `${fromEnd1Based}${ordinalSuffix(fromEnd1Based)} last day`;
}

/** Days in the billing period (cycle length). */
export function getBillingPeriodLength(cycle: IsoBounds): number {
  if (!cycle.start || !cycle.end) return 0;
  return inclusiveDayCount(cycle.start, cycle.end);
}

/**
 * Illumine dropdown for a period of `totalDays`.
 * value = numeric offset string (never the label).
 */
export function generateGenerationDateOptions(totalDays: number): ScheduleOption[] {
  const n = Math.max(1, Math.floor(totalDays));
  const split = Math.floor(n / 2);
  const options: ScheduleOption[] = [];

  for (let i = 0; i < n; i += 1) {
    if (i < split) {
      options.push({
        value: String(i),
        label: fromStartLabel(i + 1),
      });
    } else {
      const fromEnd = n - i; // 1 = last day
      options.push({
        value: String(-fromEnd),
        label: fromEndLabel(fromEnd),
      });
    }
  }
  return options;
}

/**
 * Parse stored generation token → signed offset.
 * Supports: "0", "-1", "Day 15", "1st day", "last day", "Second Last Day", …
 */
export function resolveGenerationOffset(
  generationDay: string,
  cycleLengthDays = 0,
): number {
  const raw = generationDay.trim();
  if (!raw) return 0;

  // Prefer pure numeric offset storage.
  if (/^-?\d+$/.test(raw)) {
    return Number(raw);
  }

  const key = raw.toLowerCase();

  // Legacy "Day N"
  const dayN = key.match(/^day\s+(\d+)$/);
  if (dayN) {
    const n = Number(dayN[1]);
    return Math.max(0, n - 1);
  }

  if (key === 'last day') return -1;
  if (key === 'second last day' || key === '2nd last day') return -2;

  const nthLast = key.match(
    /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|\d+(?:st|nd|rd|th))\s+last\s+day$/,
  );
  if (nthLast) {
    const word = nthLast[1];
    const asNum = parseLooseOrdinal(word);
    return asNum > 0 ? -asNum : -1;
  }

  const nthDay = key.match(
    /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|\d+(?:st|nd|rd|th))\s+day$/,
  );
  if (nthDay) {
    const asNum = parseLooseOrdinal(nthDay[1]);
    return Math.max(0, asNum - 1);
  }

  // Weekly-style "1st day"
  const ord = key.match(/^(\d+)(?:st|nd|rd|th)\s+day$/);
  if (ord) return Math.max(0, Number(ord[1]) - 1);

  if (cycleLengthDays > 0) {
    return Math.min(cycleLengthDays - 1, 0);
  }
  return 0;
}

function parseLooseOrdinal(token: string): number {
  const t = token.toLowerCase();
  const map: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
  };
  if (map[t]) return map[t];
  const m = t.match(/^(\d+)/);
  return m ? Number(m[1]) : 1;
}

/** Resolve offset on a cycle → ISO date. */
export function resolveGenerationDate(cycle: IsoBounds, offset: number): string {
  if (!cycle.start || !cycle.end) return '';
  const length = getBillingPeriodLength(cycle);
  if (length <= 0) return '';

  if (offset >= 0) {
    const clamped = Math.min(length - 1, offset);
    return addDateDays(cycle.start, clamped);
  }

  // -1 = last day, -2 = second last, …
  const fromEnd = Math.abs(offset);
  const clampedFromEnd = Math.min(length, Math.max(1, fromEnd));
  return addDateDays(cycle.end, -(clampedFromEnd - 1));
}

export function isLastGenerationDay(generationDay: string): boolean {
  const key = generationDay.trim().toLowerCase();
  if (key === 'last day' || key === '-1') return true;
  return resolveGenerationOffset(generationDay) === -1;
}

/** Parse 1-based day number from legacy tokens (weekly / Day N). */
export function parseGenerationDayNumber(generationDay: string): number {
  const offset = resolveGenerationOffset(generationDay);
  if (offset < 0) return -1;
  return offset + 1;
}

/**
 * Map generation option → 0-based offset from cycle start (weekly / bi-weekly).
 * For Monthly+ relative offsets, prefer resolveGenerationOffset + resolveGenerationDate.
 */
export function generationOffset(
  generationDay: string,
  frequency: PlanFrequency = 'Weekly',
  customTerms = false,
  cycleLengthDays = 0,
): number {
  const resolved = resolveGenerationOffset(generationDay, cycleLengthDays);

  // Weekly / Bi-Weekly "last day" → last day of cycle (or handled by caller for Start-period).
  if (
    resolved === -1 &&
    isWeekLikeFrequency(frequency, customTerms) &&
    (generationDay.trim().toLowerCase() === 'last day' || generationDay.trim() === '-1')
  ) {
    if (cycleLengthDays > 0) return cycleLengthDays - 1;
    return frequency === 'Bi-Weekly' && !customTerms ? 13 : 6;
  }

  // Relative from-end for Monthly+ — keep signed for calculateGenerationDateOnCycle.
  if (resolved < 0) return resolved;

  if (cycleLengthDays > 0) {
    return Math.min(cycleLengthDays - 1, Math.max(0, resolved));
  }
  return Math.max(0, resolved);
}

/**
 * Invoice generation date on a reference cycle.
 *
 * Weekly / Bi-Weekly Last Day → last day of the *previous* cycle (Start period).
 * Monthly+ relative offsets resolve on the reference (End) cycle.
 */
export function calculateGenerationDateOnCycle(
  referenceCycle: IsoBounds,
  previousCycle: IsoBounds | null,
  generationDay: string,
  frequency: PlanFrequency,
  customTerms: boolean,
): string {
  if (!referenceCycle.start || !generationDay) return '';

  const length = inclusiveDayCount(referenceCycle.start, referenceCycle.end);
  const offset = resolveGenerationOffset(generationDay, length);

  // Weekly / Bi-Weekly Last Day → Start period end
  if (
    offset === -1 &&
    !customTerms &&
    (frequency === 'Weekly' || frequency === 'Bi-Weekly')
  ) {
    if (previousCycle?.end) return previousCycle.end;
    return referenceCycle.end;
  }

  return resolveGenerationDate(referenceCycle, offset);
}

/** @deprecated Prefer generationOffset(day, 'Weekly') */
export function weeklyGenerationOffset(generationDay: string): number {
  return generationOffset(generationDay, 'Weekly', false, 7);
}

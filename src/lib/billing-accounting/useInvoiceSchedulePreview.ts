'use client';

import { useMemo } from 'react';
import { buildSchedulePreview } from './billingSchedule';
import type { SchedulePreviewInput, SchedulePreviewResult } from './billingSchedule';

/** Live Next Invoice Details preview for Create / Edit Fee Plan forms. */
export function useInvoiceSchedulePreview(input: SchedulePreviewInput): SchedulePreviewResult {
  return useMemo(
    () => buildSchedulePreview(input),
    [
      input.frequency,
      input.customTerms,
      input.generationDay,
      input.dueAfter,
      input.billingPeriod,
      input.periodStart,
      input.periodEnd,
      input.referenceDate,
      input.status,
    ],
  );
}

import type { BillingPeriodKind, PlanFrequency } from '../feePlansStore';

/** Inclusive ISO date bounds for one billing cycle (e.g. Sun–Sat). */
export type IsoBounds = { start: string; end: string };

export type ScheduleOption = { value: string; label: string };

/** Ready preview: invoice schedule + selected invoice period. */
export type BillingPreview = {
  generationDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
};

/** @deprecated Prefer BillingPreview */
export type InvoicePreview = BillingPreview;

/**
 * Empty-state codes for the Next Invoice Details box.
 * These are product outcomes, not form validation errors.
 */
export type SchedulePreviewEmptyCode =
  | 'incomplete'
  | 'no_previous'
  | 'plan_ended'
  | 'plan_not_started'
  | 'no_active_cycle'
  | 'plan_completed'
  | 'plan_paused';

export type SchedulePreviewResult =
  | {
      status: 'ready';
      generationDate: string;
      dueDate: string;
      periodStart: string;
      periodEnd: string;
      /** Full sentence for the UI preview box. */
      message: string;
    }
  | {
      status: 'empty';
      code: SchedulePreviewEmptyCode;
      message: string;
    };

export type SchedulePreviewInput = {
  frequency: PlanFrequency;
  customTerms: boolean;
  generationDay: string;
  dueAfter: number;
  billingPeriod: BillingPeriodKind;
  /** Plan validity window start (week start for Weekly). Required for period existence checks. */
  periodStart?: string;
  /** Plan validity window end. Empty = single cycle from periodStart. */
  periodEnd?: string;
  /** Defaults to today. */
  referenceDate?: Date | string;
  /** Soft-deleted / completed plans never show a schedule. */
  status?: string;
};

export type { BillingPeriodKind, PlanFrequency };

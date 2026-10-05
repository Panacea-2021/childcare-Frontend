/**
 * Fee Plan billing schedule engine.
 *
 * FOUR independent calculations (never mix them):
 *
 * 1) Billing Plan        → generateBillingCycles(start, end)
 * 2) Reference Cycle     → resolveReferenceCycle(today, generationDay)  ★ single switch-point
 * 3) Invoice Schedule    → calculateInvoiceDate / calculateDueDate
 * 4) Invoice Period      → resolveBillingPeriod(Previous|Current|Next)
 */

export type {
  BillingPreview,
  InvoicePreview,
  IsoBounds,
  ScheduleOption,
  SchedulePreviewEmptyCode,
  SchedulePreviewInput,
  SchedulePreviewResult,
} from './types';

export {
  generateBillingCycles,
  generateWeeklyBillingCycles,
  cycleExistsInPlan,
  findCurrentCycle,
  findPreviousCycle,
  findNextCycle,
  planHasNotStarted,
  planHasEnded,
  isSingleCyclePlan,
} from './billingCycleGenerator';

export {
  resolveReferenceCycle,
  traceReferenceCycle,
  type ReferenceCycleTrace,
  type ReferenceCycleInput,
} from './activeCycleResolver';

export {
  WEEKLY_GENERATION_OPTIONS,
  WEEKLY_DUE_AFTER_OPTIONS,
  BIWEEKLY_GENERATION_OPTIONS,
  BIWEEKLY_DUE_AFTER_OPTIONS,
  weeklyGenerationOffset,
  generationOffset,
  calculateInvoiceDate,
  calculateWeeklyInvoiceDate,
  calculateDueDate,
  calculateGenerationDateOnCycle,
  generateGenerationDateOptions,
  getBillingPeriodLength,
  resolveGenerationDate,
  resolveGenerationOffset,
  getGenerationOptions,
  getDueAfterOptions,
  resolveScheduleDayCount,
  calculateBillingSchedule,
  calculateGenerationDate,
  calculatePlanEnded,
} from './invoiceScheduleCalculator';

export {
  resolveBillingPeriod,
  getInvoicePeriod,
  getWeeklyInvoicePeriod,
} from './billingPeriodResolver';

export {
  buildSchedulePreview,
  buildInvoicePreview,
  buildWeeklyPreview,
  buildPreviewMessage,
  explainSchedulePreview,
} from './invoicePreviewBuilder';

export { validateWeeklySchedule, validatePlan } from './validationService';

export {
  weekContaining,
  getCurrentBillingCycle,
  shiftWeek,
  selectionModeForFrequency,
  cycleContaining,
  shiftCycle,
  formatPreviewDate,
} from './compat';

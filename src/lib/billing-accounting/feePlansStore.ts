/** Fee Plans catalog — localStorage backed for Fee Plan module. */

import { loadFeeComponents, type FeeComponentCategory } from './feeComponentsStore';
import { loadTaxRates } from './taxRatesStore';
import { buildSchedulePreview } from './billingSchedule';
import { loadDiscounts } from './invoiceStore';

export type PlanFrequency =
  | 'Weekly'
  | 'Bi-Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Half Yearly'
  | 'Yearly';

export type BillingPeriodKind = 'Previous' | 'Current' | 'Next';
export type PlanStatus = 'Active' | 'Completed' | 'Draft' | 'Paused';
export type TaxAmountMode = 'inclusive' | 'exclusive';
export type ApplyRule = 'always' | 'conditional';

export type FeePlanCondition = {
  id: string;
  attribute: string;
  operator: string;
  value: string;
};

export type FeePlanLine = {
  id: string;
  componentId: string;
  name: string;
  description?: string;
  /** UI: description textarea only renders when true */
  showDescription?: boolean;
  /** UI: item options accordion */
  optionsOpen?: boolean;
  category: FeeComponentCategory;
  quantity: number;
  unitPrice: number;
  taxRateIds: string[];
  discountId?: string;
  discountAmount?: number;
  refundable: boolean;
  applyRule: ApplyRule;
  conditions: FeePlanCondition[];
};

export type FeePlanStudent = {
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string;
  discountId?: string;
};

export type FeePlanCustomTerm = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  /** Absolute calendar date (YYYY-MM-DD) when the invoice is generated. */
  invoiceGenerationDate: string;
  invoiceDueAfter: number;
};

export type FeePlan = {
  id: string;
  name: string;
  status: PlanStatus;
  programId: string;
  programName: string;
  labelIds: string[];
  frequency: PlanFrequency;
  customTerms: boolean;
  /** Populated when customTerms is true (Illumine Custom Terms table). */
  terms: FeePlanCustomTerm[];
  periodStart: string;
  periodEnd: string;
  invoiceGenerationDay: string;
  invoiceDueAfter: number;
  billingPeriod: BillingPeriodKind;
  emailParent: boolean;
  settleWithCredit: boolean;
  generateOnJoin: boolean;
  schoolNotes: string;
  parentNotes: string;
  taxMode: TaxAmountMode;
  discountId?: string;
  lines: FeePlanLine[];
  students: FeePlanStudent[];
  nextInvoiceDate: string;
  createdAt: string;
  updatedAt: string;
};

export type FeePlanInput = Omit<FeePlan, 'id' | 'createdAt' | 'updatedAt' | 'nextInvoiceDate'> & {
  id?: string;
  nextInvoiceDate?: string;
};

const STORAGE_KEY = 'panacea.billing.fee-plans.v1';

export const FREQUENCY_OPTIONS: PlanFrequency[] = [
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Quarterly',
  'Half Yearly',
  'Yearly',
];

export const DUE_AFTER_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} day${i + 1 === 1 ? '' : 's'}`,
}));

/** @deprecated Static list removed — use generateInvoiceDates() from billingSchedule.ts */
export const GENERATION_DAY_OPTIONS: { value: string; label: string }[] = [];

export const CONDITION_ATTRIBUTES = [
  'Birth Date',
  'Gender',
  'Registration Date',
  'Admission Date',
  'Program',
  'Group',
  'Mother',
];

export const CONDITION_OPERATORS = [
  { value: 'is', label: 'is' },
  { value: 'is not', label: 'is not' },
  { value: 'is after', label: 'is after' },
  { value: 'is before', label: 'is before' },
  { value: 'contains', label: 'contains' },
];

const SEED: FeePlan[] = [
  {
    id: 'plan-special',
    name: 'Special Plan',
    status: 'Active',
    programId: 'prog-toddler',
    programName: 'Toddler Program (Sample)',
    labelIds: [],
    frequency: 'Weekly',
    customTerms: false,
    terms: [],
    periodStart: '2026-08-02',
    periodEnd: '2026-08-15',
    invoiceGenerationDay: '2nd day',
    invoiceDueAfter: 2,
    billingPeriod: 'Current',
    emailParent: true,
    settleWithCredit: false,
    generateOnJoin: false,
    schoolNotes: 'Okay',
    parentNotes: 'No notes added',
    taxMode: 'inclusive',
    lines: [
      {
        id: 'plan-special-l1',
        componentId: 'fc-1',
        name: 'Fee',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 1000,
        taxRateIds: ['tax-gst18'],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [
      {
        studentId: 'st-alex',
        studentName: 'Alex Demo Student',
        startDate: '2026-08-05',
        endDate: '2026-08-15',
      },
      {
        studentId: 'st-new',
        studentName: 'New Student',
        startDate: '2026-08-02',
        endDate: '2026-08-15',
      },
    ],
    nextInvoiceDate: '2026-08-09',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'plan-new',
    name: 'New Fee Plan',
    status: 'Active',
    programId: 'prog-toddler',
    programName: 'Toddler Program (Sample)',
    labelIds: [],
    frequency: 'Monthly',
    customTerms: false,
    terms: [],
    periodStart: '2026-08-01',
    periodEnd: '2026-12-31',
    invoiceGenerationDay: '1st day',
    invoiceDueAfter: 5,
    billingPeriod: 'Current',
    emailParent: true,
    settleWithCredit: false,
    generateOnJoin: true,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'inclusive',
    lines: [
      {
        id: 'plan-new-l1',
        componentId: 'fc-1',
        name: 'Fee',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 12500,
        taxRateIds: [],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [],
    nextInvoiceDate: '2026-09-01',
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'plan-completed',
    name: 'Summer Camp Plan',
    status: 'Completed',
    programId: 'prog-abc',
    programName: 'ABC',
    labelIds: [],
    frequency: 'Monthly',
    customTerms: false,
    terms: [],
    periodStart: '2026-05-01',
    periodEnd: '2026-07-31',
    invoiceGenerationDay: '1st day',
    invoiceDueAfter: 3,
    billingPeriod: 'Current',
    emailParent: false,
    settleWithCredit: false,
    generateOnJoin: false,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'exclusive',
    lines: [
      {
        id: 'plan-completed-l1',
        componentId: 'fc-3',
        name: 'Meal Charges',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 1500,
        taxRateIds: ['tax-gst5'],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [
      {
        studentId: 's1',
        studentName: 'Aarav Sharma',
        startDate: '2026-05-01',
        endDate: '2026-07-31',
      },
      {
        studentId: 's2',
        studentName: 'Diya Patel',
        startDate: '2026-05-01',
        endDate: '2026-07-31',
      },
    ],
    nextInvoiceDate: '',
    createdAt: '2026-04-15T10:00:00.000Z',
    updatedAt: '2026-07-31T10:00:00.000Z',
  },
  {
    id: 'plan-full-day',
    name: 'Full Day Monthly',
    status: 'Active',
    programId: 'prog-abc',
    programName: 'ABC Foundations',
    labelIds: [],
    frequency: 'Monthly',
    customTerms: false,
    terms: [],
    periodStart: '2026-08-01',
    periodEnd: '2027-07-31',
    invoiceGenerationDay: '1st day',
    invoiceDueAfter: 5,
    billingPeriod: 'Current',
    emailParent: true,
    settleWithCredit: true,
    generateOnJoin: true,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'inclusive',
    lines: [
      {
        id: 'plan-full-day-l1',
        componentId: 'fc-1',
        name: 'Fee',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 12500,
        taxRateIds: ['tax-gst18'],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
      {
        id: 'plan-full-day-l2',
        componentId: 'fc-3',
        name: 'Meal Charges',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 1500,
        taxRateIds: [],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [
      {
        studentId: 's1',
        studentName: 'Aarav Sharma',
        startDate: '2026-08-01',
        endDate: '2027-07-31',
      },
      {
        studentId: 's2',
        studentName: 'Diya Patel',
        startDate: '2026-08-01',
        endDate: '2027-07-31',
      },
      {
        studentId: 'st-sun-1',
        studentName: 'Ananya Reddy',
        startDate: '2026-08-01',
        endDate: '2027-07-31',
      },
    ],
    nextInvoiceDate: '2026-09-01',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'plan-half-day',
    name: 'Half Day Monthly',
    status: 'Active',
    programId: 'prog-toddler',
    programName: 'Toddler Discovery',
    labelIds: [],
    frequency: 'Monthly',
    customTerms: false,
    terms: [],
    periodStart: '2026-08-01',
    periodEnd: '2027-03-31',
    invoiceGenerationDay: '1st day',
    invoiceDueAfter: 3,
    billingPeriod: 'Current',
    emailParent: true,
    settleWithCredit: false,
    generateOnJoin: false,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'exclusive',
    lines: [
      {
        id: 'plan-half-day-l1',
        componentId: 'fc-1',
        name: 'Fee',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 8500,
        taxRateIds: [],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [
      {
        studentId: 's3',
        studentName: 'Kabir Singh',
        startDate: '2026-08-01',
        endDate: '2027-03-31',
      },
      {
        studentId: 'st-sun-3',
        studentName: 'Pooja Nair',
        startDate: '2026-08-01',
        endDate: '2027-03-31',
      },
    ],
    nextInvoiceDate: '2026-09-01',
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'plan-draft-transport',
    name: 'Transport Add-on',
    status: 'Draft',
    programId: 'prog-abcd',
    programName: 'Pre-K Explorers',
    labelIds: [],
    frequency: 'Monthly',
    customTerms: false,
    terms: [],
    periodStart: '2026-09-01',
    periodEnd: '2027-05-31',
    invoiceGenerationDay: '5th day',
    invoiceDueAfter: 7,
    billingPeriod: 'Current',
    emailParent: false,
    settleWithCredit: false,
    generateOnJoin: false,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'inclusive',
    lines: [
      {
        id: 'plan-draft-transport-l1',
        componentId: 'fc-4',
        name: 'Transport',
        category: 'Recurring',
        quantity: 1,
        unitPrice: 2000,
        taxRateIds: ['tax-gst5'],
        refundable: false,
        applyRule: 'always',
        conditions: [],
      },
    ],
    students: [],
    nextInvoiceDate: '2026-09-05',
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-05T10:00:00.000Z',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readAll(): FeePlan[] {
  if (!canUseStorage()) return SEED.map(normalizeFeePlan);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(SEED.map(normalizeFeePlan));
      return SEED.map(normalizeFeePlan);
    }
    const parsed = JSON.parse(raw) as FeePlan[];
    if (!Array.isArray(parsed)) return SEED.map(normalizeFeePlan);
    let next = parsed.map(normalizeFeePlan);
    const missing = SEED.filter((s) => !next.some((r) => r.id === s.id)).map(normalizeFeePlan);
    if (missing.length) {
      next = [...missing, ...next];
      writeAll(next);
    }
    return next;
  } catch {
    return SEED.map(normalizeFeePlan);
  }
}

function normalizeFeePlan(plan: FeePlan): FeePlan {
  return {
    ...plan,
    terms: Array.isArray(plan.terms) ? plan.terms : [],
  };
}

function writeAll(rows: FeePlan[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function loadFeePlans(): FeePlan[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getFeePlanById(id: string): FeePlan | undefined {
  return readAll().find((p) => p.id === id);
}

export function createFeePlanId() {
  return `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createLineId() {
  return `pline-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyPlanLine(componentId = ''): FeePlanLine {
  const comps = typeof window !== 'undefined' ? loadFeeComponents() : [];
  const comp = comps.find((c) => c.id === componentId) || comps[0];
  return {
    id: createLineId(),
    componentId: comp?.id || '',
    name: comp?.name || '',
    showDescription: false,
    optionsOpen: true,
    category: comp?.category || 'Recurring',
    quantity: 1,
    unitPrice: comp?.unitPrice || 0,
    taxRateIds: [],
    discountAmount: 0,
    refundable: Boolean(comp?.refundable),
    applyRule: 'always',
    conditions: [],
  };
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return toIso(d);
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Next invoice generation date from the schedule engine
 * (today's billing cycle + invoice generation day) — not from plan Start week.
 */
export function earliestCustomTermGenerationDate(terms: FeePlanCustomTerm[] = []) {
  const today = new Date().toISOString().slice(0, 10);
  const dates = terms
    .map((t) => t.invoiceGenerationDate)
    .filter(Boolean)
    .sort();
  return dates.find((d) => d >= today) || dates[0] || '';
}

export function computeNextInvoiceDate(
  plan: Pick<
    FeePlan,
    | 'periodStart'
    | 'periodEnd'
    | 'frequency'
    | 'status'
    | 'customTerms'
    | 'invoiceGenerationDay'
    | 'invoiceDueAfter'
    | 'billingPeriod'
  > & { terms?: FeePlanCustomTerm[] },
) {
  if (plan.customTerms) {
    return earliestCustomTermGenerationDate(plan.terms || []);
  }
  const preview = previewNextInvoice(plan);
  if (preview.status !== 'ready') return '';
  return preview.generationDate;
}

/** Full Next Invoice Details result (ready preview or product empty state). */
export function previewNextInvoice(
  plan: Pick<
    FeePlan,
    | 'periodStart'
    | 'periodEnd'
    | 'frequency'
    | 'invoiceDueAfter'
    | 'billingPeriod'
    | 'status'
    | 'customTerms'
    | 'invoiceGenerationDay'
  >,
) {
  return buildSchedulePreview({
    frequency: plan.frequency,
    customTerms: plan.customTerms,
    generationDay: plan.invoiceGenerationDay,
    dueAfter: plan.invoiceDueAfter,
    billingPeriod: plan.billingPeriod,
    periodStart: plan.periodStart,
    periodEnd: plan.periodEnd,
    status: plan.status,
  });
}

export function formatPlanDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function formatPlanPeriod(start: string, end: string) {
  if (!start && !end) return '—';
  return `${formatPlanDate(start)} - ${formatPlanDate(end)}`;
}

export function formatInrAmount(n: number) {
  return `₹ ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function lineTaxPercent(line: FeePlanLine) {
  const taxes = loadTaxRates();
  return line.taxRateIds.reduce((sum, id) => {
    const t = taxes.find((x) => x.id === id);
    return sum + (t?.rate || 0);
  }, 0);
}

/** List Amount column — unit price × qty (tax / invoice discount handled in summary). */
export function lineAmount(line: FeePlanLine, _taxMode?: TaxAmountMode) {
  void _taxMode;
  return Math.max(0, line.quantity * line.unitPrice - (line.discountAmount || 0));
}

export function lineTaxAmount(line: FeePlanLine, taxMode: TaxAmountMode) {
  const afterDisc = lineAmount(line);
  const taxPct = lineTaxPercent(line);
  if (taxPct <= 0) return 0;
  if (taxMode === 'inclusive') return afterDisc - afterDisc / (1 + taxPct / 100);
  return (afterDisc * taxPct) / 100;
}

function planInvoiceDiscountAmount(
  afterItemDisc: number,
  invoiceDiscountId: string | undefined,
) {
  if (!invoiceDiscountId || afterItemDisc <= 0) return 0;
  const d = loadDiscounts().find((x) => x.id === invoiceDiscountId);
  if (!d) return 0;
  const raw = d.unit === 'percent' ? (afterItemDisc * d.value) / 100 : d.value;
  return Math.min(afterItemDisc, Math.max(0, raw));
}

/**
 * Exclusive: Total = (sub − discounts) + tax
 * Inclusive: Total = sub − discounts; tax is extracted for display (Total without tax)
 */
export function summarizePlanLines(
  lines: FeePlanLine[],
  taxMode: TaxAmountMode,
  invoiceDiscountId?: string,
) {
  const subTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const itemsDiscount = lines.reduce((s, l) => s + (l.discountAmount || 0), 0);
  const afterItemDisc = Math.max(0, subTotal - itemsDiscount);
  const invoiceDiscount = planInvoiceDiscountAmount(afterItemDisc, invoiceDiscountId);
  const withoutTax = Math.max(0, afterItemDisc - invoiceDiscount);

  const taxTotal = lines.reduce((s, l) => {
    const lineBase = Math.max(0, l.quantity * l.unitPrice - (l.discountAmount || 0));
    const taxPct = lineTaxPercent(l);
    if (taxPct <= 0 || afterItemDisc <= 0) return s;
    const share = lineBase / afterItemDisc;
    const baseAfterInvoiceDisc = Math.max(0, lineBase - invoiceDiscount * share);
    if (taxMode === 'exclusive') {
      return s + (baseAfterInvoiceDisc * taxPct) / 100;
    }
    return s + (baseAfterInvoiceDisc - baseAfterInvoiceDisc / (1 + taxPct / 100));
  }, 0);

  const total = taxMode === 'exclusive' ? withoutTax + taxTotal : withoutTax;
  return {
    subTotal,
    itemsDiscount,
    invoiceDiscount,
    withoutTax,
    taxTotal,
    tax: taxTotal,
    total,
  };
}

export function upsertFeePlan(input: FeePlanInput): FeePlan {
  const all = readAll();
  const now = new Date().toISOString();
  const nextInvoiceDate =
    input.nextInvoiceDate ??
    computeNextInvoiceDate({
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      frequency: input.frequency,
      status: input.status,
      customTerms: input.customTerms,
      terms: input.terms,
      invoiceGenerationDay: input.invoiceGenerationDay,
      invoiceDueAfter: input.invoiceDueAfter,
      billingPeriod: input.billingPeriod,
    });

  if (input.id) {
    const idx = all.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      const next: FeePlan = {
        ...all[idx],
        ...input,
        id: input.id,
        nextInvoiceDate,
        updatedAt: now,
        createdAt: all[idx].createdAt,
      };
      all[idx] = next;
      writeAll(all);
      return next;
    }
  }

  const row: FeePlan = {
    ...input,
    id: input.id || createFeePlanId(),
    nextInvoiceDate,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([row, ...all]);
  return row;
}

export function deleteFeePlans(ids: string[]) {
  const set = new Set(ids);
  writeAll(readAll().filter((p) => !set.has(p.id)));
}

export function createTermId() {
  return `cterm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyCustomTerm(index = 1): FeePlanCustomTerm {
  return {
    id: createTermId(),
    name: `Custom term ${Math.max(1, index)}`,
    startDate: '',
    endDate: '',
    invoiceGenerationDate: '',
    invoiceDueAfter: 1,
  };
}

export function emptyFeePlanDraft(): FeePlanInput {
  return {
    name: '',
    status: 'Active',
    programId: '',
    programName: '',
    labelIds: [],
    frequency: 'Weekly',
    customTerms: false,
    terms: [],
    periodStart: '',
    periodEnd: '',
    invoiceGenerationDay: '',
    invoiceDueAfter: 1,
    billingPeriod: 'Current',
    emailParent: true,
    settleWithCredit: false,
    generateOnJoin: false,
    schoolNotes: '',
    parentNotes: '',
    taxMode: 'inclusive',
    lines: [emptyPlanLine()],
    students: [],
  };
}

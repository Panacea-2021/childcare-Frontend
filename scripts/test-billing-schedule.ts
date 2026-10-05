/**
 * Billing schedule engine tests (Illumine parity + regressions).
 * Run: npm run test:billing-schedule
 */

import assert from 'node:assert/strict';
import {
  buildSchedulePreview,
  explainSchedulePreview,
  resolveReferenceCycle,
  calculateInvoiceDate,
  calculateDueDate,
  generateBillingCycles,
} from '../src/lib/billing-accounting/billingSchedule';

const TODAY = '2026-08-06'; // Thu 06 Aug 2026

function ready(p: ReturnType<typeof buildSchedulePreview>) {
  assert.equal(p.status, 'ready', `expected ready, got ${JSON.stringify(p)}`);
  if (p.status !== 'ready') throw new Error('unreachable');
  return p;
}

function empty(p: ReturnType<typeof buildSchedulePreview>, code: string) {
  assert.equal(p.status, 'empty', `expected empty/${code}, got ${JSON.stringify(p)}`);
  if (p.status === 'empty') assert.equal(p.code, code);
}

// ---------------------------------------------------------------------------
// Weekly Illumine 1st-day (plan-aligned roll to 09–15)
// ---------------------------------------------------------------------------
{
  const p = ready(
    buildSchedulePreview({
      frequency: 'Weekly',
      customTerms: false,
      generationDay: '1st day',
      dueAfter: 1,
      billingPeriod: 'Current',
      periodStart: '2026-08-02',
      periodEnd: '2026-08-16',
      referenceDate: TODAY,
    }),
  );
  assert.equal(p.generationDate, '2026-08-09');
  assert.equal(p.dueDate, '2026-08-10');
  assert.equal(p.periodStart, '2026-08-09');
  assert.equal(p.periodEnd, '2026-08-15');
}

// ---------------------------------------------------------------------------
// Fee.mp4 Weekly gold — 5th day stays; Prev/Current/Next share Invoice Date
// ---------------------------------------------------------------------------
{
  const base = {
    frequency: 'Weekly' as const,
    customTerms: false,
    generationDay: '5th day',
    dueAfter: 3,
    periodStart: '2026-08-02',
    periodEnd: '2026-08-16',
    referenceDate: TODAY,
  };

  const prev = ready(buildSchedulePreview({ ...base, billingPeriod: 'Previous' }));
  assert.equal(prev.generationDate, '2026-08-06');
  assert.equal(prev.dueDate, '2026-08-09');
  assert.equal(prev.periodStart, '2026-07-26');
  assert.equal(prev.periodEnd, '2026-08-01');

  const cur = ready(buildSchedulePreview({ ...base, billingPeriod: 'Current' }));
  assert.equal(cur.generationDate, '2026-08-06');
  assert.equal(cur.periodStart, '2026-08-02');
  assert.equal(cur.periodEnd, '2026-08-08');

  const next = ready(buildSchedulePreview({ ...base, billingPeriod: 'Next' }));
  assert.equal(next.generationDate, '2026-08-06');
  assert.equal(next.periodStart, '2026-08-09');
  assert.equal(next.periodEnd, '2026-08-15');
}

// ---------------------------------------------------------------------------
// Illumine Bi-Weekly (the case that broke floating roll → 16 Aug)
// ---------------------------------------------------------------------------
{
  const cycles = generateBillingCycles('2026-07-26', '2026-08-09', 'Bi-Weekly', false);
  assert.deepEqual(cycles[0], { start: '2026-07-26', end: '2026-08-08' });
  assert.deepEqual(cycles[1], { start: '2026-08-09', end: '2026-08-22' });
  assert.equal(cycles.length, 2);

  const base = {
    frequency: 'Bi-Weekly' as const,
    customTerms: false,
    generationDay: '1st day',
    dueAfter: 1,
    periodStart: '2026-07-26',
    periodEnd: '2026-08-09',
    referenceDate: TODAY,
  };

  const ref = resolveReferenceCycle({
    ...base,
    referenceDate: TODAY,
  });
  assert.ok(ref);
  assert.equal(ref!.start, '2026-08-09', 'must NOT be 16 Aug floating roll');
  assert.equal(ref!.end, '2026-08-22');

  const inv = calculateInvoiceDate({ ...base, referenceDate: TODAY });
  assert.equal(inv, '2026-08-09');
  assert.equal(calculateDueDate(inv, 1), '2026-08-10');

  const cur = ready(buildSchedulePreview({ ...base, billingPeriod: 'Current' }));
  assert.equal(cur.generationDate, '2026-08-09');
  assert.equal(cur.dueDate, '2026-08-10');
  assert.equal(cur.periodStart, '2026-08-09');
  assert.equal(cur.periodEnd, '2026-08-22');

  const prev = ready(buildSchedulePreview({ ...base, billingPeriod: 'Previous' }));
  assert.equal(prev.generationDate, '2026-08-09', 'Invoice Date unchanged on Previous');
  assert.equal(prev.dueDate, '2026-08-10');
  assert.equal(prev.periodStart, '2026-07-26');
  assert.equal(prev.periodEnd, '2026-08-08');

  empty(buildSchedulePreview({ ...base, billingPeriod: 'Next' }), 'plan_ended');
}

// ---------------------------------------------------------------------------
// Short Weekly plan — rolled past last cycle → Plan is ended
// ---------------------------------------------------------------------------
{
  empty(
    buildSchedulePreview({
      frequency: 'Weekly',
      customTerms: false,
      generationDay: '2nd day',
      dueAfter: 1,
      billingPeriod: 'Current',
      periodStart: '2026-07-26',
      periodEnd: '2026-08-02',
      referenceDate: TODAY,
    }),
    'plan_ended',
  );
}

// ---------------------------------------------------------------------------
// Incomplete + Next ended
// ---------------------------------------------------------------------------
{
  empty(
    buildSchedulePreview({
      frequency: 'Weekly',
      customTerms: false,
      generationDay: '',
      dueAfter: 1,
      billingPeriod: 'Current',
      periodStart: '2026-08-02',
      periodEnd: '',
      referenceDate: TODAY,
    }),
    'incomplete',
  );

  empty(
    buildSchedulePreview({
      frequency: 'Weekly',
      customTerms: false,
      generationDay: '5th day',
      dueAfter: 1,
      billingPeriod: 'Next',
      periodStart: '2026-08-02',
      periodEnd: '2026-08-02',
      referenceDate: TODAY,
    }),
    'plan_ended',
  );
}

// ---------------------------------------------------------------------------
// Monthly+ structural smoke (cycle math still limited — must not throw)
// ---------------------------------------------------------------------------
for (const frequency of ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'] as const) {
  const p = buildSchedulePreview({
    frequency,
    customTerms: false,
    generationDay: '1st day',
    dueAfter: 1,
    billingPeriod: 'Current',
    periodStart: '2026-08-01',
    periodEnd: '2026-12-01',
    referenceDate: TODAY,
  });
  assert.ok(p.status === 'ready' || p.status === 'empty', frequency);
}

// ---------------------------------------------------------------------------
// Debug trail uses plan-aligned algorithm name
// ---------------------------------------------------------------------------
{
  const explained = explainSchedulePreview({
    frequency: 'Bi-Weekly',
    customTerms: false,
    generationDay: '1st day',
    dueAfter: 1,
    billingPeriod: 'Current',
    periodStart: '2026-07-26',
    periodEnd: '2026-08-09',
    referenceDate: TODAY,
  });
  assert.equal(explained.detectedAlgorithm, 'plan_aligned_next_unpaid_slot');
  assert.equal(explained.referenceTrace.rolledForward, true);
  assert.equal(explained.invoiceDate, '2026-08-09');
  assert.notEqual(explained.referenceCycle?.start, '2026-08-16');
}

console.log('All billing schedule tests passed.');

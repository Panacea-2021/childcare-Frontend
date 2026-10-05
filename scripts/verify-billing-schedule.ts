import {
  buildSchedulePreview,
  getGenerationOptions,
  getDueAfterOptions,
  generateBillingCycles,
} from '../src/lib/billing-accounting/billingSchedule';

const ref = '2026-08-07';
const weeklyBase = {
  frequency: 'Weekly' as const,
  customTerms: false,
  generationDay: '1st day',
  dueAfter: 1,
  periodStart: '2026-08-02',
  periodEnd: '2026-08-09',
  referenceDate: ref,
};

function check(name: string, cond: boolean, detail?: unknown) {
  console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name, detail ?? '');
  if (!cond) process.exitCode = 1;
}

{
  const p = buildSchedulePreview({ ...weeklyBase, billingPeriod: 'Current' });
  check('Weekly Current ready', p.status === 'ready');
  if (p.status === 'ready') {
    check('Weekly Current gen', p.generationDate === '2026-08-09', p);
    check('Weekly Current due', p.dueDate === '2026-08-10', p);
    check(
      'Weekly Current period',
      p.periodStart === '2026-08-09' && p.periodEnd === '2026-08-15',
      p,
    );
  }
}
{
  const p = buildSchedulePreview({ ...weeklyBase, billingPeriod: 'Previous' });
  check(
    'Weekly Previous period',
    p.status === 'ready' && p.periodStart === '2026-08-02' && p.periodEnd === '2026-08-08',
    p,
  );
}
{
  const p = buildSchedulePreview({ ...weeklyBase, billingPeriod: 'Next' });
  check(
    'Weekly Next period',
    p.status === 'ready' && p.periodStart === '2026-08-16' && p.periodEnd === '2026-08-22',
    p,
  );
}
{
  const p = buildSchedulePreview({
    ...weeklyBase,
    generationDay: 'last day',
    billingPeriod: 'Current',
  });
  check(
    'Weekly Last Day gen',
    p.status === 'ready' && p.generationDate === '2026-08-08',
    p,
  );
}
{
  const p = buildSchedulePreview({
    ...weeklyBase,
    periodStart: '2026-08-02',
    periodEnd: '2026-08-02',
    billingPeriod: 'Current',
  });
  check('Weekly plan ended', p.status === 'empty' && p.code === 'plan_ended', p);
}
{
  const p = buildSchedulePreview({
    frequency: 'Monthly',
    customTerms: false,
    generationDay: 'Day 1',
    dueAfter: 1,
    billingPeriod: 'Previous',
    periodStart: '2026-08-01',
    periodEnd: '2026-09-01',
    referenceDate: ref,
  });
  check(
    'Monthly Previous',
    p.status === 'ready' &&
      p.generationDate === '2026-09-01' &&
      p.dueDate === '2026-09-02' &&
      p.periodStart === '2026-08-01' &&
      p.periodEnd === '2026-08-31',
    p,
  );
}
{
  const g = getGenerationOptions('Weekly', false);
  check('Weekly gen options', g.length === 7 && g[6].value === 'last day', g.map((x) => x.value));
  const m = getGenerationOptions('Monthly', false, '2026-02-01', '2026-02-01');
  check('Feb days', m.length === 28, m.length);
  const leap = getGenerationOptions('Monthly', false, '2024-02-01', '2024-02-01');
  check('Leap Feb', leap.length === 29, leap.length);
  const due = getDueAfterOptions('Monthly', false, '2026-08-01', '2026-08-01');
  check('Aug due after', due.length === 31, due.length);
}
{
  const cycles = generateBillingCycles('2026-07-26', '2026-08-09', 'Bi-Weekly', false);
  check(
    'BiWeekly cycles',
    cycles.length === 2 && cycles[1].start === '2026-08-09' && cycles[1].end === '2026-08-22',
    cycles,
  );
}

  // Weekly last day with 2-cycle pair → always Start week end (08)
{
  const p = buildSchedulePreview({
    ...weeklyBase,
    generationDay: 'last day',
    billingPeriod: 'Current',
    referenceDate: '2026-08-09',
  });
  check(
    'Weekly Last Day on End week',
    p.status === 'ready' && p.generationDate === '2026-08-08',
    p,
  );
}

console.log('done');

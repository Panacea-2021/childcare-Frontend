import {
  buildSchedulePreview,
  generateGenerationDateOptions,
  resolveGenerationDate,
  resolveGenerationOffset,
  getGenerationOptions,
} from '../src/lib/billing-accounting/billingSchedule';

function check(name: string, cond: boolean, detail?: unknown) {
  console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name, detail ?? '');
  if (!cond) process.exitCode = 1;
}

// 31-day Illumine labels
{
  const opts = generateGenerationDateOptions(31);
  check('31 count', opts.length === 31);
  check('31 first', opts[0].label === '1st day' && opts[0].value === '0');
  check('31 fifteenth', opts[14].label === '15th day' && opts[14].value === '14');
  check('31 sixteenth last', opts[15].label === '16th last day' && opts[15].value === '-16');
  check('31 last', opts[30].label === 'last day' && opts[30].value === '-1');
}

// 30-day
{
  const opts = generateGenerationDateOptions(30);
  check('30 fifteenth', opts[14].label === '15th day');
  check('30 after mid', opts[15].label === '15th last day' && opts[15].value === '-15');
  check('30 last', opts[29].value === '-1');
}

// 28 / 29
{
  const d28 = generateGenerationDateOptions(28);
  check('28 mid', d28[13].label === '14th day' && d28[14].label === '14th last day');
  const d29 = generateGenerationDateOptions(29);
  check('29 mid', d29[13].label === '14th day' && d29[14].label === '15th last day');
}

// Resolve dates on Sep 2026 (30 days)
{
  const cycle = { start: '2026-09-01', end: '2026-09-30' };
  check('First', resolveGenerationDate(cycle, 0) === '2026-09-01');
  check('Fifteenth', resolveGenerationDate(cycle, 14) === '2026-09-15');
  check('Last', resolveGenerationDate(cycle, -1) === '2026-09-30');
  check('Second last', resolveGenerationDate(cycle, -2) === '2026-09-29');
  check('offset parse', resolveGenerationOffset('-16') === -16);
}

// Monthly options from End month Oct (31)
{
  const opts = getGenerationOptions('Monthly', false, '2026-09-01', '2026-10-01');
  check('Oct options', opts.length === 31 && opts[0].label === '1st day' && opts[30].label === 'last day');
}

// Preview First Day Monthly Sep-Oct
{
  const p = buildSchedulePreview({
    frequency: 'Monthly',
    customTerms: false,
    generationDay: '0',
    dueAfter: 1,
    billingPeriod: 'Current',
    periodStart: '2026-09-01',
    periodEnd: '2026-10-01',
    referenceDate: '2026-08-07',
  });
  check(
    'Monthly First Day preview',
    p.status === 'ready' && p.generationDate === '2026-10-01' && p.dueDate === '2026-10-02',
    p,
  );
}

// Last Day
{
  const p = buildSchedulePreview({
    frequency: 'Monthly',
    customTerms: false,
    generationDay: '-1',
    dueAfter: 1,
    billingPeriod: 'Current',
    periodStart: '2026-09-01',
    periodEnd: '2026-10-01',
    referenceDate: '2026-08-07',
  });
  check(
    'Monthly Last Day preview',
    p.status === 'ready' && p.generationDate === '2026-10-31',
    p,
  );
}

console.log('done');

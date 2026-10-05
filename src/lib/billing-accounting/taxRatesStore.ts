/** Tax rates catalog — localStorage backed for Fee Plan module. */

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
  itemCode: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'panacea.billing.tax-rates.v1';

const SEED: TaxRate[] = [
  {
    id: 'tax-gst18',
    name: 'GST',
    rate: 18,
    itemCode: 'GST 18',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'tax-gst5',
    name: 'GST Reduced',
    rate: 5,
    itemCode: 'GST 5',
    createdAt: '2026-07-04T10:00:00.000Z',
    updatedAt: '2026-07-04T10:00:00.000Z',
  },
  {
    id: 'tax-sgst9',
    name: 'SGST',
    rate: 9,
    itemCode: 'SGST 9',
    createdAt: '2026-07-08T10:00:00.000Z',
    updatedAt: '2026-07-08T10:00:00.000Z',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readAll(): TaxRate[] {
  if (!canUseStorage()) return [...SEED];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(SEED);
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as TaxRate[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeAll(rows: TaxRate[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function loadTaxRates(): TaxRate[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function createTaxRateId() {
  return `tax-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function generateTaxItemCode(existing: TaxRate[] = loadTaxRates()) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const taken = new Set(existing.map((r) => r.itemCode.toUpperCase()));
  for (let attempt = 0; attempt < 40; attempt++) {
    let code = 'TX';
    for (let i = 0; i < 2; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!taken.has(code)) return code;
  }
  return `TX${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

export function upsertTaxRate(
  input: Omit<TaxRate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): TaxRate {
  const all = readAll();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((r) => r.id === input.id);
    if (idx >= 0) {
      const next: TaxRate = {
        ...all[idx],
        name: input.name,
        rate: input.rate,
        itemCode: input.itemCode,
        updatedAt: now,
      };
      all[idx] = next;
      writeAll(all);
      return next;
    }
  }
  const row: TaxRate = {
    id: input.id || createTaxRateId(),
    name: input.name,
    rate: input.rate,
    itemCode: input.itemCode,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([row, ...all]);
  return row;
}

export function deleteTaxRates(ids: string[]) {
  const set = new Set(ids);
  writeAll(readAll().filter((r) => !set.has(r.id)));
}

export function formatTaxRate(rate: number) {
  return `${rate} %`;
}

/** Fee Components catalog — localStorage backed for Fee Plan module. */

export type FeeComponentCategory = 'One Time' | 'Recurring';

export type FeeComponent = {
  id: string;
  name: string;
  description?: string;
  itemCode: string;
  category: FeeComponentCategory;
  unitPrice: number;
  refundable: boolean;
  plansUsed: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'panacea.billing.fee-components.v1';

const SEED: FeeComponent[] = [
  {
    id: 'fc-1',
    name: 'Fee',
    description: 'Standard recurring tuition fee',
    itemCode: '6I6U',
    category: 'Recurring',
    unitPrice: 1000,
    refundable: false,
    plansUsed: 1,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'fc-2',
    name: 'Admission Deposit',
    description: 'Refundable security deposit',
    itemCode: 'AD42',
    category: 'One Time',
    unitPrice: 5000,
    refundable: true,
    plansUsed: 2,
    createdAt: '2026-07-02T10:00:00.000Z',
    updatedAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 'fc-3',
    name: 'Meal Charges',
    description: 'Daily meals package',
    itemCode: 'ML09',
    category: 'Recurring',
    unitPrice: 1500,
    refundable: false,
    plansUsed: 3,
    createdAt: '2026-07-05T10:00:00.000Z',
    updatedAt: '2026-07-05T10:00:00.000Z',
  },
  {
    id: 'fc-4',
    name: 'Transport',
    description: 'Pickup and drop service',
    itemCode: 'TR21',
    category: 'Recurring',
    unitPrice: 2000,
    refundable: false,
    plansUsed: 1,
    createdAt: '2026-07-08T10:00:00.000Z',
    updatedAt: '2026-07-08T10:00:00.000Z',
  },
  {
    id: 'fc-5',
    name: 'Activity Fee',
    description: 'Extra-curricular activities',
    itemCode: 'AC77',
    category: 'One Time',
    unitPrice: 800,
    refundable: false,
    plansUsed: 0,
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-07-12T10:00:00.000Z',
  },
  {
    id: 'fc-6',
    name: 'Uniform Kit',
    description: 'Annual uniform package',
    itemCode: 'UN15',
    category: 'One Time',
    unitPrice: 2500,
    refundable: false,
    plansUsed: 4,
    createdAt: '2026-07-15T10:00:00.000Z',
    updatedAt: '2026-07-15T10:00:00.000Z',
  },
  {
    id: 'fc-7',
    name: 'Annual Day Fee',
    description: 'Event contribution',
    itemCode: 'EV33',
    category: 'One Time',
    unitPrice: 1200,
    refundable: false,
    plansUsed: 0,
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'fc-8',
    name: 'Late Pickup',
    description: 'After-hours pickup charge',
    itemCode: 'LP08',
    category: 'One Time',
    unitPrice: 300,
    refundable: false,
    plansUsed: 1,
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readAll(): FeeComponent[] {
  if (!canUseStorage()) return [...SEED];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(SEED);
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as FeeComponent[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeAll(rows: FeeComponent[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function loadFeeComponents(): FeeComponent[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function saveFeeComponents(rows: FeeComponent[]) {
  writeAll(rows);
}

export function createFeeComponentId() {
  return `fc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Short alphanumeric item code similar to competitor demos. */
export function generateItemCode(existing: FeeComponent[] = loadFeeComponents()) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const taken = new Set(existing.map((r) => r.itemCode.toUpperCase()));
  for (let attempt = 0; attempt < 40; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!taken.has(code)) return code;
  }
  return `C${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

export function upsertFeeComponent(
  input: Omit<FeeComponent, 'id' | 'createdAt' | 'updatedAt' | 'plansUsed'> & {
    id?: string;
    plansUsed?: number;
  },
): FeeComponent {
  const all = readAll();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((r) => r.id === input.id);
    if (idx >= 0) {
      const next: FeeComponent = {
        ...all[idx],
        name: input.name,
        description: input.description,
        itemCode: input.itemCode,
        category: input.category,
        unitPrice: input.unitPrice,
        refundable: input.refundable,
        plansUsed: input.plansUsed ?? all[idx].plansUsed,
        updatedAt: now,
      };
      all[idx] = next;
      writeAll(all);
      return next;
    }
  }
  const row: FeeComponent = {
    id: input.id || createFeeComponentId(),
    name: input.name,
    description: input.description,
    itemCode: input.itemCode,
    category: input.category,
    unitPrice: input.unitPrice,
    refundable: input.refundable,
    plansUsed: input.plansUsed ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([row, ...all]);
  return row;
}

export function deleteFeeComponents(ids: string[]) {
  const set = new Set(ids);
  writeAll(readAll().filter((r) => !set.has(r.id)));
}

export function formatFeePrice(amount: number) {
  return `₹ ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

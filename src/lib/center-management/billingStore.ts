export type InvoiceStatus = 'due' | 'paid';

export type InvoiceLineItem = {
  description: string;
  amount: number;
};

export type BillingInvoice = {
  id: string;
  invoiceId: string;
  dateRaised: string;
  dueDate: string;
  pending: number;
  total: number;
  paymentDate?: string;
  status: InvoiceStatus;
  items?: InvoiceLineItem[];
  notes?: string;
};

export type CreditEntry = {
  id: string;
  ref: string;
  description: string;
  date: string;
  amount: number;
  paymentMode?: string;
  issuedAgainst: string;
  recordedBy: string;
  approvedBy?: string;
  reason?: string;
  category?: string;
};

export type CreditKind = 'issued' | 'used' | 'refunded' | 'deposit_transfer';

export type CreditSummary = {
  issued: number;
  used: number;
  refunded: number;
  fromDeposit: number;
  balance: number;
};

export type DepositKind = 'issued' | 'used' | 'refunded' | 'to_credit';

export type DepositSummary = {
  issued: number;
  used: number;
  refunded: number;
  toCredit: number;
  balance: number;
};

export type DepositEntry = {
  id: string;
  ref: string;
  transaction: string;
  date: string;
  amount: number;
  paymentMode?: string;
  issuedAgainst: string;
  recordedBy: string;
  approvedBy?: string;
  description?: string;
};

export type CreditNoteEntry = {
  id: string;
  ref: string;
  date: string;
  amount: number;
  paymentMode?: string;
  issuedAgainst: string;
  recordedBy: string;
  approvedBy?: string;
  reason?: string;
  category: string;
  /** Set when CN created Credit Balance wallet row. */
  creditBalanceRef?: string;
  /** Legacy: invoice/debit reductions from older CN rule (kept for safe reverse on delete). */
  applications?: {
    centerInvoiceId: string;
    invoiceId: string;
    amount: number;
  }[];
};

export type UpcomingInvoice = {
  id: string;
  feePlanId: string;
  feePlanName: string;
  frequency: string;
  generationDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  total: number;
  pending: number;
  /** True when projected from a fee plan (not yet a stored center invoice). */
  scheduled?: boolean;
};

export type FeePlanInfo = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
};

export type StudentBilling = {
  studentId: string;
  invoices: BillingInvoice[];
  credits: CreditEntry[];
  creditNotes: CreditNoteEntry[];
  deposits: DepositEntry[];
  upcoming: UpcomingInvoice[];
  feePlan: FeePlanInfo | null;
  /** All fee plans assigned to this student (list UI). */
  feePlans: FeePlanInfo[];
  refundTotal: number;
};

export const PAYMENT_MODES = [
  'Cash',
  'Credit Balance',
  'Cheque',
  'Card',
  'Bank Transfer',
  'M-Pesa',
  'FPS',
  'Other',
] as const;

export const CREDIT_NOTE_CATEGORIES = [
  'Deferment',
  'Discount',
  'Double Invoice',
  'Extra Fees',
  'Late Start Date',
  'Medical',
  'Mistake',
  'Special Day Promotion',
  'Student Termination',
  'Transfer Campus',
  'Transfer Programme',
  'Withdraw Extra Prog or Class',
  'Write-Off',
  'Credit Note Deposit',
] as const;

export type CreditNoteCategory = (typeof CREDIT_NOTE_CATEGORIES)[number];

export const DATE_RANGE_OPTIONS = [
  'This Month',
  'Last Month',
  'Last 6 Months',
  'This Year',
  'Life Time',
  'Custom Date',
] as const;

export type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];

const STORAGE_KEY = 'panacea.center.student-billing.v9';
const LEGACY_BILLING_KEYS = [
  'panacea.center.student-billing.v3',
  'panacea.center.student-billing.v4',
  'panacea.center.student-billing.v5',
  'panacea.center.student-billing.v6',
  'panacea.center.student-billing.v7',
  'panacea.center.student-billing.v8',
];

/** Compact demo credit ledger — only these 6 students get seed credits. */
export const CREDIT_SEED_STUDENT_IDS = [
  'st-alex',
  'st-hold',
  'st-demo-r1-2',
  'st-demo-r1-3',
  'st-nara',
  'st-with',
] as const;

function seedDepositsFor(studentId: string): DepositEntry[] {
  if (!(CREDIT_SEED_STUDENT_IDS as readonly string[]).includes(studentId)) return [];

  const byStudent: Record<string, DepositEntry[]> = {
    'st-alex': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(40),
        amount: 5000,
        paymentMode: 'Bank Transfer',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Admin',
        description: 'Refundable admission deposit',
      },
      {
        id: `${studentId}-dp-2`,
        ref: 'DP-2',
        transaction: 'Deposit used',
        date: isoDaysAgo(12),
        amount: 500,
        paymentMode: 'Deposit',
        issuedAgainst: 'INV-3',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Darshan',
        description: 'Applied toward invoice INV-3',
      },
    ],
    'st-hold': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(30),
        amount: 2000,
        paymentMode: 'Cash',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Admin',
        description: 'Security deposit',
      },
      {
        id: `${studentId}-dp-2`,
        ref: 'DP-2',
        transaction: 'Transferred to credit',
        date: isoDaysAgo(8),
        amount: 500,
        paymentMode: 'Transfer',
        issuedAgainst: 'Credit balance',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Admin',
        description: 'Moved deposit to credit',
      },
    ],
    'st-demo-r1-2': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(22),
        amount: 3500,
        paymentMode: 'Card',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Darshan',
        approvedBy: 'Malika Thimisetty',
        description: 'Admission deposit',
      },
    ],
    'st-demo-r1-3': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(18),
        amount: 2500,
        paymentMode: 'Bank Transfer',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Simran Jain',
        approvedBy: 'Darshan',
        description: 'Security deposit',
      },
    ],
    'st-nara': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(14),
        amount: 4000,
        paymentMode: 'Cash',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Simran Jain',
        description: 'Refundable deposit',
      },
    ],
    'st-with': [
      {
        id: `${studentId}-dp-1`,
        ref: 'DP-1',
        transaction: 'Deposit added',
        date: isoDaysAgo(9),
        amount: 3000,
        paymentMode: 'Bank Transfer',
        issuedAgainst: 'Deposit added directly',
        recordedBy: 'Darshan',
        approvedBy: 'Admin',
        description: 'Admission deposit',
      },
    ],
  };

  return byStudent[studentId] ?? [];
}

function seedCreditsFor(studentId: string): CreditEntry[] {
  if (!(CREDIT_SEED_STUDENT_IDS as readonly string[]).includes(studentId)) return [];

  const byStudent: Record<string, CreditEntry[]> = {
    'st-alex': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(12),
        amount: 500,
        paymentMode: 'Cash',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Darshan',
        reason: 'Welcome credit',
        category: 'Bonus',
      },
      {
        id: `${studentId}-cb-2`,
        ref: 'CB-2',
        description: 'Amount withdrawn',
        date: isoDaysAgo(5),
        amount: 80,
        paymentMode: 'Credit Balance',
        issuedAgainst: 'INV-3',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Darshan',
        reason: 'Used to settle invoice no. INV-3',
        category: 'Adjustment',
      },
    ],
    'st-hold': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(10),
        amount: 1000,
        paymentMode: 'Bank Transfer',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Admin',
        category: 'Adjustment',
      },
    ],
    'st-demo-r1-2': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(8),
        amount: 750,
        paymentMode: 'Card',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Darshan',
        approvedBy: 'Malika Thimisetty',
        reason: 'Sibling discount',
        category: 'Discount',
      },
    ],
    'st-demo-r1-3': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(6),
        amount: 600,
        paymentMode: 'Other',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Simran Jain',
        approvedBy: 'Darshan',
        category: 'Bonus',
      },
    ],
    'st-nara': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(4),
        amount: 1200,
        paymentMode: 'Cash',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Simran Jain',
        reason: 'Referral bonus',
        category: 'Bonus',
      },
    ],
    'st-with': [
      {
        id: `${studentId}-cb-1`,
        ref: 'CB-1',
        description: 'Amount credited',
        date: isoDaysAgo(2),
        amount: 900,
        paymentMode: 'Bank Transfer',
        issuedAgainst: 'Balance added directly',
        recordedBy: 'Darshan',
        approvedBy: 'Admin',
        category: 'Discount',
      },
    ],
  };

  return byStudent[studentId] ?? [];
}

function seedCreditNotesFor(studentId: string): CreditNoteEntry[] {
  if (!(CREDIT_SEED_STUDENT_IDS as readonly string[]).includes(studentId)) return [];

  const byStudent: Record<string, CreditNoteEntry[]> = {
    'st-alex': [],
    'st-hold': [
      {
        id: `${studentId}-cn-1`,
        ref: 'CN-1',
        date: isoDaysAgo(6),
        amount: 750,
        issuedAgainst: 'Credit Balance : CB-3',
        recordedBy: 'Malika Thimisetty',
        approvedBy: 'Admin',
        reason: 'Medical absence adjustment',
        category: 'Medical',
        creditBalanceRef: 'CB-3',
      },
    ],
    'st-demo-r1-2': [
      {
        id: `${studentId}-cn-1`,
        ref: 'CN-2',
        date: isoDaysAgo(4),
        amount: 300,
        issuedAgainst: 'Credit Balance : CB-2',
        recordedBy: 'Darshan',
        approvedBy: 'Darshan',
        reason: 'Invoice correction',
        category: 'Mistake',
        creditBalanceRef: 'CB-2',
      },
    ],
  };

  return byStudent[studentId] ?? [];
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function isoOnDay(dayOfMonth: number, hour = 10) {
  const d = new Date();
  d.setDate(Math.min(dayOfMonth, 28));
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function seed(studentId: string): StudentBilling {
  return {
    studentId,
    // Invoices live only in Billing & Accounting (invoiceStore).
    invoices: [],
    credits: seedCreditsFor(studentId),
    creditNotes: seedCreditNotesFor(studentId),
    deposits: seedDepositsFor(studentId),
    upcoming: [],
    feePlan: null,
    feePlans: [],
    refundTotal: 0,
  };
}

function purgeLegacyBillingStores() {
  if (!canUseStorage()) return;
  for (const key of LEGACY_BILLING_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function countAllCredits(map: Record<string, StudentBilling>) {
  return Object.values(map).reduce((sum, b) => sum + (b.credits?.length ?? 0), 0);
}

/** Wipe bloated demo ledgers and re-seed on next load. */
export function ensureCompactCreditDemo() {
  if (!canUseStorage()) return;
  purgeLegacyBillingStores();
  const flagKey = 'panacea.center.student-billing.compact-v9';
  try {
    if (localStorage.getItem(flagKey) !== '1') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(flagKey, '1');
      return;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, StudentBilling>;
    const depositCount = Object.values(map).reduce((s, b) => s + (b.deposits?.length ?? 0), 0);
    if (countAllCredits(map) > 12 || depositCount > 14) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readAll(): Record<string, StudentBilling> {
  if (!canUseStorage()) return {};
  purgeLegacyBillingStores();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StudentBilling>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, StudentBilling>) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadStudentBilling(studentId: string): StudentBilling {
  const all = readAll();
  if (all[studentId]) {
    const existing = all[studentId];
    const normalized: StudentBilling = {
      ...existing,
      creditNotes: existing.creditNotes ?? seedCreditNotesFor(studentId),
      feePlans: Array.isArray(existing.feePlans) ? existing.feePlans : [],
    };
    if (!existing.creditNotes || !Array.isArray(existing.feePlans)) {
      all[studentId] = normalized;
      writeAll(all);
    }
    return normalized;
  }
  const seeded = seed(studentId);
  all[studentId] = seeded;
  writeAll(all);
  return seeded;
}

export function saveStudentBilling(data: StudentBilling) {
  const all = readAll();
  all[data.studentId] = data;
  writeAll(all);
}

export function createBillingId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nextCreditRef(credits: CreditEntry[]) {
  const max = credits.reduce((n, c) => {
    const m = String(c.ref || '').match(/(\d+)/);
    return m ? Math.max(n, Number(m[1])) : n;
  }, 0);
  return `CB-${max + 1}`;
}

export function nextCreditNoteRef(notes: CreditNoteEntry[]) {
  const max = notes.reduce((n, c) => {
    const m = String(c.ref || '').match(/(\d+)/);
    return m ? Math.max(n, Number(m[1])) : n;
  }, 0);
  return `CN-${max + 1}`;
}

export function nextDepositRef(deposits: DepositEntry[]) {
  const n = deposits.length + 1;
  return `DP-${n}`;
}

export function formatInr(amount: number) {
  return `INR ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatInrShort(amount: number) {
  return `₹ ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Display payment mode for Credit Balance ledger rows. */
export function formatCreditPaymentMode(entry: CreditEntry): string {
  const kind = classifyCredit(entry);
  if (kind === 'used') return 'Credit Balance';
  const raw = (entry.paymentMode || '').trim();
  if (!raw || raw === '-' || raw === 'Credit') return '—';
  if (raw === 'Credit Balance') return 'Credit Balance';
  return raw;
}

/** Used / refunded rows show as outflow (− ₹). */
export function formatCreditLedgerAmount(entry: CreditEntry): string {
  const kind = classifyCredit(entry);
  const abs = formatInrShort(Math.abs(entry.amount));
  if (kind === 'used' || kind === 'refunded') return `− ${abs}`;
  return abs;
}

export function formatBillingDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatBillingDateLong(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function classifyCredit(entry: CreditEntry): CreditKind {
  const hay = `${entry.description} ${entry.issuedAgainst} ${entry.reason ?? ''} ${entry.category ?? ''}`.toLowerCase();
  if (
    hay.includes('withdraw') ||
    hay.includes('amount used') ||
    hay.includes('used to settle') ||
    hay.includes('applied to invoice')
  ) {
    return 'used';
  }
  // Invoice refunds that land in the credit wallet are issuances, not refunds out.
  if (hay.includes('refund from')) return 'issued';
  if (
    hay.includes('credit refunded') ||
    hay.includes('refund credit') ||
    hay.includes('refunded to parent') ||
    hay.includes('refunded to guardian')
  ) {
    return 'refunded';
  }
  if (hay.includes('transferred from deposit') || hay.includes('transfer from deposit')) {
    return 'deposit_transfer';
  }
  return 'issued';
}

export function summarizeCredits(credits: CreditEntry[]): CreditSummary {
  let issued = 0;
  let used = 0;
  let refunded = 0;
  let fromDeposit = 0;
  for (const c of credits) {
    const amt = Math.abs(c.amount);
    const kind = classifyCredit(c);
    if (kind === 'used') used += amt;
    else if (kind === 'refunded') refunded += amt;
    else if (kind === 'deposit_transfer') fromDeposit += amt;
    else issued += amt;
  }
  return {
    issued,
    used,
    refunded,
    fromDeposit,
    balance: Math.max(0, issued + fromDeposit - used - refunded),
  };
}

/** Pull INV-12 / CN-4 style refs from issuedAgainst / reason text. */
export function extractIssuedDocRef(text: string): { kind: 'invoice' | 'credit_note'; id: string } | null {
  const inv = text.match(/\bINV-[\w-]+\b/i);
  if (inv) return { kind: 'invoice', id: inv[0].toUpperCase() };
  const cn = text.match(/\bCN-[\w-]+\b/i);
  if (cn) return { kind: 'credit_note', id: cn[0].toUpperCase() };
  return null;
}

export function creditAmountAdded(entry: CreditEntry) {
  const kind = classifyCredit(entry);
  return kind === 'used' || kind === 'refunded' ? 0 : Math.abs(entry.amount);
}

export function creditAmountUsed(entry: CreditEntry) {
  const kind = classifyCredit(entry);
  return kind === 'used' || kind === 'refunded' ? Math.abs(entry.amount) : 0;
}

export function creditTotal(credits: CreditEntry[]) {
  return summarizeCredits(credits).balance;
}

export function creditNoteTotal(notes: CreditNoteEntry[]) {
  return notes.reduce((sum, n) => sum + Math.abs(n.amount || 0), 0);
}

export function classifyDeposit(entry: DepositEntry): DepositKind {
  const hay = `${entry.transaction} ${entry.description ?? ''} ${entry.issuedAgainst}`.toLowerCase();
  if (
    hay.includes('withdraw') ||
    hay.includes('deposit used') ||
    hay.includes('applied toward') ||
    hay.includes('used to settle')
  ) {
    return 'used';
  }
  if (hay.includes('refund')) return 'refunded';
  if (hay.includes('transfer') && hay.includes('credit')) return 'to_credit';
  return 'issued';
}

export function summarizeDeposits(deposits: DepositEntry[]): DepositSummary {
  let issued = 0;
  let used = 0;
  let refunded = 0;
  let toCredit = 0;
  for (const d of deposits) {
    const amt = Math.abs(d.amount);
    const kind = classifyDeposit(d);
    if (kind === 'used') used += amt;
    else if (kind === 'refunded') refunded += amt;
    else if (kind === 'to_credit') toCredit += amt;
    else issued += amt;
  }
  return {
    issued,
    used,
    refunded,
    toCredit,
    balance: Math.max(0, issued - used - refunded - toCredit),
  };
}

export function depositAmountAdded(entry: DepositEntry) {
  const kind = classifyDeposit(entry);
  return kind === 'used' || kind === 'refunded' || kind === 'to_credit' ? 0 : Math.abs(entry.amount);
}

export function depositAmountUsed(entry: DepositEntry) {
  const kind = classifyDeposit(entry);
  return kind === 'used' || kind === 'refunded' || kind === 'to_credit' ? Math.abs(entry.amount) : 0;
}

export function depositTotal(deposits: DepositEntry[]) {
  return summarizeDeposits(deposits).balance;
}

/** Consume credit FIFO. Returns updated credits + amount actually used.
 * @deprecated Prefer `postCreditUsage` for immutable ledger postings. */
export function consumeStudentCredits(credits: CreditEntry[], amount: number) {
  let remaining = Math.max(0, amount);
  const next: CreditEntry[] = [];
  for (const c of credits) {
    if (remaining <= 0) {
      next.push(c);
      continue;
    }
    if (c.amount <= remaining) {
      remaining -= c.amount;
    } else {
      next.push({ ...c, amount: c.amount - remaining });
      remaining = 0;
    }
  }
  return { credits: next, used: Math.max(0, amount) - remaining };
}

/**
 * Immutable ledger: post an "Amount withdrawn" credit row (does not shrink prior issuances).
 * Balance = issued + fromDeposit − used − refunded.
 */
export function postCreditUsage(
  studentId: string,
  amount: number,
  meta: {
    invoiceId: string;
    date?: string;
    recordedBy?: string;
  },
) {
  const billing = loadStudentBilling(studentId);
  const available = creditTotal(billing.credits);
  const used = Math.min(available, Math.max(0, amount));
  if (used <= 0) return { billing, used: 0, entry: null as CreditEntry | null };

  const entry: CreditEntry = {
    id: createBillingId('cb'),
    ref: nextCreditRef(billing.credits),
    description: 'Amount withdrawn',
    date: meta.date ? new Date(meta.date).toISOString() : new Date().toISOString(),
    amount: used,
    paymentMode: 'Credit Balance',
    issuedAgainst: meta.invoiceId,
    recordedBy: meta.recordedBy ?? 'Malika Thimisetty',
    reason: `Used to settle invoice no. ${meta.invoiceId}`,
    category: 'Adjustment',
  };
  const next = { ...billing, credits: [entry, ...billing.credits] };
  saveStudentBilling(next);
  return { billing: next, used, entry };
}

/** Immutable ledger: post a credit refund row (does not delete prior credits). */
export function postCreditRefund(
  studentId: string,
  amount: number,
  meta?: { date?: string; description?: string; recordedBy?: string },
) {
  const billing = loadStudentBilling(studentId);
  const available = creditTotal(billing.credits);
  const applied = Math.min(available, Math.max(0, amount));
  if (applied <= 0) return { billing, applied: 0, entry: null as CreditEntry | null };

  const entry: CreditEntry = {
    id: createBillingId('cb'),
    ref: nextCreditRef(billing.credits),
    description: 'Credit refunded',
    date: meta?.date ? new Date(meta.date).toISOString() : new Date().toISOString(),
    amount: applied,
    paymentMode: 'Refund',
    issuedAgainst: 'Refunded to parent',
    recordedBy: meta?.recordedBy ?? 'Admin',
    reason: meta?.description?.trim() || 'Credit refunded to parent',
    category: 'Refund',
  };
  const next = {
    ...billing,
    credits: [entry, ...billing.credits],
    refundTotal: billing.refundTotal + applied,
  };
  saveStudentBilling(next);
  return { billing: next, applied, entry };
}

/** Immutable ledger: refund deposit (posting, not row delete). */
export function postDepositRefund(
  studentId: string,
  amount: number,
  meta?: { date?: string; description?: string; recordedBy?: string; approvedBy?: string },
) {
  const billing = loadStudentBilling(studentId);
  const available = depositTotal(billing.deposits);
  const applied = Math.min(available, Math.max(0, amount));
  if (applied <= 0) return { billing, applied: 0, entry: null as DepositEntry | null };

  const entry: DepositEntry = {
    id: createBillingId('dp'),
    ref: nextDepositRef(billing.deposits),
    transaction: 'Deposit refunded',
    date: meta?.date ? new Date(meta.date).toISOString() : new Date().toISOString(),
    amount: applied,
    paymentMode: 'Refund',
    issuedAgainst: 'Deposit refunded to parent',
    recordedBy: meta?.recordedBy ?? 'Admin',
    approvedBy: meta?.approvedBy,
    description: meta?.description?.trim() || 'Deposit refund',
  };
  const next = { ...billing, deposits: [entry, ...billing.deposits] };
  saveStudentBilling(next);
  return { billing: next, applied, entry };
}

/** Transfer deposit → credit: both ledgers get immutable postings. */
export function transferDepositToCredit(
  studentId: string,
  amount: number,
  meta?: { date?: string; description?: string; recordedBy?: string; approvedBy?: string },
) {
  const billing = loadStudentBilling(studentId);
  const available = depositTotal(billing.deposits);
  const applied = Math.min(available, Math.max(0, amount));
  if (applied <= 0) {
    return { billing, applied: 0, depositEntry: null as DepositEntry | null, creditEntry: null as CreditEntry | null };
  }

  const iso = meta?.date ? new Date(meta.date).toISOString() : new Date().toISOString();
  const depositEntry: DepositEntry = {
    id: createBillingId('dp'),
    ref: nextDepositRef(billing.deposits),
    transaction: 'Transferred to credit',
    date: iso,
    amount: applied,
    paymentMode: 'Transfer',
    issuedAgainst: 'Credit Balance',
    recordedBy: meta?.recordedBy ?? 'Admin',
    approvedBy: meta?.approvedBy,
    description: meta?.description?.trim() || 'Deposit transferred to credit balance',
  };
  const creditEntry: CreditEntry = {
    id: createBillingId('cb'),
    ref: nextCreditRef(billing.credits),
    description: 'Amount credited',
    date: iso,
    amount: applied,
    paymentMode: 'Transfer',
    issuedAgainst: `Transferred from deposit : ${depositEntry.ref}`,
    recordedBy: meta?.recordedBy ?? 'Admin',
    approvedBy: meta?.approvedBy,
    reason: meta?.description?.trim() || 'Transferred from deposit',
    category: 'Deposit Transfer',
  };
  const next = {
    ...billing,
    deposits: [depositEntry, ...billing.deposits],
    credits: [creditEntry, ...billing.credits],
  };
  saveStudentBilling(next);
  return { billing: next, applied, depositEntry, creditEntry };
}

export function addStudentCredit(
  studentId: string,
  input: {
    amount: number;
    description?: string;
    paymentMode?: string;
    recordedBy?: string;
    approvedBy?: string;
    reason?: string;
    date?: string;
    category?: string;
    issuedAgainst?: string;
  },
) {
  const billing = loadStudentBilling(studentId);
  const entry: CreditEntry = {
    id: createBillingId('cb'),
    ref: nextCreditRef(billing.credits),
    description: input.description ?? 'Amount credited',
    date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
    amount: input.amount,
    paymentMode: input.paymentMode,
    issuedAgainst: input.issuedAgainst ?? 'Balance added directly',
    recordedBy: input.recordedBy ?? 'Malika Thimisetty',
    approvedBy: input.approvedBy,
    reason: input.reason,
    category: input.category ?? 'Discount',
  };
  const next = { ...billing, credits: [entry, ...billing.credits] };
  saveStudentBilling(next);
  return next;
}

export function addStudentDeposit(
  studentId: string,
  input: {
    amount: number;
    description?: string;
    paymentMode?: string;
    recordedBy?: string;
    approvedBy?: string;
    date?: string;
    transaction?: string;
  },
) {
  const billing = loadStudentBilling(studentId);
  const entry: DepositEntry = {
    id: createBillingId('dp'),
    ref: nextDepositRef(billing.deposits),
    transaction: input.transaction ?? 'Deposit received',
    date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
    amount: input.amount,
    paymentMode: input.paymentMode,
    issuedAgainst: 'Deposit added directly',
    recordedBy: input.recordedBy ?? 'Malika Thimisetty',
    approvedBy: input.approvedBy,
    description: input.description,
  };
  const next = { ...billing, deposits: [entry, ...billing.deposits] };
  saveStudentBilling(next);
  return next;
}

/** Keep student profile Billing tab in sync with a center invoice payment state. */
export function upsertProfileInvoiceFromCenter(input: {
  studentId: string;
  invoiceId: string;
  total: number;
  pending: number;
  status: 'due' | 'paid';
  dueDate: string;
  invoiceDate: string;
  paymentDate?: string;
  items?: InvoiceLineItem[];
  notes?: string;
}) {
  if (!input.studentId) return;
  const billing = loadStudentBilling(input.studentId);
  const existing = billing.invoices.find(
    (inv) => inv.invoiceId === input.invoiceId || inv.id === input.invoiceId,
  );
  const row: BillingInvoice = {
    id: existing?.id ?? createBillingId('pinv'),
    invoiceId: input.invoiceId,
    dateRaised: existing?.dateRaised ?? input.invoiceDate,
    dueDate: input.dueDate,
    pending: input.pending,
    total: input.total,
    paymentDate: input.status === 'paid' ? input.paymentDate ?? new Date().toISOString() : undefined,
    status: input.status,
    items: input.items ?? existing?.items,
    notes: input.notes ?? existing?.notes,
  };
  const invoices = existing
    ? billing.invoices.map((inv) => (inv.id === existing.id ? row : inv))
    : [row, ...billing.invoices];
  saveStudentBilling({ ...billing, invoices });
}

export function inDateRange(
  iso: string,
  range: DateRangeOption,
  customFrom?: string,
  customTo?: string,
): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startYear = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  switch (range) {
    case 'This Month':
      return d >= startOfMonth && d <= endOfMonth;
    case 'Last Month':
      return d >= startLastMonth && d <= endLastMonth;
    case 'Last 6 Months':
      return d >= sixMonthsAgo && d <= now;
    case 'This Year':
      return d >= startYear && d <= now;
    case 'Life Time':
      return true;
    case 'Custom Date': {
      if (!customFrom && !customTo) return true;
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(`${customTo}T23:59:59`) : null;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    }
    default:
      return true;
  }
}

/**
 * Cross-ledger ERP operations for student billing.
 *
 * Credit Note rule:
 * - Full note amount is always added to Credit Balance (wallet) + ledger history
 * - Credit Note "Issued Against" = Credit Balance : CB-*
 * - Credit Balance row "Issued Against" = Credit Note : CN-*
 *
 * Generated Invoice is NOT stored here — readers use invoiceStore filters.
 */

import {
  createBillingId,
  creditTotal,
  loadStudentBilling,
  nextCreditNoteRef,
  nextCreditRef,
  postCreditUsage,
  saveStudentBilling,
  type CreditEntry,
  type CreditNoteEntry,
  type FeePlanInfo,
  type UpcomingInvoice,
} from '@/lib/center-management/billingStore';
import {
  getCenterInvoiceById,
  loadCenterInvoices,
  resolveCenterInvoiceStatus,
  updateCenterInvoice,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import {
  getFeePlanById,
  lineTaxPercent,
  loadFeePlans,
  previewNextInvoice,
  summarizePlanLines,
  type FeePlan,
} from '@/lib/billing-accounting/feePlansStore';
import { addDateDays } from '@/lib/billing-accounting/schedule/dateUtils';

/**
 * Issue Credit Note: always post the full amount to Credit Balance (transaction history).
 */
export function issueStudentCreditNote(
  studentId: string,
  input: {
    amount: number;
    date: string;
    category: string;
    approvedBy?: string;
    reason?: string;
    recordedBy?: string;
  },
): { note: CreditNoteEntry; creditEntry: CreditEntry; appliedToDocs: number; toWallet: number } {
  const amount = Math.max(0, Number(input.amount) || 0);
  if (amount <= 0) throw new Error('Credit note amount must be positive');

  // Ensure prior orphan notes are linked first so refs stay unique.
  const billing = syncCreditNotesToCreditBalance(studentId);
  const notes = billing.creditNotes || [];
  const cnRef = nextCreditNoteRef(notes);
  const iso = new Date(input.date || new Date().toISOString().slice(0, 10)).toISOString();
  const actor = input.recordedBy ?? 'Admin';

  const cbRef = nextCreditRef(billing.credits);
  const creditEntry: CreditEntry = {
    id: createBillingId('cb'),
    ref: cbRef,
    description: 'Amount credited',
    date: iso,
    amount,
    paymentMode: '',
    issuedAgainst: `Credit Note : ${cnRef}`,
    recordedBy: actor,
    approvedBy: input.approvedBy || undefined,
    reason: input.reason?.trim() || undefined,
    category: input.category,
  };

  const note: CreditNoteEntry = {
    id: createBillingId('cn'),
    ref: cnRef,
    date: iso,
    amount,
    issuedAgainst: `Credit Balance : ${cbRef}`,
    recordedBy: actor,
    approvedBy: input.approvedBy || undefined,
    reason: input.reason?.trim() || undefined,
    category: input.category,
    creditBalanceRef: cbRef,
  };

  const next = {
    ...billing,
    credits: [creditEntry, ...billing.credits],
    creditNotes: [note, ...(billing.creditNotes || [])],
  };
  saveStudentBilling(next);

  return {
    note,
    creditEntry,
    appliedToDocs: 0,
    toWallet: amount,
  };
}

function creditLinkedToNote(credits: CreditEntry[], note: CreditNoteEntry) {
  const cnKey = note.ref.trim().toLowerCase();
  return (
    credits.find((c) => {
      if (note.creditBalanceRef && (c.ref === note.creditBalanceRef || c.id === note.creditBalanceRef)) {
        return true;
      }
      const against = (c.issuedAgainst || '').trim().toLowerCase();
      return against === `credit note : ${cnKey}` || against.includes(`credit note : ${cnKey}`);
    }) || null
  );
}

function reverseCreditNoteApplications(
  applications: NonNullable<CreditNoteEntry['applications']>,
) {
  for (const app of applications) {
    const doc = loadCenterInvoices().find(
      (r) => r.id === app.centerInvoiceId || r.invoiceId === app.invoiceId,
    );
    if (!doc) continue;
    const newInvoiced = Number(doc.invoicedAmount) + app.amount;
    const newPending = Math.max(0, newInvoiced - Number(doc.paidAmount));
    updateCenterInvoice(doc.id, {
      invoicedAmount: newInvoiced,
      pendingAmount: newPending,
      status: resolveCenterInvoiceStatus({
        status: doc.status,
        dueDate: doc.dueDate,
        paidAmount: doc.paidAmount,
        pendingAmount: newPending,
        kind: doc.kind,
      }),
    });
  }
}

/**
 * Migrate / repair Credit Notes that never received a Credit Balance ledger row
 * (old FIFO-to-invoice rule). Idempotent.
 */
export function syncCreditNotesToCreditBalance(studentId: string) {
  const billing = loadStudentBilling(studentId);
  const notes = billing.creditNotes || [];
  if (!notes.length) return billing;

  let credits = [...billing.credits];
  let changed = false;
  const nextNotes: CreditNoteEntry[] = [];

  for (const note of notes) {
    let n: CreditNoteEntry = { ...note };
    const linked = creditLinkedToNote(credits, n);

    if (linked) {
      const expectedAgainst = `Credit Balance : ${linked.ref}`;
      if (
        n.creditBalanceRef !== linked.ref ||
        n.issuedAgainst !== expectedAgainst ||
        (n.applications && n.applications.length)
      ) {
        if (n.applications?.length) reverseCreditNoteApplications(n.applications);
        n = {
          ...n,
          creditBalanceRef: linked.ref,
          issuedAgainst: expectedAgainst,
          applications: undefined,
        };
        changed = true;
      }
      nextNotes.push(n);
      continue;
    }

    if (n.applications?.length) reverseCreditNoteApplications(n.applications);

    const cbRef = nextCreditRef(credits);
    const entry: CreditEntry = {
      id: createBillingId('cb'),
      ref: cbRef,
      description: 'Amount credited',
      date: n.date,
      amount: Math.abs(Number(n.amount) || 0),
      paymentMode: '',
      issuedAgainst: `Credit Note : ${n.ref}`,
      recordedBy: n.recordedBy,
      approvedBy: n.approvedBy,
      reason: n.reason,
      category: n.category,
    };
    credits = [entry, ...credits];
    nextNotes.push({
      ...n,
      creditBalanceRef: cbRef,
      issuedAgainst: `Credit Balance : ${cbRef}`,
      applications: undefined,
    });
    changed = true;
  }

  if (!changed) return billing;
  const next = { ...billing, credits, creditNotes: nextNotes };
  saveStudentBilling(next);
  return next;
}

export function deleteStudentCreditNote(
  studentId: string,
  noteId: string,
): { ok: true; billing: ReturnType<typeof loadStudentBilling> } | { ok: false; reason: string } {
  const billing = loadStudentBilling(studentId);
  const notes = billing.creditNotes || [];
  const note = notes.find((n) => n.id === noteId);
  if (!note) return { ok: false, reason: 'Credit note not found' };

  let nextCredits = billing.credits;
  if (note.creditBalanceRef) {
    const cb = billing.credits.find(
      (c) => c.ref === note.creditBalanceRef || c.id === note.creditBalanceRef,
    );
    if (cb) {
      const available = creditTotal(billing.credits);
      if (available + 0.001 < Math.abs(cb.amount)) {
        return {
          ok: false,
          reason: 'Linked credit balance was already used or refunded. Reverse those first.',
        };
      }
      nextCredits = billing.credits.filter((c) => c.id !== cb.id);
    }
  }

  for (const app of note.applications ?? []) {
    const doc = loadCenterInvoices().find(
      (r) => r.id === app.centerInvoiceId || r.invoiceId === app.invoiceId,
    );
    if (!doc) continue;
    const newInvoiced = Number(doc.invoicedAmount) + app.amount;
    const newPending = Math.max(0, newInvoiced - Number(doc.paidAmount));
    updateCenterInvoice(doc.id, {
      invoicedAmount: newInvoiced,
      pendingAmount: newPending,
      status: resolveCenterInvoiceStatus({
        status: doc.status,
        dueDate: doc.dueDate,
        paidAmount: doc.paidAmount,
        pendingAmount: newPending,
        kind: doc.kind,
      }),
    });
  }

  const fresh = loadStudentBilling(studentId);
  let credits = fresh.credits;
  if (note.creditBalanceRef) {
    const cb = nextCredits.find(
      (c) => c.ref === note.creditBalanceRef || c.id === note.creditBalanceRef,
    );
    if (cb) credits = fresh.credits.filter((c) => c.id !== cb.id);
  }
  const next = {
    ...fresh,
    credits,
    creditNotes: (fresh.creditNotes || []).filter((n) => n.id !== noteId),
  };
  saveStudentBilling(next);
  return { ok: true, billing: next };
}

export function resolveAssignedFeePlans(studentId: string): FeePlanInfo[] {
  return loadFeePlans()
    .filter((p) => (p.students ?? []).some((s) => s.studentId === studentId))
    .map((p) => feePlanToInfo(p, studentId))
    .sort((a, b) => {
      const rank = (s: FeePlanInfo['status']) =>
        s === 'Active' ? 0 : s === 'Paused' ? 1 : s === 'Draft' ? 2 : 3;
      const d = rank(a.status) - rank(b.status);
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
}

export function resolveAssignedFeePlan(studentId: string): FeePlanInfo | null {
  const plans = resolveAssignedFeePlans(studentId);
  if (!plans.length) return null;
  return plans.find((p) => p.status === 'Active' || p.status === 'Paused') || plans[0];
}

function feePlanToInfo(plan: FeePlan, studentId: string): FeePlanInfo {
  const asg = (plan.students ?? []).find((s) => s.studentId === studentId);
  const totals = summarizePlanLines(
    plan.lines ?? [],
    plan.taxMode,
    asg?.discountId || plan.discountId,
  );
  const status: FeePlanInfo['status'] =
    plan.status === 'Paused'
      ? 'Paused'
      : plan.status === 'Completed'
        ? 'Completed'
        : plan.status === 'Draft'
          ? 'Draft'
          : 'Active';
  return {
    id: plan.id,
    name: plan.name,
    amount: totals.total,
    frequency: plan.customTerms ? 'Custom Terms' : plan.frequency,
    startDate: asg?.startDate || plan.periodStart,
    endDate: asg?.endDate || plan.periodEnd || undefined,
    status,
  };
}

function planAmountForStudent(plan: FeePlan, studentId: string) {
  const asg = (plan.students ?? []).find((s) => s.studentId === studentId);
  return summarizePlanLines(
    plan.lines ?? [],
    plan.taxMode,
    asg?.discountId || plan.discountId,
  ).total;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pushUpcoming(
  list: UpcomingInvoice[],
  seen: Set<string>,
  row: UpcomingInvoice,
) {
  const key = `${row.feePlanId}|${row.generationDate.slice(0, 10)}`;
  if (seen.has(key)) return;
  seen.add(key);
  list.push(row);
}

export function resolveStudentUpcoming(studentId: string): UpcomingInvoice[] {
  const today = todayIso();
  const seen = new Set<string>();
  const rows: UpcomingInvoice[] = [];

  const fromCenter = loadCenterInvoices().filter(
    (r) => r.studentId === studentId && r.kind === 'upcoming',
  );
  for (const r of fromCenter) {
    const plan =
      loadFeePlans().find(
        (p) =>
          p.name === r.billingPlan ||
          (p.students ?? []).some((s) => s.studentId === studentId && p.name === r.billingPlan),
      ) || null;
    pushUpcoming(rows, seen, {
      id: r.id,
      feePlanId: plan?.id || '',
      feePlanName: r.billingPlan || r.raisedAgainst || 'Fee Plan',
      frequency: plan?.frequency || '',
      generationDate: r.invoiceDate,
      dueDate: r.dueDate,
      periodStart: r.billingPeriodStart || r.invoiceDate,
      periodEnd: r.billingPeriodEnd || r.dueDate,
      total: r.invoicedAmount,
      pending: r.pendingAmount,
      scheduled: false,
    });
  }

  const plans = loadFeePlans().filter(
    (p) =>
      (p.status === 'Active' || p.status === 'Paused') &&
      (p.students ?? []).some((s) => s.studentId === studentId),
  );

  for (const plan of plans) {
    const amount = planAmountForStudent(plan, studentId);

    if (plan.customTerms) {
      for (const term of plan.terms ?? []) {
        if (!term.invoiceGenerationDate) continue;
        if (term.invoiceGenerationDate < today) continue;
        const due = addDateDays(
          term.invoiceGenerationDate,
          Math.max(0, Number(term.invoiceDueAfter) || 0),
        );
        pushUpcoming(rows, seen, {
          id: `sched-${plan.id}-${term.id}-${term.invoiceGenerationDate}`,
          feePlanId: plan.id,
          feePlanName: plan.name,
          frequency: 'Custom Terms',
          generationDate: term.invoiceGenerationDate,
          dueDate: due,
          periodStart: term.startDate || term.invoiceGenerationDate,
          periodEnd: term.endDate || term.invoiceGenerationDate,
          total: amount,
          pending: amount,
          scheduled: true,
        });
      }
      continue;
    }

    const preview = previewNextInvoice(plan);
    if (preview.status !== 'ready') continue;

    pushUpcoming(rows, seen, {
      id: `sched-${plan.id}-${preview.generationDate}`,
      feePlanId: plan.id,
      feePlanName: plan.name,
      frequency: plan.frequency,
      generationDate: preview.generationDate,
      dueDate: preview.dueDate,
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
      total: amount,
      pending: amount,
      scheduled: true,
    });
  }

  return rows.sort((a, b) => a.generationDate.localeCompare(b.generationDate));
}

/** Build a view-only CenterInvoice for student Upcoming Invoice detail overlay. */
export function buildUpcomingCenterInvoice(
  student: { id: string; name: string },
  row: UpcomingInvoice,
): CenterInvoice | null {
  if (!row.scheduled && row.id) {
    const existing = getCenterInvoiceById(row.id);
    if (existing) {
      return {
        ...existing,
        status: resolveCenterInvoiceStatus(existing),
      };
    }
  }

  const plan = row.feePlanId ? getFeePlanById(row.feePlanId) : undefined;
  if (!plan) {
    return {
      id: row.id,
      invoiceId: 'INV upcoming',
      studentId: student.id,
      studentName: student.name,
      billingPlan: row.feePlanName,
      dueDate: row.dueDate,
      invoicedAmount: row.total,
      paidAmount: 0,
      pendingAmount: row.pending,
      status: 'Upcoming',
      invoiceDate: row.generationDate,
      kind: 'upcoming',
      billingPeriodStart: row.periodStart,
      billingPeriodEnd: row.periodEnd,
      createdBy: `Fee Plan - ${row.feePlanName}`,
      createdOn: row.generationDate,
      lines: [
        {
          id: `${row.id}-l1`,
          name: row.feePlanName,
          quantity: 1,
          unitPrice: row.total,
          taxPercent: 0,
          amount: row.total,
        },
      ],
    };
  }

  const asg = (plan.students ?? []).find((s) => s.studentId === student.id);
  const totals = summarizePlanLines(
    plan.lines ?? [],
    plan.taxMode,
    asg?.discountId || plan.discountId,
  );

  return {
    id: row.id,
    invoiceId: 'INV upcoming',
    studentId: student.id,
    studentName: student.name,
    billingPlan: plan.name,
    dueDate: row.dueDate,
    invoicedAmount: totals.total,
    paidAmount: 0,
    pendingAmount: totals.total,
    status: 'Upcoming',
    invoiceDate: row.generationDate,
    kind: 'upcoming',
    billingPeriodStart: row.periodStart,
    billingPeriodEnd: row.periodEnd,
    createdBy: `Fee Plan - ${plan.name}`,
    createdOn: row.generationDate,
    schoolNotes: plan.schoolNotes,
    parentNotes: plan.parentNotes,
    emailParent: plan.emailParent,
    lines: (plan.lines ?? []).map((l) => ({
      id: l.id,
      name: l.name || 'Item',
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxPercent: lineTaxPercent(l),
      amount: Math.max(0, l.quantity * l.unitPrice - (l.discountAmount || 0)),
    })),
  };
}

/** Ledgers / fee plan / upcoming only — invoices read live from invoiceStore. */
export function hydrateStudentBilling(studentId: string) {
  // Repair orphan Credit Notes so their amount appears in Credit Balance history.
  syncCreditNotesToCreditBalance(studentId);
  const billing = loadStudentBilling(studentId);
  const next = {
    ...billing,
    invoices: [],
    feePlan: resolveAssignedFeePlan(studentId),
    feePlans: resolveAssignedFeePlans(studentId),
    upcoming: resolveStudentUpcoming(studentId),
  };
  saveStudentBilling(next);
  return next;
}

export { postCreditUsage };

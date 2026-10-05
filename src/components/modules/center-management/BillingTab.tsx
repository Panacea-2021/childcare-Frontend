'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Eye,
  FileText,
  MoreVertical,
  NotebookPen,
  PiggyBank,
  Plus,
  RotateCcw,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Student } from '@/lib/center-management/types';
import { STAFF_OPTIONS } from '@/lib/center-management/studentsStore';
import {
  type CreditEntry,
  type CreditNoteEntry,
  type DepositEntry,
  type StudentBilling,
  CREDIT_NOTE_CATEGORIES,
  PAYMENT_MODES,
  createBillingId,
  creditNoteTotal,
  creditTotal,
  depositTotal,
  formatBillingDate,
  formatBillingDateLong,
  formatCreditLedgerAmount,
  formatCreditPaymentMode,
  formatInr,
  formatInrShort,
  nextCreditRef,
  nextDepositRef,
  postCreditRefund,
  postDepositRefund,
  saveStudentBilling,
  transferDepositToCredit,
} from '@/lib/center-management/billingStore';
import {
  hydrateStudentBilling,
  issueStudentCreditNote,
} from '@/lib/center-management/billingLedgerOps';
import { AppMenu, AppSelect, ProfileTablePagination, useClientPagination } from './ui';
import { StudentDebitPanel } from './StudentDebitPanel';
import { StudentGeneratedInvoicePanel } from './StudentGeneratedInvoicePanel';
import { StudentUpcomingInvoicePanel } from './StudentUpcomingInvoicePanel';
import './billing.css';

const CreditReceiptPreview = dynamic(
  () =>
    import('@/components/modules/billing-accounting/CreditReceiptPreview').then(
      (m) => m.CreditReceiptPreview,
    ),
  { ssr: false, loading: () => null },
);
const DepositReceiptPreview = dynamic(
  () =>
    import('@/components/modules/billing-accounting/DepositReceiptPreview').then(
      (m) => m.DepositReceiptPreview,
    ),
  { ssr: false, loading: () => null },
);

type SubTab =
  | 'generated'
  | 'credit'
  | 'credit-note'
  | 'debit'
  | 'deposit'
  | 'upcoming'
  | 'fee-plan';

type Props = {
  student: Student;
};

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'generated', label: 'Generated Invoice' },
  { id: 'credit', label: 'Credit Balance' },
  { id: 'credit-note', label: 'Credit Note' },
  { id: 'debit', label: 'Debit' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'upcoming', label: 'Upcoming Invoice' },
  { id: 'fee-plan', label: 'Fee Plan' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const staffOptions = STAFF_OPTIONS.map((s) => ({ value: s.name, label: s.name }));
const paymentOptions = PAYMENT_MODES.map((m) => ({ value: m, label: m }));
const creditNoteCategoryOptions = CREDIT_NOTE_CATEGORIES.map((c) => ({ value: c, label: c }));

function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function SortHint() {
  return (
    <span className="bill-sort" aria-hidden>
      <ChevronDown size={12} />
    </span>
  );
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BillingTab({ student }: Props) {
  const searchParams = useSearchParams();
  const billingDeepLink = searchParams.get('billing');
  const [subTab, setSubTab] = useState<SubTab>(() => {
    if (
      billingDeepLink === 'credit' ||
      billingDeepLink === 'deposit' ||
      billingDeepLink === 'debit' ||
      billingDeepLink === 'credit-note' ||
      billingDeepLink === 'generated' ||
      billingDeepLink === 'upcoming' ||
      billingDeepLink === 'fee-plan'
    ) {
      return billingDeepLink;
    }
    return 'generated';
  });
  const [billing, setBilling] = useState<StudentBilling>(() => hydrateStudentBilling(student.id));
  const [toast, setToast] = useState<string | null>(null);

  const [creditOpen, setCreditOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDate, setCreditDate] = useState(todayInputValue);
  const [creditApprovedBy, setCreditApprovedBy] = useState('');
  const [creditPaymentMode, setCreditPaymentMode] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditEmail, setCreditEmail] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundKind, setRefundKind] = useState<'credit' | 'deposit-refund' | 'deposit-transfer'>(
    'credit',
  );
  const [refundDate, setRefundDate] = useState(todayInputValue);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundDesc, setRefundDesc] = useState('');

  const [creditReceipt, setCreditReceipt] = useState<CreditEntry | null>(null);
  const [depositReceipt, setDepositReceipt] = useState<DepositEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    label: string;
  }>({ open: false, id: '', label: '' });

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(todayInputValue);
  const [depositApprovedBy, setDepositApprovedBy] = useState('');
  const [depositPaymentMode, setDepositPaymentMode] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [depositEmail, setDepositEmail] = useState(false);

  const [creditNoteOpen, setCreditNoteOpen] = useState(false);
  const [cnAmount, setCnAmount] = useState('');
  const [cnDate, setCnDate] = useState(todayInputValue);
  const [cnApprovedBy, setCnApprovedBy] = useState('');
  const [cnCategory, setCnCategory] = useState('');
  const [cnReason, setCnReason] = useState('');
  const [cnEmail, setCnEmail] = useState(false);

  useEffect(() => {
    setBilling(hydrateStudentBilling(student.id));
  }, [student.id]);

  useEffect(() => {
    const b = searchParams.get('billing');
    if (
      b === 'credit' ||
      b === 'deposit' ||
      b === 'debit' ||
      b === 'credit-note' ||
      b === 'generated' ||
      b === 'upcoming' ||
      b === 'fee-plan'
    ) {
      setSubTab(b);
    }
  }, [searchParams]);

  useEffect(() => {
    setBilling(hydrateStudentBilling(student.id));
  }, [student.id, subTab]);

  useEffect(() => {
    const refresh = () => setBilling(hydrateStudentBilling(student.id));
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [student.id]);

  useEffect(() => {
    const b = searchParams.get('billing');
    if (
      b === 'credit' ||
      b === 'deposit' ||
      b === 'debit' ||
      b === 'credit-note' ||
      b === 'generated'
    ) {
      setSubTab(b);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const persist = (next: StudentBilling) => {
    setBilling(next);
    saveStudentBilling(next);
  };

  const creditSum = creditTotal(billing.credits);
  const creditNoteSum = creditNoteTotal(billing.creditNotes || []);
  const depositSum = depositTotal(billing.deposits);

  const resetCreditForm = () => {
    setCreditAmount('');
    setCreditDate(todayInputValue());
    setCreditApprovedBy('');
    setCreditPaymentMode('');
    setCreditReason('');
    setCreditEmail(false);
  };

  const resetDepositForm = () => {
    setDepositAmount('');
    setDepositDate(todayInputValue());
    setDepositApprovedBy('');
    setDepositPaymentMode('');
    setDepositDesc('');
    setDepositEmail(false);
  };

  const resetCreditNoteForm = () => {
    setCnAmount('');
    setCnDate(todayInputValue());
    setCnApprovedBy('');
    setCnCategory('');
    setCnReason('');
    setCnEmail(false);
  };

  const submitCredit = () => {
    const amount = Number(creditAmount);
    if (!amount || amount <= 0 || !creditPaymentMode) return;
    const entry: CreditEntry = {
      id: createBillingId('cb'),
      ref: nextCreditRef(billing.credits),
      description: 'Amount credited',
      date: new Date(creditDate || todayInputValue()).toISOString(),
      amount,
      paymentMode: creditPaymentMode,
      issuedAgainst: 'Balance added directly',
      recordedBy: 'Admin',
      approvedBy: creditApprovedBy || undefined,
      reason: creditReason.trim() || undefined,
      category: 'Discount',
    };
    persist({ ...billing, credits: [entry, ...billing.credits] });
    setCreditOpen(false);
    resetCreditForm();
    setToast(creditEmail ? 'Credit added · email queued' : 'Credit balance added');
  };

  const deleteDeposit = (id: string) => {
    persist({ ...billing, deposits: billing.deposits.filter((d) => d.id !== id) });
    setToast('Deposit entry deleted');
  };

  const requestDeleteDeposit = (d: DepositEntry) => {
    setDeleteConfirm({
      open: true,
      id: d.id,
      label: `${d.ref} (${formatInrShort(d.amount)})`,
    });
  };

  const confirmDelete = () => {
    deleteDeposit(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: '', label: '' });
  };

  const openLedgerModal = (
    kind: 'credit' | 'deposit-refund' | 'deposit-transfer',
    maxAmount: number,
  ) => {
    setRefundKind(kind);
    setRefundAmount(String(Math.max(0, maxAmount).toFixed(2)));
    setRefundDate(todayInputValue());
    setRefundDesc('');
    setRefundOpen(true);
  };

  const submitRefund = () => {
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) return;

    if (refundKind === 'credit') {
      const { billing: next, applied } = postCreditRefund(student.id, amount, {
        date: refundDate,
        description: refundDesc,
      });
      if (applied <= 0) {
        setToast('No credit balance to refund');
        return;
      }
      setBilling(next);
      setRefundOpen(false);
      setRefundAmount('');
      setRefundDesc('');
      setToast(`Refund of ${formatInr(applied)} recorded`);
      return;
    }

    if (refundKind === 'deposit-refund') {
      const { billing: next, applied } = postDepositRefund(student.id, amount, {
        date: refundDate,
        description: refundDesc,
      });
      if (applied <= 0) {
        setToast('No deposit balance to refund');
        return;
      }
      setBilling(next);
      setRefundOpen(false);
      setRefundAmount('');
      setRefundDesc('');
      setToast(`Deposit refund of ${formatInr(applied)} recorded`);
      return;
    }

    const { billing: next, applied } = transferDepositToCredit(student.id, amount, {
      date: refundDate,
      description: refundDesc,
    });
    if (applied <= 0) {
      setToast('No deposit balance to transfer');
      return;
    }
    setBilling(next);
    setRefundOpen(false);
    setRefundAmount('');
    setRefundDesc('');
    setToast(`Transferred ${formatInr(applied)} deposit to credit`);
  };

  const submitDeposit = () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0 || !depositPaymentMode) return;
    const entry: DepositEntry = {
      id: createBillingId('dp'),
      ref: nextDepositRef(billing.deposits),
      transaction: 'Deposit received',
      date: new Date(depositDate || todayInputValue()).toISOString(),
      amount,
      paymentMode: depositPaymentMode,
      issuedAgainst: 'Deposit added directly',
      recordedBy: 'Admin',
      approvedBy: depositApprovedBy || undefined,
      description: depositDesc.trim() || undefined,
    };
    persist({ ...billing, deposits: [entry, ...billing.deposits] });
    setDepositOpen(false);
    resetDepositForm();
    setToast(depositEmail ? 'Deposit added · email queued' : 'Deposit recorded');
  };

  const downloadCreditsCsv = () => {
    const rows = [
      ['Ref', 'Description', 'Date', 'Amount', 'Payment Mode', 'Issued Against', 'Recorded By', 'Reason', 'Category'],
      ...billing.credits.map((c) => [
        c.ref,
        c.description,
        formatBillingDate(c.date),
        String(c.amount),
        formatCreditPaymentMode(c),
        c.issuedAgainst,
        c.recordedBy,
        c.reason ?? '',
        c.category ?? '',
      ]),
    ];
    downloadCsv(`${student.name.replace(/\s+/g, '-')}-credit-balance.csv`, rows);
    setToast('Excel download started');
  };

  const downloadDepositsCsv = () => {
    const rows = [
      ['Ref', 'Transaction', 'Date', 'Amount', 'Payment Mode', 'Issued Against', 'Recorded By', 'Description'],
      ...billing.deposits.map((d) => [
        d.ref,
        d.transaction,
        formatBillingDate(d.date),
        String(d.amount),
        d.paymentMode ?? '',
        d.issuedAgainst,
        d.recordedBy,
        d.description ?? '',
      ]),
    ];
    downloadCsv(`${student.name.replace(/\s+/g, '-')}-deposits.csv`, rows);
    setToast('Excel download started');
  };

  const downloadCreditNotesCsv = () => {
    const notes = billing.creditNotes || [];
    const rows = [
      ['Ref', 'Date', 'Amount', 'Payment Mode', 'Issued Against', 'Recorded By', 'Approved By', 'Reason', 'Category'],
      ...notes.map((n) => [
        n.ref,
        formatBillingDate(n.date),
        String(n.amount),
        n.paymentMode ?? '',
        n.issuedAgainst,
        n.recordedBy,
        n.approvedBy ?? '',
        n.reason ?? '',
        n.category,
      ]),
    ];
    downloadCsv(`${student.name.replace(/\s+/g, '-')}-credit-notes.csv`, rows);
    setToast('Excel download started');
  };

  const submitCreditNote = () => {
    const amount = Number(cnAmount);
    if (!amount || amount <= 0 || !cnCategory) return;

    const { toWallet } = issueStudentCreditNote(student.id, {
      amount,
      date: cnDate || todayInputValue(),
      category: cnCategory,
      approvedBy: cnApprovedBy || undefined,
      reason: cnReason.trim() || undefined,
    });
    setBilling(hydrateStudentBilling(student.id));
    setCreditNoteOpen(false);
    resetCreditNoteForm();
    setToast(
      cnEmail
        ? `Credit note issued · ${formatInr(toWallet)} added to credit balance · email queued`
        : `Credit note issued · ${formatInr(toWallet)} added to credit balance`,
    );
  };

  return (
    <div className="bill-root">
      <AnimatePresence>
        {toast ? (
          <motion.div
            className="bill-toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Check size={14} /> {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="bill-shell"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <div className="bill-subnav">
          <div className="bill-subtabs" role="tablist">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={subTab === t.id}
                className={`bill-subtab ${subTab === t.id ? 'is-active' : ''}`}
                onClick={() => setSubTab(t.id)}
              >
                {t.label}
                {subTab === t.id ? (
                  <motion.span layoutId="bill-sub-underline" className="bill-sub-underline" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            className="bill-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            {subTab === 'generated' ? (
              <StudentGeneratedInvoicePanel
                student={student}
                walletRefundTotal={billing.refundTotal}
              />
            ) : null}

            {subTab === 'credit' ? (
              <CreditPanel
                credits={billing.credits}
                total={creditSum}
                onAdd={() => {
                  resetCreditForm();
                  setCreditOpen(true);
                }}
                onViewReceipt={setCreditReceipt}
                onDownloadExcel={downloadCreditsCsv}
                onRefund={() => openLedgerModal('credit', creditSum)}
              />
            ) : null}

            {subTab === 'credit-note' ? (
              <CreditNotePanel
                notes={billing.creditNotes || []}
                total={creditNoteSum}
                onIssue={() => {
                  resetCreditNoteForm();
                  setCreditNoteOpen(true);
                }}
                onDownloadExcel={downloadCreditNotesCsv}
                onViewReceipt={(n) =>
                  setCreditReceipt({
                    id: n.id,
                    ref: n.ref,
                    description: n.category || 'Credit Note',
                    date: n.date,
                    amount: n.amount,
                    paymentMode: n.paymentMode,
                    issuedAgainst: n.issuedAgainst,
                    recordedBy: n.recordedBy,
                    approvedBy: n.approvedBy,
                    reason: n.reason,
                    category: n.category,
                  })
                }
              />
            ) : null}

            {subTab === 'debit' ? <StudentDebitPanel student={student} /> : null}

            {subTab === 'deposit' ? (
              <DepositPanel
                deposits={billing.deposits}
                total={depositSum}
                onAdd={() => {
                  resetDepositForm();
                  setDepositOpen(true);
                }}
                onDownloadExcel={downloadDepositsCsv}
                onDelete={requestDeleteDeposit}
                onViewReceipt={setDepositReceipt}
                onRefund={() => openLedgerModal('deposit-refund', depositSum)}
                onTransferToCredit={() => openLedgerModal('deposit-transfer', depositSum)}
              />
            ) : null}

            {subTab === 'upcoming' ? (
              <StudentUpcomingInvoicePanel student={student} rows={billing.upcoming} />
            ) : null}

            {subTab === 'fee-plan' ? (
              <FeePlanPanel studentId={student.id} plans={billing.feePlans || []} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Add Credit Balance */}
      <Modal
        open={creditOpen}
        title="Add Credit Balance"
        onClose={() => setCreditOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setCreditOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!creditAmount || Number(creditAmount) <= 0 || !creditPaymentMode}
              onClick={submitCredit}
            >
              Submit
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Credit <span className="bill-req">*</span>
            </label>
            <input
              className="ui-input"
              type="number"
              min={0}
              step="0.01"
              placeholder="Enter credit amount"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Date</label>
            <input
              className="ui-input"
              type="date"
              value={creditDate}
              onChange={(e) => setCreditDate(e.target.value)}
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label">Approved By</label>
          <AppSelect
            searchable
            searchPlaceholder="Select staff"
            placeholder="Select staff"
            value={creditApprovedBy}
            onChange={setCreditApprovedBy}
            options={staffOptions}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">
            Payment Mode <span className="bill-req">*</span>
          </label>
          <AppSelect
            searchable
            searchPlaceholder="Select Payment Mode"
            placeholder="Select Payment Mode"
            value={creditPaymentMode}
            onChange={setCreditPaymentMode}
            options={paymentOptions}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Reason</label>
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Add a reason…"
            value={creditReason}
            onChange={(e) => setCreditReason(e.target.value)}
          />
        </div>
        <label className="bill-check">
          <input
            type="checkbox"
            checked={creditEmail}
            onChange={(e) => setCreditEmail(e.target.checked)}
          />
          Send email to parent and admin
        </label>
        <p className="bill-hint">Amount will be added to balance of the selected student</p>
      </Modal>

      {/* Issue Credit Note */}
      <Modal
        open={creditNoteOpen}
        title="Issue Credit Note"
        subtitle="Create a credit note and add the amount to this student’s balance."
        onClose={() => setCreditNoteOpen(false)}
        icon={<NotebookPen size={18} />}
        className="bill-cn-modal"
        autoHeight
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setCreditNoteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!cnAmount || Number(cnAmount) <= 0 || !cnCategory}
              onClick={submitCreditNote}
            >
              Submit
            </button>
          </>
        }
      >
        <div className="bill-cn-form">
          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label">
                Credit <span className="bill-req">*</span>
              </label>
              <input
                className="ui-input"
                type="number"
                min={0}
                step="0.01"
                placeholder="Enter credit amount"
                value={cnAmount}
                onChange={(e) => setCnAmount(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Date</label>
              <input
                className="ui-input"
                type="date"
                value={cnDate}
                onChange={(e) => setCnDate(e.target.value)}
              />
            </div>
          </div>
          <div className="ui-field">
            <label className="ui-label">Approved By</label>
            <AppSelect
              searchable
              searchPlaceholder="Select staff"
              placeholder="Select staff"
              value={cnApprovedBy}
              onChange={setCnApprovedBy}
              options={staffOptions}
              menuClassName="bill-cn-dd-menu"
              maxHeight={220}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">
              Credit Note Category <span className="bill-req">*</span>
            </label>
            <AppSelect
              searchable
              searchPlaceholder="Select Category"
              placeholder="Select Category"
              value={cnCategory}
              onChange={setCnCategory}
              options={creditNoteCategoryOptions}
              menuClassName="bill-cn-dd-menu"
              maxHeight={240}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Reason</label>
            <textarea
              className="ui-textarea bill-cn-reason"
              rows={3}
              placeholder="Why is this credit note being issued?"
              value={cnReason}
              onChange={(e) => setCnReason(e.target.value)}
            />
          </div>
          <label className="bill-check">
            <input
              type="checkbox"
              checked={cnEmail}
              onChange={(e) => setCnEmail(e.target.checked)}
            />
            Send email to parent and admin
          </label>
          <p className="bill-hint">Amount will be added to balance of the selected student</p>
        </div>
      </Modal>

      {/* Refund / deposit ledger modal (reuses existing Refund modal fields) */}
      <Modal
        open={refundOpen}
        title={
          refundKind === 'deposit-transfer'
            ? 'Transfer Deposit to Credit'
            : refundKind === 'deposit-refund'
              ? 'Refund Deposit'
              : 'Refund'
        }
        onClose={() => setRefundOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setRefundOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={
                !refundAmount ||
                Number(refundAmount) <= 0 ||
                (refundKind === 'credit' ? creditSum <= 0 : depositSum <= 0)
              }
              onClick={submitRefund}
            >
              {refundKind === 'deposit-transfer' ? 'Transfer' : 'Record Refund'}
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Date</label>
          <input
            className="ui-input"
            type="date"
            value={refundDate}
            onChange={(e) => setRefundDate(e.target.value)}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">
            {refundKind === 'deposit-transfer' ? 'Transfer Amount' : 'Refund Amount'}
          </label>
          <input
            className="ui-input"
            type="number"
            min={0}
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Description</label>
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Description…"
            value={refundDesc}
            onChange={(e) => setRefundDesc(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Deposit */}
      <Modal
        open={depositOpen}
        title="Add Deposit"
        onClose={() => setDepositOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDepositOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!depositAmount || Number(depositAmount) <= 0 || !depositPaymentMode}
              onClick={submitDeposit}
            >
              Submit
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Deposit Amount <span className="bill-req">*</span>
            </label>
            <input
              className="ui-input"
              type="number"
              min={0}
              step="0.01"
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Date</label>
            <input
              className="ui-input"
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label">Approved By</label>
          <AppSelect
            searchable
            searchPlaceholder="Select staff"
            placeholder="Select staff"
            value={depositApprovedBy}
            onChange={setDepositApprovedBy}
            options={staffOptions}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">
            Payment Mode <span className="bill-req">*</span>
          </label>
          <AppSelect
            searchable
            searchPlaceholder="Select Payment Mode"
            placeholder="Select Payment Mode"
            value={depositPaymentMode}
            onChange={setDepositPaymentMode}
            options={paymentOptions}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Description</label>
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Description…"
            value={depositDesc}
            onChange={(e) => setDepositDesc(e.target.value)}
          />
        </div>
        <label className="bill-check">
          <input
            type="checkbox"
            checked={depositEmail}
            onChange={(e) => setDepositEmail(e.target.checked)}
          />
          Send email to parent and admin
        </label>
        <p className="bill-hint">Amount will be Deposited to the selected student</p>
      </Modal>

      {creditReceipt ? (
        <CreditReceiptPreview
          open
          student={student}
          credit={creditReceipt}
          onClose={() => setCreditReceipt(null)}
        />
      ) : null}

      {depositReceipt ? (
        <DepositReceiptPreview
          open
          student={student}
          deposit={depositReceipt}
          onClose={() => setDepositReceipt(null)}
        />
      ) : null}

      <Modal
        open={deleteConfirm.open}
        title="Are you sure ?"
        onClose={() => setDeleteConfirm({ open: false, id: '', label: '' })}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteConfirm({ open: false, id: '', label: '' })}
            >
              No
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Yes, Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {`Delete deposit entry ${deleteConfirm.label}? This cannot be undone.`}
        </p>
      </Modal>
    </div>
  );
}

/* ─── Panels ─────────────────────────────────────────────── */

function CreditNotePanel({
  notes,
  total,
  onIssue,
  onDownloadExcel,
  onViewReceipt,
}: {
  notes: CreditNoteEntry[];
  total: number;
  onIssue: () => void;
  onDownloadExcel: () => void;
  onViewReceipt: (n: CreditNoteEntry) => void;
}) {
  const { page, setPage, pageSize, setPageSize, total: rowTotal, totalPages, pageItems } =
    useClientPagination(notes, 30);

  return (
    <div className="bill-cn">
      <div className="bill-cn-blobs" aria-hidden="true">
        <span className="bill-cn-blob bill-cn-blob-a" />
        <span className="bill-cn-blob bill-cn-blob-b" />
      </div>

      <div className="bill-cn-bar">
        <motion.div
          className="bill-cn-badge"
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <span className="bill-cn-badge-ico" aria-hidden="true">
            <NotebookPen size={16} />
          </span>
          <div>
            <em>Issued credit notes</em>
            <strong>{formatInr(total)}</strong>
          </div>
        </motion.div>

        <div className="bill-cn-actions">
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary bill-cn-issue"
            onClick={onIssue}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={15} /> Issue Credit Note
          </motion.button>
          <AppMenu
            align="end"
            minWidth={210}
            items={[
              {
                id: 'excel',
                label: 'Download Excel',
                icon: <ArrowDownToLine size={15} />,
                onSelect: onDownloadExcel,
              },
            ]}
            trigger={({ buttonProps }) => (
              <button
                type="button"
                className="bill-icon-btn"
                aria-label="More credit note actions"
                {...buttonProps}
              >
                <MoreVertical size={18} />
              </button>
            )}
          />
        </div>
      </div>

      <div className="cm-table-wrap bill-table-wrap bill-cn-table-wrap">
        <table className="ui-table cm-tab-table bill-cn-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>
                Amount <SortHint />
              </th>
              <th>Payment Mode</th>
              <th>Issued Against</th>
              <th>Recorded By</th>
              <th>Reason</th>
              <th>Category</th>
              <th className="bill-row-actions" />
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr>
                <td colSpan={8} className="bill-td-empty">
                  <div className="bill-cn-empty">
                    <NotebookPen size={28} strokeWidth={1.5} />
                    <strong>No credit notes yet</strong>
                    <span>Issue a credit note to adjust this student&apos;s balance.</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((n, i) => (
                <motion.tr
                  key={n.id}
                  className="bill-cn-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.28), duration: 0.28, ease }}
                >
                  <td>
                    <strong className="bill-cn-date">{formatBillingDate(n.date)}</strong>
                  </td>
                  <td>
                    <strong className="bill-cn-amount">{formatInrShort(n.amount)}</strong>
                    <em className="bill-sub bill-cn-ref">{n.ref}</em>
                  </td>
                  <td>{n.paymentMode || '—'}</td>
                  <td>
                    <span className="bill-cn-against">{n.issuedAgainst}</span>
                  </td>
                  <td>
                    <strong>{n.recordedBy}</strong>
                    {n.approvedBy ? (
                      <em className="bill-sub">Approved by: {n.approvedBy}</em>
                    ) : null}
                  </td>
                  <td>
                    <span className="bill-cn-reason-cell">{n.reason || '—'}</span>
                  </td>
                  <td>
                    <span className="bill-cn-chip">{n.category}</span>
                  </td>
                  <td>
                    <AppMenu
                      align="end"
                      minWidth={180}
                      items={[
                        {
                          id: 'receipt',
                          label: 'View Receipt',
                          icon: <Eye size={15} />,
                          onSelect: () => onViewReceipt(n),
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button
                          type="button"
                          className="bill-icon-btn"
                          aria-label="Credit note actions"
                          {...buttonProps}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={rowTotal}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

function CreditPanel({
  credits,
  total,
  onAdd,
  onViewReceipt,
  onDownloadExcel,
  onRefund,
}: {
  credits: CreditEntry[];
  total: number;
  onAdd: () => void;
  onViewReceipt: (c: CreditEntry) => void;
  onDownloadExcel: () => void;
  onRefund: () => void;
}) {
  const { page, setPage, pageSize, setPageSize, total: rowTotal, totalPages, pageItems } =
    useClientPagination(credits, 30);

  return (
    <>
      <div className="bill-credit-bar">
        <motion.div
          className="bill-credit-badge"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Wallet size={16} />
          Credit Amount {formatInr(total)}
        </motion.div>
        <div className="bill-credit-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={onAdd}>
            <Plus size={15} /> Add Credit Balance
          </button>
          <AppMenu
            align="end"
            minWidth={220}
            items={[
              {
                id: 'excel',
                label: 'Download Excel',
                icon: <ArrowDownToLine size={15} />,
                onSelect: onDownloadExcel,
              },
              {
                id: 'refund',
                label: 'Refund credit amount',
                icon: <RotateCcw size={15} />,
                onSelect: onRefund,
                disabled: total <= 0,
              },
            ]}
            trigger={({ buttonProps }) => (
              <button
                type="button"
                className="bill-icon-btn"
                aria-label="More credit actions"
                {...buttonProps}
              >
                <MoreVertical size={18} />
              </button>
            )}
          />
        </div>
      </div>

      <div className="cm-table-wrap bill-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>
                Amount <SortHint />
              </th>
              <th>Payment Mode</th>
              <th>Issued Against</th>
              <th>Recorded By</th>
              <th>Reason</th>
              <th>Category</th>
              <th className="bill-row-actions" />
            </tr>
          </thead>
          <tbody>
            {credits.length === 0 ? (
              <tr>
                <td colSpan={8} className="bill-td-empty">
                  No Credit History Found
                </td>
              </tr>
            ) : (
              pageItems.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <strong>{c.description}</strong>
                    <em className="bill-sub">{formatBillingDate(c.date)}</em>
                  </td>
                  <td>
                    <strong>{formatCreditLedgerAmount(c)}</strong>
                    <em className="bill-sub">{c.ref}</em>
                  </td>
                  <td>{formatCreditPaymentMode(c)}</td>
                  <td>{c.issuedAgainst}</td>
                  <td>
                    {c.recordedBy}
                    {c.approvedBy ? (
                      <em className="bill-sub">Approved by: {c.approvedBy}</em>
                    ) : null}
                  </td>
                  <td>{c.reason || '—'}</td>
                  <td>
                    {c.category ? <span className="bill-chip">{c.category}</span> : '—'}
                  </td>
                  <td>
                    <AppMenu
                      align="end"
                      minWidth={180}
                      items={[
                        {
                          id: 'receipt',
                          label: 'View Receipt',
                          icon: <FileText size={15} />,
                          onSelect: () => onViewReceipt(c),
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button
                          type="button"
                          className="bill-icon-btn"
                          aria-label="Row actions"
                          {...buttonProps}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={rowTotal}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}

function DepositPanel({
  deposits,
  total,
  onAdd,
  onDownloadExcel,
  onDelete,
  onViewReceipt,
  onRefund,
  onTransferToCredit,
}: {
  deposits: DepositEntry[];
  total: number;
  onAdd: () => void;
  onDownloadExcel: () => void;
  onDelete: (d: DepositEntry) => void;
  onViewReceipt: (d: DepositEntry) => void;
  onRefund: () => void;
  onTransferToCredit: () => void;
}) {
  const { page, setPage, pageSize, setPageSize, total: rowTotal, totalPages, pageItems } =
    useClientPagination(deposits, 30);

  return (
    <>
      <div className="bill-credit-bar">
        <motion.div
          className="bill-credit-badge"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <PiggyBank size={16} />
          Deposit Amount {formatInr(total)}
        </motion.div>
        <div className="bill-credit-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={onAdd}>
            <Plus size={15} /> Add Deposit
          </button>
          <AppMenu
            align="end"
            minWidth={200}
            items={[
              {
                id: 'refund',
                label: 'Refund deposit',
                icon: <RotateCcw size={15} />,
                onSelect: onRefund,
                disabled: total <= 0,
              },
              {
                id: 'transfer',
                label: 'Transfer to credit',
                icon: <Wallet size={15} />,
                onSelect: onTransferToCredit,
                disabled: total <= 0,
              },
              {
                id: 'excel',
                label: 'Download Excel',
                icon: <ArrowDownToLine size={15} />,
                onSelect: onDownloadExcel,
                disabled: deposits.length === 0,
              },
            ]}
            trigger={({ buttonProps }) => (
              <button
                type="button"
                className="bill-icon-btn"
                aria-label="More deposit actions"
                {...buttonProps}
              >
                <MoreVertical size={18} />
              </button>
            )}
          />
        </div>
      </div>

      <div className="cm-table-wrap bill-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>
                Amount <SortHint />
              </th>
              <th>Payment Mode</th>
              <th>Issued Against</th>
              <th>Recorded By</th>
              <th>Description</th>
              <th className="bill-row-actions" />
            </tr>
          </thead>
          <tbody>
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={7} className="bill-td-empty">
                  No Deposit History Found
                </td>
              </tr>
            ) : (
              pageItems.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <strong>{d.transaction}</strong>
                    <em className="bill-sub">{formatBillingDate(d.date)}</em>
                  </td>
                  <td>
                    <strong>{formatInrShort(d.amount)}</strong>
                    <em className="bill-sub">{d.ref}</em>
                  </td>
                  <td>{d.paymentMode || '—'}</td>
                  <td>{d.issuedAgainst}</td>
                  <td>
                    {d.recordedBy}
                    {d.approvedBy ? (
                      <em className="bill-sub">Approved by: {d.approvedBy}</em>
                    ) : null}
                  </td>
                  <td>{d.description || '—'}</td>
                  <td>
                    <AppMenu
                      align="end"
                      minWidth={180}
                      items={[
                        {
                          id: 'receipt',
                          label: 'View Receipt',
                          icon: <FileText size={15} />,
                          onSelect: () => onViewReceipt(d),
                        },
                        {
                          id: 'delete',
                          label: 'Delete',
                          icon: <Trash2 size={15} />,
                          danger: true,
                          onSelect: () => onDelete(d),
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button
                          type="button"
                          className="bill-icon-btn"
                          aria-label="Row actions"
                          {...buttonProps}
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={rowTotal}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}

function FeePlanPanel({
  studentId,
  plans,
}: {
  studentId: string;
  plans: NonNullable<StudentBilling['feePlans']>;
}) {
  const router = useRouter();

  if (!plans.length) {
    return (
      <div className="bill-empty-hero">
        <Wallet size={28} strokeWidth={1.5} />
        <p>No fee plan assigned to student</p>
      </div>
    );
  }

  const openPlan = (planId: string) => {
    const qs = new URLSearchParams({
      from: 'student',
      studentId,
      billing: 'fee-plan',
    });
    router.push(`/billing-accounting/fee-plan/${encodeURIComponent(planId)}?${qs}`);
  };

  return (
    <div className="bill-fee-list">
      {plans.map((plan, i) => (
        <motion.button
          key={plan.id}
          type="button"
          className="bill-fee-card is-clickable"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.38, ease }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => openPlan(plan.id)}
          aria-label={`Open ${plan.name} fee plan details`}
        >
          <span className="bill-fee-glow" aria-hidden />
          <span className="bill-fee-glow bill-fee-glow--soft" aria-hidden />
          <div className="bill-fee-head">
            <span className="bill-fee-ico">
              <Wallet size={20} />
            </span>
            <div className="bill-fee-titles">
              <strong>{plan.name}</strong>
              <em>{plan.frequency} billing cycle</em>
            </div>
            <span
              className={`bill-status-pill is-${
                plan.status === 'Active'
                  ? 'paid'
                  : plan.status === 'Completed'
                    ? 'completed'
                    : plan.status === 'Paused'
                      ? 'due'
                      : 'draft'
              }`}
            >
              {plan.status}
            </span>
          </div>
          <div className="bill-fee-grid">
            <div>
              <span>Amount</span>
              <strong>
                {`₹ ${plan.amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              </strong>
            </div>
            <div>
              <span>Frequency</span>
              <strong>{plan.frequency}</strong>
            </div>
            <div>
              <span>Start Date</span>
              <strong>{formatBillingDateLong(plan.startDate)}</strong>
            </div>
            <div>
              <span>End Date</span>
              <strong>{plan.endDate ? formatBillingDateLong(plan.endDate) : 'Ongoing'}</strong>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

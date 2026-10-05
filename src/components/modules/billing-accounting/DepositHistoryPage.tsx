'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  FileText,
  PiggyBank,
  Receipt,
  Search,
} from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { DepositReceiptPreview } from './DepositReceiptPreview';
import {
  depositAmountAdded,
  depositAmountUsed,
  ensureCompactCreditDemo,
  extractIssuedDocRef,
  formatBillingDate,
  formatInrShort,
  loadStudentBilling,
  type DepositEntry,
} from '@/lib/center-management/billingStore';
import { loadStudents } from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';
import { findCenterInvoiceForStudent } from '@/lib/billing-accounting/invoiceStore';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import './student-balances.css';
import './credit-history.css';

type HistoryRow = {
  student: Student;
  deposit: DepositEntry;
};

type SortKey = 'date' | 'student' | 'added' | 'used';
type SortDir = 'asc' | 'desc';

const ease = [0.22, 1, 0.36, 1] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function avatarTone(name: string) {
  const tones = [
    'linear-gradient(145deg, #6366f1, #4f46e5)',
    'linear-gradient(145deg, #059669, #047857)',
    'linear-gradient(145deg, #e11d48, #be123c)',
    'linear-gradient(145deg, #0284c7, #0369a1)',
    'linear-gradient(145deg, #d97706, #b45309)',
    'linear-gradient(145deg, #7c3aed, #6d28d9)',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % tones.length;
  return tones[h];
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const v = String(cell ?? '');
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function resolveBackHref(from: string | null) {
  if (from === 'balances' || from === 'deposit' || !from) {
    return '/billing-accounting/student-balances?tab=deposit';
  }
  if (from.startsWith('/')) return from;
  return '/billing-accounting/student-balances?tab=deposit';
}

export function DepositHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const backHref = resolveBackHref(from);

  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<HistoryRow | null>(null);

  useEffect(() => {
    ensureCompactCreditDemo();
    setTick((n) => n + 1);
    const onFocus = () => setTick((n) => n + 1);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const rows = useMemo<HistoryRow[]>(() => {
    void tick;
    const students = loadStudents();
    const out: HistoryRow[] = [];
    for (const student of students) {
      const deposits = loadStudentBilling(student.id).deposits;
      for (const deposit of deposits) out.push({ student, deposit });
    }
    return out;
  }, [tick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ student, deposit }) => {
      const hay = [
        student.name,
        student.admissionNumber,
        deposit.transaction,
        deposit.description,
        deposit.issuedAgainst,
        deposit.recordedBy,
        deposit.approvedBy,
        deposit.ref,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'student') return a.student.name.localeCompare(b.student.name) * dir;
      if (sortKey === 'added') {
        return (depositAmountAdded(a.deposit) - depositAmountAdded(b.deposit)) * dir;
      }
      if (sortKey === 'used') {
        return (depositAmountUsed(a.deposit) - depositAmountUsed(b.deposit)) * dir;
      }
      return (new Date(a.deposit.date).getTime() - new Date(b.deposit.date).getTime()) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'student' ? 'asc' : 'desc');
    }
  };

  const invoiceLinkFor = (student: Student, deposit: DepositEntry) => {
    const blob = `${deposit.issuedAgainst} ${deposit.description ?? ''} ${deposit.transaction}`;
    const ref = extractIssuedDocRef(blob);
    if (!ref || ref.kind !== 'invoice') return null;
    const match = findCenterInvoiceForStudent(ref.id, student);
    if (!match) return null;
    return { label: match.invoiceId, invoice: match };
  };

  const downloadExcel = () => {
    const data = sorted.map(({ student, deposit }) => [
      student.name,
      student.admissionNumber || student.id,
      formatBillingDate(deposit.date),
      deposit.transaction,
      deposit.description || '',
      deposit.issuedAgainst,
      String(depositAmountAdded(deposit)),
      String(depositAmountUsed(deposit)),
      deposit.recordedBy,
      deposit.approvedBy || '',
      deposit.ref,
    ]);
    downloadCsv('deposit-history.csv', [
      [
        'Student',
        'Admission No',
        'Date',
        'Transaction',
        'Description',
        'Issued Against',
        'Amount Added',
        'Amount Used',
        'Recorded By',
        'Approved By',
        'Reference',
      ],
      ...data,
    ]);
    setToast('Excel download started');
  };

  const toastNode =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {toast ? (
              <motion.div
                className="sb-toast"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22, ease }}
                role="status"
              >
                <span className="sb-toast-ico" aria-hidden>
                  <CheckCircle2 size={18} />
                </span>
                {toast}
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div className="bi-root ch-root">
      {toastNode}

      <BillingAccountingPageHeader
        title="Deposit History"
        description="Every deposit issued, used, refunded, or moved to credit — with notes and invoice links."
        icon={<PiggyBank size={20} />}
      />

      <div className="ch-back-row">
        <button
          type="button"
          className="ui-btn ui-btn-outline ch-back-btn"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft size={16} />
          Go back
        </button>
        <button type="button" className="ui-btn ui-btn-outline ch-excel" onClick={downloadExcel}>
          <ArrowDownToLine size={15} />
          Download Excel
        </button>
      </div>

      <motion.div
        className="ch-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <div className="ch-toolbar">
          <div className="ch-search">
            <Search size={16} aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search student, transaction, invoice…"
              aria-label="Search deposit history"
            />
            {search ? (
              <button
                type="button"
                className="ch-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
          </div>
          <span className="ch-count">{sorted.length} record{sorted.length === 1 ? '' : 's'}</span>
        </div>

        {pageRows.length === 0 ? (
          <div className="ch-empty">
            <div className="ch-empty-art" aria-hidden>
              <Receipt size={28} />
            </div>
            <h3>No deposit history yet</h3>
            <p>Add a deposit from Student Balances to see ledger activity here.</p>
          </div>
        ) : (
          <div className="ch-table-wrap">
            <table className="ui-table ch-table">
              <thead>
                <tr>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`ch-sort${sortKey === 'student' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('student')}
                      >
                        Student
                        <span aria-hidden>
                          {sortKey === 'student' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>Transaction</th>
                  <th style={{ textAlign: 'center' }}>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`ch-sort is-center${sortKey === 'added' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('added')}
                      >
                        Amount Added
                        <span aria-hidden>
                          {sortKey === 'added' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th style={{ textAlign: 'center' }}>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`ch-sort is-center${sortKey === 'used' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('used')}
                      >
                        Amount Used
                        <span aria-hidden>
                          {sortKey === 'used' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>Recorded By</th>
                  <th>Description</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {pageRows.map(({ student, deposit }, idx) => {
                    const added = depositAmountAdded(deposit);
                    const used = depositAmountUsed(deposit);
                    const invoiceLink = invoiceLinkFor(student, deposit);
                    return (
                      <motion.tr
                        key={deposit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.28), duration: 0.28, ease }}
                      >
                        <td>
                          <div className="ch-student">
                            <span
                              className="ch-avatar"
                              style={{ background: avatarTone(student.name) }}
                              aria-hidden
                            >
                              {initials(student.name)}
                            </span>
                            <span>
                              <strong>{student.name}</strong>
                              <em>{formatBillingDate(deposit.date)}</em>
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong className="ch-desc">{deposit.transaction}</strong>
                          {invoiceLink ? (
                            <button
                              type="button"
                              className="ch-link"
                              onClick={() =>
                                router.push(
                                  `/billing-accounting/invoices/${encodeURIComponent(invoiceLink.invoice.id)}?from=deposit-history`,
                                )
                              }
                            >
                              {invoiceLink.label}
                            </button>
                          ) : (
                            <em className="ch-sub">{deposit.ref}</em>
                          )}
                        </td>
                        <td>
                          <span className={`ch-amt${added > 0 ? ' is-add' : ''}`}>
                            {added > 0 ? formatInrShort(added).replace('₹ ', '') : '0'}
                          </span>
                        </td>
                        <td>
                          <span className={`ch-amt${used > 0 ? ' is-use' : ''}`}>
                            {used > 0 ? formatInrShort(used).replace('₹ ', '') : '0'}
                          </span>
                        </td>
                        <td>
                          <span className="ch-people">
                            Recorded by: {deposit.recordedBy}
                            {deposit.approvedBy ? (
                              <em>Approved by: {deposit.approvedBy}</em>
                            ) : null}
                          </span>
                        </td>
                        <td>
                          <span className="ch-reason">{deposit.description || '—'}</span>
                        </td>
                        <td>
                          <AppTooltip content="View deposit note" side="top">
                            <button
                              type="button"
                              className="ch-receipt-btn"
                              aria-label={`View receipt for ${deposit.ref}`}
                              onClick={() => setReceipt({ student, deposit })}
                            >
                              <FileText size={16} />
                            </button>
                          </AppTooltip>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        <div className="ch-footer cm-pagination">
          <span className="cm-page-info">
            Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length} results
          </span>
          <div className="cm-page-btns">
            <button
              type="button"
              className="cm-page-nav"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cm-page-num${p === safePage ? ' is-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              className="cm-page-nav"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <div className="cm-page-size">
            <AppSelect
              value={String(pageSize)}
              onChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
              options={[
                { label: '5 / page', value: '5' },
                { label: '10 / page', value: '10' },
                { label: '30 / page', value: '30' },
              ]}
              align="end"
            />
          </div>
        </div>
      </motion.div>

      {receipt ? (
        <DepositReceiptPreview
          open
          student={receipt.student}
          deposit={receipt.deposit}
          onClose={() => setReceipt(null)}
        />
      ) : null}
    </div>
  );
}

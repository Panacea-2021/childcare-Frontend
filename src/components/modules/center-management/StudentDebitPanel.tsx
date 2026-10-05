'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ChevronDown,
  MoreVertical,
  Plus,
  Receipt,
} from 'lucide-react';
import { AppMenu, ProfileTablePagination, useClientPagination } from './ui';
import {
  deleteCenterInvoices,
  formatDisplayDate,
  formatInrPlain,
  getStudentReceipts,
  latestPaymentDate,
  loadCenterInvoices,
  syncCenterInvoiceStatuses,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import {
  buildDebitActionItems,
  buildParentDebitActionItems,
  parentEmailsForInvoice,
} from '@/components/modules/billing-accounting/invoiceActionItems';
import { useRouter } from 'next/navigation';
import {
  InvoiceActionToast,
  type InvoiceToastPayload,
} from '@/components/modules/billing-accounting/invoice-detail/InvoiceActionToast';
import { SelectReceiptModal } from '@/components/modules/billing-accounting/invoice-detail/RefundReceiptModals';
import { ReceiptPreviewPage } from '@/components/modules/billing-accounting/invoice-detail/ReceiptPreviewPage';
import { InvoicePreviewPage } from '@/components/modules/billing-accounting/invoice-detail/InvoicePreviewPage';
import { DeleteInvoiceModal } from '@/components/modules/billing-accounting/DeleteInvoiceModal';
import { CreateDebitNotePage } from '@/components/modules/billing-accounting/CreateDebitNotePage';
import { RecordPaymentPage } from '@/components/modules/billing-accounting/invoice-detail/RecordPaymentOverlay';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import type { Student } from '@/lib/center-management/types';

type Props = {
  student: Student;
  variant?: 'admin' | 'parent';
};

type StatusFilter = 'Due' | 'Paid';
type DebitFormState =
  | { mode: 'add' }
  | { mode: 'edit'; id: string }
  | { mode: 'pay'; invoice: CenterInvoice };

const ease = [0.22, 1, 0.36, 1] as const;

function badgeClass(status: CenterInvoice['status']) {
  const map: Record<CenterInvoice['status'], string> = {
    Due: 'is-due',
    Paid: 'is-paid',
    Overdue: 'is-overdue',
    Pending: 'is-pending',
    Upcoming: 'is-pending',
    Draft: 'is-draft',
    Refund: 'is-refund',
    Cancelled: 'is-draft',
  };
  return map[status] ?? 'is-draft';
}

function SortHint() {
  return (
    <span className="bill-sort" aria-hidden>
      <ChevronDown size={12} />
    </span>
  );
}

export function StudentDebitPanel({ student, variant = 'admin' }: Props) {
  const router = useRouter();
  const isParent = variant === 'parent';
  const [rows, setRows] = useState<CenterInvoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Due');
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<InvoiceToastPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CenterInvoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [receiptPickOpen, setReceiptPickOpen] = useState(false);
  const [actionInvoice, setActionInvoice] = useState<CenterInvoice | null>(null);
  const [receiptView, setReceiptView] = useState<{
    invoice: CenterInvoice;
    payment: InvoicePayment;
  } | null>(null);
  const [debitPreview, setDebitPreview] = useState<CenterInvoice | null>(null);
  const [form, setForm] = useState<DebitFormState | null>(null);

  const clearToast = useCallback(() => setToast(null), []);
  const flash = (payload: InvoiceToastPayload) => setToast(payload);

  const refresh = useCallback(() => {
    setRows(syncCenterInvoiceStatuses());
  }, []);

  const closeForm = useCallback(() => {
    setForm(null);
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, [refresh]);

  const studentDebits = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.kind === 'debit' &&
          (r.studentId === student.id ||
            r.studentName.toLowerCase() === student.name.toLowerCase()),
      ),
    [rows, student.id, student.name],
  );

  const filtered = useMemo(() => {
    return studentDebits.filter((r) => {
      if (statusFilter === 'Paid') return r.status === 'Paid' || r.pendingAmount <= 0;
      return r.status !== 'Paid' && r.pendingAmount > 0;
    });
  }, [studentDebits, statusFilter]);

  const dueTotal = useMemo(
    () =>
      studentDebits
        .filter((r) => r.status !== 'Paid' && r.pendingAmount > 0)
        .reduce((sum, r) => sum + r.pendingAmount, 0),
    [studentDebits],
  );

  const { page, setPage, pageSize, setPageSize, total: rowTotal, totalPages, pageItems } =
    useClientPagination(filtered, 30);

  const openReceipts = (invoice: CenterInvoice) => {
    const own = invoice.payments ?? [];
    if (own.length === 1) {
      setReceiptView({ invoice, payment: own[0] });
      return;
    }
    setActionInvoice(invoice);
    setReceiptPickOpen(true);
  };

  const emailDebit = (invoice: CenterInvoice) => {
    const { emails } = parentEmailsForInvoice(invoice);
    if (!emails.length) {
      flash({
        type: 'error',
        title: 'No parent email found',
        detail: 'Add a parent email on the student profile to send this debit.',
      });
      return;
    }
    flash({
      type: 'success',
      title: 'Debit pdf email Sent.',
      detail: `${invoice.invoiceId} sent to parent${emails.length === 1 ? '' : 's'}.`,
      emails,
    });
  };

  const openDebitDetail = (invoice: CenterInvoice) => {
    if (isParent) {
      const q = new URLSearchParams({
        from: 'parent',
        billing: 'debit',
        studentId: student.id,
      });
      router.push(`/parent/profile/invoices/${encodeURIComponent(invoice.id)}?${q.toString()}`);
      return;
    }
    setDebitPreview(invoice);
  };

  const menuFor = (invoice: CenterInvoice) => {
    if (isParent) {
      return buildParentDebitActionItems(invoice, {
        onView: () => openDebitDetail(invoice),
        onViewReceipt: () => openReceipts(invoice),
        onDownloadReceipt: () => openReceipts(invoice),
      });
    }
    return buildDebitActionItems(invoice, {
      onRecordPayment: () => setForm({ mode: 'pay', invoice }),
      onEdit: () => setForm({ mode: 'edit', id: invoice.id }),
      onDelete: () => setDeleteTarget(invoice),
      onView: () => setDebitPreview(invoice),
      onViewReceipt: () => openReceipts(invoice),
      onDownloadReceipt: () => openReceipts(invoice),
      onEmail: () => emailDebit(invoice),
    });
  };

  const allChecked = pageItems.length > 0 && pageItems.every((r) => selected.includes(r.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelected((prev) => prev.filter((id) => !pageItems.some((r) => r.id === id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...pageItems.map((r) => r.id)])]);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    window.setTimeout(() => {
      const next = deleteCenterInvoices([target.id, target.invoiceId]);
      setRows(next);
      setSelected((prev) => prev.filter((id) => id !== target.id));
      setDeleting(false);
      setDeleteTarget(null);
      flash({
        type: 'success',
        title: 'Debit note deleted',
        detail: `${target.invoiceId} was removed.`,
      });
    }, 220);
  };

  const downloadCsv = () => {
    const header = [
      'Debit Id',
      'Date Raised',
      'Due Date',
      'Pending',
      'Raised Against',
      'Total',
      'Payment Date',
      'Status',
    ];
    const lines = filtered.map((r) => {
      const pay = latestPaymentDate(r);
      return [
        r.invoiceId,
        r.invoiceDate,
        r.dueDate,
        String(r.pendingAmount),
        r.raisedAgainst || r.billingPlan || '',
        String(r.invoicedAmount),
        pay || '',
        r.status,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',');
    });
    const blob = new Blob([[header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g, '-')}-debits.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash({ type: 'success', title: 'Excel download started' });
  };

  return (
    <div className="bill-debit">
      <InvoiceActionToast toast={toast} onClose={clearToast} durationMs={3800} />

      {form?.mode === 'pay' ? (
        <RecordPaymentPage
          invoice={form.invoice}
          allowCredit={false}
          backLabel="Back to Student"
          onBack={closeForm}
          onSaved={(next) => {
            setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
            flash({
              type: 'success',
              title: 'Payment recorded',
              detail: `${next.invoiceId} was updated.`,
            });
            closeForm();
          }}
        />
      ) : form ? (
        <Suspense fallback={<div className="bill-td-empty">Loading debit form…</div>}>
          <CreateDebitNotePage
            embedInStudent
            studentId={student.id}
            editId={form.mode === 'edit' ? form.id : undefined}
            onClose={closeForm}
            onSaved={closeForm}
          />
        </Suspense>
      ) : (
        <>
      <div className="bill-debit-bar">
        <div className="bill-debit-left">
          <div className="bill-debit-seg" role="group" aria-label="Debit status">
            {(['Due', 'Paid'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`bill-debit-seg-btn${statusFilter === s ? ' is-active' : ''}`}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="bill-debit-badge">
            Debit <strong>INR {formatInrPlain(dueTotal)}</strong>
          </div>
        </div>

        <div className="bill-debit-actions">
          {!isParent ? (
            <>
              <AppMenu
                align="end"
                minWidth={200}
                items={[
                  {
                    id: 'excel',
                    label: 'Download Excel',
                    icon: <ArrowDownToLine size={15} />,
                    onSelect: downloadCsv,
                  },
                ]}
                trigger={({ buttonProps }) => (
                  <button type="button" className="ui-btn ui-btn-outline bill-debit-actions-btn" {...buttonProps}>
                    Actions <ChevronDown size={15} />
                  </button>
                )}
              />
              <motion.button
                type="button"
                className="ui-btn ui-btn-outline bill-debit-add"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ mode: 'add' })}
              >
                <Plus size={15} /> Add Debit
              </motion.button>
            </>
          ) : null}
        </div>
      </div>

      <div className="cm-table-wrap bill-table-wrap bill-debit-table-wrap">
        <table className="ui-table cm-tab-table bill-debit-table">
          <thead>
            <tr>
              {!isParent ? (
                <th style={{ width: 44 }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Select all on page"
                  />
                </th>
              ) : null}
              <th>
                Debit Id <SortHint />
              </th>
              <th>Date Raised</th>
              <th>
                Due Date <SortHint />
              </th>
              <th>
                Pending <SortHint />
              </th>
              <th>Raised Against</th>
              <th>
                Total <SortHint />
              </th>
              <th>
                Payment Date <SortHint />
              </th>
              <th className="bill-row-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isParent ? 8 : 9} className="bill-td-empty">
                  <div className="bill-cn-empty">
                    <Receipt size={28} strokeWidth={1.5} />
                    <strong>No {statusFilter.toLowerCase()} debit notes</strong>
                    <span>
                      {statusFilter === 'Due'
                        ? isParent
                          ? 'Due debit notes for this student will appear here.'
                          : 'Add a debit note for this student to track amounts due.'
                        : 'Paid debit notes will appear here.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((row, i) => {
                const payDate = latestPaymentDate(row);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.28, ease }}
                    onClick={isParent ? () => openDebitDetail(row) : undefined}
                    style={isParent ? { cursor: 'pointer' } : undefined}
                  >
                    {!isParent ? (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.invoiceId}`}
                        />
                      </td>
                    ) : null}
                    <td>
                      <div className="bi-inv-id">
                        <strong>{row.invoiceId}</strong>
                        <span className={`bi-badge ${badgeClass(row.status)}`}>{row.status}</span>
                      </div>
                    </td>
                    <td>{formatDisplayDate(row.invoiceDate)}</td>
                    <td>{formatDisplayDate(row.dueDate)}</td>
                    <td className="bi-amount">{formatInrPlain(row.pendingAmount)}</td>
                    <td>{row.raisedAgainst || row.billingPlan || '—'}</td>
                    <td className="bi-amount">{formatInrPlain(row.invoicedAmount)}</td>
                    <td>{payDate ? formatDisplayDate(payDate) : ''}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <AppMenu
                        align="end"
                        minWidth={240}
                        items={menuFor(row)}
                        trigger={({ buttonProps }) => (
                          <button
                            type="button"
                            className="bill-icon-btn"
                            aria-label="Debit note actions"
                            {...buttonProps}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      />
                    </td>
                  </motion.tr>
                );
              })
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
      )}

      <DeleteInvoiceModal
        open={Boolean(deleteTarget)}
        invoiceLabel={deleteTarget?.invoiceId || ''}
        studentName={student.name}
        busy={deleting}
        onClose={() => (deleting ? undefined : setDeleteTarget(null))}
        onConfirm={confirmDelete}
      />

      <SelectReceiptModal
        open={receiptPickOpen}
        receipts={
          actionInvoice ? getStudentReceipts(actionInvoice.studentId, actionInvoice.kind) : []
        }
        onClose={() => setReceiptPickOpen(false)}
        onSelect={(inv, payment) => {
          setReceiptPickOpen(false);
          setReceiptView({ invoice: inv, payment });
        }}
      />

      {receiptView
        ? createPortal(
            <div className="bi-receipt-overlay">
              <ReceiptPreviewPage
                invoice={receiptView.invoice}
                payment={receiptView.payment}
                onBack={() => setReceiptView(null)}
              />
            </div>,
            document.body,
          )
        : null}

      {debitPreview
        ? createPortal(
            <div className="bi-receipt-overlay">
              <InvoicePreviewPage
                invoice={debitPreview}
                initialMode="pdf"
                onBack={() => setDebitPreview(null)}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

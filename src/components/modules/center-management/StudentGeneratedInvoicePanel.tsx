'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  MoreVertical,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, ProfileTablePagination, useClientPagination } from './ui';
import {
  deleteCenterInvoices,
  formatDisplayDate,
  formatInr,
  getCenterInvoiceById,
  getStudentReceipts,
  recordFeeReminder,
  recordInvoiceRefund,
  updateCenterInvoice,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import {
  generatedInvoiceBucket,
  generatedPaymentDate,
  listStudentGeneratedInvoices,
  studentGeneratedInvoiceStats,
} from '@/lib/billing-accounting/studentInvoices';
import {
  DATE_RANGE_OPTIONS,
  type DateRangeOption,
  formatInr as formatInrBilling,
  inDateRange,
} from '@/lib/center-management/billingStore';
import {
  buildInvoiceActionItems,
  buildParentInvoiceActionItems,
  parentEmailsForInvoice,
} from '@/components/modules/billing-accounting/invoiceActionItems';
import {
  InvoiceActionToast,
  type InvoiceToastPayload,
} from '@/components/modules/billing-accounting/invoice-detail/InvoiceActionToast';
import {
  RefundInvoiceModal,
  SelectReceiptModal,
} from '@/components/modules/billing-accounting/invoice-detail/RefundReceiptModals';
import { ReceiptPreviewPage } from '@/components/modules/billing-accounting/invoice-detail/ReceiptPreviewPage';
import { InvoicePreviewPage } from '@/components/modules/billing-accounting/invoice-detail/InvoicePreviewPage';
import { DeleteInvoiceModal } from '@/components/modules/billing-accounting/DeleteInvoiceModal';
import {
  DateRangeCalendar,
  formatDateLabel,
} from '@/components/modules/billing-accounting/DateRangeCalendar';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import '@/components/modules/billing-accounting/billing-invoices.css';
import type { Student } from '@/lib/center-management/types';

type Props = {
  student: Student;
  walletRefundTotal?: number;
  /** Parent portal: view-only menus + open student invoice detail on row click. */
  variant?: 'admin' | 'parent';
};

const ease = [0.22, 1, 0.36, 1] as const;
const rangeOptions = DATE_RANGE_OPTIONS.map((r) => ({ value: r, label: r }));

function SortHint() {
  return (
    <span className="bill-sort" aria-hidden>
      <ChevronDown size={12} />
    </span>
  );
}

function statusTone(bucket: 'due' | 'paid') {
  return bucket === 'paid' ? 'is-paid' : 'is-due';
}

function useAnimatedNumber(target: number, duration = 620) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function AnimatedInr({ amount }: { amount: number }) {
  const n = useAnimatedNumber(amount);
  return <>{formatInrBilling(n)}</>;
}

function studentInvoiceHref(id: string, studentId: string, opts?: { pay?: boolean; parent?: boolean }) {
  const q = new URLSearchParams({
    from: opts?.parent ? 'parent' : 'student',
    billing: 'generated',
    studentId,
  });
  if (opts?.pay) q.set('pay', '1');
  if (opts?.parent) {
    return `/parent/profile/invoices/${encodeURIComponent(id)}?${q.toString()}`;
  }
  return `/billing-accounting/invoices/${encodeURIComponent(id)}?${q.toString()}`;
}

function studentCreateHref(mode: 'edit' | 'clone', invoiceId: string, studentId: string) {
  const q = new URLSearchParams({
    [mode]: invoiceId,
    from: 'student',
    billing: 'generated',
    studentId,
  });
  return `/billing-accounting/invoices/create?${q.toString()}`;
}

export function StudentGeneratedInvoicePanel({
  student,
  walletRefundTotal = 0,
  variant = 'admin',
}: Props) {
  const router = useRouter();
  const isParent = variant === 'parent';
  const [tick, setTick] = useState(0);
  const [invoiceStatus, setInvoiceStatus] = useState<'due' | 'paid'>('due');
  const [dateRange, setDateRange] = useState<DateRangeOption>('This Month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [draftCustom, setDraftCustom] = useState({ start: '', end: '' });
  const [customPos, setCustomPos] = useState({ top: 0, left: 0, width: 560 });
  const prevDateRangeRef = useRef<DateRangeOption>('This Month');
  const rangeWrapRef = useRef<HTMLDivElement>(null);
  const customPanelRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<InvoiceToastPayload | null>(null);
  const [actionInvoice, setActionInvoice] = useState<CenterInvoice | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<CenterInvoice | null>(null);
  const [receiptPickOpen, setReceiptPickOpen] = useState(false);
  const [receiptView, setReceiptView] = useState<{
    invoice: CenterInvoice;
    payment: InvoicePayment;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CenterInvoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CenterInvoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refundTarget, setRefundTarget] = useState<CenterInvoice | null>(null);
  const [refundBusy, setRefundBusy] = useState(false);

  const flash = (payload: InvoiceToastPayload) => setToast(payload);
  const clearToast = useCallback(() => setToast(null), []);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const openCustomDate = useCallback(() => {
    setDraftCustom({ start: customFrom, end: customTo });
    setCustomOpen(true);
  }, [customFrom, customTo]);

  const closeCustomPanel = useCallback(() => {
    setCustomOpen(false);
    if (!customFrom || !customTo) {
      const fallback =
        prevDateRangeRef.current === 'Custom Date' ? 'This Month' : prevDateRangeRef.current;
      setDateRange(fallback);
    }
  }, [customFrom, customTo]);

  const onDateRangeChange = (v: string) => {
    if (v === 'Custom Date') {
      if (dateRange !== 'Custom Date') prevDateRangeRef.current = dateRange;
      setDateRange('Custom Date');
      openCustomDate();
      return;
    }
    prevDateRangeRef.current = v as DateRangeOption;
    setDateRange(v as DateRangeOption);
    setCustomOpen(false);
  };

  const customDisplay =
    dateRange === 'Custom Date' && customFrom && customTo
      ? `${formatDateLabel(customFrom)} → ${formatDateLabel(customTo)}`
      : null;

  useLayoutEffect(() => {
    if (!customOpen) return;
    const place = () => {
      const trigger = rangeWrapRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(560, Math.max(420, window.innerWidth - 24));
      let left = rect.right - width;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
      let top = rect.bottom + 8;
      const panelH = customPanelRef.current?.offsetHeight ?? 420;
      if (top + panelH > window.innerHeight - 12) {
        top = Math.max(12, rect.top - panelH - 8);
      }
      setCustomPos({ top, left, width });
    };
    const raf = requestAnimationFrame(() => {
      place();
      requestAnimationFrame(place);
    });
    const timer = window.setTimeout(place, 50);
    const ro = new ResizeObserver(place);
    if (customPanelRef.current) ro.observe(customPanelRef.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [customOpen]);

  useEffect(() => {
    if (!customOpen) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rangeWrapRef.current?.contains(t) || customPanelRef.current?.contains(t)) return;
      closeCustomPanel();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCustomPanel();
    };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [customOpen, closeCustomPanel]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, [refresh, student.id]);

  const all = useMemo(() => {
    void tick;
    return listStudentGeneratedInvoices(student.id, student.name);
  }, [student.id, student.name, tick]);

  const stats = useMemo(() => {
    void tick;
    const s = studentGeneratedInvoiceStats(student.id, student.name);
    return { ...s, refund: s.refund + walletRefundTotal };
  }, [student.id, student.name, tick, walletRefundTotal]);

  const filtered = useMemo(() => {
    return all.filter(
      (inv) =>
        generatedInvoiceBucket(inv) === invoiceStatus &&
        inDateRange(inv.invoiceDate, dateRange, customFrom, customTo),
    );
  }, [all, invoiceStatus, dateRange, customFrom, customTo]);

  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(
      filtered,
      30,
      `${invoiceStatus}|${dateRange}|${customFrom}|${customTo}|${tick}`,
    );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  const openInvoicePreview = (invoice: CenterInvoice) => {
    const fresh = getCenterInvoiceById(invoice.id) || invoice;
    setInvoicePreview(fresh);
  };

  const openReceipts = (invoice: CenterInvoice) => {
    const fresh = getCenterInvoiceById(invoice.id) || invoice;
    const own = fresh.payments ?? [];
    if (own.length === 1) {
      setReceiptView({ invoice: fresh, payment: own[0] });
      return;
    }
    if (own.length > 1) {
      setActionInvoice(fresh);
      setReceiptPickOpen(true);
      return;
    }
    // Fallback: any stored receipt rows for this invoice/student
    const listed = getStudentReceipts(fresh.studentId, 'invoice').filter(
      (r) => r.invoice.id === fresh.id || r.invoice.invoiceId === fresh.invoiceId,
    );
    if (listed.length === 1) {
      setReceiptView(listed[0]);
      return;
    }
    if (listed.length > 1) {
      setActionInvoice(fresh);
      setReceiptPickOpen(true);
      return;
    }
    flash({
      type: 'info',
      title: 'No receipt yet',
      detail: 'Record a payment on this invoice to generate a receipt.',
    });
  };

  const emailInvoice = (invoice: CenterInvoice) => {
    const { emails } = parentEmailsForInvoice(invoice);
    if (!emails.length) {
      flash({
        type: 'info',
        title: 'No parent email',
        detail: 'Add a parent email on the student profile to send invoices.',
      });
      return;
    }
    flash({
      type: 'success',
      title: 'Invoice email Sent.',
      detail: `${invoice.invoiceId} sent to parent${emails.length === 1 ? '' : 's'}.`,
      emails,
    });
  };

  const openStudentDetail = (invoice: CenterInvoice) => {
    router.push(studentInvoiceHref(invoice.id, student.id, { parent: isParent }));
  };

  const menuFor = (invoice: CenterInvoice) => {
    if (isParent) {
      const paid = invoiceStatus === 'paid';
      return buildParentInvoiceActionItems(invoice, {
        onView: () => {
          if (paid) openInvoicePreview(invoice);
          else openStudentDetail(invoice);
        },
        onViewReceipt: () => openReceipts(invoice),
        onDownloadReceipt: () => openReceipts(invoice),
      });
    }
    return buildInvoiceActionItems(invoice, {
      onRecordPayment: () =>
        router.push(studentInvoiceHref(invoice.id, student.id, { pay: true })),
      onEdit: () => router.push(studentCreateHref('edit', invoice.id, student.id)),
      onClone: () => router.push(studentCreateHref('clone', invoice.id, student.id)),
      onDelete: () => setDeleteTarget(invoice),
      onView: () => openInvoicePreview(invoice),
      onViewReceipt: () => openReceipts(invoice),
      onDownloadReceipt: () => openReceipts(invoice),
      onRefreshPdf: () =>
        flash({
          type: 'success',
          title: 'PDF refreshed',
          detail: 'Latest invoice PDF is ready — open View Invoice to download.',
        }),
      onEmail: () => emailInvoice(invoice),
      onRemind: () => {
        recordFeeReminder(invoice.id);
        flash({
          type: 'success',
          title: 'Fee reminder sent',
          detail: `Reminder recorded for ${invoice.invoiceId}.`,
        });
        refresh();
      },
      onCancel: () => setCancelTarget(invoice),
      onRefund: () => setRefundTarget(invoice),
    });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    updateCenterInvoice(cancelTarget.id, {
      status: 'Cancelled',
      pendingAmount: 0,
    });
    flash({
      type: 'success',
      title: 'Invoice cancelled',
      detail: `${cancelTarget.invoiceId} was cancelled.`,
    });
    setCancelTarget(null);
    refresh();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    window.setTimeout(() => {
      deleteCenterInvoices([target.id, target.invoiceId]);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      setDeleting(false);
      setDeleteTarget(null);
      flash({
        type: 'success',
        title: 'Invoice deleted',
        detail: `${target.invoiceId} was removed from Generated Invoice and Billing & Accounting.`,
      });
      refresh();
    }, 220);
  };

  const confirmRefund = (input: {
    amount: number;
    mode: string;
    date: string;
    reference?: string;
    addAsCredit: boolean;
  }) => {
    if (!refundTarget) return;
    setRefundBusy(true);
    window.setTimeout(() => {
      recordInvoiceRefund(refundTarget.id, input);
      setRefundBusy(false);
      setRefundTarget(null);
      flash({
        type: 'success',
        title: 'Refund recorded',
        detail: input.addAsCredit
          ? 'Refund saved and added to student credit balance.'
          : `Refund for ${refundTarget.invoiceId} was recorded.`,
      });
      refresh();
    }, 220);
  };

  const cards = [
    {
      value: formatInrBilling(stats.total),
      label: 'Total Amount',
      tone: 'total',
      icon: <CircleDollarSign size={18} />,
      hint: 'All invoices',
    },
    {
      value: formatInrBilling(stats.dueAmount),
      label: `${stats.dueCount} Due invoices`,
      tone: 'due',
      icon: <Receipt size={18} />,
      hint: 'Awaiting payment',
    },
    {
      value: formatInrBilling(stats.paidAmount),
      label: `${stats.paidCount} Paid invoices`,
      tone: 'paid',
      icon: <Check size={18} />,
      hint: 'Settled',
    },
    {
      value: formatInrBilling(stats.refund),
      label: 'Refund Amount',
      tone: 'refund',
      icon: <RotateCcw size={18} />,
      hint: 'Credits refunded',
    },
  ] as const;

  return (
    <>
      <InvoiceActionToast toast={toast} onClose={clearToast} durationMs={3800} />

      <div className="bill-stats">
        {cards.map((card, i) => (
          <motion.div
            key={card.tone}
            className={`bill-stat bill-stat-${card.tone}`}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.32, ease }}
            whileHover={{ y: -3 }}
          >
            <div className="bill-stat-top">
              <span className="bill-stat-ico">{card.icon}</span>
              <em>{card.hint}</em>
            </div>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="bill-toolbar">
        <div className="bill-seg" role="group" aria-label="Invoice status">
          <button
            type="button"
            className={invoiceStatus === 'due' ? 'is-active' : ''}
            onClick={() => setInvoiceStatus('due')}
          >
            Due
          </button>
          <button
            type="button"
            className={invoiceStatus === 'paid' ? 'is-active' : ''}
            onClick={() => setInvoiceStatus('paid')}
          >
            Paid
          </button>
        </div>

        <div className="bill-range-wrap" ref={rangeWrapRef}>
          <AppSelect
            value={dateRange}
            onChange={onDateRangeChange}
            options={rangeOptions}
            placeholder="This Month"
          />
          {customDisplay ? (
            <button
              type="button"
              className="bill-custom-chip"
              onClick={openCustomDate}
              title="Edit custom date range"
            >
              {customDisplay}
            </button>
          ) : null}
        </div>
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {customOpen ? (
                <motion.div
                  ref={customPanelRef}
                  className="bi-custom-date-panel"
                  style={{ top: customPos.top, left: customPos.left, width: customPos.width }}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease }}
                >
                  <div className="bi-custom-date-head">
                    <div>
                      <strong>Custom date range</strong>
                      <p>Pick a start date, then an end date</p>
                    </div>
                    <button type="button" className="bi-link-btn" onClick={closeCustomPanel}>
                      Close
                    </button>
                  </div>
                  <DateRangeCalendar
                    key={`${customOpen}-${customFrom}-${customTo}`}
                    start={draftCustom.start}
                    end={draftCustom.end}
                    onChange={setDraftCustom}
                    onClear={() => setDraftCustom({ start: '', end: '' })}
                    onDone={() => {
                      if (!draftCustom.start || !draftCustom.end) return;
                      setCustomFrom(draftCustom.start);
                      setCustomTo(draftCustom.end);
                      setDateRange('Custom Date');
                      prevDateRangeRef.current = 'Custom Date';
                      setCustomOpen(false);
                      setPage(1);
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <div className="cm-table-wrap bill-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              {!isParent ? (
                <th className="bill-check-col">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
              ) : null}
              <th>
                Invoice ID <SortHint />
              </th>
              <th>
                Date Raised <SortHint />
              </th>
              <th>
                Due Date <SortHint />
              </th>
              <th>
                Pending <SortHint />
              </th>
              <th>
                Total <SortHint />
              </th>
              <th>
                Payment Date <SortHint />
              </th>
              <th className="bill-row-actions">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isParent ? 7 : 8} className="bill-td-empty">
                  No Data
                </td>
              </tr>
            ) : (
              pageItems.map((inv, i) => {
                const payDate = generatedPaymentDate(inv);
                const bucket = generatedInvoiceBucket(inv);
                return (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={isParent ? 'bill-row-clickable' : undefined}
                    onClick={
                      isParent
                        ? () => {
                            if (bucket === 'due') openStudentDetail(inv);
                          }
                        : undefined
                    }
                    style={isParent && bucket === 'due' ? { cursor: 'pointer' } : undefined}
                  >
                    {!isParent ? (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(inv.id)}
                          onChange={() => toggle(inv.id)}
                          aria-label={`Select ${inv.invoiceId}`}
                        />
                      </td>
                    ) : null}
                    <td>
                      <strong className="bill-id">{inv.invoiceId}</strong>
                      <em className="bill-sub">
                        <span className={`bill-status-pill ${statusTone(bucket)}`}>
                          {bucket === 'paid' ? 'Paid' : 'Due'}
                        </span>
                      </em>
                    </td>
                    <td>{formatDisplayDate(inv.invoiceDate)}</td>
                    <td>{formatDisplayDate(inv.dueDate)}</td>
                    <td>{formatInr(inv.pendingAmount)}</td>
                    <td>{formatInr(inv.invoicedAmount)}</td>
                    <td>{payDate ? formatDisplayDate(payDate) : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <AppMenu
                        align="end"
                        minWidth={240}
                        items={menuFor(inv)}
                        trigger={({ buttonProps }) => (
                          <button
                            type="button"
                            className="bill-icon-btn"
                            aria-label="Invoice actions"
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
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel Invoice"
        onClose={() => setCancelTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setCancelTarget(null)}>
              Keep Invoice
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmCancel}>
              Cancel Invoice
            </button>
          </>
        }
      >
        <p className="bill-hint">
          Cancel {cancelTarget?.invoiceId}? Pending amount will be cleared. This uses the same
          invoice record as Billing &amp; Accounting.
        </p>
      </Modal>

      {refundTarget ? (
        <RefundInvoiceModal
          open={Boolean(refundTarget)}
          busy={refundBusy}
          invoice={refundTarget}
          onClose={() => (refundBusy ? undefined : setRefundTarget(null))}
          onConfirm={confirmRefund}
        />
      ) : null}

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
          actionInvoice
            ? getStudentReceipts(actionInvoice.studentId, 'invoice').filter(
                (r) =>
                  r.invoice.id === actionInvoice.id ||
                  r.invoice.invoiceId === actionInvoice.invoiceId,
              )
            : []
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

      {invoicePreview
        ? createPortal(
            <div className="bi-receipt-overlay">
              <InvoicePreviewPage
                invoice={invoicePreview}
                initialMode="pdf"
                onBack={() => setInvoicePreview(null)}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

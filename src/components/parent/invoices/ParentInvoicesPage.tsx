'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { FileText, Receipt } from 'lucide-react';
import {
  InvoiceActionToast,
  type InvoiceToastPayload,
} from '@/components/modules/billing-accounting/invoice-detail/InvoiceActionToast';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import { useParentStudent } from '../ParentStudentContext';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentPageHeader } from '../shared';
import { ParentInvoiceToolbar } from './ParentInvoiceToolbar';
import { ParentInvoiceSummary } from './ParentInvoiceSummary';
import { ParentInvoiceCard } from './ParentInvoiceCard';
import { ParentInvoiceSkeleton } from './ParentInvoiceSkeleton';
import { ParentInvoiceDetailModal } from './ParentInvoiceDetailModal';
import { ParentInvoicePreviewModal } from './ParentInvoicePreviewModal';
import { ParentReceiptPreviewModal } from './ParentReceiptPreviewModal';
import { ParentInvoiceCommentsModal } from './ParentInvoiceCommentsModal';
import { ParentSelectReceiptModal } from './ParentSelectReceiptModal';
import { ParentPaymentConfirmModal } from './ParentPaymentConfirmModal';
import { ParentPaymentSuccessModal } from './ParentPaymentSuccessModal';
import type {
  InvoiceComment,
  ParentInvoice,
  ParentInvoiceFilter,
  ParentInvoicePayment,
  ParentInvoiceSort,
} from './types';
import {
  computeSummaryStats,
  filterParentInvoices,
  markInvoicePaid,
  resolveParentInvoices,
  sortParentInvoices,
} from './mockData';
import { processParentInvoicePayment } from './payment';
import './parent-invoices.css';

export function ParentInvoicesPage() {
  const { selectedStudent, displayName } = useParentStudent();

  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ParentInvoice[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ParentInvoiceFilter>('all');
  const [sort, setSort] = useState<ParentInvoiceSort>('newest');

  const [detail, setDetail] = useState<ParentInvoice | null>(null);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [receiptPickerOpen, setReceiptPickerOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<ParentInvoicePayment | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [payTarget, setPayTarget] = useState<ParentInvoice | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<ParentInvoice | null>(null);
  const [toast, setToast] = useState<InvoiceToastPayload | null>(null);

  const studentContext = useMemo(
    () => ({
      studentId: selectedStudent?.id,
      studentName: selectedStudent?.name,
      roomName: selectedStudent?.roomName,
      programName: selectedStudent?.programName,
      photoUrl: selectedStudent?.photoUrl,
    }),
    [selectedStudent],
  );

  const load = useCallback(() => {
    setBooting(true);
    setError(null);
    window.setTimeout(() => {
      try {
        const rows = resolveParentInvoices(selectedStudent?.id);
        setInvoices(rows);
        setBooting(false);
      } catch {
        setInvoices([]);
        setError('Unable to load invoices');
        setBooting(false);
      }
    }, 650);
  }, [selectedStudent?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => computeSummaryStats(invoices), [invoices]);

  const detailInvoice = useMemo(() => {
    if (!detail) return null;
    return invoices.find((inv) => inv.id === detail.id) ?? detail;
  }, [detail, invoices]);

  const visible = useMemo(() => {
    const filtered = filterParentInvoices(invoices, filter, search);
    return sortParentInvoices(filtered, sort);
  }, [invoices, filter, search, sort]);

  const filtersActive = Boolean(search.trim()) || filter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setSort('newest');
  };

  const showToast = (next: InvoiceToastPayload) => setToast(next);

  const openPayFlow = (invoice: ParentInvoice) => {
    setPayError(null);
    setInvoicePreviewOpen(false);
    setReceiptPickerOpen(false);
    setReceiptPayment(null);
    setCommentsOpen(false);
    setDetail(null);
    setPayTarget(invoice);
  };

  const handleContinuePayment = async () => {
    if (!payTarget || paying) return;
    setPaying(true);
    setPayError(null);
    try {
      const result = await processParentInvoicePayment(payTarget);
      if (!result.ok) {
        setPayError(result.message ?? 'Payment could not be completed.');
        return;
      }
      const paid = markInvoicePaid(payTarget);
      setInvoices((prev) => prev.map((inv) => (inv.id === paid.id ? paid : inv)));
      setPayTarget(null);
      setSuccessInvoice(paid);
    } catch {
      setPayError('Something went wrong while processing payment.');
    } finally {
      setPaying(false);
    }
  };

  const openInvoicePreview = (invoice: ParentInvoice) => {
    setDetail(invoice);
    setInvoicePreviewOpen(true);
  };

  const openReceiptFlow = (invoice: ParentInvoice) => {
    setDetail(invoice);
    const payments = (invoice.payments ?? []).filter((p) => Boolean(p.receiptId) || p.amount > 0);
    if (payments.length === 0) {
      showToast({
        type: 'error',
        title: 'Unable to load receipt preview. Please try again.',
      });
      return;
    }
    if (payments.length === 1) {
      setReceiptPayment(payments[0]);
      return;
    }
    setReceiptPickerOpen(true);
  };

  const openComments = (invoice: ParentInvoice) => {
    setDetail(invoice);
    setCommentsOpen(true);
  };

  const handleCommentsChange = (invoiceId: string, comments: InvoiceComment[]) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, comments, commentsCount: comments.length }
          : inv,
      ),
    );
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="pi-page">
          <ParentPageHeader
            title="Invoices"
            description="View your child's invoices, payment status and billing history."
            icon={<ParentModuleIcon id="student-invoices" />}
          />

          {booting ? (
            <ParentInvoiceSkeleton />
          ) : error && invoices.length === 0 ? (
            <div className="pi-state pi-state--error" role="alert">
              <span className="pi-state-icon" aria-hidden>
                <FileText size={26} strokeWidth={1.75} />
              </span>
              <h3>Unable to load invoices</h3>
              <p>Something went wrong while loading your invoices.</p>
              <button type="button" className="ui-btn ui-btn-primary" onClick={load}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <ParentInvoiceSummary stats={stats} />

              <ParentInvoiceToolbar
                search={search}
                onSearchChange={setSearch}
                filter={filter}
                onFilterChange={setFilter}
                sort={sort}
                onSortChange={setSort}
                resultCount={visible.length}
              />

              <AnimatePresence mode="wait">
                {visible.length === 0 ? (
                  <m.div
                    key="empty"
                    className="pi-state"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <span className="pi-state-icon" aria-hidden>
                      <Receipt size={26} strokeWidth={1.75} />
                    </span>
                    <h3>No invoices found</h3>
                    <p>Try changing your search or filter.</p>
                    {filtersActive ? (
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    ) : null}
                  </m.div>
                ) : (
                  <m.div
                    key="grid"
                    className="pi-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    {visible.map((inv) => (
                      <ParentInvoiceCard
                        key={inv.id}
                        invoice={inv}
                        onView={setDetail}
                        onPay={openPayFlow}
                      />
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </>
          )}

          <ParentInvoiceDetailModal
            open={Boolean(detailInvoice)}
            invoice={detailInvoice}
            onClose={() => {
              if (invoicePreviewOpen || receiptPayment || receiptPickerOpen || commentsOpen) return;
              setDetail(null);
            }}
            onPay={openPayFlow}
            onViewInvoice={openInvoicePreview}
            onViewReceipt={openReceiptFlow}
            onOpenComments={openComments}
          />

          <ParentInvoicePreviewModal
            open={invoicePreviewOpen && Boolean(detailInvoice)}
            invoice={detailInvoice}
            studentContext={studentContext}
            onClose={() => setInvoicePreviewOpen(false)}
            onError={(message) => showToast({ type: 'error', title: message })}
            onDownloaded={() =>
              showToast({ type: 'success', title: 'Invoice downloaded' })
            }
          />

          <ParentSelectReceiptModal
            open={receiptPickerOpen && Boolean(detailInvoice)}
            invoice={detailInvoice}
            onClose={() => setReceiptPickerOpen(false)}
            onSelect={(payment) => {
              setReceiptPickerOpen(false);
              setReceiptPayment(payment);
            }}
          />

          <ParentReceiptPreviewModal
            open={Boolean(receiptPayment) && Boolean(detailInvoice)}
            invoice={detailInvoice}
            payment={receiptPayment}
            studentContext={studentContext}
            onClose={() => setReceiptPayment(null)}
            onError={(message) => showToast({ type: 'error', title: message })}
            onDownloaded={() =>
              showToast({ type: 'success', title: 'Receipt downloaded' })
            }
          />

          <ParentInvoiceCommentsModal
            open={commentsOpen && Boolean(detailInvoice)}
            invoice={detailInvoice}
            authorName={displayName}
            onClose={() => setCommentsOpen(false)}
            onCommentsChange={handleCommentsChange}
            onError={(message) => showToast({ type: 'error', title: message })}
            onSuccess={(message) => showToast({ type: 'success', title: message })}
          />

          <ParentPaymentConfirmModal
            open={Boolean(payTarget)}
            invoice={payTarget}
            busy={paying}
            errorMessage={payError}
            onClose={() => {
              if (!paying) {
                setPayTarget(null);
                setPayError(null);
              }
            }}
            onConfirm={handleContinuePayment}
          />
          <ParentPaymentSuccessModal
            open={Boolean(successInvoice)}
            invoice={successInvoice}
            onClose={() => setSuccessInvoice(null)}
          />

          <InvoiceActionToast toast={toast} onClose={() => setToast(null)} />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

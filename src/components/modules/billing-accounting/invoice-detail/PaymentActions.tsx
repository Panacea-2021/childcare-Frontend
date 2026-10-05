'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, CreditCard, Download, MoreHorizontal, Receipt } from 'lucide-react';
import { AppMenu } from '@/components/modules/center-management/ui';
import {
  getStudentReceipts,
  isInvoicePaidLike,
  recordFeeReminder,
  recordInvoiceRefund,
  updateCenterInvoice,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import { DeleteInvoiceModal } from '../DeleteInvoiceModal';
import {
  buildInvoiceActionItems,
  buildParentInvoiceActionItems,
  parentEmailsForInvoice,
} from '../invoiceActionItems';
import { CancelInvoiceModal, FeeReminderConfirmModal } from './InvoiceActionModals';
import { InvoiceActionToast, type InvoiceToastPayload } from './InvoiceActionToast';
import { RefundInvoiceModal, SelectReceiptModal } from './RefundReceiptModals';

type NavContext = {
  from?: string;
  billing?: string;
  studentId?: string;
};

type Props = {
  invoice: CenterInvoice;
  /** Preserve entry-point query when navigating to Edit / Clone. */
  navContext?: NavContext;
  /** Parent portal: download / view only. */
  readOnly?: boolean;
  onRecordPayment?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onViewInvoice?: () => void;
  onInvoiceChange?: (next: CenterInvoice) => void;
  onOpenReceipt?: (invoice: CenterInvoice, payment: InvoicePayment) => void;
};

function withNavQuery(base: string, nav?: NavContext) {
  const q = new URLSearchParams();
  if (nav?.from) q.set('from', nav.from);
  if (nav?.billing) q.set('billing', nav.billing);
  if (nav?.studentId) q.set('studentId', nav.studentId);
  const qs = q.toString();
  return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
}

export function PaymentActions({
  invoice,
  navContext,
  readOnly = false,
  onRecordPayment,
  onDownload,
  onDelete,
  onViewInvoice,
  onInvoiceChange,
  onOpenReceipt,
}: Props) {
  const router = useRouter();
  const paid = isInvoicePaidLike(invoice);
  const isDebit = invoice.kind === 'debit';
  const [toast, setToast] = useState<InvoiceToastPayload | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [receiptPickOpen, setReceiptPickOpen] = useState(false);

  const clearToast = useCallback(() => setToast(null), []);
  const flash = (payload: InvoiceToastPayload) => setToast(payload);

  const receipts = useMemo(
    () => getStudentReceipts(invoice.studentId, isDebit ? 'debit' : undefined),
    [invoice.studentId, invoice.payments, invoice.id, isDebit],
  );

  const goEdit = () => {
    if (isDebit) {
      router.push(
        withNavQuery(
          `/billing-accounting/invoices/debit/create?edit=${encodeURIComponent(invoice.id)}`,
          navContext,
        ),
      );
      return;
    }
    router.push(
      withNavQuery(
        `/billing-accounting/invoices/create?edit=${encodeURIComponent(invoice.id)}`,
        navContext,
      ),
    );
  };

  const goClone = () => {
    router.push(
      withNavQuery(
        `/billing-accounting/invoices/create?clone=${encodeURIComponent(invoice.id)}`,
        navContext,
      ),
    );
  };

  const confirmDelete = () => {
    setDeleting(true);
    window.setTimeout(() => {
      onDelete?.();
      setDeleting(false);
      setDeleteOpen(false);
    }, 180);
  };

  const emailInvoice = () => {
    const { emails } = parentEmailsForInvoice(invoice);
    if (!emails.length) {
      flash({
        type: 'error',
        title: 'No parent email found',
        detail: 'Add a parent email on the student profile to send this invoice.',
      });
      return;
    }
    flash({
      type: 'success',
      title: isDebit ? 'Debit emailed successfully' : 'Invoice emailed successfully',
      detail: `Sent ${invoice.invoiceId} to ${emails.length} parent${emails.length === 1 ? '' : 's'}.`,
      emails,
    });
  };

  const confirmFeeReminder = () => {
    setReminding(true);
    const { emails } = parentEmailsForInvoice(invoice);
    window.setTimeout(() => {
      const next = recordFeeReminder(invoice.id);
      setReminding(false);
      setRemindOpen(false);
      if (next) onInvoiceChange?.(next);
      if (!emails.length) {
        flash({
          type: 'info',
          title: 'Fee reminder queued',
          detail: 'No parent email on file — reminder recorded for follow-up.',
        });
        return;
      }
      flash({
        type: 'success',
        title: 'Fee reminder sent',
        detail: 'Parents were notified about the outstanding balance.',
        emails,
      });
    }, 320);
  };

  const confirmCancel = (note: string) => {
    setCancelling(true);
    const next = updateCenterInvoice(invoice.id, {
      status: 'Cancelled',
      cancelNote: note,
      cancelledAt: new Date().toISOString(),
      pendingAmount: 0,
    });
    window.setTimeout(() => {
      setCancelling(false);
      setCancelOpen(false);
      if (next) onInvoiceChange?.(next);
      flash({
        type: 'success',
        title: 'Invoice cancelled',
        detail: `${invoice.invoiceId} was cancelled with your note saved.`,
      });
    }, 220);
  };

  const confirmRefund = (input: {
    amount: number;
    mode: string;
    date: string;
    reference?: string;
    addAsCredit: boolean;
  }) => {
    setRefunding(true);
    window.setTimeout(() => {
      const next = recordInvoiceRefund(invoice.id, input);
      setRefunding(false);
      setRefundOpen(false);
      if (next) onInvoiceChange?.(next);
      flash({
        type: 'success',
        title: 'Refund recorded',
        detail: input.addAsCredit
          ? 'Refund saved and added to student credit balance.'
          : `Refund of ${invoice.invoiceId} was recorded.`,
      });
    }, 280);
  };

  const openReceipts = () => setReceiptPickOpen(true);

  const menuItems = readOnly
    ? buildParentInvoiceActionItems(invoice, {
        onView: () => onViewInvoice?.() ?? onDownload?.(),
        onViewReceipt: openReceipts,
        onDownloadReceipt: openReceipts,
      })
    : buildInvoiceActionItems(invoice, {
        onRecordPayment: () => onRecordPayment?.(),
        onEdit: goEdit,
        onDelete: () => setDeleteOpen(true),
        onClone: goClone,
        onView: () => onViewInvoice?.() ?? onDownload?.(),
        onViewReceipt: openReceipts,
        onDownloadReceipt: openReceipts,
        onRefreshPdf: () =>
          flash({
            type: 'success',
            title: 'PDF refreshed',
            detail: 'Latest invoice PDF is ready to download.',
          }),
        onEmail: emailInvoice,
        onRemind: () => setRemindOpen(true),
        onCancel: () => setCancelOpen(true),
        onRefund: () => setRefundOpen(true),
      });

  return (
    <div className="ivd-actions">
      {!readOnly && !paid ? (
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline ivd-action-btn"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRecordPayment?.()}
        >
          <CreditCard size={16} />
          Record Payment
        </motion.button>
      ) : null}
      {paid ? (
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline ivd-action-btn"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={openReceipts}
          disabled={!receipts.length}
        >
          <Receipt size={16} />
          {readOnly ? 'View Receipt' : 'Download Receipt'}
        </motion.button>
      ) : null}
      <motion.button
        type="button"
        className="ui-btn ui-btn-outline ivd-action-btn"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onDownload?.()}
      >
        <Download size={16} />
        {isDebit ? 'Download Debit' : 'Download Invoice'}
      </motion.button>
      <AppMenu
        align="end"
        minWidth={260}
        items={menuItems}
        trigger={({ open, buttonProps }) => (
          <button
            type="button"
            className={`ui-btn ui-btn-primary ivd-action-btn${open ? ' is-open' : ''}`}
            {...buttonProps}
          >
            <MoreHorizontal size={16} />
            Actions
            <ChevronDown size={14} className={open ? 'ivd-chevron-up' : ''} />
          </button>
        )}
      />
      <InvoiceActionToast toast={toast} onClose={clearToast} />

      {!readOnly ? (
        <>
          <DeleteInvoiceModal
            open={deleteOpen}
            invoiceLabel={invoice.invoiceId}
            studentName={invoice.studentName}
            busy={deleting}
            onClose={() => (deleting ? undefined : setDeleteOpen(false))}
            onConfirm={confirmDelete}
          />
          <FeeReminderConfirmModal
            open={remindOpen}
            busy={reminding}
            onClose={() => (reminding ? undefined : setRemindOpen(false))}
            onConfirm={confirmFeeReminder}
          />
          <CancelInvoiceModal
            open={cancelOpen}
            busy={cancelling}
            invoiceLabel={invoice.invoiceId}
            onClose={() => (cancelling ? undefined : setCancelOpen(false))}
            onConfirm={confirmCancel}
          />
          <RefundInvoiceModal
            open={refundOpen}
            busy={refunding}
            invoice={invoice}
            onClose={() => (refunding ? undefined : setRefundOpen(false))}
            onConfirm={confirmRefund}
          />
        </>
      ) : null}
      <SelectReceiptModal
        open={receiptPickOpen}
        receipts={receipts}
        onClose={() => setReceiptPickOpen(false)}
        onSelect={(inv, payment) => {
          setReceiptPickOpen(false);
          onOpenReceipt?.(inv, payment);
        }}
      />
    </div>
  );
}

export function GradientButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      className={`ui-btn ui-btn-primary ivd-gradient-btn ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import {
  deleteCenterInvoices,
  getCenterInvoiceById,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import { StudentProfileCard } from './StudentProfileCard';
import { InvoiceSummary } from './InvoiceSummary';
import { ChargesTable } from './ChargesTable';
import { CommentDrawer } from './CommentDrawer';
import { NotesSection } from './NotesSection';
import { FeeReminderHistory } from './FeeReminderHistory';
import { PaymentActions } from './PaymentActions';
import { RecordPaymentPage } from './RecordPaymentOverlay';
import { InvoicePreviewPage } from './InvoicePreviewPage';
import { ReceiptPreviewPage } from './ReceiptPreviewPage';
import { pageEnter } from './animations';
import '@/components/modules/center-management/students.css';
import './invoice-detail.css';

function Skeleton() {
  return (
    <div className="ivd-skel" aria-hidden>
      <div className="ivd-skel-row">
        <div className="ivd-skel-avatar shimmer" />
        <div className="ivd-skel-lines">
          <span className="shimmer" />
          <span className="shimmer" />
        </div>
        <div className="ivd-skel-actions">
          <span className="shimmer" />
          <span className="shimmer" />
          <span className="shimmer" />
        </div>
      </div>
      <div className="ivd-skel-card shimmer" />
      <div className="ivd-skel-card shimmer" />
      <div className="ivd-skel-card shimmer" />
    </div>
  );
}

function backTarget(
  from: string | null,
  kind: CenterInvoice['kind'],
  studentId?: string,
  billingTab?: string | null,
) {
  if (from === 'parent' && studentId) {
    const billing =
      billingTab === 'debit' || billingTab === 'generated' ? billingTab : kind === 'debit' ? 'debit' : 'generated';
    return {
      href: `/parent/profile?tab=Billing&billing=${billing}`,
      label: kind === 'debit' ? 'View Debit' : 'View Invoice',
    };
  }
  if (from === 'student' && studentId) {
    const billing =
      billingTab === 'debit' || billingTab === 'generated' ? billingTab : kind === 'debit' ? 'debit' : 'generated';
    return {
      href: `/center-management/students/${encodeURIComponent(studentId)}?tab=Billing&billing=${billing}`,
      label: 'Back to Student',
    };
  }
  if (from === 'payments') {
    return { href: '/billing-accounting/payments', label: 'Back to Payments' };
  }
  if (from === 'credit-history') {
    return {
      href: '/billing-accounting/student-balances/credit-history?from=credit',
      label: 'Back to Credit History',
    };
  }
  if (from === 'deposit-history') {
    return {
      href: '/billing-accounting/student-balances/deposit-history?from=deposit',
      label: 'Back to Deposit History',
    };
  }
  if (from === 'balances' || from === 'balances-credit') {
    return {
      href: '/billing-accounting/student-balances?tab=credit',
      label: 'Back to Student Balances',
    };
  }
  if (from === 'balances-deposit') {
    return {
      href: '/billing-accounting/student-balances?tab=deposit',
      label: 'Back to Student Balances',
    };
  }
  if (from === 'debit' || kind === 'debit') {
    return { href: '/billing-accounting/invoices?tab=debit', label: 'View Debit' };
  }
  return { href: '/billing-accounting/invoices', label: 'View Invoice' };
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const isParentView = from === 'parent';
  const billingTab = searchParams.get('billing');
  const studentIdParam = searchParams.get('studentId')?.trim() || '';
  const openPay = searchParams.get('pay') === '1' && !isParentView;
  const openPreviewParam = searchParams.get('view') === 'preview';
  const payBootstrapped = useRef(false);
  const [invoice, setInvoice] = useState<CenterInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [receiptView, setReceiptView] = useState<{
    invoice: CenterInvoice;
    payment: InvoicePayment;
  } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      const row = getCenterInvoiceById(invoiceId);
      setInvoice(row);
      setMissing(!row);
      setLoading(false);
    }, 420);
    return () => window.clearTimeout(t);
  }, [invoiceId]);

  useEffect(() => {
    payBootstrapped.current = false;
    setPaymentOpen(false);
    setPreviewOpen(openPreviewParam);
    setReceiptView(null);
  }, [invoiceId, openPreviewParam]);

  useEffect(() => {
    if (!loading && invoice && openPay && !payBootstrapped.current) {
      payBootstrapped.current = true;
      setPaymentOpen(true);
    }
  }, [loading, invoice, openPay]);

  useEffect(() => {
    if (!loading && invoice && openPreviewParam) {
      setPreviewOpen(true);
    }
  }, [loading, invoice, openPreviewParam]);

  const resolvedStudentId = studentIdParam || invoice?.studentId || '';

  const listBack = useMemo(
    () => backTarget(from, invoice?.kind ?? 'invoice', resolvedStudentId || undefined, billingTab),
    [from, invoice?.kind, resolvedStudentId, billingTab],
  );

  const navContext = useMemo(
    () => ({
      from: from || undefined,
      billing: billingTab || undefined,
      studentId: resolvedStudentId || undefined,
    }),
    [from, billingTab, resolvedStudentId],
  );

  const remove = () => {
    if (!invoice) return;
    deleteCenterInvoices([invoice.id]);
    router.push(listBack.href);
  };

  /** Record Payment opened directly from a list (pay=1) returns to that list, not invoice shell. */
  const paymentBack = () => {
    if (openPay) {
      router.push(listBack.href);
      return;
    }
    setPaymentOpen(false);
  };

  return (
    <div className="ivd-root">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skel" {...pageEnter} className="ivd-shell">
            <Skeleton />
          </motion.div>
        ) : missing || !invoice ? (
          <motion.div key="missing" {...pageEnter} className="ivd-shell ivd-missing">
            <h1>Invoice not found</h1>
            <p>This invoice may have been deleted or the link is invalid.</p>
            <Link href={listBack.href} className="ui-btn ui-btn-primary">
              {listBack.label === 'View Invoice' || listBack.label === 'View Debit'
                ? 'Back to invoices'
                : listBack.label}
            </Link>
          </motion.div>
        ) : paymentOpen ? (
          <RecordPaymentPage
            key={`pay-${invoice.id}`}
            invoice={invoice}
            onBack={paymentBack}
            onSaved={setInvoice}
            allowCredit={invoice.kind !== 'debit'}
            backLabel={openPay ? listBack.label : 'Back to invoice'}
          />
        ) : receiptView ? (
          <ReceiptPreviewPage
            key={`rec-${receiptView.payment.id}`}
            invoice={receiptView.invoice}
            payment={receiptView.payment}
            onBack={() => setReceiptView(null)}
          />
        ) : previewOpen ? (
          <InvoicePreviewPage
            key={`doc-${invoice.id}`}
            invoice={invoice}
            onBack={() => {
              if (openPreviewParam) {
                router.push(listBack.href);
                return;
              }
              setPreviewOpen(false);
            }}
          />
        ) : (
          <motion.div key={`inv-${invoice.id}`} {...pageEnter} className="ivd-shell">
            <div className="ivd-topbar">
              <Link href={listBack.href} className="ivd-back">
                <ArrowLeft size={16} />
                {listBack.label}
              </Link>
              <PaymentActions
                invoice={invoice}
                navContext={navContext}
                readOnly={isParentView}
                onDelete={isParentView ? undefined : remove}
                onRecordPayment={isParentView ? undefined : () => setPaymentOpen(true)}
                onDownload={() => setPreviewOpen(true)}
                onViewInvoice={() => setPreviewOpen(true)}
                onInvoiceChange={setInvoice}
                onOpenReceipt={(inv, payment) => setReceiptView({ invoice: inv, payment })}
              />
            </div>

            <div className="ivd-main">
              <div className="ivd-hero">
                <StudentProfileCard invoice={invoice} />
                <InvoiceSummary invoice={invoice} />
              </div>
              <ChargesTable invoice={invoice} />

              <button
                type="button"
                className="ivd-comments-launch"
                onClick={() => setCommentsOpen(true)}
              >
                <MessageCircle size={18} />
                <span>
                  {(invoice.comments ?? []).length} Comment
                  {(invoice.comments ?? []).length === 1 ? '' : 's'}
                </span>
              </button>

              {invoice.kind !== 'debit' && !isParentView ? <FeeReminderHistory invoice={invoice} /> : null}
              <NotesSection invoice={invoice} onChange={setInvoice} readOnly={isParentView} />
            </div>

            <div className="ivd-mobile-bar">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => setCommentsOpen(true)}
              >
                <MessageCircle size={16} />
                Comments
              </button>
              <PaymentActions
                invoice={invoice}
                navContext={navContext}
                readOnly={isParentView}
                onDelete={isParentView ? undefined : remove}
                onRecordPayment={isParentView ? undefined : () => setPaymentOpen(true)}
                onDownload={() => setPreviewOpen(true)}
                onViewInvoice={() => setPreviewOpen(true)}
                onInvoiceChange={setInvoice}
                onOpenReceipt={(inv, payment) => setReceiptView({ invoice: inv, payment })}
              />
            </div>

            <CommentDrawer
              open={commentsOpen}
              onClose={() => setCommentsOpen(false)}
              invoice={invoice}
              onChange={setInvoice}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Alias requested in the product brief. */
export function StudentHeader(props: { invoice: CenterInvoice }) {
  return <StudentProfileCard {...props} />;
}

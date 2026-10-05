'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  MoreHorizontal,
  Plus,
  Receipt,
  RefreshCcw,
  Search,
  Settings2,
  Trash2,
  Wallet,
} from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { TableSkeleton } from '@/components/ui/loading';
import { AppMenu, AppSelect } from '@/components/modules/center-management/ui';
import { BiFilterSelect } from './BiFilterSelect';
import { DateRangeCalendar, formatDateLabel } from './DateRangeCalendar';
import { DeleteInvoiceModal } from './DeleteInvoiceModal';
import {
  CancelInvoiceModal,
  FeeReminderConfirmModal,
  BulkFeeReminderModal,
} from './invoice-detail/InvoiceActionModals';
import {
  InvoiceActionToast,
  type InvoiceToastPayload,
} from './invoice-detail/InvoiceActionToast';
import {
  buildInvoiceActionItems,
  parentEmailsForInvoice,
} from './invoiceActionItems';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
/* billing-invoices.css loaded from billing-accounting/layout.tsx — do not re-import here (Turbopack panic). */
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';
import {
  deleteCenterInvoices,
  formatDisplayDate,
  formatInr,
  formatInrPlain,
  getStudentReceipts,
  latestPaymentDate,
  listFeeReminderTargets,
  loadCenterInvoices,
  recordFeeReminder,
  recordInvoiceRefund,
  syncCenterInvoiceStatuses,
  updateCenterInvoice,
  type CenterInvoice,
  type CenterInvoiceStatus,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import { ROOM_OPTIONS, GROUP_OPTIONS } from '@/lib/center-management/studentsStore';
import { ReceiptPreviewPage } from './invoice-detail/ReceiptPreviewPage';
import { RefundInvoiceModal, SelectReceiptModal } from './invoice-detail/RefundReceiptModals';
import { UpcomingInvoicesPanel } from './UpcomingInvoicesPanel';

type ListTab = 'invoices' | 'debit' | 'upcoming';

const TABS: { id: ListTab; label: string }[] = [
  { id: 'invoices', label: 'Invoices' },
  { id: 'debit', label: 'Debit Notes' },
  { id: 'upcoming', label: 'Upcoming Invoices' },
];

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

function badgeClass(status: CenterInvoiceStatus) {
  const map: Record<CenterInvoiceStatus, string> = {
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

function InvoiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M14 3.5V8h4.5M9 12h6M9 15.5h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: ListTab =
    tabParam === 'debit' || tabParam === 'upcoming' ? tabParam : 'invoices';
  const [tab, setTab] = useState<ListTab>(initialTab);
  const [rows, setRows] = useState<CenterInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState(
    initialTab === 'debit' ? 'Creation Date' : 'Invoice date',
  );
  const [timeRange, setTimeRange] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [draftCustom, setDraftCustom] = useState({ start: '', end: '' });
  const [customOpen, setCustomOpen] = useState(false);
  const statusParam = searchParams.get('status');
  const [invoiceStatus, setInvoiceStatus] = useState(
    statusParam === 'Overdue' ||
      statusParam === 'Due' ||
      statusParam === 'Paid' ||
      statusParam === 'Pending' ||
      statusParam === 'Draft' ||
      statusParam === 'Cancelled' ||
      statusParam === 'Refund'
      ? statusParam
      : 'All',
  );
  const [studentStatus, setStudentStatus] = useState('Active');
  const [room, setRoom] = useState('All Room');
  const [group, setGroup] = useState('All Group');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<InvoiceToastPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CenterInvoice | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionInvoice, setActionInvoice] = useState<CenterInvoice | null>(null);
  const [remindOpen, setRemindOpen] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [bulkRemindOpen, setBulkRemindOpen] = useState(false);
  const [bulkRemindMode, setBulkRemindMode] = useState<'overdue' | 'unpaid'>('overdue');
  const [bulkReminding, setBulkReminding] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [receiptPickOpen, setReceiptPickOpen] = useState(false);
  const [receiptView, setReceiptView] = useState<{
    invoice: CenterInvoice;
    payment: InvoicePayment;
  } | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const flash = (payload: InvoiceToastPayload) => setToast(payload);

  const emailInvoice = (invoice: CenterInvoice) => {
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
      title: invoice.kind === 'debit' ? 'Debit pdf email Sent.' : 'Invoice emailed successfully',
      detail: `Sent ${invoice.invoiceId} to ${emails.length} parent${emails.length === 1 ? '' : 's'}.`,
      emails,
    });
  };

  const openRemind = (invoice: CenterInvoice) => {
    setActionInvoice(invoice);
    setRemindOpen(true);
  };

  const openCancel = (invoice: CenterInvoice) => {
    setActionInvoice(invoice);
    setCancelOpen(true);
  };

  const openRefund = (invoice: CenterInvoice) => {
    setActionInvoice(invoice);
    setRefundOpen(true);
  };

  const openReceipts = (invoice: CenterInvoice) => {
    setActionInvoice(invoice);
    setReceiptPickOpen(true);
  };

  const confirmFeeReminder = () => {
    if (!actionInvoice) return;
    setReminding(true);
    const { emails } = parentEmailsForInvoice(actionInvoice);
    window.setTimeout(() => {
      recordFeeReminder(actionInvoice.id);
      setRows(loadCenterInvoices());
      setReminding(false);
      setRemindOpen(false);
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

  const bulkRemindTargets = useMemo(
    () => listFeeReminderTargets(bulkRemindMode, rows),
    [rows, bulkRemindMode],
  );

  const openBulkRemind = (mode: 'overdue' | 'unpaid') => {
    const fresh = syncCenterInvoiceStatuses();
    setRows(fresh);
    setBulkRemindMode(mode);
    setBulkRemindOpen(true);
  };

  const confirmBulkFeeReminder = () => {
    const targets = listFeeReminderTargets(bulkRemindMode);
    if (!targets.length) {
      setBulkRemindOpen(false);
      return;
    }
    setBulkReminding(true);
    window.setTimeout(() => {
      targets.forEach((inv) => recordFeeReminder(inv.id));
      setRows(syncCenterInvoiceStatuses());
      setBulkReminding(false);
      setBulkRemindOpen(false);
      flash({
        type: 'success',
        title: 'Reminder sent',
        detail: `Fee reminders recorded for ${targets.length} invoice${
          targets.length === 1 ? '' : 's'
        }.`,
      });
    }, 420);
  };

  const confirmCancel = (note: string) => {
    if (!actionInvoice) return;
    setCancelling(true);
    updateCenterInvoice(actionInvoice.id, {
      status: 'Cancelled',
      cancelNote: note,
      cancelledAt: new Date().toISOString(),
      pendingAmount: 0,
    });
    window.setTimeout(() => {
      setRows(loadCenterInvoices());
      setCancelling(false);
      setCancelOpen(false);
      flash({
        type: 'success',
        title: 'Invoice cancelled',
        detail: `${actionInvoice.invoiceId} was cancelled with your note saved.`,
      });
      setActionInvoice(null);
    }, 220);
  };

  const confirmRefund = (input: {
    amount: number;
    mode: string;
    date: string;
    reference?: string;
    addAsCredit: boolean;
  }) => {
    if (!actionInvoice) return;
    setRefunding(true);
    window.setTimeout(() => {
      recordInvoiceRefund(actionInvoice.id, input);
      setRows(loadCenterInvoices());
      setRefunding(false);
      setRefundOpen(false);
      flash({
        type: 'success',
        title: 'Refund recorded',
        detail: input.addAsCredit
          ? 'Refund saved and added to student credit balance.'
          : `Refund for ${actionInvoice.invoiceId} was recorded.`,
      });
      setActionInvoice(null);
    }, 280);
  };

  const menuFor = (invoice: CenterInvoice) =>
    buildInvoiceActionItems(invoice, {
      onRecordPayment: () => router.push(`/billing-accounting/invoices/${invoice.id}`),
      onEdit: () =>
        router.push(
          invoice.kind === 'debit'
            ? `/billing-accounting/invoices/debit/create?edit=${encodeURIComponent(invoice.id)}`
            : `/billing-accounting/invoices/create?edit=${encodeURIComponent(invoice.id)}`,
        ),
      onDelete: () => setDeleteTarget(invoice),
      onClone: () =>
        router.push(`/billing-accounting/invoices/create?clone=${encodeURIComponent(invoice.id)}`),
      onView: () =>
        router.push(`/billing-accounting/invoices/${invoice.id}?view=preview`),
      onViewReceipt: () => openReceipts(invoice),
      onDownloadReceipt: () => openReceipts(invoice),
      onRefreshPdf: () =>
        flash({
          type: 'success',
          title: 'PDF refreshed',
          detail: 'Latest document PDF is ready to download.',
        }),
      onEmail: () => emailInvoice(invoice),
      onRemind: () => openRemind(invoice),
      onCancel: () => openCancel(invoice),
      onRefund: () => openRefund(invoice),
    });

  const isDebitTab = tab === 'debit';
  const isUpcomingTab = tab === 'upcoming';
  const createHref = isDebitTab
    ? '/billing-accounting/invoices/debit/create?from=debit'
    : '/billing-accounting/invoices/create?from=invoices';
  const createLabel = isDebitTab ? 'Create Debit Note' : 'Create Invoice';

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsWrapRef = useRef<HTMLDivElement>(null);
  const timeRangeTriggerRef = useRef<HTMLDivElement>(null);
  const customPanelRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 4, width: 0, ready: false });
  const [customPos, setCustomPos] = useState({ top: 0, left: 0, width: 560 });

  useLayoutEffect(() => {
    if (!customOpen) return;

    const place = () => {
      const trigger = timeRangeTriggerRef.current;
      const panel = customPanelRef.current;
      if (!trigger || !panel) return;

      const rect = trigger.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 12;
      const gap = 6;
      const width = Math.min(Math.max(560, rect.width), vw - pad * 2);
      const h = Math.min(panel.offsetHeight || 460, vh - pad * 2);

      // Sit directly under Time Range; shift up only enough to keep Apply visible in the viewport.
      let top = rect.bottom + gap;
      if (top + h > vh - pad) {
        top = Math.max(pad, vh - h - pad);
      }

      let left = rect.left;
      left = Math.min(Math.max(pad, left), vw - width - pad);

      setCustomPos({ top, left, width });
    };

    place();
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
    setRows(syncCenterInvoiceStatuses());
    setLoading(false);
  }, []);

  useEffect(() => {
    const refresh = () => setRows(syncCenterInvoiceStatuses());
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const prevTimeRangeRef = useRef(timeRange);

  const closeCustomPanel = () => {
    setCustomOpen(false);
    if (!customStart || !customEnd) {
      const fallback = prevTimeRangeRef.current === 'Custom Date' ? 'This Month' : prevTimeRangeRef.current;
      setTimeRange(fallback);
    }
  };

  const openCustomDate = () => {
    setDraftCustom({ start: customStart, end: customEnd });
    setCustomOpen(true);
  };

  const onTimeRangeChange = (v: string) => {
    if (v === 'Custom Date') {
      if (timeRange !== 'Custom Date') prevTimeRangeRef.current = timeRange;
      setTimeRange('Custom Date');
      openCustomDate();
      return;
    }
    prevTimeRangeRef.current = v;
    setTimeRange(v);
    setCustomOpen(false);
  };

  const customDisplay =
    timeRange === 'Custom Date' && customStart && customEnd
      ? `${formatDateLabel(customStart)} → ${formatDateLabel(customEnd)}`
      : undefined;

  useEffect(() => {
    if (!customOpen) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (timeRangeTriggerRef.current?.contains(t) || customPanelRef.current?.contains(t)) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close when outside; deps on open + applied range
  }, [customOpen, customStart, customEnd]);

  useLayoutEffect(() => {
    const measure = () => {
      const idx = TABS.findIndex((t) => t.id === tab);
      const el = tabRefs.current[idx];
      const wrap = tabsWrapRef.current;
      if (!el || !wrap) return;
      const wr = wrap.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setPill({ left: er.left - wr.left, width: er.width, ready: er.width > 0 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab]);

  const kind = tab === 'invoices' ? 'invoice' : tab === 'debit' ? 'debit' : 'upcoming';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.kind !== kind) return false;
      if (invoiceStatus !== 'All' && r.status !== invoiceStatus) return false;
      if (timeRange === 'Custom Date' && customStart && customEnd) {
        const field = filterBy === 'Due date' ? r.dueDate : r.invoiceDate;
        if (field < customStart || field > customEnd) return false;
      }
      if (q) {
        const hay = `${r.studentName} ${r.invoiceId} ${r.billingPlan}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, kind, search, invoiceStatus, timeRange, customStart, customEnd, filterBy]);

  const totals = useMemo(() => {
    const list = filtered;
    const invoiced = list.reduce((s, r) => s + r.invoicedAmount, 0);
    const paid = list.reduce((s, r) => s + r.paidAmount, 0);
    const pending = list.reduce((s, r) => s + r.pendingAmount, 0);
    const refund = list.reduce((s, r) => s + (r.totalRefund ?? 0), 0);
    return { invoiced, paid, pending, refund };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allChecked = pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id));

  const toggleAll = () => {
    if (allChecked) setSelected((ids) => ids.filter((id) => !pageRows.some((r) => r.id === id)));
    else setSelected((ids) => [...new Set([...ids, ...pageRows.map((r) => r.id)])]);
  };

  const toggleOne = (id: string) => {
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const removeSelected = () => {
    if (!selected.length) return;
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    setDeleting(true);
    const next = deleteCenterInvoices(selected);
    setRows(next);
    setSelected([]);
    setBulkDeleteOpen(false);
    setDeleting(false);
    flash({
      type: 'success',
      title: 'Invoices deleted',
      detail: 'Selected invoices were removed successfully.',
    });
  };

  const confirmRowDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    deleteCenterInvoices([deleteTarget.id]);
    setRows(loadCenterInvoices());
    setSelected((ids) => ids.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
    flash({
      type: 'success',
      title: 'Invoice deleted',
      detail: `${deleteTarget.invoiceId} was removed successfully.`,
    });
  };

  return (
    <div className="bi-root">
      <InvoiceActionToast toast={toast} onClose={clearToast} />

      <BillingAccountingPageHeader
        title="Invoices"
        description={
          isDebitTab
            ? 'Issue and track debit notes raised against student balances.'
            : isUpcomingTab
              ? 'Preview scheduled invoices before they are generated for families.'
              : 'Track invoiced, paid, and pending amounts across families.'
        }
        icon={<InvoiceIcon />}
        actions={
          <button
            type="button"
            className="bi-settings-btn"
            aria-label="Customize Invoice PDF"
            data-tip="Customize Invoice PDF"
            onClick={() => router.push('/billing-accounting/invoices/customize-pdf')}
          >
            <span className="bi-settings-btn__ring" aria-hidden />
            <span className="bi-settings-btn__glow" aria-hidden />
            <Settings2 className="bi-settings-btn__icon" size={18} strokeWidth={2.1} />
          </button>
        }
      />

      <div className="bi-command-bar" key={`cmd-${tab}`}>
        <div className="bi-command-bar-glow" aria-hidden />
        <div
          className={`bi-tabs${pill.ready ? ' has-pill' : ''}`}
          ref={tabsWrapRef}
          role="tablist"
          aria-label="Invoice views"
        >
          {pill.ready ? (
            <span
              className="bi-tab-pill is-ready"
              style={{ left: pill.left, width: pill.width }}
              aria-hidden
            />
          ) : null}
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`bi-tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => {
                setTab(t.id);
                setPage(1);
                setSelected([]);
                setFilterBy(t.id === 'debit' ? 'Creation Date' : 'Invoice date');
                if (t.id === 'debit') {
                  const debitOk = ['All', 'Due', 'Overdue', 'Paid'];
                  if (!debitOk.includes(invoiceStatus)) setInvoiceStatus('All');
                }
                const url =
                  t.id === 'invoices'
                    ? '/billing-accounting/invoices'
                    : `/billing-accounting/invoices?tab=${t.id}`;
                router.replace(url);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bi-command-bar-meta" aria-live="polite">
          <span className="bi-command-bar-view">
            {isDebitTab ? 'Debit Notes' : tab === 'upcoming' ? 'Upcoming' : 'Invoices'}
          </span>
          <span className="bi-command-bar-dot" aria-hidden>
            ·
          </span>
          <span className="bi-command-bar-count">
            {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bi-command-bar-actions">
          {tab === 'invoices' ? (
            <AppMenu
              align="end"
              minWidth={300}
              items={[
                {
                  id: 'remind-overdue',
                  label: 'Send Reminder For Overdue Invoices',
                  icon: <Bell size={15} />,
                  onSelect: () => openBulkRemind('overdue'),
                },
                {
                  id: 'remind-unpaid',
                  label: 'Send Reminder For All Unpaid Invoices',
                  icon: <Bell size={15} />,
                  onSelect: () => openBulkRemind('unpaid'),
                },
              ]}
              trigger={({ buttonProps }) => (
                <button type="button" className="ui-btn ui-btn-outline bi-toolbar-btn" {...buttonProps}>
                  Actions
                  <ChevronDown size={15} aria-hidden />
                </button>
              )}
            />
          ) : null}
          {!isUpcomingTab ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary bi-toolbar-btn bi-create-cta"
              onClick={() => router.push(createHref)}
            >
              <Plus size={16} aria-hidden /> {createLabel}
            </button>
          ) : null}
        </div>
      </div>

      {isUpcomingTab ? (
        <UpcomingInvoicesPanel rows={rows} />
      ) : (
        <>
      <div className="bi-filters" key={`filters-${tab}`}>
        <BiFilterSelect
          label="Filter By"
          value={filterBy}
          onChange={setFilterBy}
          options={
            isDebitTab
              ? [
                  { value: 'Creation Date', label: 'Creation Date' },
                  { value: 'Due date', label: 'Due date' },
                ]
              : [
                  { value: 'Invoice date', label: 'Invoice date' },
                  { value: 'Due date', label: 'Due date' },
                  { value: 'Billing period', label: 'Billing period' },
                ]
          }
        />
        <BiFilterSelect
          label="Time Range"
          value={timeRange}
          onChange={onTimeRangeChange}
          displayValue={customDisplay}
          triggerRefOut={timeRangeTriggerRef}
          options={[
            { value: 'This Month', label: 'This Month' },
            { value: 'Last Month', label: 'Last Month' },
            { value: 'Last 6 Months', label: 'Last 6 Months' },
            { value: 'This Year', label: 'This Year' },
            { value: 'Life Time', label: 'Life Time' },
            { value: 'Custom Date', label: 'Custom Date' },
          ]}
        />
        <BiFilterSelect
          label={isDebitTab ? 'Status' : 'Invoice status'}
          value={invoiceStatus}
          onChange={(v) => {
            setInvoiceStatus(v);
            setPage(1);
          }}
          options={
            isDebitTab
              ? [
                  { value: 'All', label: 'All' },
                  { value: 'Due', label: 'Due' },
                  { value: 'Overdue', label: 'Overdue' },
                  { value: 'Paid', label: 'Paid' },
                ]
              : [
                  { value: 'All', label: 'All' },
                  { value: 'Due', label: 'Due' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Overdue', label: 'Overdue' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Cancelled', label: 'Cancelled' },
                  { value: 'Refund', label: 'Refund' },
                ]
          }
        />
        <BiFilterSelect
          label="Student Status"
          value={studentStatus}
          onChange={setStudentStatus}
          options={[
            { value: 'All', label: 'All' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'On Hold', label: 'On hold' },
            { value: 'Withdrawn', label: 'Withdrawn' },
            { value: 'Signed up', label: 'Signed up' },
            { value: 'Transferred', label: 'Transferred' },
            { value: 'Graduated', label: 'Graduated' },
          ]}
        />
        <BiFilterSelect
          label="Room"
          value={room}
          onChange={setRoom}
          options={[
            { value: 'All Room', label: 'All Room' },
            ...ROOM_OPTIONS.map((r) => ({ value: r.name, label: r.name })),
          ]}
        />
        <BiFilterSelect
          label="Group"
          value={group}
          onChange={setGroup}
          options={[
            { value: 'All Group', label: 'All Group' },
            ...GROUP_OPTIONS.map((g) => ({ value: g.name, label: g.name })),
          ]}
        />
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
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                    key={`${customOpen}-${customStart}-${customEnd}`}
                    start={draftCustom.start}
                    end={draftCustom.end}
                    onChange={setDraftCustom}
                    onClear={() => setDraftCustom({ start: '', end: '' })}
                    onDone={() => {
                      if (!draftCustom.start || !draftCustom.end) return;
                      setCustomStart(draftCustom.start);
                      setCustomEnd(draftCustom.end);
                      setTimeRange('Custom Date');
                      prevTimeRangeRef.current = 'Custom Date';
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

      <div className="bi-kpis">
        <article className="bi-kpi is-invoiced">
          <div className="bi-kpi-shine" aria-hidden />
          <div className="bi-kpi-icon is-mint" aria-hidden>
            <Receipt size={20} />
          </div>
          <div className="bi-kpi-meta">
            <span className="bi-kpi-label">
              {isDebitTab ? 'Debit Note Amount' : 'Invoiced Amount'}
            </span>
            <span className="bi-kpi-value">{formatInr(totals.invoiced)}</span>
          </div>
        </article>
        <article className="bi-kpi is-pending">
          <div className="bi-kpi-shine" aria-hidden />
          <div className="bi-kpi-icon is-lavender" aria-hidden>
            <Wallet size={20} />
          </div>
          <div className="bi-kpi-meta">
            <span className="bi-kpi-label">Pending Amount</span>
            <span className="bi-kpi-value">{formatInr(totals.pending)}</span>
          </div>
        </article>
        <article className="bi-kpi is-paid">
          <div className="bi-kpi-shine" aria-hidden />
          <div className="bi-kpi-icon is-blush" aria-hidden>
            <CreditCard size={20} />
          </div>
          <div className="bi-kpi-meta">
            <span className="bi-kpi-label">Paid Amount</span>
            <span className="bi-kpi-value">{formatInr(totals.paid)}</span>
          </div>
        </article>
        {!isDebitTab ? (
          <article className="bi-kpi is-refund">
            <div className="bi-kpi-shine" aria-hidden />
            <div className="bi-kpi-icon is-beige" aria-hidden>
              <RefreshCcw size={20} />
            </div>
            <div className="bi-kpi-meta">
              <span className="bi-kpi-label">Total Refund</span>
              <span className="bi-kpi-value">{formatInr(totals.refund)}</span>
            </div>
          </article>
        ) : null}
      </div>

      <div className="bi-panel">
        <div className="bi-panel-toolbar">
          <div className="bi-search">
            <Search size={16} aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                isDebitTab
                  ? 'Search by student name, debit id, admission number or preferred name'
                  : 'Search by name, invoice number or fee plan'
              }
              aria-label={isDebitTab ? 'Search debit notes' : 'Search invoices'}
            />
            {search ? (
              <button type="button" className="bi-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                ×
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={!selected.length}
            onClick={removeSelected}
            aria-label="Delete selected"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {loading ? (
          <TableSkeleton rows={8} />
        ) : pageRows.length === 0 ? (
          <div className="bi-empty">
            <div className="bi-empty-icon">
              <Receipt size={24} />
            </div>
            <h3>{isDebitTab ? 'No debit notes found' : 'No invoices found'}</h3>
            <p>
              {isDebitTab
                ? 'Try adjusting filters or issue a new debit note for your students.'
                : 'Try adjusting filters or create a new invoice for your students.'}
            </p>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => router.push(createHref)}
            >
              + {createLabel}
            </button>
          </div>
        ) : (
          <div className="bi-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all on page" />
                  </th>
                  <th>Student Name</th>
                  {isDebitTab ? (
                    <>
                      <th>Debit Id</th>
                      <th>Date Raised</th>
                      <th>Due Date</th>
                      <th>Raised Against</th>
                      <th>Total</th>
                      <th>Pending</th>
                      <th>Paid</th>
                      <th>Latest Payment</th>
                    </>
                  ) : (
                    <>
                      <th>Invoice ID</th>
                      <th>Billing Plan</th>
                      <th>Due Date</th>
                      <th>Invoiced Amount</th>
                      <th>Paid Amount</th>
                      <th>Pending Amount</th>
                    </>
                  )}
                  <th style={{ width: isDebitTab ? 88 : 48 }} />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const latest = latestPaymentDate(row);
                  return (
                  <tr
                    key={row.id}
                    className="bi-row-clickable"
                    onClick={() => router.push(`/billing-accounting/invoices/${row.id}`)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        aria-label={`Select ${row.invoiceId}`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="bi-student-cell bi-student-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/billing-accounting/invoices/${row.id}`);
                        }}
                      >
                        <span
                          className="bi-avatar is-tone"
                          style={{ background: avatarTone(row.studentName) }}
                        >
                          {row.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.photoUrl} alt="" />
                          ) : (
                            initials(row.studentName)
                          )}
                        </span>
                        <span>{row.studentName}</span>
                      </button>
                    </td>
                    {isDebitTab ? (
                      <>
                        <td>
                          <div className="bi-inv-id">
                            <strong>{row.invoiceId}</strong>
                            <span className={`bi-badge ${badgeClass(row.status)}`}>{row.status}</span>
                          </div>
                        </td>
                        <td>
                          <span className="bi-date-cell">
                            <CalendarDays size={14} aria-hidden />
                            {formatDisplayDate(row.invoiceDate)}
                          </span>
                        </td>
                        <td>
                          <span className="bi-date-cell">
                            <CalendarDays size={14} aria-hidden />
                            {formatDisplayDate(row.dueDate)}
                          </span>
                        </td>
                        <td>{row.raisedAgainst || row.billingPlan}</td>
                        <td className="bi-amount">{formatInrPlain(row.invoicedAmount)}</td>
                        <td className="bi-amount">{formatInrPlain(row.pendingAmount)}</td>
                        <td className="bi-amount">{formatInrPlain(row.paidAmount)}</td>
                        <td>{latest ? formatDisplayDate(latest) : '—'}</td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="bi-inv-id">
                            <strong>{row.invoiceId}</strong>
                            <span className={`bi-badge ${badgeClass(row.status)}`}>{row.status}</span>
                          </div>
                        </td>
                        <td>{row.billingPlan}</td>
                        <td>
                          <span className="bi-date-cell">
                            <CalendarDays size={14} aria-hidden />
                            {formatDisplayDate(row.dueDate)}
                          </span>
                        </td>
                        <td className="bi-amount">{formatInrPlain(row.invoicedAmount)}</td>
                        <td className="bi-amount">{formatInrPlain(row.paidAmount)}</td>
                        <td className="bi-amount">{formatInrPlain(row.pendingAmount)}</td>
                      </>
                    )}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="bi-row-actions">
                        {isDebitTab ? (
                          <button
                            type="button"
                            className="mod-icon-btn"
                            aria-label="Download debit receipt"
                            onClick={() => {
                              const own = row.payments ?? [];
                              if (own.length === 1) {
                                setReceiptView({ invoice: row, payment: own[0] });
                                return;
                              }
                              if (own.length > 1) {
                                openReceipts(row);
                                return;
                              }
                              flash({
                                type: 'info',
                                title: 'No receipt yet',
                                detail: 'Record a payment on this debit note to generate a receipt.',
                              });
                            }}
                          >
                            <Download size={16} />
                          </button>
                        ) : null}
                        <AppMenu
                          align="end"
                          minWidth={260}
                          items={menuFor(row)}
                          trigger={({ buttonProps }) => (
                            <button
                              type="button"
                              className="mod-icon-btn"
                              aria-label="Row actions"
                              {...buttonProps}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          )}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bi-footer cm-pagination">
          <span className="cm-page-info">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} results
          </span>
          <div className="cm-page-btns">
            <button
              type="button"
              className="cm-page-nav"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`cm-page-num${p === page ? ' is-active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="cm-page-nav"
              disabled={page >= totalPages}
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
                { label: '10 / page', value: '10' },
                { label: '30 / page', value: '30' },
                { label: '50 / page', value: '50' },
              ]}
              align="end"
            />
          </div>
        </div>
      </div>
        </>
      )}

      <DeleteInvoiceModal
        open={Boolean(deleteTarget)}
        invoiceLabel={deleteTarget?.invoiceId || ''}
        studentName={deleteTarget?.studentName}
        busy={deleting}
        onClose={() => (deleting ? undefined : setDeleteTarget(null))}
        onConfirm={confirmRowDelete}
      />
      <DeleteInvoiceModal
        open={bulkDeleteOpen}
        invoiceLabel="selected invoices"
        count={selected.length}
        busy={deleting}
        onClose={() => (deleting ? undefined : setBulkDeleteOpen(false))}
        onConfirm={confirmBulkDelete}
      />
      <FeeReminderConfirmModal
        open={remindOpen}
        busy={reminding}
        onClose={() => (reminding ? undefined : setRemindOpen(false))}
        onConfirm={confirmFeeReminder}
      />
      <BulkFeeReminderModal
        open={bulkRemindOpen}
        busy={bulkReminding}
        mode={bulkRemindMode}
        invoices={bulkRemindTargets}
        onClose={() => (bulkReminding ? undefined : setBulkRemindOpen(false))}
        onConfirm={confirmBulkFeeReminder}
      />
      <CancelInvoiceModal
        open={cancelOpen}
        busy={cancelling}
        invoiceLabel={actionInvoice?.invoiceId || ''}
        onClose={() => (cancelling ? undefined : setCancelOpen(false))}
        onConfirm={confirmCancel}
      />
      {actionInvoice ? (
        <RefundInvoiceModal
          open={refundOpen}
          busy={refunding}
          invoice={actionInvoice}
          onClose={() => (refunding ? undefined : setRefundOpen(false))}
          onConfirm={confirmRefund}
        />
      ) : null}
      <SelectReceiptModal
        open={receiptPickOpen}
        receipts={
          actionInvoice
            ? getStudentReceipts(actionInvoice.studentId, actionInvoice.kind)
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
    </div>
  );
}

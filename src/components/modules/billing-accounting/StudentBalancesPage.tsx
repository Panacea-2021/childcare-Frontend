'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  History,
  Hourglass,
  PiggyBank,
  Plus,
  RotateCcw,
  Search,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { TableSkeleton } from '@/components/ui/loading';
import { AppMenu, AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { BiFilterSelect } from './BiFilterSelect';
import { DateRangeCalendar, formatDateLabel } from './DateRangeCalendar';
import { BalanceAllocationModal } from './BalanceAllocationModal';
import {
  formatInr,
  formatInrPlain,
  loadCenterInvoices,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import {
  DATE_RANGE_OPTIONS,
  ensureCompactCreditDemo,
  inDateRange,
  loadStudentBilling,
  summarizeCredits,
  summarizeDeposits,
  type DateRangeOption,
} from '@/lib/center-management/billingStore';
import {
  GROUP_OPTIONS,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  STUDENT_STATUSES,
  loadStudents,
} from '@/lib/center-management/studentsStore';
import type { Student, StudentStatus } from '@/lib/center-management/types';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import './student-balances.css';

type TabId = 'balances' | 'credit' | 'deposit';
type SortKey =
  | 'name'
  | 'invoiced'
  | 'paid'
  | 'pending'
  | 'credit'
  | 'deposit'
  | 'creditIssued'
  | 'creditFromDeposit'
  | 'creditUsed'
  | 'creditRefunded'
  | 'depositIssued'
  | 'depositToCredit'
  | 'depositUsed'
  | 'depositRefunded';
type SortDir = 'asc' | 'desc';
type KpiFilter =
  | 'invoiced'
  | 'paid'
  | 'pending'
  | 'credit'
  | 'deposit'
  | 'creditIssued'
  | 'creditUsed'
  | 'creditRefunded'
  | 'depositIssued'
  | 'depositUsed'
  | 'depositRefunded'
  | null;

type BalanceRow = {
  student: Student;
  invoiced: number;
  paid: number;
  pending: number;
  credit: number;
  deposit: number;
  creditIssued: number;
  creditFromDeposit: number;
  creditUsed: number;
  creditRefunded: number;
  depositIssued: number;
  depositToCredit: number;
  depositUsed: number;
  depositRefunded: number;
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'balances', label: 'Student Balances' },
  { id: 'credit', label: 'Credit Balance' },
  { id: 'deposit', label: 'Deposit' },
];

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

function moneyClass(amount: number, kind: 'paid' | 'pending' | 'credit' | 'plain') {
  if (amount <= 0) return 'sb-amt is-muted';
  if (kind === 'paid') return 'sb-amt is-paid';
  if (kind === 'pending') return 'sb-amt is-pending';
  if (kind === 'credit') return 'sb-amt is-credit';
  return 'sb-amt';
}

function WalletIcon() {
  return <WalletCards size={20} />;
}

export function StudentBalancesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: TabId =
    tabParam === 'credit' || tabParam === 'deposit' || tabParam === 'balances'
      ? tabParam
      : 'balances';
  const [tab, setTab] = useState<TabId>(initialTab);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<CenterInvoice[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  const [timeRange, setTimeRange] = useState<DateRangeOption>('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [draftCustom, setDraftCustom] = useState({ start: '', end: '' });
  const [customOpen, setCustomOpen] = useState(false);
  const [customPos, setCustomPos] = useState({ top: 0, left: 0, width: 560 });
  const [status, setStatus] = useState('All');
  const [room, setRoom] = useState('All');
  const [group, setGroup] = useState('All');
  const [program, setProgram] = useState('All');
  const [search, setSearch] = useState('');
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [creditOpen, setCreditOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    balances: null,
    credit: null,
    deposit: null,
  });
  const tabsWrapRef = useRef<HTMLDivElement>(null);
  const timeRangeTriggerRef = useRef<HTMLDivElement>(null);
  const customPanelRef = useRef<HTMLDivElement>(null);
  const prevTimeRangeRef = useRef(timeRange);
  const [pill, setPill] = useState({ left: 4, width: 0 });

  const refresh = () => {
    setStudents(loadStudents());
    setInvoices(loadCenterInvoices());
    setTick((n) => n + 1);
  };

  useEffect(() => {
    if (tabParam === 'credit' || tabParam === 'deposit' || tabParam === 'balances') {
      setTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    ensureCompactCreditDemo();
    refresh();
    setLoading(false);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useLayoutEffect(() => {
    const el = tabRefs.current[tab];
    const wrap = tabsWrapRef.current;
    if (!el || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setPill({ left: rect.left - wrapRect.left, width: rect.width });
  }, [tab, students.length]);

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
      let top = rect.bottom + gap;
      if (top + h > vh - pad) top = Math.max(pad, vh - h - pad);
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

  const closeCustomPanel = () => {
    setCustomOpen(false);
    if (!customStart || !customEnd) {
      const fallback =
        prevTimeRangeRef.current === 'Custom Date' ? 'This Month' : prevTimeRangeRef.current;
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
    const next = v as DateRangeOption;
    prevTimeRangeRef.current = next;
    setTimeRange(next);
    setCustomOpen(false);
    setPage(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customOpen, customStart, customEnd]);

  useEffect(() => {
    setSortKey('name');
    setSortDir('asc');
    setKpiFilter(null);
  }, [tab]);

  const rows = useMemo<BalanceRow[]>(() => {
    void tick;
    return students.map((student) => {
      const related = invoices.filter(
        (inv) =>
          inv.kind === 'invoice' &&
          inv.status !== 'Cancelled' &&
          (inv.studentId === student.id ||
            inv.studentName.trim().toLowerCase() === student.name.trim().toLowerCase()) &&
          inDateRange(inv.invoiceDate, timeRange, customStart, customEnd),
      );
      const invoiced = related.reduce((s, i) => s + i.invoicedAmount, 0);
      const paid = related.reduce((s, i) => s + i.paidAmount, 0);
      const pending = related.reduce((s, i) => s + i.pendingAmount, 0);
      const billing = loadStudentBilling(student.id);
      const creditSummary = summarizeCredits(billing.credits);
      const depositSummary = summarizeDeposits(billing.deposits);
      return {
        student,
        invoiced,
        paid,
        pending,
        credit: creditSummary.balance,
        deposit: depositSummary.balance,
        creditIssued: creditSummary.issued,
        creditFromDeposit: creditSummary.fromDeposit,
        creditUsed: creditSummary.used,
        creditRefunded: creditSummary.refunded,
        depositIssued: depositSummary.issued,
        depositToCredit: depositSummary.toCredit,
        depositUsed: depositSummary.used,
        depositRefunded: depositSummary.refunded,
      };
    });
  }, [students, invoices, timeRange, customStart, customEnd, tick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((row) => {
      const s = row.student;
      if (status !== 'All' && s.status !== status) return false;
      if (room !== 'All' && !s.roomIds.includes(room)) return false;
      if (group !== 'All' && !s.groupIds.includes(group)) return false;
      if (program !== 'All' && !s.programIds.includes(program)) return false;
      if (tab === 'credit') {
        const hasCredit =
          row.credit > 0 ||
          row.creditIssued > 0 ||
          row.creditUsed > 0 ||
          row.creditRefunded > 0 ||
          row.creditFromDeposit > 0;
        if (!hasCredit) return false;
      }
      if (tab === 'deposit') {
        const hasDeposit =
          row.deposit > 0 ||
          row.depositIssued > 0 ||
          row.depositUsed > 0 ||
          row.depositRefunded > 0 ||
          row.depositToCredit > 0;
        if (!hasDeposit) return false;
      }
      if (q) {
        const hay = `${s.name} ${s.admissionNumber} ${s.preferredName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return list;
  }, [rows, status, room, group, program, search, tab]);

  const tableRows = useMemo(() => {
    const list = filtered.filter((row) => {
      if (kpiFilter === 'invoiced' && row.invoiced <= 0) return false;
      if (kpiFilter === 'paid' && row.paid <= 0) return false;
      if (kpiFilter === 'pending' && row.pending <= 0) return false;
      if (kpiFilter === 'credit' && row.credit <= 0) return false;
      if (kpiFilter === 'deposit' && row.deposit <= 0) return false;
      if (kpiFilter === 'creditIssued' && row.creditIssued <= 0) return false;
      if (kpiFilter === 'creditUsed' && row.creditUsed <= 0) return false;
      if (kpiFilter === 'creditRefunded' && row.creditRefunded <= 0) return false;
      if (kpiFilter === 'depositIssued' && row.depositIssued <= 0) return false;
      if (kpiFilter === 'depositUsed' && row.depositUsed <= 0) return false;
      if (kpiFilter === 'depositRefunded' && row.depositRefunded <= 0) return false;
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        return a.student.name.localeCompare(b.student.name) * dir;
      }
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [filtered, kpiFilter, sortKey, sortDir]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        invoiced: acc.invoiced + r.invoiced,
        paid: acc.paid + r.paid,
        pending: acc.pending + r.pending,
        credit: acc.credit + r.credit,
        deposit: acc.deposit + r.deposit,
        creditIssued: acc.creditIssued + r.creditIssued,
        creditFromDeposit: acc.creditFromDeposit + r.creditFromDeposit,
        creditUsed: acc.creditUsed + r.creditUsed,
        creditRefunded: acc.creditRefunded + r.creditRefunded,
        depositIssued: acc.depositIssued + r.depositIssued,
        depositToCredit: acc.depositToCredit + r.depositToCredit,
        depositUsed: acc.depositUsed + r.depositUsed,
        depositRefunded: acc.depositRefunded + r.depositRefunded,
      }),
      {
        invoiced: 0,
        paid: 0,
        pending: 0,
        credit: 0,
        deposit: 0,
        creditIssued: 0,
        creditFromDeposit: 0,
        creditUsed: 0,
        creditRefunded: 0,
        depositIssued: 0,
        depositToCredit: 0,
        depositUsed: 0,
        depositRefunded: 0,
      },
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = tableRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleKpi = (key: Exclude<KpiFilter, null>) => {
    setKpiFilter((prev) => (prev === key ? null : key));
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortTooltip = (key: SortKey) =>
    sortKey === key
      ? sortDir === 'asc'
        ? 'Click to sort descending'
        : 'Click to sort ascending'
      : 'Click to sort ascending';

  const sortColumns = useMemo((): [SortKey, string, boolean?][] => {
    if (tab === 'credit') {
      return [
        ['name', 'Student'],
        ['creditIssued', 'Direct Credit Issued'],
        ['creditFromDeposit', 'Transferred From Deposit'],
        ['creditUsed', 'Credit Used'],
        ['creditRefunded', 'Credit Refunded'],
        ['credit', 'Credit Balance'],
      ];
    }
    if (tab === 'deposit') {
      return [
        ['name', 'Student'],
        ['depositIssued', 'Deposit Issued'],
        ['depositToCredit', 'Transferred To Credit'],
        ['depositUsed', 'Deposit Used'],
        ['depositRefunded', 'Deposit Refunded'],
        ['deposit', 'Deposit Balance'],
      ];
    }
    return [
      ['name', 'Student Name'],
      ['invoiced', 'Invoiced Amount', true],
      ['paid', 'Paid Amount', true],
      ['pending', 'Pending Amount', true],
      ['credit', 'Credit Balance', true],
    ];
  }, [tab]);

  const selectTab = (next: TabId) => {
    setTab(next);
    setPage(1);
    const url = new URL(window.location.href);
    if (next === 'balances') url.searchParams.delete('tab');
    else url.searchParams.set('tab', next);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  const openStudent = (id: string) => {
    if (tab === 'credit') {
      router.push(`/center-management/students/${id}?tab=Billing&billing=credit`);
      return;
    }
    if (tab === 'deposit') {
      router.push(`/center-management/students/${id}?tab=Billing&billing=deposit`);
      return;
    }
    router.push(`/center-management/students/${id}?tab=Billing`);
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
    <div className="bi-root sb-root">
      {toastNode}

      <BillingAccountingPageHeader
        title="Student Balances"
        description="Track invoiced, paid, pending, credit, and deposit balances by student."
        icon={<WalletIcon />}
      />

      <div className="sb-tabs-row">
        <div className="sb-tabs" role="tablist" aria-label="Student balance views" ref={tabsWrapRef}>
          <motion.span
            className="sb-tab-pill"
            animate={{ left: pill.left, width: pill.width }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`sb-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="sb-actions">
          {tab === 'credit' ? (
            <>
              <button
                type="button"
                className="ui-btn ui-btn-outline sb-credit-history-btn"
                onClick={() =>
                  router.push('/billing-accounting/student-balances/credit-history?from=credit')
                }
              >
                <History size={15} />
                Credit History
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => setCreditOpen(true)}
              >
                <Plus size={15} />
                Add Credit Balance
              </button>
            </>
          ) : tab === 'deposit' ? (
            <>
              <button
                type="button"
                className="ui-btn ui-btn-outline sb-credit-history-btn"
                onClick={() =>
                  router.push('/billing-accounting/student-balances/deposit-history?from=deposit')
                }
              >
                <History size={15} />
                Deposit History
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => setDepositOpen(true)}
              >
                <Plus size={15} />
                Add Deposit
              </button>
            </>
          ) : (
            <AppMenu
              align="end"
              minWidth={210}
              menuClassName="sb-actions-menu"
              items={[
                {
                  id: 'invoice',
                  label: 'Create Invoice',
                  icon: <FileText size={15} />,
                  onSelect: () => router.push('/billing-accounting/invoices/create?from=balances'),
                },
                {
                  id: 'credit',
                  label: 'Add Credit',
                  icon: <Wallet size={15} />,
                  onSelect: () => setCreditOpen(true),
                },
                {
                  id: 'deposit',
                  label: 'Add Deposit',
                  icon: <PiggyBank size={15} />,
                  onSelect: () => setDepositOpen(true),
                },
                {
                  id: 'debit',
                  label: 'Create Debit',
                  icon: <Plus size={15} />,
                  onSelect: () =>
                    router.push('/billing-accounting/invoices/debit/create?from=balances'),
                },
              ]}
              trigger={({ open, buttonProps }) => (
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  aria-expanded={open}
                  {...buttonProps}
                >
                  Actions <ChevronDown size={16} />
                </button>
              )}
            />
          )}
        </div>
      </div>

      <div className="sb-toolbar">
        <div className="bi-filters">
          <BiFilterSelect
            label="Time Range"
            value={timeRange}
            onChange={onTimeRangeChange}
            displayValue={customDisplay}
            triggerRefOut={timeRangeTriggerRef}
            options={DATE_RANGE_OPTIONS.map((o) => ({
              value: o,
              label: o,
            }))}
          />
          <BiFilterSelect
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All Status' },
              ...STUDENT_STATUSES.map((s: StudentStatus) => ({
                value: s,
                label: s === 'On Hold' ? 'On hold' : s,
              })),
            ]}
          />
          <BiFilterSelect
            label="Rooms"
            value={room}
            onChange={(v) => {
              setRoom(v);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All Rooms' },
              ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
          <BiFilterSelect
            label="Groups"
            value={group}
            onChange={(v) => {
              setGroup(v);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All Groups' },
              ...GROUP_OPTIONS.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
          <BiFilterSelect
            label="Programs"
            value={program}
            onChange={(v) => {
              setProgram(v);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All Programs' },
              ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
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

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease }}
        >
          {tab === 'balances' ? (
            <div className="sb-kpis">
              <article
                className={`sb-kpi is-invoiced${kpiFilter === 'invoiced' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'invoiced'}
                onClick={() => toggleKpi('invoiced')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('invoiced');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-mint" aria-hidden>
                  <FileText size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Invoiced Amount</span>
                  <span className="sb-kpi-value">{formatInr(totals.invoiced)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-paid${kpiFilter === 'paid' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'paid'}
                onClick={() => toggleKpi('paid')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('paid');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-blush" aria-hidden>
                  <Wallet size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Paid Amount</span>
                  <span className="sb-kpi-value">{formatInr(totals.paid)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-pending${kpiFilter === 'pending' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'pending'}
                onClick={() => toggleKpi('pending')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('pending');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-lavender" aria-hidden>
                  <Hourglass size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Pending Amount</span>
                  <span className="sb-kpi-value">{formatInr(totals.pending)}</span>
                </div>
              </article>
            </div>
          ) : null}

          {tab === 'credit' ? (
            <div className="sb-kpis is-four">
              <article
                className={`sb-kpi is-credit${kpiFilter === 'creditIssued' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'creditIssued'}
                onClick={() => toggleKpi('creditIssued')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('creditIssued');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-mint" aria-hidden>
                  <FileText size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Total Credit Issued</span>
                  <span className="sb-kpi-value">{formatInr(totals.creditIssued)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-pending${kpiFilter === 'creditUsed' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'creditUsed'}
                onClick={() => toggleKpi('creditUsed')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('creditUsed');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-blush" aria-hidden>
                  <ArrowUpRight size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Credit Used</span>
                  <span className="sb-kpi-value">{formatInr(totals.creditUsed)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-invoiced${kpiFilter === 'creditRefunded' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'creditRefunded'}
                onClick={() => toggleKpi('creditRefunded')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('creditRefunded');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-lavender" aria-hidden>
                  <RotateCcw size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Credit Refunded</span>
                  <span className="sb-kpi-value">{formatInr(totals.creditRefunded)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-credit${kpiFilter === 'credit' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'credit'}
                onClick={() => toggleKpi('credit')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('credit');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-sky" aria-hidden>
                  <Wallet size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Credit Balance</span>
                  <span className="sb-kpi-value">{formatInr(totals.credit)}</span>
                </div>
              </article>
            </div>
          ) : null}

          {tab === 'deposit' ? (
            <div className="sb-kpis is-four">
              <article
                className={`sb-kpi is-credit${kpiFilter === 'depositIssued' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'depositIssued'}
                onClick={() => toggleKpi('depositIssued')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('depositIssued');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-amber" aria-hidden>
                  <PiggyBank size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Deposit Issued</span>
                  <span className="sb-kpi-value">{formatInr(totals.depositIssued)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-pending${kpiFilter === 'depositUsed' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'depositUsed'}
                onClick={() => toggleKpi('depositUsed')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('depositUsed');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-rose" aria-hidden>
                  <ArrowUpRight size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Deposit Used</span>
                  <span className="sb-kpi-value">{formatInr(totals.depositUsed)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-invoiced${kpiFilter === 'depositRefunded' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'depositRefunded'}
                onClick={() => toggleKpi('depositRefunded')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('depositRefunded');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-violet" aria-hidden>
                  <RotateCcw size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Deposit Refunded</span>
                  <span className="sb-kpi-value">{formatInr(totals.depositRefunded)}</span>
                </div>
              </article>
              <article
                className={`sb-kpi is-deposit${kpiFilter === 'deposit' ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={kpiFilter === 'deposit'}
                onClick={() => toggleKpi('deposit')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleKpi('deposit');
                  }
                }}
              >
                <div className="sb-kpi-shine" aria-hidden />
                <div className="sb-kpi-icon is-sky" aria-hidden>
                  <WalletCards size={22} />
                </div>
                <div className="sb-kpi-meta">
                  <span className="sb-kpi-label">Deposit Balance</span>
                  <span className="sb-kpi-value">{formatInr(totals.deposit)}</span>
                </div>
              </article>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="sb-panel bi-panel">
        <div className="bi-panel-toolbar">
          <div className="bi-search">
            <Search size={16} aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name or admission number"
              aria-label="Search students"
            />
            {search ? (
              <button
                type="button"
                className="bi-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
        {loading ? (
          <TableSkeleton rows={8} />
        ) : pageRows.length === 0 ? (
          <div className="sb-empty bi-empty">
            <div className="sb-empty-icon bi-empty-icon">
              <WalletCards size={24} />
            </div>
            <h3>No students found</h3>
            <p>Try adjusting filters or search to see student balances.</p>
          </div>
        ) : (
          <div className="sb-table-wrap bi-table-wrap">
            <table className={`ui-table${tab === 'balances' ? '' : ' sb-cols-credit'}`}>
              <thead>
                <tr>
                  {sortColumns.map(([key, label, right]) => (
                    <th key={key} style={right ? { textAlign: 'right' } : undefined}>
                      <AppTooltip content={sortTooltip(key)} side="bottom">
                        <button
                          type="button"
                          className={`sb-sort-btn${sortKey === key ? ' is-active' : ''}${right ? ' is-end' : ''}`}
                          onClick={() => toggleSort(key)}
                        >
                          <span>{label}</span>
                          <span className="sb-sort-icon" aria-hidden>
                            {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                          </span>
                        </button>
                      </AppTooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {pageRows.map((row, idx) => (
                    <motion.tr
                      key={row.student.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.025, 0.25), duration: 0.28, ease }}
                      className="bi-row-clickable"
                      onClick={() => openStudent(row.student.id)}
                    >
                      <td>
                        <button
                          type="button"
                          className="bi-student-cell bi-student-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStudent(row.student.id);
                          }}
                        >
                          <span
                            className="sb-avatar"
                            style={{ background: avatarTone(row.student.name) }}
                          >
                            {row.student.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={row.student.photoUrl} alt="" />
                            ) : (
                              initials(row.student.name)
                            )}
                          </span>
                          <span className="sb-student-text">
                            <span className="sb-student-name">{row.student.name}</span>
                            <span className="sb-student-id">
                              {row.student.admissionNumber || row.student.id}
                            </span>
                          </span>
                        </button>
                      </td>
                      {tab === 'balances' ? (
                        <>
                          <td style={{ textAlign: 'right' }}>
                            <span className={moneyClass(row.invoiced, 'plain')}>
                              ₹ {formatInrPlain(row.invoiced)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={moneyClass(row.paid, 'paid')}>
                              ₹ {formatInrPlain(row.paid)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={moneyClass(row.pending, 'pending')}>
                              ₹ {formatInrPlain(row.pending)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={moneyClass(row.credit, 'credit')}>
                              ₹ {formatInrPlain(row.credit)}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {tab === 'credit' ? (
                        <>
                          <td>
                            <span className={moneyClass(row.creditIssued, 'credit')}>
                              ₹ {formatInrPlain(row.creditIssued)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.creditFromDeposit, 'plain')}>
                              ₹ {formatInrPlain(row.creditFromDeposit)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.creditUsed, 'pending')}>
                              ₹ {formatInrPlain(row.creditUsed)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.creditRefunded, 'plain')}>
                              ₹ {formatInrPlain(row.creditRefunded)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.credit, 'credit')}>
                              ₹ {formatInrPlain(row.credit)}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {tab === 'deposit' ? (
                        <>
                          <td>
                            <span className={moneyClass(row.depositIssued, 'credit')}>
                              ₹ {formatInrPlain(row.depositIssued)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.depositToCredit, 'plain')}>
                              ₹ {formatInrPlain(row.depositToCredit)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.depositUsed, 'pending')}>
                              ₹ {formatInrPlain(row.depositUsed)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.depositRefunded, 'plain')}>
                              ₹ {formatInrPlain(row.depositRefunded)}
                            </span>
                          </td>
                          <td>
                            <span className={moneyClass(row.deposit, 'credit')}>
                              ₹ {formatInrPlain(row.deposit)}
                            </span>
                          </td>
                        </>
                      ) : null}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        <div className="sb-footer cm-pagination">
          <span className="cm-page-info">
            Showing {tableRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
            {Math.min(safePage * pageSize, tableRows.length)} of {tableRows.length} results
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
      </div>

      <BalanceAllocationModal
        open={creditOpen}
        mode="credit"
        students={students}
        onClose={() => setCreditOpen(false)}
        onSuccess={({ count, notify }) => {
          refresh();
          setToast(
            notify
              ? `Credit added for ${count} student(s) · email queued`
              : `Credit added for ${count} student(s)`,
          );
        }}
      />

      <BalanceAllocationModal
        open={depositOpen}
        mode="deposit"
        students={students}
        onClose={() => setDepositOpen(false)}
        onSuccess={({ count, notify }) => {
          refresh();
          setToast(
            notify
              ? `Deposit recorded for ${count} student(s) · email queued`
              : `Deposit recorded for ${count} student(s)`,
          );
        }}
      />
    </div>
  );
}

'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, CalendarDays, FileSpreadsheet, MoreVertical, Search, Sparkles } from 'lucide-react';
import { AppMenu, AppSelect } from '@/components/modules/center-management/ui';
import { BiFilterSelect } from './BiFilterSelect';
import { DateRangeCalendar, formatDateLabel } from './DateRangeCalendar';
import {
  FEE_PLAN_OPTIONS,
  formatDisplayDate,
  formatInr,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { GROUP_OPTIONS, ROOM_OPTIONS } from '@/lib/center-management/studentsStore';

type SortKey = 'studentName' | 'amount' | 'dueDate' | 'upcomingDate' | 'billingPlan';
type SortDir = 'asc' | 'desc';

type Props = {
  rows: CenterInvoice[];
};

function inMonth(iso: string, ref = new Date()) {
  if (!iso) return false;
  const d = new Date(`${iso}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function inYear(iso: string, ref = new Date()) {
  if (!iso) return false;
  return new Date(`${iso}T00:00:00`).getFullYear() === ref.getFullYear();
}

function downloadUpcomingExcel(rows: CenterInvoice[]) {
  const header = ['Student Name', 'Fee Plan', 'Upcoming Date', 'Amount', 'Due Date'];
  const lines = rows.map((r) =>
    [
      r.studentName,
      r.billingPlan,
      formatDisplayDate(r.invoiceDate),
      String(r.invoicedAmount),
      formatDisplayDate(r.dueDate),
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `upcoming-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ease = [0.22, 1, 0.36, 1] as const;

export function UpcomingInvoicesPanel({ rows }: Props) {
  const [dateRange, setDateRange] = useState('All Upcoming Invoice');
  const [search, setSearch] = useState('');
  const [feePlan, setFeePlan] = useState('All');
  const [room, setRoom] = useState('All Room');
  const [group, setGroup] = useState('All Group');
  const [sortKey, setSortKey] = useState<SortKey>('upcomingDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [customOpen, setCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [draftCustom, setDraftCustom] = useState({ start: '', end: '' });
  const [sortTip, setSortTip] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dateTriggerRef = useRef<HTMLDivElement>(null);
  const customPanelRef = useRef<HTMLDivElement>(null);
  const [customPos, setCustomPos] = useState({ top: 0, left: 0, width: 560 });

  useLayoutEffect(() => {
    if (!customOpen) return;

    const place = () => {
      const trigger = dateTriggerRef.current;
      const panel = customPanelRef.current;
      if (!trigger || !panel) return;

      const rect = trigger.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 12;
      const gap = 8;
      const width = Math.min(Math.max(560, rect.width), vw - pad * 2);
      const h = Math.min(panel.offsetHeight || 520, vh - pad * 2);

      let top = rect.bottom + gap;
      if (top + h > vh - pad) {
        const above = rect.top - gap - h;
        top = above >= pad ? above : Math.max(pad, vh - h - pad);
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
    const timer = window.setTimeout(place, 40);
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

  const feePlanOptions = useMemo(
    () => [
      { value: 'All', label: 'All' },
      ...FEE_PLAN_OPTIONS.map((p) => ({ value: p.name, label: p.name })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => r.kind === 'upcoming');

    if (dateRange === 'This Month') {
      list = list.filter((r) => inMonth(r.invoiceDate) || inMonth(r.dueDate));
    } else if (dateRange === 'This Year') {
      list = list.filter((r) => inYear(r.invoiceDate) || inYear(r.dueDate));
    } else if (dateRange === 'Custom Date' && customStart && customEnd) {
      list = list.filter((r) => {
        const field = r.invoiceDate || r.dueDate;
        return field >= customStart && field <= customEnd;
      });
    }

    if (feePlan !== 'All') {
      list = list.filter((r) => r.billingPlan === feePlan || r.billingPlan.includes(feePlan));
    }
    if (room !== 'All Room') {
      list = list.filter((r) => !r.roomId || r.roomId === room);
    }
    if (group !== 'All Group') {
      list = list.filter((r) => !r.groupId || r.groupId === group);
    }
    if (q) {
      list = list.filter((r) => r.studentName.toLowerCase().includes(q));
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av =
        sortKey === 'studentName'
          ? a.studentName.toLowerCase()
          : sortKey === 'billingPlan'
            ? a.billingPlan.toLowerCase()
            : sortKey === 'amount'
              ? a.invoicedAmount
              : sortKey === 'dueDate'
                ? a.dueDate
                : a.invoiceDate;
      const bv =
        sortKey === 'studentName'
          ? b.studentName.toLowerCase()
          : sortKey === 'billingPlan'
            ? b.billingPlan.toLowerCase()
            : sortKey === 'amount'
              ? b.invoicedAmount
              : sortKey === 'dueDate'
                ? b.dueDate
                : b.invoiceDate;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, dateRange, customStart, customEnd, feePlan, room, group, search, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [dateRange, customStart, customEnd, feePlan, room, group, search, sortKey, sortDir, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const totalAmount = useMemo(
    () => filtered.reduce((s, r) => s + (r.invoicedAmount || 0), 0),
    [filtered],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openCustom = () => {
    setDraftCustom({ start: customStart, end: customEnd });
    setCustomOpen(true);
  };

  const onDateRangeChange = (v: string) => {
    if (v === 'Custom Date') {
      setDateRange(v);
      openCustom();
      return;
    }
    setDateRange(v);
    setCustomOpen(false);
  };

  const customDisplay =
    dateRange === 'Custom Date' && customStart && customEnd
      ? `${formatDateLabel(customStart)} → ${formatDateLabel(customEnd)}`
      : undefined;

  const sortLabel = (key: SortKey) =>
    sortKey === key
      ? sortDir === 'asc'
        ? 'Click to sort descending'
        : 'Click to sort ascending'
      : 'Click to sort ascending';

  return (
    <motion.section
      className="bi-up-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <div className="bi-up-toolbar">
        <motion.div
          className="bi-up-amount"
          initial={{ opacity: 0, scale: 0.94, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.05 }}
        >
          <Sparkles size={15} className="bi-up-amount-ico" aria-hidden />
          <span className="bi-up-amount-label">Amount:</span>
          <strong className="bi-up-amount-value">{formatInr(totalAmount).replace('₹', 'INR ')}</strong>
        </motion.div>

        <AppMenu
          align="end"
          minWidth={200}
          items={[
            {
              id: 'download-excel',
              label: 'Download Excel',
              icon: <FileSpreadsheet size={15} />,
              onSelect: () => downloadUpcomingExcel(filtered),
            },
          ]}
          trigger={({ buttonProps }) => (
            <button
              type="button"
              className="bi-up-more"
              aria-label="Upcoming invoice actions"
              {...buttonProps}
            >
              <MoreVertical size={18} />
            </button>
          )}
        />
      </div>

      <motion.div
        className="bi-up-filters"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease, delay: 0.08 }}
      >
        <BiFilterSelect
          label="Date Range"
          value={dateRange}
          onChange={onDateRangeChange}
          displayValue={customDisplay}
          triggerRefOut={dateTriggerRef}
          options={[
            { value: 'This Month', label: 'This Month' },
            { value: 'This Year', label: 'This Year' },
            { value: 'All Upcoming Invoice', label: 'All Upcoming Invoice' },
            { value: 'Custom Date', label: 'Custom Date' },
          ]}
        />

        <div className="bi-up-search-field">
          <label className="bi-filter-label" htmlFor="bi-up-search">
            Search
          </label>
          <div className="bi-up-search">
            <Search size={15} aria-hidden />
            <input
              id="bi-up-search"
              className="bi-up-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search By Student Name"
            />
          </div>
        </div>

        <BiFilterSelect
          label="Fee Plan"
          value={feePlan}
          onChange={setFeePlan}
          options={feePlanOptions}
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
      </motion.div>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {customOpen ? (
                <motion.div
                  ref={customPanelRef}
                  className="bi-custom-date-panel bi-custom-date-panel--upcoming"
                  style={{
                    top: customPos.top,
                    left: customPos.left,
                    width: customPos.width,
                    maxHeight: 'calc(100vh - 24px)',
                  }}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="bi-custom-date-head">
                    <div>
                      <strong>Custom date range</strong>
                      <p>Pick upcoming invoice dates</p>
                    </div>
                    <button
                      type="button"
                      className="bi-link-btn"
                      onClick={() => setCustomOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <DateRangeCalendar
                    start={draftCustom.start}
                    end={draftCustom.end}
                    onChange={setDraftCustom}
                    onClear={() => setDraftCustom({ start: '', end: '' })}
                    onDone={() => {
                      if (!draftCustom.start || !draftCustom.end) return;
                      setCustomStart(draftCustom.start);
                      setCustomEnd(draftCustom.end);
                      setDateRange('Custom Date');
                      setCustomOpen(false);
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <motion.div
        className="bi-up-table-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.12 }}
      >
        <div className="bi-table-wrap">
          <table className="ui-table bi-up-table">
            <thead>
              <tr>
                {(
                  [
                    { key: 'studentName' as const, label: 'Student Name' },
                    { key: 'billingPlan' as const, label: 'Fee Plan' },
                    { key: 'upcomingDate' as const, label: 'Upcoming Date' },
                    { key: 'amount' as const, label: 'Amount' },
                    { key: 'dueDate' as const, label: 'Due Date' },
                  ] as const
                ).map((col) => (
                  <th key={col.key}>
                    <button
                      type="button"
                      className={`bi-up-sort${sortKey === col.key ? ' is-active' : ''}`}
                      onClick={() => toggleSort(col.key)}
                      onMouseEnter={() => setSortTip(sortLabel(col.key))}
                      onMouseLeave={() => setSortTip(null)}
                      onFocus={() => setSortTip(sortLabel(col.key))}
                      onBlur={() => setSortTip(null)}
                      title={sortLabel(col.key)}
                    >
                      <span>{col.label}</span>
                      <ArrowDownUp size={13} aria-hidden />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={5}>
                      <motion.div
                        className="bi-up-empty"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                      >
                        <span className="bi-up-empty-orb" aria-hidden>
                          <CalendarDays size={28} />
                        </span>
                        <strong>No Data</strong>
                        <p>No upcoming invoices match your filters right now.</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28, ease, delay: Math.min(i * 0.035, 0.28) }}
                      className="bi-up-row"
                    >
                      <td>
                        <div className="bi-student-cell">
                          <span className="bi-avatar" aria-hidden>
                            {row.studentName
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((p) => p[0]?.toUpperCase() ?? '')
                              .join('')}
                          </span>
                          <span>{row.studentName}</span>
                        </div>
                      </td>
                      <td>{row.billingPlan}</td>
                      <td>
                        <span className="bi-date-cell">
                          <CalendarDays size={14} aria-hidden />
                          {formatDisplayDate(row.invoiceDate)}
                        </span>
                      </td>
                      <td className="bi-amount">{formatInr(row.invoicedAmount)}</td>
                      <td>
                        <span className="bi-date-cell">
                          <CalendarDays size={14} aria-hidden />
                          {formatDisplayDate(row.dueDate)}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
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
        {sortTip ? (
          <div className="bi-up-sort-tip" role="status">
            {sortTip}
          </div>
        ) : null}
      </motion.div>
    </motion.section>
  );
}

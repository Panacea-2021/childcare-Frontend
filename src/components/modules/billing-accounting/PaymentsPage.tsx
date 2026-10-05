'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Wallet } from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { TableSkeleton } from '@/components/ui/loading';
import { AppSelect } from '@/components/modules/center-management/ui';
import { BiFilterSelect } from './BiFilterSelect';
import {
  formatDisplayDate,
  formatInr,
  formatInrPlain,
  formatInvoicePaymentMode,
  listSuccessfulPayments,
  type PaymentRecord,
} from '@/lib/billing-accounting/invoiceStore';
import {
  inDateRange,
  type DateRangeOption,
} from '@/lib/center-management/billingStore';
import { loadStudents, STUDENT_STATUSES } from '@/lib/center-management/studentsStore';
import type { StudentStatus } from '@/lib/center-management/types';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';

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

const PAYMENT_MODES = [
  'Cash',
  'Credit Balance',
  'Cheque',
  'Card',
  'Bank Transfer',
  'M-Pesa',
  'FPS',
  'Other',
];

function paymentModeMatches(stored: string, filter: string) {
  if (filter === 'All') return true;
  if (filter === 'Credit Balance') {
    return stored === 'Credit Balance' || stored === 'Credit';
  }
  return stored === filter;
}

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  ...STUDENT_STATUSES.map((s) => ({
    value: s,
    label: s === 'On Hold' ? 'On hold' : s,
  })),
];

function resolveStudentStatus(
  studentId: string,
  studentName: string,
  byId: Map<string, StudentStatus>,
  byName: Map<string, StudentStatus>,
): StudentStatus {
  return byId.get(studentId) ?? byName.get(studentName.trim().toLowerCase()) ?? 'Active';
}

export function PaymentsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<DateRangeOption>('This Month');
  const [studentId, setStudentId] = useState('All');
  const [paymentMode, setPaymentMode] = useState('All');
  const [studentStatus, setStudentStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const studentStatusMaps = useMemo(() => {
    const byId = new Map<string, StudentStatus>();
    const byName = new Map<string, StudentStatus>();
    for (const s of loadStudents()) {
      byId.set(s.id, s.status);
      byName.set(s.name.trim().toLowerCase(), s.status);
    }
    return { byId, byName };
  }, [records]);

  const refresh = () => setRecords(listSuccessfulPayments());

  useEffect(() => {
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

  const studentOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of records) {
      map.set(row.invoice.studentId, row.invoice.studentName);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((row) => {
      if (studentId !== 'All' && row.invoice.studentId !== studentId) return false;
      if (!paymentModeMatches(row.payment.mode, paymentMode)) return false;
      if (studentStatus !== 'All') {
        const status = resolveStudentStatus(
          row.invoice.studentId,
          row.invoice.studentName,
          studentStatusMaps.byId,
          studentStatusMaps.byName,
        );
        if (status !== studentStatus) return false;
      }
      if (!inDateRange(row.payment.date, timeRange)) return false;
      return true;
    });
  }, [records, studentId, paymentMode, studentStatus, timeRange, studentStatusMaps]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, row) => sum + row.payment.amount, 0),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openInvoice = (invoiceId: string) => {
    router.push(`/billing-accounting/invoices/${invoiceId}?from=payments`);
  };

  return (
    <div className="bi-root bi-payments-root">
      <BillingAccountingPageHeader
        title="Payments"
        description="Successful payment records from invoices and debit notes."
        icon={<Wallet size={20} />}
        actions={
          <div className="bi-pay-total" aria-live="polite">
            Total: {formatInr(totalAmount)}
          </div>
        }
      />

      <div className="bi-filters">
        <BiFilterSelect
          label="Time Range"
          value={timeRange}
          onChange={(v) => {
            setTimeRange(v as DateRangeOption);
            setPage(1);
          }}
          options={[
            { value: 'This Month', label: 'This Month' },
            { value: 'Last Month', label: 'Last Month' },
            { value: 'Last 6 Months', label: 'Last 6 Months' },
            { value: 'This Year', label: 'This Year' },
            { value: 'Life Time', label: 'Life Time' },
          ]}
        />
        <BiFilterSelect
          label="Student Name"
          value={studentId}
          onChange={(v) => {
            setStudentId(v);
            setPage(1);
          }}
          options={[
            { value: 'All', label: 'All Students' },
            ...studentOptions,
          ]}
        />
        <BiFilterSelect
          label="Payment Mode"
          value={paymentMode}
          onChange={(v) => {
            setPaymentMode(v);
            setPage(1);
          }}
          options={[
            { value: 'All', label: 'All Modes' },
            ...PAYMENT_MODES.map((m) => ({ value: m, label: m })),
          ]}
        />
        <BiFilterSelect
          label="Status"
          value={studentStatus}
          onChange={(v) => {
            setStudentStatus(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="bi-panel">
        {loading ? (
          <TableSkeleton rows={7} />
        ) : pageRows.length === 0 ? (
          <div className="bi-empty">
            <div className="bi-empty-icon">
              <Wallet size={24} />
            </div>
            <h3>No payment records</h3>
            <p>Successful payments recorded on invoices will appear here.</p>
          </div>
        ) : (
          <div className="bi-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Invoice ID</th>
                  <th>Receipt Id</th>
                  <th>Payment Date</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={row.key}
                    className="bi-row-clickable"
                    onClick={() => openInvoice(row.invoice.id)}
                  >
                    <td>
                      <button
                        type="button"
                        className="bi-student-cell bi-student-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInvoice(row.invoice.id);
                        }}
                      >
                        <span
                          className="bi-avatar is-tone"
                          style={{ background: avatarTone(row.invoice.studentName) }}
                        >
                          {row.invoice.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.invoice.photoUrl} alt="" />
                          ) : (
                            initials(row.invoice.studentName)
                          )}
                        </span>
                        <span>{row.invoice.studentName}</span>
                      </button>
                    </td>
                    <td>
                      <strong>{row.invoice.invoiceId}</strong>
                    </td>
                    <td>{row.payment.receiptId}</td>
                    <td>
                      <span className="bi-date-cell">
                        <CalendarDays size={14} aria-hidden />
                        {formatDisplayDate(row.payment.date)}
                      </span>
                    </td>
                    <td>
                      <span className="bi-pay-mode">{formatInvoicePaymentMode(row.payment.mode)}</span>
                    </td>
                    <td className="bi-amount" style={{ textAlign: 'right' }}>
                      ₹ {formatInrPlain(row.payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bi-footer cm-pagination">
          <span className="cm-page-info">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{' '}
            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length} results
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                { label: '10 / page', value: '10' },
                { label: '30 / page', value: '30' },
                { label: '50 / page', value: '50' },
              ]}
              align="end"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

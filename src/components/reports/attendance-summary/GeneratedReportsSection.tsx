'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { badgeClass } from '@/lib/moduleData';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { downloadGeneratedReport } from '@/components/reports/shared/generatedReport';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { formatDateTime, toDisplayDate } from './utils';
import { ReportPreviewModal } from './ReportPreviewModal';
import { ShareReportModal } from './ShareReportModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { AgeGroupDashboardPreview } from '@/components/reports/student-count-age/AgeGroupDashboardPreview';

type Props = {
  reports: GeneratedExcelReport[];
  onChange: (next: GeneratedExcelReport[]) => void;
};

type SortMode = 'newest' | 'oldest';

const FORMAT_OPTIONS = [
  { value: 'All', label: 'All formats' },
  { value: 'PDF', label: 'PDF' },
  { value: 'Excel', label: 'Excel' },
  { value: 'CSV', label: 'CSV' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
  { value: '100', label: '100 rows' },
];

function formatLabel(report: GeneratedExcelReport) {
  if (report.format === 'pdf' || /\.pdf$/i.test(report.name)) return 'PDF';
  if (report.format === 'excel' || /\.xlsx$/i.test(report.name)) return 'Excel';
  return 'CSV';
}

function duplicateName(name: string) {
  if (/\.pdf$/i.test(name)) return name.replace(/\.pdf$/i, '_copy.pdf');
  if (/\.xlsx$/i.test(name)) return name.replace(/\.xlsx$/i, '_copy.xlsx');
  if (/\.csv$/i.test(name)) return name.replace(/\.csv$/i, '_copy.csv');
  return `${name}_copy`;
}

export function GeneratedReportsSection({ reports, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [generatedDate, setGeneratedDate] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState<GeneratedExcelReport | null>(null);
  const [share, setShare] = useState<GeneratedExcelReport | null>(null);
  const [remove, setRemove] = useState<GeneratedExcelReport | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...reports];

    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.generatedBy.toLowerCase().includes(q) ||
          r.kind.toLowerCase().includes(q) ||
          toDisplayDate(r.startDate).includes(q) ||
          toDisplayDate(r.endDate).includes(q) ||
          formatDateTime(r.generatedAt).date.includes(q),
      );
    }
    if (formatFilter !== 'All') list = list.filter((r) => formatLabel(r) === formatFilter);
    if (generatedDate) list = list.filter((r) => r.generatedAt.slice(0, 10) === generatedDate);

    list.sort((a, b) => {
      const av = new Date(a.generatedAt).getTime();
      const bv = new Date(b.generatedAt).getTime();
      return sort === 'newest' ? bv - av : av - bv;
    });

    return list;
  }, [reports, search, formatFilter, generatedDate, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const duplicate = (report: GeneratedExcelReport) => {
    const copy: GeneratedExcelReport = {
      ...report,
      id: `${report.kind}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      name: duplicateName(report.name),
      rows: report.rows.map((row) => ({ ...row })),
      selectedColumns: [...report.selectedColumns],
      columns: [...report.columns],
    };
    onChange([copy, ...reports]);
  };

  const confirmDelete = () => {
    if (!remove) return;
    onChange(reports.filter((r) => r.id !== remove.id));
    setRemove(null);
  };

  const kindLabel = (kind: GeneratedExcelReport['kind']) => {
    if (kind === 'absentees') return 'Absentees';
    if (kind === 'late-attendance') return 'Late Attendance';
    if (kind === 'daily-time-card') return 'Daily Time Card';
    if (kind === 'monthly-attendance') return 'Monthly Attendance';
    if (kind === 'weekly-attendance') return 'Weekly Attendance';
    if (kind === 'dropoff-pickup') return 'Drop Off & Pickup';
    if (kind === 'daily-schedule') return 'Daily Schedule';
    if (kind === 'checkin-checkout') return 'Check-In / Check-Out';
    if (kind === 'students') return 'Students';
    if (kind === 'students-age') return 'Students Age';
    if (kind === 'student-count-age') return 'Count By Age Group';
    if (kind === 'students-allergy') return 'Students Allergy';
    if (kind === 'students-emergency') return 'Emergency Contacts';
    if (kind === 'student-notes') return 'Student Notes';
    if (kind === 'authorised-pickups') return 'Authorised Pickups';
    if (kind === 'student-info-sheet') return 'Information Sheet';
    if (kind === 'immunization') return 'Immunization';
    if (kind === 'student-balance') return 'Student Balance';
    if (kind === 'fee-plan') return 'Fee Plan';
    if (kind === 'invoices') return 'Invoices';
    if (kind === 'monthly-charges') return 'Monthly Charges';
    if (kind === 'credit-note') return 'Credit Note';
    if (kind === 'line-item') return 'Line Item';
    if (kind === 'discount') return 'Discount';
    if (kind === 'payment') return 'Payment';
    if (kind === 'deposit-history') return 'Deposit History';
    if (kind === 'credit-history') return 'Credit History';
    if (kind === 'credit-balance') return 'Credit Balance';
    if (kind === 'deposit') return 'Deposit';
    if (kind === 'refund-listing') return 'Refund Listing';
    if (kind === 'daily-collection') return 'Daily Collection';
    if (kind === 'customer-statement') return 'Customer Statement';
    if (kind === 'expense') return 'Expense';
    if (kind === 'monthly-aging') return 'Monthly Aging';
    if (kind === 'invoice-ageing') return 'Invoice Ageing';
    if (kind === 'subsidy-collection') return 'Subsidy Collection';
    if (kind === 'staff-report') return 'Staff Report';
    if (kind === 'staff-attendance-summary') return 'Staff Attendance Summary';
    if (kind === 'staff-absentees') return 'Staff Absentees';
    if (kind === 'staff-late-attendance') return 'Staff Late Attendance';
    if (kind === 'staff-monthly-attendance') return 'Staff Monthly Attendance';
    if (kind === 'staff-daily-timecard') return 'Staff Daily Time Card';
    if (kind === 'enquiry-report') return 'Enquiry Report';
    if (kind === 'enquiry-activity') return 'Enquiry Activity Log';
    if (kind === 'lost-enquiry-reasons') return 'Lost Enquiry Reasons';
    if (kind === 'enquiry-source') return 'Enquiry Source Report';
    if (kind === 'weekly-enquiry-summary') return 'Weekly Enquiry Summary';
    if (kind === 'student-form-submission') return 'Student Form Submission';
    if (kind === 'staff-form-submission') return 'Staff Form Submission';
    if (kind === 'activity-excel') return 'Activity Excel Report';
    if (kind === 'program-students') return 'Program Students';
    if (kind === 'programs') return 'Programs Report';
    if (kind === 'deferred-list') return 'Deferred List';
    if (kind === 'transfer-campus-programs') return 'Transfer Campus With Programs';
    if (kind === 'new-joiner-breakdown') return 'New Joiner Breakdown';
    if (kind === 'active-students') return 'Active Students';
    if (kind === 'student-status') return 'Student Status';
    if (kind === 'transfer-campus-list') return 'Transfer Campus List';
    if (kind === 'withdrawal') return 'Withdrawal';
    if (kind === 'room-capacity') return 'Room Capacity';
    if (kind === 'graduated-students') return 'Graduated Students';
    return 'Attendance Summary';
  };

  return (
    <section className="asr-section" id="asr-generated-reports">
      <div className="asr-section-head">
        <div>
          <h2>Generated Reports</h2>
          <p>Recently generated attendance and absentees reports.</p>
        </div>
        <span className="rp-badge">{reports.length} total</span>
      </div>

      <div className="asr-toolbar">
        <label className="asr-search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by report name, generated by, or date…"
            aria-label="Search generated reports"
          />
        </label>
        <div className="asr-filter asr-filter--format">
          <SearchableSelect
            value={formatFilter}
            onChange={(v) => {
              setFormatFilter(v);
              setPage(0);
            }}
            options={FORMAT_OPTIONS}
            placeholder="All formats"
            searchPlaceholder="Search format…"
            searchable={false}
            ariaLabel="Filter by format"
          />
        </div>
        <div className="asr-filter asr-filter--date">
          <FieldDatePicker
            value={generatedDate}
            onChange={(v) => {
              setGeneratedDate(v);
              setPage(0);
            }}
            ariaLabel="Generated date"
            placeholder="dd-mm-yyyy"
          />
        </div>
        <div className="asr-filter asr-filter--sort">
          <SearchableSelect
            value={sort}
            onChange={(v) => setSort(v as SortMode)}
            options={SORT_OPTIONS}
            placeholder="Sort"
            searchable={false}
            ariaLabel="Sort reports"
          />
        </div>
        <div className="asr-filter asr-filter--rows">
          <SearchableSelect
            value={String(pageSize)}
            onChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
            options={PAGE_SIZE_OPTIONS}
            placeholder="Rows"
            searchable={false}
            ariaLabel="Rows per page"
          />
        </div>
      </div>

      {!reports.length ? (
        <div className="asr-empty">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
            }}
          >
            <FileSpreadsheet size={26} />
          </motion.div>
          <h3>No Student Count By Age Group Reports have been generated yet.</h3>
          <p>Generate Student Count By Age Group or another Excel report from the catalog. New exports appear here with Preview, Download, Duplicate, and Delete.</p>
        </div>
      ) : !filtered.length ? (
        <div className="asr-empty">
          <h3>No matching reports</h3>
          <p>Try adjusting search or filters.</p>
        </div>
      ) : (
        <div className="asr-table-wrap">
          <div className="asr-table-scroll asr-desktop-only">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Generated By</th>
                  <th>Generated Date</th>
                  <th>Attendance Date Range</th>
                  <th>Filter Type</th>
                  <th>Selection</th>
                  <th>Selected Columns</th>
                  <th>Auto Fill</th>
                  <th>Records</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {slice.map((report) => {
                    const { date, time } = formatDateTime(report.generatedAt);
                    return (
                      <motion.tr key={report.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                        <td><strong>{report.name}</strong></td>
                        <td>{kindLabel(report.kind)}</td>
                        <td>{formatLabel(report)}</td>
                        <td>{report.generatedBy}</td>
                        <td>
                          {date}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{time}</div>
                        </td>
                        <td>{toDisplayDate(report.startDate)} – {toDisplayDate(report.endDate)}</td>
                        <td style={{ textTransform: 'capitalize' }}>{report.filterBy}</td>
                        <td>{report.selectedLabel}</td>
                        <td>{report.kind === 'weekly-attendance' ? '—' : report.selectedColumns.length}</td>
                        <td>
                          {typeof report.autoFill === 'boolean'
                            ? report.autoFill
                              ? 'Enabled'
                              : 'Disabled'
                            : '—'}
                        </td>
                        <td>{report.recordCount}</td>
                        <td><span className={badgeClass('Completed')}>{report.status}</span></td>
                        <td>
                          <div className="asr-actions">
                            <button type="button" className="asr-icon-btn" title="Preview" aria-label="Preview" onClick={() => setPreview(report)}><Eye size={15} /></button>
                            <button type="button" className="asr-icon-btn" title="Download" aria-label="Download" onClick={() => downloadGeneratedReport(report)}><Download size={15} /></button>
                            <button type="button" className="asr-icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(report)}><Copy size={15} /></button>
                            <button type="button" className="asr-icon-btn" title="Share" aria-label="Share" onClick={() => setShare(report)}><Share2 size={15} /></button>
                            <button type="button" className="asr-icon-btn danger" title="Delete" aria-label="Delete" onClick={() => setRemove(report)}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="asr-cards asr-mobile-only" style={{ padding: 12 }}>
            {slice.map((report) => {
              const { date, time } = formatDateTime(report.generatedAt);
              return (
                <article key={report.id} className="asr-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <h3>{report.name}</h3>
                    <span className={badgeClass('Completed')}>{report.status}</span>
                  </div>
                  <div className="asr-card-meta">
                    <div><strong>Type</strong> {kindLabel(report.kind)}</div>
                    <div><strong>Format</strong> {formatLabel(report)}</div>
                    <div><strong>By</strong> {report.generatedBy}</div>
                    <div><strong>Generated</strong> {date} · {time}</div>
                    <div><strong>Range</strong> {toDisplayDate(report.startDate)} – {toDisplayDate(report.endDate)}</div>
                    <div><strong>Filter</strong> {report.filterBy} · {report.selectedLabel}</div>
                    <div><strong>Columns</strong> {report.kind === 'weekly-attendance' ? '—' : report.selectedColumns.length}</div>
                    <div>
                      <strong>Auto Fill</strong>{' '}
                      {typeof report.autoFill === 'boolean' ? (report.autoFill ? 'Enabled' : 'Disabled') : '—'}
                    </div>
                    <div><strong>Records</strong> {report.recordCount}</div>
                  </div>
                  <div className="asr-actions">
                    <button type="button" className="asr-icon-btn" aria-label="Preview" onClick={() => setPreview(report)}><Eye size={15} /></button>
                    <button type="button" className="asr-icon-btn" aria-label="Download" onClick={() => downloadGeneratedReport(report)}><Download size={15} /></button>
                    <button type="button" className="asr-icon-btn" aria-label="Duplicate" onClick={() => duplicate(report)}><Copy size={15} /></button>
                    <button type="button" className="asr-icon-btn" aria-label="Share" onClick={() => setShare(report)}><Share2 size={15} /></button>
                    <button type="button" className="asr-icon-btn danger" aria-label="Delete" onClick={() => setRemove(report)}><Trash2 size={15} /></button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="asr-pager">
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Showing {slice.length ? safePage * pageSize + 1 : 0}–
              {Math.min((safePage + 1) * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="asr-pager-btns">
              <button type="button" className="ui-btn ui-btn-outline" disabled={safePage <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button>
              <button type="button" className="ui-btn ui-btn-outline" disabled={safePage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      )}

      {preview?.kind === 'student-count-age' ? (
        <AgeGroupDashboardPreview report={preview} onClose={() => setPreview(null)} />
      ) : (
        <ReportPreviewModal report={preview} onClose={() => setPreview(null)} />
      )}
      <ShareReportModal report={share} onClose={() => setShare(null)} />
      <DeleteConfirmModal report={remove} onClose={() => setRemove(null)} onConfirm={confirmDelete} />
    </section>
  );
}

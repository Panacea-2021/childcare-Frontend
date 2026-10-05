import * as XLSX from 'xlsx';
import type { FilterBy } from '@/components/reports/attendance-summary/types';

export type ExcelReportKind =
  | 'attendance-summary'
  | 'absentees'
  | 'late-attendance'
  | 'daily-time-card'
  | 'monthly-attendance'
  | 'weekly-attendance'
  | 'dropoff-pickup'
  | 'daily-schedule'
  | 'checkin-checkout'
  | 'students'
  | 'students-age'
  | 'student-count-age'
  | 'students-allergy'
  | 'students-emergency'
  | 'student-notes'
  | 'authorised-pickups'
  | 'student-info-sheet'
  | 'immunization'
  | 'student-balance'
  | 'fee-plan'
  | 'invoices'
  | 'monthly-charges'
  | 'credit-note'
  | 'line-item'
  | 'discount'
  | 'payment'
  | 'deposit-history'
  | 'credit-history'
  | 'credit-balance'
  | 'deposit'
  | 'refund-listing'
  | 'daily-collection'
  | 'customer-statement'
  | 'expense'
  | 'monthly-aging'
  | 'invoice-ageing'
  | 'subsidy-collection'
  | 'staff-report'
  | 'staff-attendance-summary'
  | 'staff-absentees'
  | 'staff-late-attendance'
  | 'staff-monthly-attendance'
  | 'staff-daily-timecard'
  | 'enquiry-report'
  | 'enquiry-activity'
  | 'lost-enquiry-reasons'
  | 'enquiry-source'
  | 'enquiry-count-stage'
  | 'appointment-report'
  | 'student-form-submission'
  | 'staff-form-submission'
  | 'weekly-enquiry-summary'
  | 'cumulative-enquiry-stage'
  | 'activity-excel'
  | 'program-students'
  | 'programs'
  | 'deferred-list'
  | 'transfer-campus-programs'
  | 'new-joiner-breakdown'
  | 'active-students'
  | 'student-status'
  | 'transfer-campus-list'
  | 'withdrawal'
  | 'room-capacity'
  | 'graduated-students';

export type ReportExportFormat = 'pdf' | 'excel';

export type AgeGroupAnalytics = {
  totalStudents: number;
  averageAge: number;
  youngestAge: number;
  oldestAge: number;
  youngestLabel: string;
  oldestLabel: string;
};

export type GeneratedExcelReport = {
  id: string;
  kind: ExcelReportKind;
  name: string;
  generatedBy: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  selectedLabel: string;
  selectedColumns: string[];
  recordCount: number;
  status: 'Generated';
  columns: string[];
  rows: Record<string, string>[];
  /** Present for Weekly Attendance (and similar) generators. */
  autoFill?: boolean;
  /** Optional export format (Students Allergy and similar). Defaults to excel/CSV. */
  format?: ReportExportFormat;
  /** KPI metrics for analytics dashboards (e.g. Student Count By Age Group). */
  analytics?: AgeGroupAnalytics;
};

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadRecordCsv(filename: string, columns: string[], rows: Record<string, string>[]) {
  const escape = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [
    columns.map(escape).join(','),
    ...rows.map((row) => columns.map((col) => escape(row[col] ?? '')).join(',')),
  ];
  const csv = `\uFEFF${lines.join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const base = filename.replace(/\.(csv|xlsx)$/i, '');
  triggerDownload(blob, `${base}.csv`);
}

/** Real .xlsx workbook via SheetJS (xlsx). */
export function downloadRecordExcel(
  filename: string,
  columns: string[],
  rows: Record<string, string>[],
  sheetName = 'Report',
) {
  const aoa = [
    columns,
    ...rows.map((row) => columns.map((col) => row[col] ?? '')),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  const safeSheet = (sheetName || 'Report').replace(/[\\/?*[\]]/g, '').slice(0, 31) || 'Report';
  XLSX.utils.book_append_sheet(wb, ws, safeSheet);
  const base = filename.replace(/\.(csv|xlsx|pdf)$/i, '');
  XLSX.writeFile(wb, `${base}.xlsx`);
}

function pdfEscape(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Lightweight frontend-only PDF (text table) — no extra dependencies. */
export function downloadRecordPdf(
  filename: string,
  title: string,
  columns: string[],
  rows: Record<string, string>[],
) {
  const maxRows = Math.min(rows.length, 40);
  const lines: string[] = [title, `${rows.length} record(s)`, ''];
  lines.push(columns.join(' | '));
  lines.push('-'.repeat(Math.min(90, columns.join(' | ').length)));

  for (let i = 0; i < maxRows; i += 1) {
    const row = rows[i];
    lines.push(columns.map((col) => (row[col] ?? '').replace(/\s+/g, ' ').trim()).join(' | '));
  }
  if (rows.length > maxRows) {
    lines.push('');
    lines.push(`…and ${rows.length - maxRows} more record(s). Open Preview for the full table.`);
  }

  const contentLines = lines.flatMap((line) => {
    const chunks: string[] = [];
    const raw = line.length ? line : ' ';
    for (let i = 0; i < raw.length; i += 95) chunks.push(raw.slice(i, i + 95));
    return chunks.length ? chunks : [' '];
  });

  const leading = 760;
  const ops: string[] = ['BT', '/F1 10 Tf', '14 TL', `50 ${leading} Td`];
  contentLines.forEach((line, idx) => {
    if (idx > 0) ops.push('T*');
    ops.push(`(${pdfEscape(line)}) Tj`);
  });
  ops.push('ET');
  const stream = ops.join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  );
  objects.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const base = filename.replace(/\.pdf$/i, '');
  triggerDownload(blob, `${base}.pdf`);
}

export function downloadGeneratedReport(report: GeneratedExcelReport) {
  const isPdf = report.format === 'pdf' || /\.pdf$/i.test(report.name);
  if (isPdf && report.format !== 'excel') {
    downloadRecordPdf(report.name, report.name.replace(/\.pdf$/i, ''), report.columns, report.rows);
    return;
  }
  // Excel Reports catalog — always deliver a real .xlsx sheet (even if stored name ends in .csv).
  downloadRecordExcel(report.name, report.columns, report.rows);
}

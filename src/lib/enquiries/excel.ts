import * as XLSX from 'xlsx';
import type { EnquiryRecord, EnquiryStage } from '@/components/modules/enquiries/types';
import {
  IMPORT_COLUMNS,
  type EnquirySource,
  type ImportColumn,
  type ImportValidationSummary,
  type ParsedImportRow,
} from './types';

export const LEAD_STAGE_VALUES: EnquiryStage[] = [
  'Stored',
  'Admitted',
  'Interested',
  'Waitlisted',
  'Lost',
];

export const SAMPLE_TEMPLATE_ROW: Record<ImportColumn, string> = {
  'Student Name': 'Aarav Sharma',
  Gender: 'Male',
  'Lead Status': 'Interested',
  Source: 'Website',
  'Sub Source': 'Contact Form',
  'Preferred Name': 'Aarav',
  'Emergency Contact Name': 'Priya Sharma',
  'Emergency Contact Number': '9876543210',
  'Emergency Contact Country Code': '+91',
  School: 'Panacea Early Years — HQ',
  Address: '12 Palm Avenue, Hyderabad',
  'Assigned To': 'John Smith',
  Program: 'Pre-K Prep (4–5 yrs)',
  'Expected Start Date': '2026-09-01',
  'Additional Note': 'Prefers morning tour',
  'Created Date': '2026-07-31',
  'Birth Date': '2023-04-12',
  'Parent 1 Name': 'Priya Sharma',
  'Parent 2 Name': 'Rohit Sharma',
  'Parent 1 Phone': '9876543210',
  'Parent 2 Phone': '9123456780',
  'Parent 1 Email': 'priya.sharma@email.com',
  'Parent 2 Email': 'rohit.sharma@email.com',
  'Parent 1 Company': 'Acme Corp',
  'Parent 2 Company': 'Nova Labs',
  'Parent 1 Country Code': '+91',
  'Parent 2 Country Code': '+91',
  'Student Sub Parent': 'None',
};

function normalizeHeader(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

const HEADER_LOOKUP = new Map(IMPORT_COLUMNS.map((col) => [normalizeHeader(col), col]));

export function downloadSampleTemplate(): void {
  const aoa = [IMPORT_COLUMNS as unknown as string[], IMPORT_COLUMNS.map((c) => SAMPLE_TEMPLATE_ROW[c])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = IMPORT_COLUMNS.map((col) => ({ wch: Math.max(14, col.length + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');
  XLSX.writeFile(wb, 'enquiry_import_template.xlsx');
}

function buildExportMatrix(items: EnquiryRecord[]): (string | number)[][] {
  const headers = [...IMPORT_COLUMNS];
  const rows = items.map((item) => [
    item.studentName,
    item.gender,
    item.stage,
    item.source,
    item.subSource ?? '',
    item.preferredName ?? '',
    '',
    '',
    '',
    '',
    '',
    item.assignedTo,
    item.program,
    item.expectedStartDate ?? '',
    item.interest ?? '',
    item.createdOn,
    item.dateOfBirth ?? '',
    item.motherName ?? '',
    item.fatherName ?? '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  return [headers, ...rows];
}

function exportStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportEnquiriesToExcel(items: EnquiryRecord[]): void {
  const ws = XLSX.utils.aoa_to_sheet(buildExportMatrix(items));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');
  XLSX.writeFile(wb, `enquiries_export_${exportStamp()}.xlsx`);
}

export function exportEnquiriesToCsv(items: EnquiryRecord[]): void {
  const ws = XLSX.utils.aoa_to_sheet(buildExportMatrix(items));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enquiries_export_${exportStamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportEnquiriesToPdf(items: EnquiryRecord[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const cols = ['Student', 'Stage', 'Source', 'Assigned', 'Program', 'Created'];
  const startX = 36;
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Enquiries Export', startX, y);
  y += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const colW = [140, 90, 110, 110, 160, 80];
  let x = startX;
  cols.forEach((c, i) => {
    doc.text(c, x, y);
    x += colW[i];
  });
  y += 14;
  doc.setFont('helvetica', 'normal');
  for (const item of items) {
    if (y > 540) {
      doc.addPage();
      y = 48;
    }
    const vals = [
      item.studentName,
      item.stage,
      item.source,
      item.assignedTo,
      item.program,
      item.createdOn,
    ];
    x = startX;
    vals.forEach((v, i) => {
      doc.text(String(v ?? '').slice(0, 28), x, y);
      x += colW[i];
    });
    y += 14;
  }
  doc.save(`enquiries_export_${exportStamp()}.pdf`);
}

function emptyRow(): Record<ImportColumn, string> {
  return IMPORT_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = '';
      return acc;
    },
    {} as Record<ImportColumn, string>,
  );
}

function parseDateValue(value: string): boolean {
  if (!value.trim()) return true;
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return true;
  return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value.trim());
}

function parsePhoneValue(value: string): boolean {
  if (!value.trim()) return true;
  return /^[+\d][\d\s\-()]{6,18}$/.test(value.trim());
}

export type TemplateMatchResult = {
  ok: boolean;
  missingColumns: string[];
  extraColumns: string[];
  matchedCount: number;
  message: string;
};

/** Strict check: file headers must match the enquiry import template exactly. */
export function matchEnquiryTemplate(headers: string[]): TemplateMatchResult {
  const normalized = headers.map((h) => normalizeHeader(h)).filter(Boolean);
  const uniqueNormalized = Array.from(new Set(normalized));

  const missingColumns = IMPORT_COLUMNS.filter(
    (col) => !uniqueNormalized.includes(normalizeHeader(col)),
  );
  const extraColumns = headers
    .map((h) => h.trim())
    .filter(Boolean)
    .filter((h) => !HEADER_LOOKUP.has(normalizeHeader(h)));

  const matchedCount = IMPORT_COLUMNS.length - missingColumns.length;
  const ok = missingColumns.length === 0 && extraColumns.length === 0;

  let message = '';
  if (ok) {
    message = 'File matches the enquiry import template.';
  } else if (matchedCount === 0) {
    message =
      'This file is not an enquiry import template. Download the sample template and use those exact column headers.';
  } else if (missingColumns.length && extraColumns.length) {
    message = `Template mismatch: ${missingColumns.length} required column(s) missing and ${extraColumns.length} unrecognized column(s) found. Only the official sample template is accepted.`;
  } else if (missingColumns.length) {
    message = `Template mismatch: missing required column(s): ${missingColumns.slice(0, 6).join(', ')}${missingColumns.length > 6 ? '…' : ''}. Only the official sample template is accepted.`;
  } else {
    message = `Template mismatch: unrecognized column(s): ${extraColumns.slice(0, 6).join(', ')}${extraColumns.length > 6 ? '…' : ''}. Remove extra columns or use the official sample template.`;
  }

  return { ok, missingColumns, extraColumns, matchedCount, message };
}

export async function parseEnquiryFile(file: File): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  // Always take headers from the first row so empty optional columns still match the template.
  const aoa = XLSX.utils.sheet_to_json<(string | number | boolean | null | undefined)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  const headerRow = (aoa[0] ?? []).map((h) => String(h ?? '').trim());
  const headers = headerRow.filter(Boolean);

  if (aoa.length <= 1) {
    return { headers, rows: [] };
  }

  const rows = aoa.slice(1).map((line) => {
    const out: Record<string, string> = {};
    headerRow.forEach((header, idx) => {
      if (!header) return;
      out[header] = String(line?.[idx] ?? '').trim();
    });
    // Skip completely empty spreadsheet rows
    const hasAny = Object.values(out).some((v) => v.length > 0);
    return hasAny ? out : null;
  }).filter((r): r is Record<string, string> => !!r);

  return { headers, rows };
}

export function validateImportRows(
  headers: string[],
  rawRows: Record<string, string>[],
  sources: EnquirySource[],
  existingNames: string[],
): { rows: ParsedImportRow[]; summary: ImportValidationSummary } {
  const normalizedHeaders = headers.map((h) => normalizeHeader(h)).filter(Boolean);

  const missingColumns = IMPORT_COLUMNS.filter(
    (col) => !normalizedHeaders.includes(normalizeHeader(col)),
  );
  const extraColumns = headers.filter((h) => !HEADER_LOOKUP.has(normalizeHeader(h)));

  const activeSources = sources.filter((s) => s.status === 'Active');
  const sourceMap = new Map(activeSources.map((s) => [s.name.toLowerCase(), s]));
  const existingSet = new Set(existingNames.map((n) => n.trim().toLowerCase()).filter(Boolean));
  const seenNames = new Set<string>();

  const rows: ParsedImportRow[] = rawRows.map((raw, index) => {
    const data = emptyRow();
    for (const [key, value] of Object.entries(raw)) {
      const mapped = HEADER_LOOKUP.get(normalizeHeader(key));
      if (mapped) data[mapped] = value;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (missingColumns.length) {
      errors.push('File is missing required columns');
    }

    if (!data['Student Name'].trim()) {
      errors.push('Student Name is required');
    }

    const lead = data['Lead Status'].trim();
    if (lead && !LEAD_STAGE_VALUES.some((s) => s.toLowerCase() === lead.toLowerCase())) {
      errors.push(`Invalid Lead Status: ${lead}`);
    }

    const sourceName = data.Source.trim();
    const subName = data['Sub Source'].trim();
    const source = sourceMap.get(sourceName.toLowerCase());

    if (!sourceName) {
      errors.push('Source is required');
    } else if (!source) {
      errors.push(`Unknown Source: ${sourceName}`);
    }

    if (!subName) {
      errors.push('Sub Source is required');
    } else if (
      source &&
      !source.subSources.some((s) => s.name.toLowerCase() === subName.toLowerCase())
    ) {
      errors.push(`Sub Source "${subName}" does not belong to ${sourceName}`);
    }

    if (!parseDateValue(data['Expected Start Date'])) {
      errors.push('Invalid Expected Start Date');
    }
    if (!parseDateValue(data['Created Date'])) {
      errors.push('Invalid Created Date');
    }
    if (!parseDateValue(data['Birth Date'])) {
      errors.push('Invalid Birth Date');
    }

    for (const phoneCol of [
      'Emergency Contact Number',
      'Parent 1 Phone',
      'Parent 2 Phone',
    ] as const) {
      if (!parsePhoneValue(data[phoneCol])) {
        errors.push(`Invalid phone: ${phoneCol}`);
      }
    }

    const nameKey = data['Student Name'].trim().toLowerCase();
    if (nameKey && existingSet.has(nameKey)) {
      warnings.push('Duplicate student (already in enquiries)');
    } else if (nameKey && seenNames.has(nameKey)) {
      warnings.push('Duplicate student in file');
    }
    if (nameKey) seenNames.add(nameKey);

    let status: ParsedImportRow['status'] = 'Valid';
    if (errors.length) status = 'Invalid';
    else if (warnings.length) status = 'Warning';

    return {
      id: `imp-${index + 1}`,
      rowNum: index + 1,
      data,
      status,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
    };
  });

  const duplicates = rows.filter((r) => r.warnings.some((w) => w.includes('Duplicate'))).length;

  return {
    rows,
    summary: {
      total: rows.length,
      valid: rows.filter((r) => r.status === 'Valid').length,
      warnings: rows.filter((r) => r.status === 'Warning').length,
      invalid: rows.filter((r) => r.status === 'Invalid').length,
      missingColumns,
      extraColumns,
      duplicates,
    },
  };
}

export function importRowsToEnquiries(rows: ParsedImportRow[]): EnquiryRecord[] {
  return rows
    .filter((r) => r.status !== 'Invalid')
    .map((r, i) => {
      const d = r.data;
      const stageRaw = d['Lead Status'].trim();
      const stage =
        LEAD_STAGE_VALUES.find((s) => s.toLowerCase() === stageRaw.toLowerCase()) ?? 'Stored';
      const assignedRaw = d['Assigned To'].trim();
      const assigned = assignedRaw || 'Unassigned';

      const genderRaw = d.Gender.trim();
      const gender =
        genderRaw === 'Male' || genderRaw === 'Female'
          ? genderRaw
          : ('Prefer Not to Say' as const);

      return {
        id: `e-imp-${Date.now()}-${i}`,
        studentName: d['Student Name'].trim(),
        preferredName: d['Preferred Name'].trim() || undefined,
        stage,
        gender,
        dateOfBirth: d['Birth Date'].trim() || undefined,
        source: d.Source.trim(),
        subSource: d['Sub Source'].trim(),
        program: d.Program.trim() || 'General',
        assignedTo: assigned,
        createdOn: d['Created Date'].trim() || new Date().toISOString().slice(0, 10),
        motherName: d['Parent 1 Name'].trim() || undefined,
        fatherName: d['Parent 2 Name'].trim() || undefined,
        interest: d['Additional Note'].trim() || undefined,
      } satisfies EnquiryRecord;
    });
}

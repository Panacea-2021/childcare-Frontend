'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ParsedImportRow } from '@/lib/enquiries/types';

type Props = {
  rows: ParsedImportRow[];
};

const PAGE_SIZE = 8;

const PREVIEW_COLS: { key: keyof ParsedImportRow['data'] | '_status' | '_issues'; label: string }[] = [
  { key: 'Student Name', label: 'Student Name' },
  { key: 'Gender', label: 'Gender' },
  { key: 'Lead Status', label: 'Lead Status' },
  { key: 'Source', label: 'Source' },
  { key: 'Sub Source', label: 'Sub Source' },
  { key: 'Assigned To', label: 'Assigned To' },
  { key: 'Program', label: 'Program' },
  { key: 'Expected Start Date', label: 'Expected Start' },
  { key: 'Parent 1 Name', label: 'Parent 1' },
  { key: 'Parent 1 Phone', label: 'Parent Phone' },
  { key: '_status', label: 'Status' },
  { key: '_issues', label: 'Issues' },
];

function statusBadge(status: ParsedImportRow['status']) {
  if (status === 'Valid') return 'enq-preview-badge is-valid';
  if (status === 'Warning') return 'enq-preview-badge is-warn';
  return 'enq-preview-badge is-invalid';
}

export const ImportPreviewTable = memo(function ImportPreviewTable({ rows }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );

  if (!rows.length) {
    return (
      <div className="enq-preview-empty">
        <AlertTriangle size={22} aria-hidden />
        <div>
          <strong>No data rows found</strong>
          <p>The template headers look fine, but the sheet has no enquiry rows to import.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enq-preview-panel">
      <div className="enq-preview-head">
        <div>
          <h4>Tabular preview</h4>
          <p>
            Review {rows.length} row{rows.length === 1 ? '' : 's'} before importing. Invalid rows
            will be blocked.
          </p>
        </div>
        <div className="enq-preview-legend">
          <span>
            <CheckCircle2 size={13} aria-hidden /> Valid
          </span>
          <span className="is-warn">Warning</span>
          <span className="is-invalid">Invalid</span>
        </div>
      </div>

      <div className="enq-preview-wrap">
        <table className="ui-table enq-preview-table">
          <thead>
            <tr>
              <th>#</th>
              {PREVIEW_COLS.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout" initial={false}>
              {slice.map((row, index) => {
                const issues = [...row.errors, ...row.warnings];
                return (
                  <motion.tr
                    key={row.id}
                    className={`enq-preview-row is-${row.status.toLowerCase()}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.18 }}
                  >
                    <td>{row.rowNum}</td>
                    {PREVIEW_COLS.map((col) => {
                      if (col.key === '_status') {
                        return (
                          <td key={col.key}>
                            <span className={statusBadge(row.status)}>{row.status}</span>
                          </td>
                        );
                      }
                      if (col.key === '_issues') {
                        return (
                          <td key={col.key} className="enq-preview-issues">
                            {issues.length ? issues.join('; ') : '—'}
                          </td>
                        );
                      }
                      const value = row.data[col.key];
                      return <td key={col.key}>{value?.trim() ? value : '—'}</td>;
                    })}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="enq-preview-pager">
          <span>
            Page {safePage} of {totalPages}
          </span>
          <div className="enq-preview-pager-btns">
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} aria-hidden />
              Prev
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight size={15} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

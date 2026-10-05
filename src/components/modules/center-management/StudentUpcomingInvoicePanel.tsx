'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ProfileTablePagination, useClientPagination } from './ui';
import {
  formatBillingDate,
  formatInr,
  type UpcomingInvoice,
} from '@/lib/center-management/billingStore';
import { buildUpcomingCenterInvoice } from '@/lib/center-management/billingLedgerOps';
import { InvoicePreviewPage } from '@/components/modules/billing-accounting/invoice-detail/InvoicePreviewPage';
import type { CenterInvoice } from '@/lib/billing-accounting/invoiceStore';
import type { Student } from '@/lib/center-management/types';
import '@/components/modules/billing-accounting/invoice-detail/invoice-detail.css';

type Props = {
  student: Student;
  rows: UpcomingInvoice[];
};

function SortHint() {
  return (
    <span className="bill-sort" aria-hidden>
      <ChevronDown size={12} />
    </span>
  );
}

export function StudentUpcomingInvoicePanel({ student, rows }: Props) {
  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(rows, 30);
  const [preview, setPreview] = useState<CenterInvoice | null>(null);

  const empty = rows.length === 0;

  const openPreview = (row: UpcomingInvoice) => {
    const inv = buildUpcomingCenterInvoice(
      { id: student.id, name: student.name },
      row,
    );
    if (inv) setPreview(inv);
  };

  const listHint = useMemo(
    () =>
      empty
        ? 'Upcoming invoices appear when this student is linked to an active fee plan.'
        : null,
    [empty],
  );

  return (
    <>
      <div className="cm-table-wrap bill-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              <th>Fee Plan Name</th>
              <th>Generation Date</th>
              <th>Due Date</th>
              <th>
                Total <SortHint />
              </th>
              <th>
                Pending <SortHint />
              </th>
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr>
                <td colSpan={5} className="bill-td-empty">
                  {listHint || 'No Data'}
                </td>
              </tr>
            ) : (
              pageItems.map((r, i) => (
                <motion.tr
                  key={r.id}
                  className="bill-upcoming-row"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => openPreview(r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openPreview(r);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View upcoming invoice for ${r.feePlanName}`}
                >
                  <td>
                    <strong className="bill-upcoming-name">{r.feePlanName}</strong>
                    {r.frequency ? (
                      <span className="bill-upcoming-freq">({r.frequency})</span>
                    ) : null}
                  </td>
                  <td>{formatBillingDate(r.generationDate)}</td>
                  <td>{formatBillingDate(r.dueDate)}</td>
                  <td>{formatInr(r.total)}</td>
                  <td>{formatInr(r.pending)}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {preview
        ? createPortal(
            <div className="bi-receipt-overlay">
              <InvoicePreviewPage
                invoice={preview}
                initialMode="pdf"
                onBack={() => setPreview(null)}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

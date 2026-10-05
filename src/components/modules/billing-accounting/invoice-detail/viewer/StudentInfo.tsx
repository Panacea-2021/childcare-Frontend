'use client';

import { motion } from 'framer-motion';
import { formatDisplayDate } from '@/lib/billing-accounting/invoiceStore';
import type { InvoiceViewModel } from '../../invoice-pdf';
import { fadeUpTransition } from '../animations';

export function StudentInfo({ vm }: { vm: InvoiceViewModel }) {
  const { invoice, period } = vm;
  return (
    <motion.section
      className="ivw-info-grid"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition(0.14)}
    >
      <div className="ivw-info-panel">
        <h3>Student information</h3>
        <dl>
          <div>
            <dt>Student</dt>
            <dd>{invoice.studentName}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{invoice.billingPlan}</dd>
          </div>
          <div>
            <dt>Class</dt>
            <dd>{invoice.roomId || 'Demo Room'}</dd>
          </div>
          <div>
            <dt>Created by</dt>
            <dd>{invoice.createdBy || '—'}</dd>
          </div>
        </dl>
      </div>
      <div className="ivw-info-panel">
        <h3>Billing information</h3>
        <dl>
          <div>
            <dt>Invoice number</dt>
            <dd>{invoice.invoiceId}</dd>
          </div>
          <div>
            <dt>Date issued</dt>
            <dd>{formatDisplayDate(invoice.invoiceDate)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDisplayDate(invoice.dueDate)}</dd>
          </div>
          <div>
            <dt>Billing period</dt>
            <dd>{period}</dd>
          </div>
        </dl>
      </div>
    </motion.section>
  );
}

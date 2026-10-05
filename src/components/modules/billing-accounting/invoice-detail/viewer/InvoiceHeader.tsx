'use client';

import { motion } from 'framer-motion';
import { INVOICE_BRAND, type InvoiceViewModel } from '../../invoice-pdf';
import { fadeUpTransition } from '../animations';
import { StatusBadge } from '../StatusBadge';

export function InvoiceHeader({ vm }: { vm: InvoiceViewModel }) {
  const { invoice } = vm;
  return (
    <motion.header
      className="ivw-card-head"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition(0.08)}
    >
      <div className="ivw-brand">
        <span className="ivw-logo" aria-hidden>
          P
        </span>
        <div>
          <strong>{INVOICE_BRAND.product}</strong>
          <p>{INVOICE_BRAND.center}</p>
          <em>
            {INVOICE_BRAND.email} · {INVOICE_BRAND.phone}
          </em>
        </div>
      </div>
      <div className="ivw-card-title">
        <span>INVOICE</span>
        <StatusBadge status={invoice.status} />
        <p className={`ivw-due-chip ${invoice.pendingAmount > 0 ? 'is-due' : 'is-paid'}`}>
          {vm.dueLabel}
        </p>
      </div>
    </motion.header>
  );
}

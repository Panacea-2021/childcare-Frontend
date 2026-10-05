'use client';

import { motion } from 'framer-motion';
import { formatInr } from '@/lib/billing-accounting/invoiceStore';
import type { InvoiceViewModel } from '../../invoice-pdf';
import { fadeUpTransition } from '../animations';

export function TotalSummary({ vm }: { vm: InvoiceViewModel }) {
  return (
    <motion.div
      className="ivw-totals"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition(0.28)}
    >
      <div>
        <span>Subtotal</span>
        <strong>{formatInr(vm.subtotal)}</strong>
      </div>
      <div>
        <span>Discount</span>
        <strong>{formatInr(vm.discount)}</strong>
      </div>
      <div>
        <span>Tax</span>
        <strong>{formatInr(vm.taxTotal)}</strong>
      </div>
      <div>
        <span>Paid</span>
        <strong>{formatInr(vm.paid)}</strong>
      </div>
      <div>
        <span>Balance</span>
        <strong>{formatInr(vm.balance)}</strong>
      </div>
      <div className="is-grand">
        <span>Grand Total</span>
        <strong>{formatInr(vm.invoice.invoicedAmount)}</strong>
      </div>
      <div className="is-due">
        <span>Amount Due</span>
        <strong>{formatInr(vm.amountDue)}</strong>
      </div>
    </motion.div>
  );
}

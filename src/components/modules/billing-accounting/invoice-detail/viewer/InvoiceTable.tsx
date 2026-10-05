'use client';

import { motion } from 'framer-motion';
import { formatInr } from '@/lib/billing-accounting/invoiceStore';
import type { InvoiceViewModel } from '../../invoice-pdf';
import { easeOutCubic, fadeUpTransition } from '../animations';

export function InvoiceTable({ vm }: { vm: InvoiceViewModel }) {
  return (
    <motion.div
      className="ivw-table-wrap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition(0.2)}
    >
      <table className="ivw-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {vm.lines.map((line, i) => (
            <motion.tr
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + i * 0.05, duration: 0.32, ease: easeOutCubic }}
            >
              <td>
                <strong>{line.name}</strong>
              </td>
              <td>{line.quantity.toFixed(2)}</td>
              <td>{formatInr(line.unitPrice)}</td>
              <td>{line.taxLabel}</td>
              <td>{formatInr(line.amount)}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

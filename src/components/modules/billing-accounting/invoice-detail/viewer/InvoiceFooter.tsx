'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { INVOICE_BRAND, type InvoiceViewModel } from '../../invoice-pdf';
import { fadeUpTransition } from '../animations';

export function InvoiceFooter({ vm }: { vm: InvoiceViewModel }) {
  const notes = [vm.invoice.schoolNotes, vm.invoice.parentNotes].filter(Boolean).join('\n\n');
  const [open, setOpen] = useState(Boolean(notes));

  return (
    <motion.footer
      className="ivw-card-foot"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fadeUpTransition(0.34)}
    >
      <div className="ivw-foot-grid">
        <div>
          <h4>Payment instructions</h4>
          <p>{INVOICE_BRAND.paymentNote}</p>
        </div>
        <div>
          <h4>Terms</h4>
          <p>{INVOICE_BRAND.terms}</p>
        </div>
      </div>

      <button type="button" className="ivw-notes-toggle" onClick={() => setOpen((v) => !v)}>
        Notes
        <ChevronDown size={15} className={open ? 'is-open' : ''} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="ivw-notes-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
          >
            <p>{notes || 'No notes on this invoice.'}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="ivw-thanks">{INVOICE_BRAND.thankYou} This is a computer-generated invoice.</p>
    </motion.footer>
  );
}

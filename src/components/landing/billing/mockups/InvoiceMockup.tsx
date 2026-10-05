'use client';

import { motion } from 'framer-motion';

const LINES = [
  { label: 'School Fee', value: '$1,200' },
  { label: 'Discount', value: '-$100' },
  { label: 'Subsidy', value: '-$400' },
  { label: 'Total', value: '$700', strong: true },
];

export function InvoiceMockup({ reduced }: { reduced: boolean }) {
  return (
    <div className="bl-mock bl-mock-invoice">
      <div className="bl-mockCard bl-invoiceCard">
        <div className="bl-mockHead">Invoice</div>
        <div className="bl-mockBody">
          <div className="bl-invoiceBrand">
            <span className="bl-logoMark" aria-hidden="true">
              P
            </span>
            <div>
              <strong>Blossom Tots Pre-School</strong>
              <em>Your centre branding</em>
            </div>
          </div>
          <div className="bl-invoiceHints" aria-hidden="true">
            <span>Your logo</span>
            <span>Centre name</span>
          </div>
          <ul className="bl-invoiceLines">
            {LINES.map((line, i) => (
              <motion.li
                key={line.label}
                className={line.strong ? 'is-total' : undefined}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.1 }}
              >
                <span>{line.label}</span>
                <strong>{line.value}</strong>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

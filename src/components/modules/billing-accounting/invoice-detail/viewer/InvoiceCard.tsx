'use client';

import { motion } from 'framer-motion';
import type { InvoiceViewModel } from '../../invoice-pdf';
import { easeOutCubic } from '../animations';
import { InvoiceHeader } from './InvoiceHeader';
import { StudentInfo } from './StudentInfo';
import { InvoiceTable } from './InvoiceTable';
import { TotalSummary } from './TotalSummary';
import { InvoiceFooter } from './InvoiceFooter';

export function InvoiceCard({ vm }: { vm: InvoiceViewModel }) {
  return (
    <motion.article
      className="ivw-card"
      initial={{ opacity: 0, y: 40, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: easeOutCubic }}
    >
      <div className="ivw-card-shine" aria-hidden />
      <InvoiceHeader vm={vm} />
      <StudentInfo vm={vm} />
      <InvoiceTable vm={vm} />
      <TotalSummary vm={vm} />
      <InvoiceFooter vm={vm} />
    </motion.article>
  );
}

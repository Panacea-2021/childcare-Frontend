'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CenterInvoice } from '@/lib/billing-accounting/invoiceStore';
import { StatusBadge } from './StatusBadge';
import { GlassCard } from './GlassCard';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function StudentProfileCard({ invoice }: { invoice: CenterInvoice }) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(invoice.invoiceId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <GlassCard className="ivd-student-card" delay={0.05}>
      <motion.div
        className="ivd-avatar-ring"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="ivd-avatar">
          {invoice.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invoice.photoUrl} alt="" />
          ) : (
            initials(invoice.studentName)
          )}
        </span>
      </motion.div>
      <div className="ivd-student-meta">
        <h1>{invoice.studentName}</h1>
        <div className="ivd-invoice-id-row">
          <span className="ivd-invoice-id">{invoice.invoiceId}</span>
          <button type="button" className="ivd-icon-btn" onClick={copyId} aria-label="Copy invoice ID">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div className="ivd-student-badges">
          <StatusBadge status={invoice.status} />
        </div>
        <p className="ivd-plan">{invoice.billingPlan}</p>
      </div>
    </GlassCard>
  );
}

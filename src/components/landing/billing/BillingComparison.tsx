'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { BILLING_COMPARISON_ROWS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function Cell({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="bl-cmpYes" aria-label="Included">
      <Check size={15} strokeWidth={2.6} />
    </span>
  ) : (
    <span className="bl-cmpNo" aria-label="Not included">
      <X size={14} strokeWidth={2.2} />
    </span>
  );
}

export function BillingComparison() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="bl-compare">
      <div className="bl-compareHead">
        <div className="bl-sectionCopy bl-center">
          <h2>Why Choose Panacea for Billing?</h2>
          <p>See how Panacea compares with traditional tools and generic billing software.</p>
        </div>
        <Link href="/book-demo" className="ui-btn ui-btn-primary bl-compareDemo">
          Book a Demo
        </Link>
      </div>

      <motion.div
        className="bl-compareTableWrap"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <table className="bl-compareTable">
          <colgroup>
            <col className="bl-cmpColFeature" />
            <col className="bl-cmpCol" />
            <col className="bl-cmpCol" />
            <col className="bl-cmpColPanacea" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">Traditional Tools</th>
              <th scope="col">Generic Billing</th>
              <th scope="col" className="is-panacea">
                Panacea
              </th>
            </tr>
          </thead>
          <tbody>
            {BILLING_COMPARISON_ROWS.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.045, duration: 0.35 }}
              >
                <th scope="row">{row.feature}</th>
                <td>
                  <Cell ok={row.traditional} />
                </td>
                <td>
                  <Cell ok={row.generic} />
                </td>
                <td className="is-panacea">
                  <Cell ok={row.panacea} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

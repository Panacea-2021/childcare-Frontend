'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AIP_COMPARE_ROWS, type CompareCell } from './data';
import { AipReveal } from './AipReveal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function Cell({ value }: { value: CompareCell }) {
  if (value === 'check') {
    return (
      <span className="aip-cmpYes" aria-label="Included">
        <Check size={15} strokeWidth={2.6} />
      </span>
    );
  }
  return <span className="aip-cmpNote">{value}</span>;
}

export function AipCompare() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="aip-compare">
      <AipReveal className="aip-sectionHead aip-center">
        <h2>How Panacea AI Compares</h2>
        <p>Childcare-specific intelligence — not generic chat tools.</p>
      </AipReveal>

      <motion.div
        className="aip-compareScroll"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <table className="aip-compareTable">
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col" className="is-panacea">
                Panacea
              </th>
              <th scope="col">ChatGPT</th>
              <th scope="col">Copilot</th>
            </tr>
          </thead>
          <tbody>
            {AIP_COMPARE_ROWS.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <th scope="row">{row.feature}</th>
                <td className="is-panacea">
                  <Cell value={row.panacea} />
                </td>
                <td>
                  <Cell value={row.chatgpt} />
                </td>
                <td>
                  <Cell value={row.copilot} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

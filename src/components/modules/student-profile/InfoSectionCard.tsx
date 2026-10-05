'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cardHover, staggerItem } from './animations';

type Field = { label: string; value: string };

type Props = {
  icon: ReactNode;
  title: string;
  fields: Field[];
};

export function InfoSectionCard({ icon, title, fields }: Props) {
  return (
    <motion.section className="sp-info-card" variants={staggerItem} whileHover={cardHover}>
      <header className="sp-info-card-head">
        <span className="sp-info-card-ico" aria-hidden>
          {icon}
        </span>
        <h3>{title}</h3>
      </header>
      <div className="sp-info-grid">
        {fields.map((f) => (
          <div key={f.label} className="sp-info-field">
            <span className="sp-info-label">{f.label}</span>
            <strong className="sp-info-value">{f.value || '—'}</strong>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

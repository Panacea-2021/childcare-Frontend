'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
};

function SectionHeaderBase({ title, description, count, icon: Icon }: Props) {
  return (
    <motion.header
      className="rp-section-header"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35 }}
    >
      <div className="rp-section-header-main">
        <span className="rp-section-icon">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div>
          <h2>{title}</h2>
          <div className="rp-section-underline" />
          <p>{description}</p>
        </div>
      </div>
      <span className="rp-section-count">{count} reports</span>
    </motion.header>
  );
}

export const SectionHeader = memo(SectionHeaderBase);

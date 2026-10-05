'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import '@/components/ui/module.css';
import './calendar.css';

type Props = {
  title: string;
  description: string;
  crumbs: string[];
};

export function CalendarSubPlaceholder({ title, description, crumbs }: Props) {
  return (
    <div className="mod-page cal-page">
      <PageHeader title={title} description={description} crumbs={crumbs} />
      <motion.section
        className="cal-placeholder"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p>
          This Calendar view is ready for a premium experience matching Staff Schedule. Layout, filters, and
          interactions will follow the same Panacea design system when data is wired in.
        </p>
        <button type="button" className="ui-btn ui-btn-primary" disabled>
          Coming soon
        </button>
      </motion.section>
    </div>
  );
}

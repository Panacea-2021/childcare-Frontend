'use client';

import { motion } from 'framer-motion';

const PLACEHOLDERS = [
  { key: 'Connection Status', value: 'Not Connected' },
  { key: 'Connected Account', value: '—' },
  { key: 'Facebook Page', value: 'No Page Selected' },
  { key: 'Lead Form', value: 'No Form Selected' },
  { key: 'Last Sync', value: 'Never Synced' },
  { key: 'Permissions', value: '—' },
  { key: 'Sync History', value: '—' },
] as const;

export function PlaceholderIntegrationInfo() {
  return (
    <motion.section
      className="fb-card fb-placeholders"
      aria-labelledby="fb-placeholders-title"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="fb-placeholders-header">
        <h2 id="fb-placeholders-title" className="fb-placeholders-title">
          Integration details
        </h2>
        <p className="fb-placeholders-hint">
          Reserved for future backend integration — values are placeholders only.
        </p>
      </header>

      <dl className="fb-placeholder-grid">
        {PLACEHOLDERS.map((item) => (
          <div key={item.key} className="fb-placeholder-item">
            <dt className="fb-placeholder-key">{item.key}</dt>
            <dd className="fb-placeholder-val">{item.value}</dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}

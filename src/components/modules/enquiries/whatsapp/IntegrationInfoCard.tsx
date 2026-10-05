'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PLACEHOLDERS = [
  { key: 'Connection Status', value: 'Not Connected', muted: false },
  { key: 'Business Account', value: '—', muted: true },
  { key: 'Phone Number', value: '—', muted: true },
  { key: 'Verified Status', value: '—', muted: true },
  { key: 'Messaging Provider', value: '—', muted: true },
  { key: 'Template Status', value: '—', muted: true },
  { key: 'Last Sync', value: 'Never', muted: false },
  { key: 'Webhook Status', value: 'Inactive', muted: false },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

const grid = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const cell = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease },
  },
};

export function IntegrationInfoCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="wa-card wa-placeholders"
      aria-labelledby="wa-placeholders-title"
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.48, ease }}
    >
      <header className="wa-placeholders-header">
        <motion.h2
          id="wa-placeholders-title"
          className="wa-placeholders-title"
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease }}
        >
          Integration details
        </motion.h2>
        <motion.p
          className="wa-placeholders-hint"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          Reserved for future backend integration — values are placeholders only.
        </motion.p>
      </header>

      <motion.dl
        className="wa-placeholder-grid"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {PLACEHOLDERS.map((item) => (
          <motion.div
            key={item.key}
            className="wa-placeholder-item"
            variants={cell}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -3,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: 'rgba(37, 211, 102, 0.28)',
                    transition: { duration: 0.2 },
                  }
            }
          >
            <dt className="wa-placeholder-key">{item.key}</dt>
            <dd
              className={`wa-placeholder-val${item.muted ? ' is-muted' : ''}`}
            >
              {item.value}
            </dd>
          </motion.div>
        ))}
      </motion.dl>
    </motion.section>
  );
}

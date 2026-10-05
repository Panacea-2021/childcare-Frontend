'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { WhatsAppGlyph } from './WhatsAppGlyph';

function CrmLogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden>
      <path
        d="M20 4 L34 14 L28 32 L12 32 L6 14 Z"
        fill="none"
        stroke="#6B7280"
        strokeWidth="2.2"
      />
      <path
        d="M20 10 L28 16 L20 28 L12 16 Z"
        fill="none"
        stroke="#5D5FEF"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="wa-card wa-hero"
      aria-labelledby="wa-hero-title"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="wa-hero-glow" aria-hidden />

      <motion.div
        className="wa-logos"
        aria-hidden
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.14 } },
        }}
      >
        <motion.div
          className="wa-logo-circle is-whatsapp"
          variants={{
            hidden: { opacity: 0, scale: 0.7, x: -18 },
            show: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.45, ease } },
          }}
        >
          <motion.span
            className="wa-logo-float"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WhatsAppGlyph size={34} />
          </motion.span>
          {!reduceMotion ? (
            <motion.span
              className="wa-logo-ring"
              animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />
          ) : null}
        </motion.div>

        <motion.div
          className="wa-sync"
          variants={{
            hidden: { opacity: 0, scale: 0.5 },
            show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } },
          }}
        >
          <motion.span
            animate={
              reduceMotion
                ? undefined
                : { rotate: [0, 180, 360], scale: [1, 1.08, 1] }
            }
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'grid' }}
          >
            <RefreshCw size={22} strokeWidth={1.75} aria-hidden />
          </motion.span>
        </motion.div>

        <motion.div
          className="wa-logo-circle is-crm"
          variants={{
            hidden: { opacity: 0, scale: 0.7, x: 18 },
            show: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.45, ease } },
          }}
        >
          <motion.span
            className="wa-logo-float"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.35,
            }}
          >
            <CrmLogoMark />
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div
        className="wa-hero-badge"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2, ease }}
      >
        <Sparkles size={12} aria-hidden />
        Coming soon
      </motion.div>

      <motion.h2
        id="wa-hero-title"
        className="wa-hero-title"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.24, ease }}
      >
        WhatsApp Campaigns
      </motion.h2>
      <motion.p
        className="wa-hero-desc"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.32, ease }}
      >
        Connect your WhatsApp Business account to automate enquiry
        communication, engage with parents instantly, and streamline admission
        workflows from one centralized CRM platform.
      </motion.p>
    </motion.section>
  );
}

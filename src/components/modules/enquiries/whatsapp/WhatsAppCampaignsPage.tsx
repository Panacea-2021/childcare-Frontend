'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { BenefitCards } from './BenefitCards';
import { FeatureHighlights } from './FeatureHighlights';
import { HeroSection } from './HeroSection';
import { IntegrationInfoCard } from './IntegrationInfoCard';
import { InterestedButton } from './InterestedButton';
import { WhatsAppDecor } from './WhatsAppDecor';
import { WhatsAppHeader } from './WhatsAppHeader';
import '@/components/ui/module.css';
import './whatsapp-campaigns.css';

export function WhatsAppCampaignsPage() {
  const [toast, setToast] = useState(false);
  const reduceMotion = useReducedMotion();

  const showToast = useCallback(() => {
    setToast(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="mod-page wa-page">
      <div className="wa-ambient" aria-hidden>
        <span className="wa-blob b1" />
        <span className="wa-blob b2" />
        <span className="wa-blob b3" />
        <span className="wa-mesh" />
        <WhatsAppDecor />
      </div>

      <div className="wa-page-inner">
        <WhatsAppHeader />

        <motion.div
          className="wa-stack"
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.12 },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <HeroSection />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <BenefitCards />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <InterestedButton onInterested={showToast} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <IntegrationInfoCard />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <FeatureHighlights />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="wa-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: 28, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="wa-toast-ico"
              aria-hidden
              animate={reduceMotion ? undefined : { rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Info size={16} strokeWidth={2} />
            </motion.span>
            <div className="wa-toast-body">
              <strong>Coming soon</strong>
              <p>
                WhatsApp Campaign integration will be available after backend
                integration.
              </p>
            </div>
            <button
              type="button"
              className="wa-toast-close"
              aria-label="Dismiss notification"
              onClick={() => setToast(false)}
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

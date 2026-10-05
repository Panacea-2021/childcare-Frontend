'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { pageMotion, staggerContainer, staggerItem } from '../animations';
import { FacebookConnectionCard } from './FacebookConnectionCard';
import { FacebookHeader } from './FacebookHeader';
import { FeatureHighlights } from './FeatureHighlights';
import { HowItWorksCard } from './HowItWorksCard';
import { PlaceholderIntegrationInfo } from './PlaceholderIntegrationInfo';
import '@/components/ui/module.css';
import './facebook-integration.css';

export function FacebookIntegrationPage() {
  const [toast, setToast] = useState(false);

  const showToast = useCallback(() => {
    setToast(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <motion.div className="mod-page fb-page" {...pageMotion}>
      <FacebookHeader />

      <motion.div
        className="fb-stack"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <FacebookConnectionCard onConnectSimulated={showToast} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <HowItWorksCard />
        </motion.div>

        <motion.div variants={staggerItem}>
          <FeatureHighlights />
        </motion.div>

        <motion.div variants={staggerItem}>
          <PlaceholderIntegrationInfo />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="fb-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="fb-toast-ico" aria-hidden>
              <Info size={16} strokeWidth={2} />
            </span>
            <div className="fb-toast-body">
              <strong>Coming soon</strong>
              <p>Facebook integration will be available after backend integration.</p>
            </div>
            <button
              type="button"
              className="fb-toast-close"
              aria-label="Dismiss notification"
              onClick={() => setToast(false)}
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

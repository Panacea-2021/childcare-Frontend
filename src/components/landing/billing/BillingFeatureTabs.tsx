'use client';

import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BILLING_FEATURES, type BillingFeatureId } from './data';
import { useAutoRotate } from '../enrollments/hooks/useAutoRotate';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { FlexibleBillingMockup } from './mockups/FlexibleBillingMockup';
import { RecurringBillingMockup } from './mockups/RecurringBillingMockup';
import { SubsidyMockup } from './mockups/SubsidyMockup';
import { InvoiceMockup } from './mockups/InvoiceMockup';
import { ReminderMockup } from './mockups/ReminderMockup';

const MOCKUPS: Record<BillingFeatureId, ComponentType<{ reduced: boolean }>> = {
  flexible: FlexibleBillingMockup,
  recurring: RecurringBillingMockup,
  subsidy: SubsidyMockup,
  invoices: InvoiceMockup,
  reminders: ReminderMockup,
};

export function BillingFeatureTabs() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const { activeId, progress, select } = useAutoRotate(BILLING_FEATURES, {
    paused: paused || reduced,
    initialId: 'flexible',
  });

  const active = BILLING_FEATURES.find((f) => f.id === activeId) ?? BILLING_FEATURES[0];
  const Mockup = MOCKUPS[active.id];

  return (
    <div id="bl-features" className="bl-features">
      <div className="bl-featuresAtmosphere" aria-hidden="true">
        <span className="bl-featMesh" />
      </div>

      <motion.div
        className="bl-featuresHead"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.45 }}
      >
        <h2>Built for real childcare billing</h2>
        <p>Flexible billing plans for daycare centers — weekly, monthly, attendance-based</p>
      </motion.div>

      <motion.div
        className="bl-featurePanel"
        initial={reduced ? false : { opacity: 0, y: 22, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
        }}
      >
        <div className="bl-featureNav" role="tablist" aria-label="Billing features">
          <div className="bl-featureProgressTrack" aria-hidden="true">
            <motion.i
              className="bl-featureProgressFill"
              style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
            />
          </div>

          <div className="bl-featureTabs">
            {BILLING_FEATURES.map((feature) => {
              const isActive = feature.id === activeId;
              return (
                <button
                  key={feature.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`bl-featureTab${isActive ? ' is-active' : ''}`}
                  onClick={() => select(feature.id)}
                >
                  <strong>{feature.title}</strong>
                  <span className="bl-featureDescSlot">
                    <AnimatePresence initial={false} mode="wait">
                      {isActive ? (
                        <motion.span
                          key={feature.id}
                          className="bl-featureDesc"
                          initial={reduced ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduced ? undefined : { opacity: 0, y: -4 }}
                          transition={{ duration: 0.22 }}
                        >
                          {feature.description}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bl-featureStage" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="bl-featureVisual"
              initial={reduced ? false : { opacity: 0, scale: 0.97, x: 18 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.97, x: -14 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Mockup reduced={reduced} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

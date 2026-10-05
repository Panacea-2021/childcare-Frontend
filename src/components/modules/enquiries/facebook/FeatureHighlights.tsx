'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Clock3, ClipboardList } from 'lucide-react';
import { cardHoverLift } from '../animations';

const FEATURES = [
  {
    id: 'sync',
    title: 'Instant Sync',
    description: 'Receive new Facebook leads immediately without manual imports.',
    icon: Clock3,
    tone: 'is-clock',
  },
  {
    id: 'forms',
    title: 'Supports All Lead Forms',
    description:
      'Admissions, Tours, General Enquiries, Events, Scholarship Campaigns and more.',
    icon: ClipboardList,
    tone: 'is-forms',
  },
  {
    id: 'convert',
    title: 'Track & Convert',
    description:
      'Manage every Facebook lead through the CRM enquiry pipeline from first contact to admission.',
    icon: BarChart3,
    tone: 'is-chart',
  },
] as const;

export function FeatureHighlights() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="fb-card"
      aria-label="Feature highlights"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="fb-features">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.id}
              className="fb-feature"
              whileHover={reduceMotion ? undefined : cardHoverLift}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.span
                className={`fb-feature-icon ${feature.tone}`}
                aria-hidden
                animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.4,
                }}
              >
                <Icon size={22} strokeWidth={1.85} />
              </motion.span>
              <h3 className="fb-feature-title">{feature.title}</h3>
              <p className="fb-feature-desc">{feature.description}</p>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}

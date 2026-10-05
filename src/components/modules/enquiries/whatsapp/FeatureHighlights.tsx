'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Megaphone, MessageSquare } from 'lucide-react';

const FEATURES = [
  {
    id: 'instant',
    title: 'Instant Messaging',
    description: 'Respond to enquiries immediately through WhatsApp.',
    icon: MessageSquare,
    tone: 'is-msg',
  },
  {
    id: 'broadcast',
    title: 'Broadcast Campaigns',
    description:
      'Send promotional campaigns, announcements, and admission updates to selected audiences.',
    icon: Megaphone,
    tone: 'is-broadcast',
  },
  {
    id: 'analytics',
    title: 'Campaign Analytics',
    description:
      'Track delivery, read rates, responses, and campaign performance after backend integration.',
    icon: BarChart3,
    tone: 'is-analytics',
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function FeatureHighlights() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="wa-card wa-features-card"
      aria-label="Feature highlights"
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.48, ease }}
    >
      <div className="wa-features">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.id}
              className="wa-feature"
              initial={reduceMotion ? false : { opacity: 0, y: 18, x: -6 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -4,
                      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)',
                      transition: { duration: 0.2 },
                    }
              }
            >
              <motion.span
                className={`wa-feature-icon ${feature.tone}`}
                aria-hidden
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        y: [0, -5, 0],
                        scale: [1, 1.06, 1],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.4,
                }}
              >
                <Icon size={22} strokeWidth={1.85} />
              </motion.span>
              <h3 className="wa-feature-title">{feature.title}</h3>
              <p className="wa-feature-desc">{feature.description}</p>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}

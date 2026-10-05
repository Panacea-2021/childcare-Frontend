'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Link2, Zap } from 'lucide-react';
import { staggerContainer, staggerItem } from '../animations';

const STEPS = [
  {
    id: 1,
    title: 'Connect your Facebook account',
    description:
      'Authorize your Facebook Business account securely. We only request the permissions required to access Lead Forms.',
    icon: Link2,
    tone: 'is-link',
  },
  {
    id: 2,
    title: 'Select your Facebook Page & Lead Form',
    description:
      'Choose which Facebook Page and Lead Form should sync into the CRM. Future backend integration will automatically map incoming fields.',
    icon: ClipboardList,
    tone: 'is-form',
  },
  {
    id: 3,
    title: 'Receive leads instantly',
    description:
      'Every new Facebook Lead Ad submission will automatically appear inside the Enquiries module in real time.',
    icon: Zap,
    tone: 'is-bolt',
  },
] as const;

export function HowItWorksCard() {
  return (
    <motion.section
      className="fb-card fb-how"
      aria-labelledby="fb-how-title"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="fb-how-header">
        <p id="fb-how-title" className="fb-how-eyebrow">
          How it works
        </p>
      </header>

      <motion.ol
        className="fb-steps"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <motion.li key={step.id} className="fb-step" variants={staggerItem}>
              <span className="fb-step-num" aria-hidden>
                {step.id}
              </span>
              <span className={`fb-step-icon ${step.tone}`} aria-hidden>
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <div className="fb-step-copy">
                <h3 className="fb-step-title">{step.title}</h3>
                <p className="fb-step-desc">{step.description}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </motion.section>
  );
}

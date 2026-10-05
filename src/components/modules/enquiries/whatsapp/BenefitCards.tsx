'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Users, Zap } from 'lucide-react';

const BENEFITS = [
  {
    id: 'capture',
    title: 'Capture Every Lead',
    description:
      'Automatically convert WhatsApp conversations into enquiries, ensuring every parent interaction is recorded inside the CRM.',
    icon: Users,
    tone: 'is-users',
  },
  {
    id: 'engage',
    title: 'Engage with Parents',
    description:
      'Send messages, images, PDFs, videos, and important updates while maintaining complete communication history.',
    icon: MessageCircle,
    tone: 'is-chat',
  },
  {
    id: 'automate',
    title: 'Automate Follow-Ups',
    description:
      'Automatically trigger WhatsApp reminders for tours, appointments, admissions, fee reminders, follow-ups, and important notifications.',
    icon: Zap,
    tone: 'is-auto',
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease },
  },
};

export function BenefitCards() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      aria-label="WhatsApp campaign benefits"
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.ul
        className="wa-benefits"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
      >
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.li
              key={benefit.id}
              className="wa-benefit"
              variants={item}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -8,
                      scale: 1.02,
                      boxShadow: '0 20px 44px rgba(15, 23, 42, 0.12)',
                      transition: { duration: 0.22, ease },
                    }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            >
              <span className="wa-benefit-shine" aria-hidden />
              <motion.span
                className={`wa-benefit-icon ${benefit.tone}`}
                aria-hidden
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        y: [0, -5, 0],
                        rotate: [0, index % 2 === 0 ? 4 : -4, 0],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.4,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { scale: 1.12, rotate: 0, transition: { duration: 0.2 } }
                }
              >
                <Icon size={24} strokeWidth={1.85} />
              </motion.span>
              <motion.h3
                className="wa-benefit-title"
                initial={reduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.08 }}
              >
                {benefit.title}
              </motion.h3>
              <p className="wa-benefit-desc">{benefit.description}</p>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
}

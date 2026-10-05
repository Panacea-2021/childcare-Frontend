'use client';

import {
  Zap,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FOLLOW_UP_BENEFITS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = [Zap, Mail, MessageSquare, Phone, RefreshCw];

type Props = {
  onSeeInAction: () => void;
};

export function FollowUpFlow({ onSeeInAction }: Props) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="en-follow" aria-labelledby="en-follow-title">
      <div className="en-sectionHead">
        <h2 id="en-follow-title">Automated Follow-Up That Keeps Your Seats Full</h2>
        <p>
          Automatically nurture inquiries, confirm tours and engage waitlisted families
          with personalized enrollment workflows.
        </p>
      </div>

      <div className="en-followLayout">
        <div className="en-followBenefits">
          <ol className="en-timeline">
            {FOLLOW_UP_BENEFITS.map((item, index) => {
              const Icon = ICONS[index] ?? CheckCircle2;
              return (
                <motion.li
                  key={item.id}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <span className="en-timelineIcon" aria-hidden="true">
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
          <button type="button" className="ui-btn ui-btn-primary en-followCta" onClick={onSeeInAction}>
            See it in Action
          </button>
        </div>

        <div className="en-followVisual" aria-hidden="true">
          <div className="en-syncStack">
            <div className="en-profileCard is-back">
              <span className="en-pill en-pill-muted">Inquiry (Lead)</span>
              <div className="en-profileTop">
                <span className="en-avatar">JA</span>
                <div>
                  <strong>Jacob Anderson</strong>
                  <span className="en-pill en-pill-blush">Interested</span>
                </div>
              </div>
              <div className="en-bar" />
              <div className="en-bar" />
            </div>

            <div className="en-profileCard is-front">
              <div className="en-profileTop">
                <span className="en-avatar">JA</span>
                <div>
                  <strong>Jacob Anderson</strong>
                  <span className="en-pill en-pill-mint">Active</span>
                </div>
              </div>
              <div className="en-miniTabs">
                <span className="is-active">Profile</span>
                <span>Programs</span>
                <span>Attendance</span>
                <span>Billing</span>
                <span>Docs</span>
              </div>
              <p className="en-uiLabel">Student Information</p>
              <div className="en-bar" />
              <div className="en-bar" />
              <div className="en-bar short" />
            </div>

            <motion.div
              className="en-syncBadge"
              animate={reduced ? undefined : { rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw size={18} color="#fff" />
            </motion.div>

            <motion.div
              className="en-callout c1"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity }}
            >
              <CheckCircle2 size={14} /> First-Day Reminders Sent
            </motion.div>
            <motion.div
              className="en-callout c2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.6, repeat: Infinity }}
            >
              <Mail size={14} /> Welcome E-Mail Sent
            </motion.div>
            <motion.div
              className="en-callout c3"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FileText size={14} /> Medical Information Form Shared
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

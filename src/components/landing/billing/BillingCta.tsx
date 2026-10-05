'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const FLOATS = ['Invoice Sent', 'Payment Received', 'Subsidy Updated', 'Reminder Scheduled'];

export function BillingCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="bl-cta">
      <div className="bl-ctaSplit">
        <div className="bl-ctaPhoto" aria-hidden="true">
          <div className="bl-ctaPhotoShade" />
          <strong>Warm classrooms. Clear cash flow.</strong>
        </div>
        <div className="bl-ctaInner">
          <div className="bl-ctaCopy">
            <h2>Ready to get paid faster with less work?</h2>
            <p>
              Bring billing, payments, subsidies and financial workflows together with
              Panacea.
            </p>
            <Link href="/book-demo" className="ui-btn ui-btn-primary">
              Book a Demo
            </Link>
          </div>
          <div className="bl-ctaFloats" aria-hidden="true">
            {FLOATS.map((label, i) => (
              <motion.div
                key={label}
                className={`bl-ctaFloat f${i}`}
                animate={reduced ? undefined : { y: [0, -8, 0] }}
                transition={{
                  duration: 3.6 + i * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <CheckCircle2 size={14} />
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

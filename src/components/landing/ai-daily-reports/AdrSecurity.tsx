'use client';

import { ShieldCheck } from 'lucide-react';
import { AdrReveal } from './AdrReveal';
import { slideFromLeft, slideFromRight } from './motion';

export function AdrSecurity() {
  return (
    <div className="adr-security">
      <AdrReveal className="adr-sectionHead adr-center">
        <h2>Security you can trust.</h2>
      </AdrReveal>

      <div className="adr-securityCard glass">
        <AdrReveal className="adr-securityCopy" variants={slideFromLeft}>
          <span className="adr-securityPulse" aria-hidden>
            <ShieldCheck size={22} />
          </span>
          <p className="adr-securityLead">
            Safety, built into every layer. Protecting children&apos;s data isn&apos;t a
            feature, it&apos;s a responsibility.
          </p>
        </AdrReveal>

        <AdrReveal className="adr-securityVisual" variants={slideFromRight}>
          <img
            src="/images/parent-communication/classroom.jpg"
            alt="Child playing safely in a childcare environment"
            width={640}
            height={480}
            loading="lazy"
          />
        </AdrReveal>
      </div>
    </div>
  );
}

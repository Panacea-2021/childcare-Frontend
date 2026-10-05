'use client';

import Link from 'next/link';
import { BlReveal } from './BlReveal';
import { scaleIn } from './motion';

export function BlogCta() {
  return (
    <section className="bl-cta">
      <div className="bl-ctaGlow" aria-hidden />
      <BlReveal className="bl-ctaInner" variants={scaleIn}>
        <h2>Try Our AI-Powered Childcare Platform</h2>
        <p>Revolutionize your childcare operations with AI-powered solutions.</p>
        <div className="bl-ctaActions">
          <Link href="/book-demo" className="ui-btn ui-btn-primary bl-ctaPrimary">
            Get a Free Demo
          </Link>
          <Link href="/contact" className="ui-btn ui-btn-outline bl-ctaSecondary">
            Contact Us
          </Link>
        </div>
        <p className="bl-ctaNote">
          Become part of a network of childcare owners which helps you to reach excellence.{' '}
          <Link href="/contact" className="bl-inlineLink">
            Join Our Community
          </Link>
        </p>
      </BlReveal>
    </section>
  );
}

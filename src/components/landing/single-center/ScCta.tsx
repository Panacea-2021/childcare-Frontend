'use client';

import Link from 'next/link';
import { ScReveal } from './ScReveal';
import { SC_CTA } from './data';

export function ScCta() {
  return (
    <div className="sc-cta">
      <ScReveal className="sc-ctaInner">
        <h2>{SC_CTA.title}</h2>
        <p>{SC_CTA.body}</p>
        <Link href={SC_CTA.ctaHref} className="ui-btn ui-btn-primary sc-btn">
          {SC_CTA.ctaLabel}
        </Link>
      </ScReveal>
    </div>
  );
}

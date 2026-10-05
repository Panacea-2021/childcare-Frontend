'use client';

import Link from 'next/link';
import { DcReveal } from './DcReveal';
import { DC_CTA } from './data';

export function DcCta() {
  return (
    <div className="dc-cta">
      <DcReveal className="dc-ctaInner">
        <h2>{DC_CTA.title}</h2>
        <p>{DC_CTA.body}</p>
        <Link href={DC_CTA.ctaHref} className="ui-btn ui-btn-primary dc-btn">
          {DC_CTA.ctaLabel}
        </Link>
      </DcReveal>
    </div>
  );
}

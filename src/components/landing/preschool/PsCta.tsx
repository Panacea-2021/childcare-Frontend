'use client';

import Link from 'next/link';
import { PsReveal } from './PsReveal';
import { PS_CTA } from './data';

export function PsCta() {
  return (
    <div className="ps-cta">
      <PsReveal className="ps-ctaInner">
        <h2>{PS_CTA.title}</h2>
        <p>{PS_CTA.body}</p>
        <Link href={PS_CTA.ctaHref} className="ui-btn ui-btn-primary ps-btn ps-btnSoft">
          {PS_CTA.ctaLabel}
        </Link>
      </PsReveal>
    </div>
  );
}

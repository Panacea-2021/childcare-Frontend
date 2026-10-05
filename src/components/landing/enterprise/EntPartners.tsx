'use client';

import { LogoMarquee } from '../shared/LogoMarquee';
import { ENT_PARTNERS } from './data';
import { EntReveal } from './EntReveal';

export function EntPartners() {
  return (
    <EntReveal className="ent-partners">
      <LogoMarquee label={ENT_PARTNERS.label} items={[...ENT_PARTNERS.items]} speed={42} />
    </EntReveal>
  );
}

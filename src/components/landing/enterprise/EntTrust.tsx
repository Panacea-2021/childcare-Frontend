'use client';

import { LogoMarquee } from '../shared/LogoMarquee';
import { ENT_TRUST } from './data';
import { EntReveal } from './EntReveal';

export function EntTrust() {
  return (
    <EntReveal className="ent-trust">
      <LogoMarquee label={ENT_TRUST.label} items={[...ENT_TRUST.items]} speed={38} />
    </EntReveal>
  );
}

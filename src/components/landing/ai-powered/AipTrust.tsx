'use client';

import { useState } from 'react';
import { AIP_TRUST } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function TrustLogo({
  label,
  logo,
  domain,
}: {
  label: string;
  logo: string;
  domain: string;
}) {
  const [failed, setFailed] = useState(false);
  const fallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const src = failed ? fallback : logo;

  return (
    <li className="aip-trustLogo">
      <span className="aip-trustLogoMark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </span>
      <em>{label}</em>
    </li>
  );
}

export function AipTrust() {
  const reduced = usePrefersReducedMotion();
  const loop = [...AIP_TRUST, ...AIP_TRUST];

  return (
    <div className="aip-trust">
      <p className="aip-trustLabel">Trusted by childcare centers</p>
      <div
        className={`aip-trustMarquee${reduced ? ' is-static' : ''}`}
        aria-label="Trusted childcare brands"
      >
        <ul
          className="aip-trustTrack"
          style={reduced ? undefined : { animationDuration: '36s' }}
        >
          {loop.map((item, i) => (
            <TrustLogo
              key={`${item.domain}-${i}`}
              label={item.label}
              logo={item.logo}
              domain={item.domain}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

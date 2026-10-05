'use client';

import { useState } from 'react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import './logo-marquee.css';

export type LogoMarqueeItem = {
  label: string;
  domain: string;
};

type Props = {
  label?: string;
  items: readonly LogoMarqueeItem[] | LogoMarqueeItem[];
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
};

function MarqueeLogo({ label, domain }: LogoMarqueeItem) {
  const [failed, setFailed] = useState(false);
  const clearbit = `https://logo.clearbit.com/${domain}`;
  const fallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const src = failed ? fallback : clearbit;

  return (
    <li className="lm-item">
      <span className="lm-mark">
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

export function LogoMarquee({
  label,
  items,
  speed = 36,
  pauseOnHover = true,
  className = '',
}: Props) {
  const reduced = usePrefersReducedMotion();
  const loop = [...items, ...items];

  return (
    <div className={`lm-root ${className}`.trim()}>
      {label ? <p className="lm-label">{label}</p> : null}
      <div
        className={`lm-marquee${reduced ? ' is-static' : ''}${pauseOnHover ? ' is-pauseHover' : ''}`}
        aria-label={label ?? 'Partner logos'}
      >
        <ul
          className="lm-track"
          style={reduced ? undefined : { animationDuration: `${speed}s` }}
        >
          {loop.map((item, i) => (
            <MarqueeLogo
              key={`${item.domain}-${i}`}
              label={item.label}
              domain={item.domain}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

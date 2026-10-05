'use client';

import type { ReactNode } from 'react';
import './curved-band.css';

type Props = {
  children: ReactNode;
  /** Band fill (purple video section) */
  band?: string;
  /** Page background above/below the band */
  edge?: string;
  className?: string;
  id?: string;
};

/**
 * Soft organic SVG curves — white flows into purple band and back out.
 */
export function CurvedBand({
  children,
  band = '#2a1748',
  edge = '#ffffff',
  className = '',
  id = 'cb',
}: Props) {
  const topId = `${id}-top`;
  const botId = `${id}-bot`;
  const glowId = `${id}-glow`;

  return (
    <div className={`curved-band ${className}`.trim()} style={{ background: edge }}>
      <div className="curved-bandWave curved-bandWave--top" aria-hidden style={{ background: band }}>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="curved-bandSvg">
          <defs>
            <linearGradient id={topId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={edge} />
              <stop offset="50%" stopColor={edge} stopOpacity="0.98" />
              <stop offset="100%" stopColor={edge} />
            </linearGradient>
            <linearGradient id={glowId} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(167,139,250,0)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.35)" />
            </linearGradient>
          </defs>
          <path
            d="M0 0h1440v48C1080 48 900 148 720 154C540 148 360 48 0 48V0z"
            fill={`url(#${glowId})`}
          />
          <path
            d="M0 0h1440v36C1100 36 920 142 720 148C520 142 340 36 0 36V0z"
            fill={`url(#${topId})`}
          />
          <path
            className="curved-bandStroke"
            d="M0 36C340 36 520 142 720 148C920 142 1100 36 1440 36"
            fill="none"
            stroke="rgba(196,181,253,0.35)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="curved-bandBody" style={{ background: band }}>
        <span className="curved-bandOrb curved-bandOrb--a" aria-hidden />
        <span className="curved-bandOrb curved-bandOrb--b" aria-hidden />
        {children}
      </div>

      <div className="curved-bandWave curved-bandWave--bot" aria-hidden style={{ background: band }}>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="curved-bandSvg">
          <defs>
            <linearGradient id={botId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={edge} />
              <stop offset="50%" stopColor={edge} stopOpacity="0.98" />
              <stop offset="100%" stopColor={edge} />
            </linearGradient>
          </defs>
          <path
            d="M0 160h1440V112C1080 112 900 12 720 6C540 12 360 112 0 112V160z"
            fill="rgba(167,139,250,0.2)"
          />
          <path
            d="M0 160h1440V124C1100 124 920 18 720 12C520 18 340 124 0 124V160z"
            fill={`url(#${botId})`}
          />
          <path
            className="curved-bandStroke"
            d="M0 124C340 124 520 18 720 12C920 18 1100 124 1440 124"
            fill="none"
            stroke="rgba(196,181,253,0.35)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}

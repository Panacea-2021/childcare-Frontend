'use client';

import './section-wave.css';

export type SectionWaveVariant =
  | 'valley'
  | 'crest'
  | 'softS'
  | 'asymmetric'
  | 'ribbon';

type Props = {
  /** Top fill that “dips” / flows into the next band */
  from: string;
  /** Background of the band below */
  to: string;
  /** Optional hairline along the curve */
  accent?: string;
  variant?: SectionWaveVariant;
  className?: string;
  /** Unique SVG paint id prefix when multiple waves share a page */
  id?: string;
};

const PATHS: Record<
  SectionWaveVariant,
  { fill: string; stroke: string; glow?: string; fill2?: string }
> = {
  /* Soft U — like AI Daily Reports stats → security */
  valley: {
    glow: 'M0 0h1440v48C1080 48 900 188 720 196C540 188 360 48 0 48V0z',
    fill: 'M0 0h1440v36C1100 36 920 172 720 180C520 172 340 36 0 36V0z',
    stroke: 'M0 36C340 36 520 172 720 180C920 172 1100 36 1440 36',
  },
  /* Gentle rise into the next section */
  crest: {
    glow: 'M0 80h1440V200H0z',
    fill: 'M0 0h1440v120C1100 40 900 8 720 8C540 8 340 40 0 120V0z',
    stroke: 'M0 120C340 40 540 8 720 8C900 8 1100 40 1440 120',
  },
  /* Soft S / wave rhythm */
  softS: {
    glow: 'M0 0h1440v70C1200 40 1000 120 720 110C440 100 240 30 0 70V0z',
    fill: 'M0 0h1440v52C1180 28 980 118 720 108C460 98 260 22 0 52V0z',
    stroke: 'M0 52C260 22 460 98 720 108C980 118 1180 28 1440 52',
  },
  /* Off-center dip for visual variety */
  asymmetric: {
    glow: 'M0 0h1440v56C1000 40 780 190 520 188C280 186 160 60 0 56V0z',
    fill: 'M0 0h1440v40C1040 28 800 178 520 176C280 174 140 48 0 40V0z',
    stroke: 'M0 40C140 48 280 174 520 176C800 178 1040 28 1440 40',
  },
  /* Double-layer ribbon */
  ribbon: {
    glow: 'M0 0h1440v60C1100 50 900 150 720 155C540 150 340 50 0 60V0z',
    fill: 'M0 0h1440v34C1120 34 940 130 720 136C500 130 320 34 0 34V0z',
    fill2: 'M0 34C320 34 500 118 720 124C940 118 1120 34 1440 34V48C1120 48 940 142 720 148C500 142 320 48 0 48V34z',
    stroke: 'M0 34C320 34 500 118 720 124C940 118 1120 34 1440 34',
  },
};

export function SectionWave({
  from,
  to,
  accent = 'rgba(120, 80, 180, 0.22)',
  variant = 'valley',
  className = '',
  id = 'sw',
}: Props) {
  const paths = PATHS[variant];
  const gid = `${id}-${variant}`;

  return (
    <div
      className={`section-wave section-wave--${variant} ${className}`.trim()}
      style={{ background: to }}
      aria-hidden
    >
      <svg
        className="section-waveSvg"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${gid}-glow`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="70%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${gid}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="50%" stopColor={from} stopOpacity="0.98" />
            <stop offset="100%" stopColor={from} />
          </linearGradient>
        </defs>

        {paths.glow ? (
          <path d={paths.glow} fill={`url(#${gid}-glow)`} />
        ) : null}

        <path
          className="section-waveFill"
          d={paths.fill}
          fill={`url(#${gid}-fill)`}
        />

        {paths.fill2 ? (
          <path d={paths.fill2} fill={to} opacity="0.55" />
        ) : null}

        <path
          className="section-waveStroke"
          d={paths.stroke}
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

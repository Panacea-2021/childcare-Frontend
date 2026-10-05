'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { CertificateTemplate, CertificateTheme } from './toolsData';
import {
  fontFamilyCss,
  fontWeightValue,
  type CertificateStyleState,
  type TextStyle,
} from './certificateStyles';

export type CertificatePreviewProps = {
  template: CertificateTemplate;
  styles?: CertificateStyleState;
  title?: string;
  subtitle?: string;
  studentName?: string;
  bodyText?: string;
  signatory?: string;
  schoolName?: string;
  dateLabel?: string;
  size?: 'sm' | 'lg';
};

function styleCss(s: TextStyle, extra?: CSSProperties): CSSProperties {
  return {
    color: s.color,
    fontSize: `${s.fontSize}px`,
    fontFamily: fontFamilyCss(s.fontFamily),
    fontWeight: fontWeightValue(s.fontWeight),
    ...extra,
  };
}

function SchoolMark({ light }: { light?: boolean }) {
  return (
    <span className={`certv-logo ${light ? 'is-light' : ''}`} aria-hidden>
      <svg width="28" height="28" viewBox="0 0 40 40">
        <path
          d="M20 4 L34 14 L28 32 L12 32 L6 14 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M20 10 L28 16 L20 28 L12 16 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

function Bunting() {
  return (
    <div className="certv-bunting" aria-hidden>
      {Array.from({ length: 11 }).map((_, i) => (
        <span key={i} className={`flag f${(i % 5) + 1}`} />
      ))}
    </div>
  );
}

function ThemeArt({ theme, uid }: { theme: CertificateTheme; uid: string }) {
  if (theme === 'pastel') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-p1`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8B4A8" />
            <stop offset="100%" stopColor="#F5C6B8" />
          </linearGradient>
          <linearGradient id={`${uid}-p2`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9D9A8" />
            <stop offset="100%" stopColor="#A8C99A" />
          </linearGradient>
          <linearGradient id={`${uid}-p3`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#F2D08A" />
            <stop offset="100%" stopColor="#E8B86D" />
          </linearGradient>
          <linearGradient id={`${uid}-p4`} x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#9EC9D8" />
            <stop offset="100%" stopColor="#7EB6C9" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="40" rx="160" ry="140" fill={`url(#${uid}-p1)`} opacity="0.9" />
        <ellipse cx="760" cy="50" rx="140" ry="120" fill={`url(#${uid}-p2)`} opacity="0.85" />
        <ellipse cx="60" cy="520" rx="150" ry="130" fill={`url(#${uid}-p3)`} opacity="0.85" />
        <ellipse cx="760" cy="510" rx="170" ry="140" fill={`url(#${uid}-p4)`} opacity="0.9" />
        <circle cx="120" cy="90" r="4" fill="#C4A35A" opacity="0.55" />
        <circle cx="145" cy="105" r="3" fill="#C4A35A" opacity="0.45" />
        <circle cx="110" cy="118" r="3.5" fill="#C4A35A" opacity="0.4" />
      </svg>
    );
  }

  if (theme === 'playful') {
    return (
      <>
        <Bunting />
        <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
          <circle cx="70" cy="480" r="28" fill="#86EFAC" opacity="0.7" />
          <circle cx="740" cy="470" r="22" fill="#F9A8D4" opacity="0.7" />
          <circle cx="90" cy="70" r="18" fill="#FDE047" opacity="0.75" />
          <path d="M700 80 Q740 60 760 100 Q720 110 700 80" fill="#93C5FD" opacity="0.7" />
          <rect x="40" y="500" width="18" height="18" rx="3" fill="#60A5FA" transform="rotate(18 49 509)" opacity="0.65" />
        </svg>
      </>
    );
  }

  if (theme === 'starry') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        <rect width="800" height="560" fill="#0F1B3D" />
        <circle cx="80" cy="70" r="1.5" fill="#fff" />
        <circle cx="160" cy="120" r="1" fill="#fff" />
        <circle cx="240" cy="50" r="1.5" fill="#fff" />
        <circle cx="320" cy="140" r="1" fill="#fff" />
        <circle cx="420" cy="40" r="1.2" fill="#fff" />
        <circle cx="520" cy="100" r="1.5" fill="#fff" />
        <circle cx="620" cy="60" r="1" fill="#fff" />
        <circle cx="700" cy="130" r="1.4" fill="#fff" />
        <circle cx="760" cy="40" r="1" fill="#fff" />
        <circle cx="100" cy="480" r="1.2" fill="#fff" />
        <circle cx="300" cy="500" r="1" fill="#fff" />
        <circle cx="550" cy="470" r="1.5" fill="#fff" />
        <circle cx="720" cy="510" r="1" fill="#fff" />
        <circle cx="70" cy="70" r="16" fill="#FBBF24" />
        <path d="M58 86 L54 110 L70 98 L86 110 L82 86" fill="#3B82F6" />
        <rect x="48" y="48" width="704" height="464" rx="18" fill="#fff" />
      </svg>
    );
  }

  if (theme === 'graduation') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        <rect width="800" height="560" fill="#fff" />
        <path d="M0 0 H180 L0 160 Z" fill="#FDBA74" />
        <path d="M800 0 H620 L800 160 Z" fill="#FACC15" />
        <rect x="0" y="520" width="800" height="40" fill="#86EFAC" opacity="0.85" />
        <circle cx="90" cy="470" r="10" fill="#FDE68A" opacity="0.7" />
        <circle cx="710" cy="460" r="12" fill="#F9A8D4" opacity="0.55" />
      </svg>
    );
  }

  if (theme === 'geo') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern
            id={`${uid}-stripe`}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <rect width="7" height="14" fill="#FACC15" />
            <rect x="7" width="7" height="14" fill="#fff" />
          </pattern>
        </defs>
        <path d="M0 0 H220 L0 200 Z" fill="#5D5FEF" />
        <path d="M0 0 H130 L0 120 Z" fill="#F59E0B" opacity="0.9" />
        <path d="M800 560 H580 L800 360 Z" fill="#38BDF8" />
        <path d="M800 560 H680 L800 440 Z" fill="#F97316" opacity="0.85" />
        <rect x="520" y="18" width="250" height="14" fill={`url(#${uid}-stripe)`} />
        <rect x="30" y="528" width="250" height="14" fill={`url(#${uid}-stripe)`} />
      </svg>
    );
  }

  if (theme === 'chevron') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <path
              d={`M20 ${40 + i * 60} L44 ${70 + i * 60} L20 ${100 + i * 60}`}
              fill="none"
              stroke="#5D5FEF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
            <path
              d={`M780 ${40 + i * 60} L756 ${70 + i * 60} L780 ${100 + i * 60}`}
              fill="none"
              stroke="#5D5FEF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          </g>
        ))}
      </svg>
    );
  }

  if (theme === 'classic') {
    return (
      <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
        <rect width="800" height="560" fill="#FFFBEB" />
        <rect x="18" y="18" width="764" height="524" rx="10" fill="none" stroke="#F59E0B" strokeWidth="3" />
        <rect x="28" y="28" width="744" height="504" rx="8" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.7" />
        <circle cx="400" cy="70" r="18" fill="none" stroke="#D97706" strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }

  // modern
  return (
    <svg className="certv-art" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-mw`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5D5FEF" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" fill="#EEF2FF" />
      <path
        d="M0 0 C200 80 280 40 400 0 L400 70 C280 90 200 120 0 70 Z"
        fill={`url(#${uid}-mw)`}
        opacity="0.35"
      />
      <path
        d="M800 560 C600 480 520 520 400 560 L400 490 C520 470 600 440 800 490 Z"
        fill={`url(#${uid}-mw)`}
        opacity="0.3"
      />
      <circle cx="90" cy="450" r="50" fill="#C7D2FE" opacity="0.45" />
      <circle cx="720" cy="100" r="60" fill="#A5B4FC" opacity="0.35" />
    </svg>
  );
}

export function CertificatePreview({
  template,
  styles,
  title,
  subtitle,
  studentName,
  bodyText,
  signatory,
  schoolName,
  dateLabel,
  size = 'sm',
}: CertificatePreviewProps) {
  const school = styles?.schoolName.text ?? schoolName ?? 'Panacea | Childcare';
  const heading = styles?.header.text ?? title ?? template.title;
  const sub = styles?.subheader.text ?? subtitle ?? 'This Certificate is Proudly Presented To :';
  const name = studentName ?? styles?.name.text ?? template.sampleName;
  const body = styles?.body.text ?? bodyText ?? template.description;
  const dateText = styles?.date.label ?? dateLabel ?? 'Date';
  const signText = styles?.signature.label ?? signatory ?? 'Signature';
  const showDate = styles ? styles.date.enabled : true;
  const showSign = styles ? styles.signature.enabled : true;
  const outlined =
    styles?.name.outlined ?? (template.theme === 'pastel' || template.theme === 'playful');

  const scale = size === 'sm';
  const schoolStyle = styles
    ? styleCss(styles.schoolName, {
        fontSize: scale ? `${Math.max(10, styles.schoolName.fontSize * 0.45)}px` : undefined,
      })
    : undefined;
  const headerStyle = styles
    ? styleCss(styles.header, {
        fontSize: scale ? `${Math.max(12, styles.header.fontSize * 0.42)}px` : undefined,
      })
    : undefined;
  const subStyle = styles
    ? styleCss(styles.subheader, {
        fontSize: scale ? `${Math.max(9, styles.subheader.fontSize * 0.5)}px` : undefined,
      })
    : undefined;
  const nameStyle = styles
    ? styleCss(styles.name, {
        fontSize: scale ? `${Math.max(18, styles.name.fontSize * 0.42)}px` : undefined,
        WebkitTextStroke: outlined ? '1.35px #1f2937' : undefined,
        color: outlined ? 'transparent' : styles.name.color,
        paintOrder: outlined ? 'stroke fill' : undefined,
      })
    : undefined;
  const bodyStyle = styles
    ? styleCss(styles.body, {
        fontSize: scale ? `${Math.max(8, styles.body.fontSize * 0.55)}px` : undefined,
      })
    : undefined;
  const dateStyle = styles
    ? styleCss(styles.date, {
        fontSize: scale ? `${Math.max(8, styles.date.fontSize * 0.55)}px` : undefined,
      })
    : undefined;
  const signStyle = styles
    ? styleCss(styles.signature, {
        fontSize: scale ? `${Math.max(8, styles.signature.fontSize * 0.55)}px` : undefined,
      })
    : undefined;

  const foot = (
    <footer className="certv-foot">
      {showDate ? (
        <div className="certv-sign-block" style={dateStyle}>
          <span className="certv-line dotted" />
          <span>{dateText}</span>
        </div>
      ) : (
        <div className="certv-sign-block is-empty" />
      )}
      {showSign ? (
        <div className="certv-sign-block" style={signStyle}>
          {styles?.signature.imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={styles.signature.imageDataUrl} alt="" className="certv-sign-image" />
          ) : null}
          <span className="certv-line dotted" />
          <span>{signText}</span>
        </div>
      ) : (
        <div className="certv-sign-block is-empty" />
      )}
    </footer>
  );

  const content: ReactNode = (
    <>
      <header className="certv-brand">
        <SchoolMark />
        <p style={schoolStyle}>{school}</p>
      </header>
      <h3 className="certv-title" style={headerStyle}>
        {heading}
      </h3>
      <p className="certv-subtitle" style={subStyle}>
        {sub}
      </p>
      <p className={`certv-name ${outlined ? 'is-outlined' : ''}`} style={nameStyle}>
        {name}
      </p>
      <p className="certv-body" style={bodyStyle}>
        {body}
      </p>
      {foot}
    </>
  );

  const uid = `${template.id}-${size}-${name.replace(/\s+/g, '').slice(0, 12)}`;

  return (
    <article className={`certv theme-${template.theme} size-${size}`} data-theme={template.theme}>
      <ThemeArt theme={template.theme} uid={uid} />
      <div className={`certv-inner ${template.theme === 'starry' ? 'is-inset' : ''}`}>{content}</div>
    </article>
  );
}

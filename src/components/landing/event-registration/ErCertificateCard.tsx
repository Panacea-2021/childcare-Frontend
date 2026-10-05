'use client';

import { motion } from 'framer-motion';
import type { EventCertificate } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  certificate: EventCertificate;
};

function CertificateSeal() {
  return (
    <div className="er-certSeal" aria-hidden>
      <svg viewBox="0 0 120 140" className="er-certSealSvg">
        <defs>
          <linearGradient id="erSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="55%" stopColor="#5d5fef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="erSealShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* ribbon tails */}
        <path d="M42 98 L34 132 L48 118 L54 134 Z" fill="#6d28d9" />
        <path d="M78 98 L86 132 L72 118 L66 134 Z" fill="#5b21b6" />
        {/* outer seal */}
        <circle cx="60" cy="58" r="46" fill="url(#erSealGrad)" />
        <circle cx="60" cy="58" r="46" fill="url(#erSealShine)" />
        <circle cx="60" cy="58" r="38" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
        <circle cx="60" cy="58" r="32" fill="none" stroke="#ede9fe" strokeWidth="1.2" opacity="0.7" />
        {/* center band */}
        <rect x="18" y="48" width="84" height="20" rx="3" fill="#fff" />
        <text
          x="60"
          y="40"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
          fontFamily="Poppins, sans-serif"
        >
          Earn
        </text>
        <text
          x="60"
          y="62"
          textAnchor="middle"
          fill="#312e81"
          fontSize="7.5"
          fontWeight="700"
          fontFamily="Poppins, sans-serif"
        >
          Professional Development
        </text>
        <text
          x="60"
          y="82"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
          fontFamily="Poppins, sans-serif"
        >
          Certificate
        </text>
      </svg>
      <span className="er-certSealGlow" />
    </div>
  );
}

export function ErCertificateCard({ certificate }: Props) {
  const reduced = usePrefersReducedMotion();
  if (!certificate.enabled) return null;

  return (
    <motion.aside
      className="er-cert"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={
        reduced
          ? undefined
          : { y: -4, rotateX: 2, rotateY: -2, transition: { duration: 0.35 } }
      }
    >
      <div className="er-certShine" aria-hidden />
      <CertificateSeal />
      <div className="er-certCopy">
        <h3>{certificate.title}</h3>
        {certificate.description ? <p>{certificate.description}</p> : null}
      </div>
    </motion.aside>
  );
}

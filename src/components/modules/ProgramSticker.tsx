'use client';

import { motion } from 'framer-motion';
import styles from './programMotion.module.css';

export type ProgramStickerKind = 'star' | 'balloon' | 'sun';

type Props = {
  /** Unique sticker per Program page */
  kind?: ProgramStickerKind;
};

/** Soft pastel school stickers for Program module titles. */
export function ProgramSticker({ kind = 'star' }: Props) {
  return (
    <motion.span
      className={styles.sticker}
      aria-hidden
      animate={{
        y: [0, -5, 0, -3, 0],
        rotate: kind === 'balloon' ? [0, -4, 3, -2, 0] : [0, 8, -6, 4, 0],
        scale: [1, 1.06, 1, 1.04, 1],
      }}
      transition={{
        duration: kind === 'sun' ? 5.2 : 4.6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {kind === 'star' ? <StarSvg /> : null}
      {kind === 'balloon' ? <BalloonSvg /> : null}
      {kind === 'sun' ? <SunSvg /> : null}
    </motion.span>
  );
}

function StarSvg() {
  return (
    <svg className={styles.stickerSvg} viewBox="0 0 32 32" width="28" height="28" fill="none">
      <path
        d="M16 3.2l3.1 7.1 7.7.8-5.8 5 1.8 7.5L16 19.8l-6.8 3.8 1.8-7.5-5.8-5 7.7-.8L16 3.2Z"
        fill="url(#progStarFill)"
        stroke="url(#progStarStroke)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="13.2" r="2.1" fill="#fff" opacity="0.55" />
      <path
        d="M26.5 7.5l1.2 2.4 2.5.3-1.9 1.6.6 2.4-2.4-1.3-2.4 1.3.6-2.4-1.9-1.6 2.5-.3 1.2-2.4Z"
        fill="#F9A8D4"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="progStarFill" x1="6" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.45" stopColor="#F9A8D4" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id="progStarStroke" x1="8" y1="5" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BalloonSvg() {
  return (
    <svg className={styles.stickerSvg} viewBox="0 0 32 32" width="28" height="28" fill="none">
      <ellipse cx="16" cy="12.5" rx="8.2" ry="9.4" fill="url(#progBalloonFill)" />
      <ellipse cx="13.2" cy="9.2" rx="2.4" ry="3.2" fill="#fff" opacity="0.45" />
      <path d="M16 21.6c0 0-1.4 1.6-.2 2.8 1.1 1.1.4 2.2.4 2.2" stroke="#94A3B8" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14.6 21.2h2.8l-1.4 1.7-1.4-1.7Z" fill="#E879A9" />
      <circle cx="24.5" cy="6.5" r="1.3" fill="#FDE68A" />
      <circle cx="7.5" cy="8" r="1" fill="#C4B5FD" />
      <defs>
        <linearGradient id="progBalloonFill" x1="8" y1="4" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9A8D4" />
          <stop offset="0.55" stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#93C5FD" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SunSvg() {
  return (
    <svg className={styles.stickerSvg} viewBox="0 0 32 32" width="28" height="28" fill="none">
      <circle cx="16" cy="16" r="6.2" fill="url(#progSunFill)" />
      <circle cx="14.4" cy="14.2" r="1.8" fill="#fff" opacity="0.4" />
      <g stroke="url(#progSunRay)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 3.8v3.2" />
        <path d="M16 25v3.2" />
        <path d="M3.8 16h3.2" />
        <path d="M25 16h3.2" />
        <path d="M7.2 7.2l2.3 2.3" />
        <path d="M22.5 22.5l2.3 2.3" />
        <path d="M24.8 7.2l-2.3 2.3" />
        <path d="M9.5 22.5l-2.3 2.3" />
      </g>
      <defs>
        <linearGradient id="progSunFill" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="progSunRay" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F472B6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

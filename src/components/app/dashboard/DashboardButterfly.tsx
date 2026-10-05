'use client';

import { motion } from 'framer-motion';

/** Small decorative butterfly for Center Dashboard heading — CSS/SVG only */
export function DashboardButterfly() {
  return (
    <motion.span
      className="dash-butterfly"
      aria-hidden
      animate={{
        y: [0, -6, 0, -4, 0],
        x: [0, 3, 0, -2, 0],
        rotate: [0, 4, -3, 2, 0],
      }}
      transition={{
        duration: 5.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg className="dash-butterflySvg" viewBox="0 0 32 32" width="28" height="28" fill="none">
        <g className="dash-butterflyWing dash-butterflyWingL">
          <path
            d="M15.2 16.2C11.2 14.4 7.4 11.2 6.2 7.8c-.6-1.7.4-3.2 2-3.1 2.8.2 5.6 3.2 7 6.8-.2 1.6-.1 3.1 0 4.7Z"
            fill="url(#dashBfWing)"
            opacity="0.92"
          />
          <path
            d="M15.1 16.5c-3.6 1.2-7.2 4.2-7.8 7.4-.3 1.7.9 2.9 2.4 2.5 2.6-.7 5.2-3.8 5.8-7.4.1-1 .1-1.7-.4-2.5Z"
            fill="url(#dashBfWing2)"
            opacity="0.88"
          />
        </g>
        <g className="dash-butterflyWing dash-butterflyWingR">
          <path
            d="M16.8 16.2c4-1.8 7.8-5 9-8.4.6-1.7-.4-3.2-2-3.1-2.8.2-5.6 3.2-7 6.8.2 1.6.1 3.1 0 4.7Z"
            fill="url(#dashBfWing)"
            opacity="0.92"
          />
          <path
            d="M16.9 16.5c3.6 1.2 7.2 4.2 7.8 7.4.3 1.7-.9 2.9-2.4 2.5-2.6-.7-5.2-3.8-5.8-7.4-.1-1-.1-1.7.4-2.5Z"
            fill="url(#dashBfWing2)"
            opacity="0.88"
          />
        </g>
        <ellipse cx="16" cy="16.5" rx="1.15" ry="5.2" fill="#64748B" opacity="0.75" />
        <circle cx="16" cy="11.2" r="1.35" fill="#475569" />
        <path d="M15.2 10.2C14.2 8.4 13.1 7.4 12 7" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M16.8 10.2C17.8 8.4 18.9 7.4 20 7" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
        <defs>
          <linearGradient id="dashBfWing" x1="6" y1="5" x2="22" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9A8D4" />
            <stop offset="0.5" stopColor="#C4B5FD" />
            <stop offset="1" stopColor="#BFDBFE" />
          </linearGradient>
          <linearGradient id="dashBfWing2" x1="8" y1="16" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBCFE8" />
            <stop offset="0.55" stopColor="#DDD6FE" />
            <stop offset="1" stopColor="#BAE6FD" />
          </linearGradient>
        </defs>
      </svg>
    </motion.span>
  );
}

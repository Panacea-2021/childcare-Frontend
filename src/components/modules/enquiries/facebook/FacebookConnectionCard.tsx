'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { FacebookGlyph } from './FacebookGlyph';

type Props = {
  onConnectSimulated: () => void;
};

function CrmLogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden>
      <path
        d="M20 4 L34 14 L28 32 L12 32 L6 14 Z"
        fill="none"
        stroke="#6B7280"
        strokeWidth="2.2"
      />
      <path
        d="M20 10 L28 16 L20 28 L12 16 Z"
        fill="none"
        stroke="#5D5FEF"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type Ripple = { id: number; x: number; y: number };

export function FacebookConnectionCard({ onConnectSimulated }: Props) {
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const handleConnect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (loading) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const id = ++rippleId.current;
      setRipples((prev) => [
        ...prev,
        {
          id,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      ]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 560);

      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        onConnectSimulated();
      }, reduceMotion ? 200 : 900);
    },
    [loading, onConnectSimulated, reduceMotion],
  );

  return (
    <motion.section
      className="fb-card fb-connect"
      aria-labelledby="fb-connect-title"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="fb-logos" aria-hidden>
        <motion.div
          className="fb-logo-circle is-facebook"
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FacebookGlyph size={34} />
        </motion.div>

        <motion.div
          className="fb-arrow"
          animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], x: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight size={22} strokeWidth={1.75} aria-hidden />
        </motion.div>

        <motion.div
          className="fb-logo-circle is-crm"
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.35,
          }}
        >
          <CrmLogoMark />
        </motion.div>
      </div>

      <h2 id="fb-connect-title" className="fb-connect-title">
        Connect your Facebook account
      </h2>
      <p className="fb-connect-desc">
        Get your Facebook leads delivered instantly into the CRM, allowing your team to
        access, engage, and convert them effortlessly from one centralized platform.
      </p>

      <div className="fb-connect-actions">
        <motion.button
          ref={btnRef}
          type="button"
          className="fb-connect-btn"
          onClick={handleConnect}
          disabled={loading}
          aria-label="Connect to Facebook"
          aria-busy={loading}
          whileHover={loading || reduceMotion ? undefined : { scale: 1.03, y: -2 }}
          whileTap={loading || reduceMotion ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {ripples.map((r) => (
            <span
              key={r.id}
              className="fb-connect-btn-ripple"
              style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
            />
          ))}
          {loading ? (
            <span className="fb-connect-spinner" aria-hidden />
          ) : (
            <FacebookGlyph size={18} />
          )}
          {loading ? 'Connecting…' : 'Connect to Facebook'}
        </motion.button>

        <ConnectionStatus status="not_connected" />
      </div>
    </motion.section>
  );
}

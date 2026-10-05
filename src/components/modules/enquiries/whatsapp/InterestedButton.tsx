'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { WhatsAppGlyph } from './WhatsAppGlyph';

type Props = {
  onInterested: () => void;
};

type Ripple = { id: number; x: number; y: number };

export function InterestedButton({ onInterested }: Props) {
  const reduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pulse, setPulse] = useState(0);
  const rippleId = useRef(0);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
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

      setPulse((p) => p + 1);
      onInterested();
    },
    [onInterested],
  );

  return (
    <motion.div
      className="wa-cta-wrap"
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {!reduceMotion ? (
        <motion.span
          key={pulse}
          className="wa-cta-aura"
          aria-hidden
          initial={{ opacity: 0.55, scale: 0.85 }}
          animate={{ opacity: 0, scale: 1.55 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ) : null}

      <motion.button
        type="button"
        className="wa-cta-btn"
        onClick={handleClick}
        aria-label="I'm Interested in WhatsApp Campaigns"
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.05,
                y: -3,
                boxShadow:
                  '0 18px 40px rgba(18, 140, 126, 0.45), 0 0 0 6px rgba(37, 211, 102, 0.16)',
              }
        }
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  '0 12px 28px rgba(18, 140, 126, 0.3), 0 0 0 0 rgba(37, 211, 102, 0.2)',
                  '0 14px 32px rgba(18, 140, 126, 0.38), 0 0 0 5px rgba(37, 211, 102, 0.12)',
                  '0 12px 28px rgba(18, 140, 126, 0.3), 0 0 0 0 rgba(37, 211, 102, 0.2)',
                ],
              }
        }
        transition={{
          boxShadow: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
          default: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <span className="wa-cta-shine" aria-hidden />
        {ripples.map((r) => (
          <span
            key={r.id}
            className="wa-cta-btn-ripple"
            style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
          />
        ))}
        <motion.span
          className="wa-cta-icon"
          animate={reduceMotion ? undefined : { rotate: [0, -8, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WhatsAppGlyph size={18} />
        </motion.span>
        I&apos;m Interested
      </motion.button>
    </motion.div>
  );
}

'use client';

import { memo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

type Props = {
  loading?: boolean;
  label?: string;
  onClick: () => void;
};

function GenerateButtonBase({ loading, label = 'Generate Report', onClick }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    onClick();
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className="rp-gen-btn"
      onClick={handleClick}
      disabled={loading}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <span
            key={r.id}
            className="rp-gen-ripple"
            style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16 }}
          />
        ))}
      </AnimatePresence>
      {loading ? (
        <>
          <Loader2 size={16} className="rp-spin" />
          Generating…
        </>
      ) : (
        <>
          {label}
          <motion.span className="rp-gen-arrow" aria-hidden>
            <ArrowRight size={16} />
          </motion.span>
        </>
      )}
    </button>
  );
}

export const GenerateButton = memo(GenerateButtonBase);

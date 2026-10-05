'use client';

import { motion } from 'framer-motion';
import { Download, Layers } from 'lucide-react';
import { AnimatedBadge } from './AnimatedBadge';

type Props = {
  total: number;
  busy: boolean;
  onDownloadOne: () => void;
  onDownloadAll: () => void;
};

export function DownloadActions({ total, busy, onDownloadOne, onDownloadAll }: Props) {
  return (
    <div className="slq-downloads" aria-label="Download actions">
      <motion.button
        type="button"
        className="slq-dl slq-dl-primary"
        onClick={onDownloadOne}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      >
        <span className="slq-dl-ripple" aria-hidden />
        <span className="slq-dl-icon" aria-hidden>
          <Download size={18} />
        </span>
        <span className="slq-dl-copy">
          <strong>Download Current QR</strong>
          <em>PNG · ready to print</em>
        </span>
      </motion.button>

      {total > 1 ? (
        <motion.button
          type="button"
          className="slq-dl slq-dl-secondary"
          onClick={onDownloadAll}
          disabled={busy}
          whileHover={busy ? undefined : { y: -2 }}
          whileTap={busy ? undefined : { scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          aria-busy={busy}
        >
          <span className="slq-dl-ripple" aria-hidden />
          <span className="slq-dl-icon" aria-hidden>
            <Layers size={18} />
          </span>
          <span className="slq-dl-copy">
            <strong>{busy ? 'Preparing…' : 'Download All QR Codes'}</strong>
            <em>Export every selected card</em>
          </span>
          <AnimatedBadge tone="soft" className="slq-dl-count">
            {total} QR Codes
          </AnimatedBadge>
        </motion.button>
      ) : null}
    </div>
  );
}

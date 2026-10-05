'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

type Props = {
  progress: number;
  label?: string;
};

export const ImportProgress = memo(function ImportProgress({
  progress,
  label = 'Uploading…',
}: Props) {
  return (
    <div className="enq-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="enq-progress-track">
        <motion.div
          className="enq-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <p className="enq-progress-label">
        {label} {Math.round(progress)}%
      </p>
    </div>
  );
});

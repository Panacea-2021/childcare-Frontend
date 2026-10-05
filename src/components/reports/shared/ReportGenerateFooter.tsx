'use client';

import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';

type Props = {
  generating: boolean;
  onCancel: () => void;
  onGenerate: () => void;
  generateLabel?: string;
  generatingLabel?: string;
};

export function ReportGenerateFooter({
  generating,
  onCancel,
  onGenerate,
  generateLabel = 'Generate Report',
  generatingLabel = 'Generating…',
}: Props) {
  return (
    <>
      <motion.button
        type="button"
        className="ui-btn ui-btn-outline asr-btn-cancel"
        onClick={onCancel}
        disabled={generating}
        whileHover={generating ? undefined : { y: -1 }}
        whileTap={generating ? undefined : { scale: 0.98 }}
      >
        Cancel
      </motion.button>
      <motion.button
        type="button"
        className="ui-btn ui-btn-primary asr-btn-generate"
        onClick={onGenerate}
        disabled={generating}
        whileHover={generating ? undefined : { y: -2 }}
        whileTap={generating ? undefined : { scale: 0.98 }}
        aria-busy={generating}
      >
        {generating ? (
          <>
            <Loader2 size={16} className="asr-spin" aria-hidden />
            {generatingLabel}
          </>
        ) : (
          <>
            <BarChart3 size={16} aria-hidden />
            {generateLabel}
          </>
        )}
      </motion.button>
    </>
  );
}

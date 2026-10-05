'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { getStageIcon } from './stage-icon';

type Props = {
  stages: EnquiryStageConfig[];
};

export const StagePipelinePreview = memo(function StagePipelinePreview({ stages }: Props) {
  const ordered = [...stages].filter((s) => s.active).sort((a, b) => a.order - b.order);

  if (!ordered.length) {
    return (
      <div className="enq-pipeline enq-pipeline-empty">
        No active stages to preview. Enable a stage to see the pipeline.
      </div>
    );
  }

  return (
    <div className="enq-pipeline" aria-label="Stage pipeline preview">
      {ordered.map((stage, index) => {
        const Icon = getStageIcon(stage.icon);
        return (
          <div key={stage.id} className="enq-pipeline-step">
            <motion.span
              className="enq-pipeline-badge"
              style={{
                background: `color-mix(in srgb, ${stage.color} 16%, #fff)`,
                color: stage.color,
                borderColor: `color-mix(in srgb, ${stage.color} 35%, transparent)`,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.28 }}
            >
              <Icon size={14} aria-hidden />
              {stage.name}
            </motion.span>
            {index < ordered.length - 1 ? (
              <motion.span
                className="enq-pipeline-connector"
                aria-hidden
                initial={{ opacity: 0, scaleY: 0.4 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: index * 0.05 + 0.08, duration: 0.25 }}
              >
                <ChevronDown size={16} />
              </motion.span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

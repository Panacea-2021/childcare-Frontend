'use client';

import { memo } from 'react';
import type { EnquiryRecord } from '../types';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { EnquiryCard } from './enquiry-card';

type Props = {
  item: EnquiryRecord | null;
  stageColor?: string;
  stages?: EnquiryStageConfig[];
};

export const EnquiryDragOverlay = memo(function EnquiryDragOverlay({
  item,
  stageColor,
  stages = [],
}: Props) {
  if (!item) return null;
  return (
    <EnquiryCard
      item={item}
      stageColor={stageColor}
      stages={stages}
      onView={() => undefined}
      onEdit={() => undefined}
      onTour={() => undefined}
      onQuickMove={() => undefined}
      isDragOverlay
    />
  );
});

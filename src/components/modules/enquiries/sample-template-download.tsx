'use client';

import { memo } from 'react';
import { Download } from 'lucide-react';
import { downloadSampleTemplate } from '@/lib/enquiries/excel';

type Props = {
  onDownloaded?: () => void;
};

export const SampleTemplateDownload = memo(function SampleTemplateDownload({
  onDownloaded,
}: Props) {
  return (
    <button
      type="button"
      className="ui-btn ui-btn-outline"
      onClick={() => {
        downloadSampleTemplate();
        onDownloaded?.();
      }}
    >
      <Download size={15} aria-hidden /> Download Sample Template
    </button>
  );
});

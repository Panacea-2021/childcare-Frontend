'use client';

import { memo } from 'react';

type Props = {
  count?: number;
};

function SkeletonLoaderBase({ count = 6 }: Props) {
  return (
    <div className="rp-skel-grid" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rp-skel-card" />
      ))}
    </div>
  );
}

export const SkeletonLoader = memo(SkeletonLoaderBase);

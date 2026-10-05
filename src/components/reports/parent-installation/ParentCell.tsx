'use client';

import type { ParentInfo } from './types';

type Props = {
  parent: ParentInfo;
};

export function ParentCell({ parent }: Props) {
  return (
    <div className="pai-parent-simple">
      <strong>{parent.name}</strong>
      <span className="pai-muted">{parent.email || '—'}</span>
    </div>
  );
}

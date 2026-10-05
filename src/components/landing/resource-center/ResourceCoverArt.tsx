'use client';

import {
  Camera,
  ClipboardList,
  FileSpreadsheet,
  LineChart,
  Rocket,
  Sparkles,
} from 'lucide-react';
import type { ResourceItem } from './data';

const ART_ICON = {
  ads: LineChart,
  ai: Sparkles,
  billing: FileSpreadsheet,
  supplies: ClipboardList,
  camera: Camera,
  facebook: LineChart,
  checklist: ClipboardList,
  rocket: Rocket,
} as const;

type Props = {
  item: Pick<ResourceItem, 'tone' | 'art' | 'title'>;
  className?: string;
};

export function ResourceCoverArt({ item, className = '' }: Props) {
  const Icon = ART_ICON[item.art];
  return (
    <div className={`rc-cover rc-cover--${item.tone} ${className}`.trim()} aria-hidden>
      <div className="rc-coverLayer rc-coverLayer--back" />
      <div className="rc-coverLayer rc-coverLayer--mid" />
      <div className="rc-coverLayer rc-coverLayer--front">
        <Icon className="rc-coverIcon" strokeWidth={1.5} />
        <span className="rc-coverLines">
          <i />
          <i />
          <i />
        </span>
      </div>
      <span className="rc-coverChip">{item.title.slice(0, 1)}</span>
    </div>
  );
}

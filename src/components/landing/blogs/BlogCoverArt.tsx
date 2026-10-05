'use client';

import {
  ClipboardList,
  School,
  ShieldCheck,
  Sparkles,
  Map,
  Smartphone,
  Scale,
  Pencil,
} from 'lucide-react';
import type { BlogArticle } from './data';

const ICONS = {
  clipboard: ClipboardList,
  school: School,
  shield: ShieldCheck,
  ai: Sparkles,
  map: Map,
  phone: Smartphone,
  scale: Scale,
  draw: Pencil,
} as const;

type Props = {
  article: Pick<BlogArticle, 'heroTone' | 'heroIcon' | 'title' | 'thumbnail'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function BlogCoverArt({ article, className = '', size = 'md' }: Props) {
  const Icon = ICONS[article.heroIcon];
  return (
    <div
      className={`bl-cover bl-cover--${article.heroTone} bl-cover--${size} ${className}`.trim()}
      aria-hidden
    >
      {article.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.thumbnail} alt="" className="bl-coverPhoto" loading="lazy" />
      ) : (
        <div className="bl-coverArt">
          <span className="bl-coverBlob" />
          <Icon className="bl-coverIcon" strokeWidth={1.6} />
        </div>
      )}
      <span className="bl-coverLabel">{article.title.slice(0, 1)}</span>
    </div>
  );
}

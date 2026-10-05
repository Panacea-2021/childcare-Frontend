'use client';

import { useEffect, useState } from 'react';
import { Baby, BookOpen, Cloud, Star } from 'lucide-react';
import { getLoadingCopy, type LoadingContext } from './messages';
import './loading.css';

type Props = {
  context?: LoadingContext;
  title?: string;
  /** Shorter height for in-route panels */
  inset?: boolean;
  className?: string;
};

export function PageLoader({ context = 'default', title, inset, className = '' }: Props) {
  const copy = getLoadingCopy(context);
  const [sub, setSub] = useState(copy.rotating[0] ?? '');

  useEffect(() => {
    const msgs = copy.rotating;
    if (msgs.length < 2) return;
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % msgs.length;
      setSub(msgs[i] ?? '');
    }, 2200);
    return () => window.clearInterval(t);
  }, [copy.rotating]);

  return (
    <div
      className={`pl-page${inset ? ' pl-page--inset' : ''}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="pl-blob pl-blob--a" aria-hidden />
      <span className="pl-blob pl-blob--b" aria-hidden />
      <div className="pl-floaters" aria-hidden>
        <Star size={16} className="pl-floater" />
        <Cloud size={18} className="pl-floater" />
        <BookOpen size={16} className="pl-floater" />
        <Star size={14} className="pl-floater" />
      </div>
      <div className="pl-card">
        <div className="pl-mascot" aria-hidden>
          <Baby size={34} strokeWidth={1.75} />
        </div>
        <p className="pl-title">{title ?? copy.title}</p>
        <p className="pl-sub">{sub}</p>
        <div className="pl-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="pl-progress" aria-hidden>
          <i />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ArticleSection } from './data';
import { sectionAnchor } from './ArticleRenderer';

const HEADER_OFFSET = 88;

export function ArticleTOC({
  sections,
  variant = 'both',
}: {
  sections: ArticleSection[];
  variant?: 'mobile' | 'desktop' | 'both';
}) {
  const headings = useMemo(
    () =>
      sections
        .filter((s) => s.type === 'HEADING' && s.title)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: sectionAnchor(s.title!),
          title: s.title!,
        })),
    [sections],
  );

  const [active, setActive] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: [0, 0.25, 1] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  };

  if (!headings.length) return null;

  const list = (
    <ul className="pg-toc-list">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={active === h.id ? 'is-active' : ''}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(h.id);
              const details = e.currentTarget.closest('details') as HTMLDetailsElement | null;
              if (details) details.open = false;
            }}
          >
            {h.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {variant === 'mobile' || variant === 'both' ? (
        <details className="pg-toc-mobile">
          <summary>On this page</summary>
          {list}
        </details>
      ) : null}
      {variant === 'desktop' || variant === 'both' ? (
        <nav className="pg-toc pg-toc-desktop" aria-label="On this page">
          <p className="pg-toc-title">On this page</p>
          {list}
        </nav>
      ) : null}
    </>
  );
}

export function ArticleReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="pg-read-progress"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}

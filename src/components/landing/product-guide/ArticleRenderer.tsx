'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ArticleSection } from './data';
import { ArticleImage } from './ArticleImage';

export function sectionAnchor(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function SectionBlock({ section }: { section: ArticleSection }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const revealClass = `pg-section pg-reveal${visible ? ' is-in' : ''}`;

  switch (section.type) {
    case 'HEADING': {
      const id = section.title ? sectionAnchor(section.title) : section.id;
      return (
        <section ref={ref} className={revealClass} id={id}>
          <h2 className={`pg-section-heading${visible ? ' is-visible' : ''}`}>{section.title}</h2>
        </section>
      );
    }
    case 'TEXT':
      return (
        <section ref={ref} className={revealClass}>
          <p className="pg-section-text">{section.content}</p>
        </section>
      );
    case 'BULLETS':
      return (
        <section ref={ref} className={revealClass}>
          <ul className="pg-section-list">
            {(section.items ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case 'NUMBERED_LIST':
      return (
        <section ref={ref} className={revealClass}>
          <ol className="pg-section-list">
            {(section.items ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      );
    case 'IMAGE':
      if (!section.imageUrl) return null;
      return (
        <section ref={ref} className={revealClass}>
          <ArticleImage
            src={section.imageUrl}
            alt={section.imageAlt ?? section.imageCaption ?? 'Documentation screenshot'}
            caption={section.imageCaption}
          />
        </section>
      );
    case 'TIP':
    case 'WARNING':
    case 'CALLOUT': {
      const variant =
        section.variant ??
        (section.type === 'TIP' ? 'tip' : section.type === 'WARNING' ? 'warning' : 'info');
      return (
        <aside ref={ref} className={`${revealClass} pg-callout pg-callout--${variant}`}>
          {section.title ? <p className="pg-callout-title">{section.title}</p> : null}
          {section.content ? <p className="pg-callout-body">{section.content}</p> : null}
        </aside>
      );
    }
    case 'LINK':
      return (
        <section ref={ref} className={`${revealClass} pg-section-link`}>
          <a href={section.href ?? '#'} target="_blank" rel="noopener noreferrer">
            {section.linkLabel ?? section.content ?? 'Open link'}
          </a>
        </section>
      );
    case 'DIVIDER':
      return <hr className="pg-divider" />;
    default:
      return null;
  }
}

export function ArticleRenderer({ sections }: { sections: ArticleSection[] }) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return (
    <div>
      {sorted.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}

export function RelatedArticles({
  items,
}: {
  items: { id: string; title: string; slug: string; guideSlug: string }[];
}) {
  if (!items.length) return null;
  return (
    <section className="pg-related" aria-labelledby="pg-related-heading">
      <h3 id="pg-related-heading">Related Articles</h3>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/resources/product-guide/${item.guideSlug}/${item.slug}`}
          className="pg-related-row"
        >
          <span>{item.title}</span>
          <span className="pg-related-arrow" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </section>
  );
}

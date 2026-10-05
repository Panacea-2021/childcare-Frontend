'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, List, X } from 'lucide-react';
import {
  getRelatedResources,
  type ResourceBlock,
  type ResourceItem,
} from './data';
import { ResourceCard } from './ResourceCard';
import { ResourceCoverArt } from './ResourceCoverArt';
import { RcReveal } from './RcReveal';
import { scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = { item: ResourceItem };

function BlockView({ block }: { block: ResourceBlock }) {
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'h3') return <h3>{block.text}</h3>;
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'ol') {
    return (
      <ol>
        {block.items.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ol>
    );
  }
  return (
    <aside className={`rc-callout rc-callout--${block.tone}`}>
      <strong>{block.title}</strong>
      <p>{block.text}</p>
    </aside>
  );
}

export function ResourceArticleExperience({ item }: Props) {
  const reduced = usePrefersReducedMotion();
  const related = useMemo(() => getRelatedResources(item), [item]);
  const [activeId, setActiveId] = useState(item.sections[0]?.id ?? '');
  const [tocOpen, setTocOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const nodes = item.sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [item.sections]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    });
    setActiveId(id);
    setTocOpen(false);
  };

  const dateLabel = new Date(item.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="rc-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className="rc-article">
        <header className="rc-articleHero">
          <div className="rc-wrap rc-articleHeroInner">
            <div className="rc-articleHeroCopy">
              <nav className="rc-breadcrumb" aria-label="Breadcrumb">
                <Link href="/resources">Resources</Link>
                <span>/</span>
                <span>{item.category}</span>
                <span>/</span>
                <em>{item.title}</em>
              </nav>
              <span className="rc-cardCat">{item.category}</span>
              <h1>{item.title}</h1>
              <p>{item.excerpt}</p>
              <div className="rc-articleMeta">
                <span>{item.type}</span>
                <span>{dateLabel}</span>
                <span>{item.readTime} read</span>
              </div>
            </div>
            <div className="rc-articleHeroArt">
              <ResourceCoverArt item={item} />
            </div>
          </div>
        </header>

        <div className="rc-wrap rc-articleLayout">
          <aside className="rc-tocDesktop" aria-label="On this page">
            <p className="rc-tocLabel">In this guide</p>
            <nav>
              {item.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`rc-tocItem${activeId === section.id ? ' is-active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          <div className="rc-articleBody">
            <details className="rc-tocMobile">
              <summary>
                <List size={16} /> On this page <ChevronDown size={16} />
              </summary>
              <nav>
                {item.sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`rc-tocItem${activeId === section.id ? ' is-active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </details>

            {item.sections.map((section) => (
              <RcReveal key={section.id} className="rc-sectionBlock">
                <section id={section.id}>
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, i) => (
                    <BlockView key={`${section.id}-${i}`} block={block} />
                  ))}
                </section>
              </RcReveal>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="rc-tocFab"
          onClick={() => setTocOpen(true)}
          aria-expanded={tocOpen}
        >
          <List size={18} />
          On this page
        </button>

        <AnimatePresence>
          {tocOpen ? (
            <motion.div className="rc-tocSheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                className="rc-tocSheetBackdrop"
                aria-label="Close contents"
                onClick={() => setTocOpen(false)}
              />
              <motion.div
                className="rc-tocSheetPanel"
                initial={reduced ? false : { y: 40 }}
                animate={{ y: 0 }}
                role="dialog"
                aria-label="Article contents"
              >
                <div className="rc-tocSheetHead">
                  <strong>On this page</strong>
                  <button type="button" onClick={() => setTocOpen(false)} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <nav>
                  {item.sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`rc-tocItem${activeId === section.id ? ' is-active' : ''}`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <section className="rc-relatedBand">
          <div className="rc-wrap">
            <RcReveal>
              <h2 className="rc-sectionTitle rc-center">Related Resources</h2>
            </RcReveal>
            <motion.div
              className="rc-relatedGrid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {related.map((entry) => (
                <ResourceCard key={entry.id} item={entry} compact />
              ))}
            </motion.div>
          </div>
        </section>

        <section className="rc-articleCtaBand">
          <div className="rc-wrap">
            <RcReveal className="rc-articleCta" variants={scaleIn}>
              <h2>Ready to simplify your childcare operations?</h2>
              <p>Explore Panacea&apos;s AI-powered childcare platform.</p>
              <div className="rc-ctaActions">
                <Link href="/book-demo" className="ui-btn ui-btn-primary rc-ctaPrimary">
                  Get a Free Demo
                </Link>
                <Link href="/features/ai" className="ui-btn ui-btn-outline rc-ctaSecondary">
                  Explore Platform
                </Link>
              </div>
            </RcReveal>
          </div>
        </section>
      </article>
    </>
  );
}

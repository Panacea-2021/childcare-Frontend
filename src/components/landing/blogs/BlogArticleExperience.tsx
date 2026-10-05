'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { List, X } from 'lucide-react';
import {
  categoryLabel,
  getRelatedArticles,
  type BlogArticle,
  type BlogBlock,
} from './data';
import { BlogCoverArt } from './BlogCoverArt';
import { BlogCard } from './BlogCard';
import { BlReveal } from './BlReveal';
import { scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  article: BlogArticle;
};

function BlockView({
  block,
  onLightbox,
}: {
  block: BlogBlock;
  onLightbox: (src: string, alt: string) => void;
}) {
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'h3') return <h3>{block.text}</h3>;
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'ol') {
    return (
      <ol>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }
  if (block.type === 'quote') {
    return (
      <blockquote className="bl-quote">
        <p>{block.text}</p>
        {block.cite ? <cite>{block.cite}</cite> : null}
      </blockquote>
    );
  }
  if (block.type === 'callout') {
    return (
      <aside className={`bl-callout bl-callout--${block.tone}`}>
        <strong>{block.title}</strong>
        <p>{block.text}</p>
      </aside>
    );
  }
  if (block.type === 'image') {
    return (
      <figure className="bl-inlineFigure">
        <button
          type="button"
          className="bl-inlineImgBtn"
          onClick={() => onLightbox(block.src, block.alt)}
        >
          <Image
            src={block.src}
            alt={block.alt}
            width={880}
            height={520}
            className="bl-inlineImg"
            loading="lazy"
          />
        </button>
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <div className="bl-inlineCta">
      <p>{block.text}</p>
      <Link href={block.href} className="ui-btn ui-btn-primary">
        {block.buttonLabel}
      </Link>
    </div>
  );
}

export function BlogArticleExperience({ article }: Props) {
  const reduced = usePrefersReducedMotion();
  const related = useMemo(() => getRelatedArticles(article), [article]);
  const [activeId, setActiveId] = useState(article.sections[0]?.id ?? '');
  const [tocOpen, setTocOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

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
    const nodes = article.sections
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
  }, [article.sections]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setActiveId(id);
    setTocOpen(false);
  };

  const dateLabel = new Date(article.publishedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="bl-progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className="bl-article">
        <header className="bl-articleHero">
          <div className="bl-wrap bl-articleHeroInner">
            <div className="bl-articleHeroCopy">
              <span className="bl-cat">{categoryLabel(article.category)}</span>
              <h1>{article.title}</h1>
              <p>{article.excerpt}</p>
              <div className="bl-authorRow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.authorAvatar} alt="" width={44} height={44} />
                <div>
                  <strong>{article.author}</strong>
                  <span>
                    {dateLabel} · {article.readTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="bl-articleHeroArt">
              <BlogCoverArt article={article} size="lg" />
            </div>
          </div>
        </header>

        <div className="bl-wrap bl-articleLayout">
          <aside className="bl-tocDesktop" aria-label="Table of contents">
            <p className="bl-tocLabel">Table of Contents</p>
            <nav>
              {article.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`bl-tocItem${activeId === section.id ? ' is-active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          <div className="bl-articleBody">
            {article.sections.map((section) => (
              <BlReveal key={section.id} className="bl-sectionBlock" amount={0.12}>
                <section id={section.id}>
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, i) => (
                    <BlockView
                      key={`${section.id}-${i}`}
                      block={block}
                      onLightbox={(src, alt) => setLightbox({ src, alt })}
                    />
                  ))}
                </section>
              </BlReveal>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="bl-tocFab"
          onClick={() => setTocOpen(true)}
          aria-expanded={tocOpen}
        >
          <List size={18} />
          Article Contents
        </button>

        <AnimatePresence>
          {tocOpen ? (
            <motion.div
              className="bl-tocSheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="bl-tocSheetBackdrop"
                aria-label="Close contents"
                onClick={() => setTocOpen(false)}
              />
              <motion.div
                className="bl-tocSheetPanel"
                initial={reduced ? false : { y: 40 }}
                animate={{ y: 0 }}
                exit={reduced ? undefined : { y: 24 }}
                role="dialog"
                aria-label="Article contents"
              >
                <div className="bl-tocSheetHead">
                  <strong>Article Contents</strong>
                  <button type="button" onClick={() => setTocOpen(false)} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <nav>
                  {article.sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`bl-tocItem${activeId === section.id ? ' is-active' : ''}`}
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

        <section className="bl-band bl-relatedBand">
          <div className="bl-wrap">
            <BlReveal className="bl-interestingHead">
              <h2>Related Blogs</h2>
            </BlReveal>
            <motion.div
              className="bl-relatedTrack"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {related.map((item) => (
                <BlogCard key={item.id} article={item} variant="related" />
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bl-band bl-band-cta">
          <div className="bl-wrap">
            <BlReveal className="bl-articleCta" variants={scaleIn}>
              <h2>Have questions about childcare software?</h2>
              <p>Talk with our team or book a personalized walkthrough of Panacea.</p>
              <div className="bl-ctaActions">
                <Link href="/contact" className="ui-btn ui-btn-outline bl-ctaSecondary">
                  Contact Us
                </Link>
                <Link href="/book-demo" className="ui-btn ui-btn-primary bl-ctaPrimary">
                  Book a Demo
                </Link>
              </div>
            </BlReveal>
          </div>
        </section>
      </article>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            className="bl-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="bl-lightboxBackdrop"
              aria-label="Close image"
              onClick={() => setLightbox(null)}
            />
            <motion.div
              className="bl-lightboxPanel"
              initial={reduced ? false : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? undefined : { scale: 0.96, opacity: 0 }}
            >
              <button
                type="button"
                className="bl-lightboxClose"
                onClick={() => setLightbox(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.src} alt={lightbox.alt} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

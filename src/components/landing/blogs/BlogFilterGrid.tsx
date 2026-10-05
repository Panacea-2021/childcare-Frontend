'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  type BlogCategoryId,
} from './data';
import { BlogCard } from './BlogCard';
import { staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const PAGE_SIZE = 6;

export function BlogFilterGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const [, startTransition] = useTransition();

  const initialCategory = (searchParams.get('category') as BlogCategoryId | 'all' | null) ?? 'all';
  const initialSearch = searchParams.get('search') ?? '';

  const [category, setCategory] = useState<BlogCategoryId | 'all'>(
    BLOG_CATEGORIES.some((c) => c.id === initialCategory) ? (initialCategory as BlogCategoryId) : 'all',
  );
  const [query, setQuery] = useState(initialSearch);
  const [debounced, setDebounced] = useState(initialSearch);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 220);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (debounced) params.set('search', debounced);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [category, debounced, pathname, router]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [category, debounced]);

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    return BLOG_ARTICLES.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (!q) return true;
      const hay = `${a.title} ${a.excerpt} ${a.category} ${a.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, debounced]);

  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <section className="bl-filterSection">
      <div className="bl-filterBar">
        <div className="bl-chips" role="list">
          <button
            type="button"
            role="listitem"
            className={`bl-chip${category === 'all' ? ' is-active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All
            {category === 'all' ? null : null}
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="listitem"
              className={`bl-chip${category === c.id ? ' is-active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
              {category === c.id ? (
                <X
                  size={14}
                  aria-hidden
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategory('all');
                  }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <label className={`bl-search${query ? ' is-filled' : ''}`}>
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search size={16} aria-hidden />
        </label>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            className="bl-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Sparkles size={36} strokeWidth={1.5} />
            <h3>No stories found</h3>
            <p>Try another topic or category.</p>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setCategory('all');
                setQuery('');
              }}
            >
              View All Articles
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`${category}-${debounced}-${visible}`}
            className="bl-grid"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            {shown.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {canLoadMore ? (
        <div className="bl-loadMoreWrap">
          <button
            type="button"
            className="bl-loadMore"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load More <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

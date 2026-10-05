'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchProductGuides, type SearchHit } from './service';

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export function GuideSearch({
  className,
  autoFocus,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setHits([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchProductGuides(query);
      setHits(results);
      setOpen(true);
      setActive(0);
      setLoading(false);
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = useCallback(
    (hit: SearchHit) => {
      setOpen(false);
      setQuery('');
      router.push(hit.href);
    },
    [router],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== 'Escape') return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!hits.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[active];
      if (hit) go(hit);
    }
  };

  const groups: { label: string; items: SearchHit[] }[] = [
    { label: 'Product Guide', items: hits.filter((h) => h.kind === 'guide') },
    { label: 'Articles', items: hits.filter((h) => h.kind === 'step') },
    { label: 'Sections', items: hits.filter((h) => h.kind === 'section') },
  ].filter((g) => g.items.length > 0);

  let flatIndex = -1;

  return (
    <div className={`pg-search-wrap ${className ?? ''}`} ref={wrapRef}>
      <div className="pg-search" role="search">
        <Search size={20} aria-hidden />
        <input
          type="search"
          placeholder="Search guides, steps and articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hits.length || (query.trim() && !loading)) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={open && hits[active] ? `${listId}-${hits[active].id}` : undefined}
        />
      </div>
      {open && query.trim() ? (
        <div className="pg-search-panel" id={listId} role="listbox" aria-label="Search results">
          {loading ? (
            <p className="pg-search-empty">Searching…</p>
          ) : hits.length === 0 ? (
            <p className="pg-search-empty">No results found</p>
          ) : (
            groups.map((g) => (
              <div key={g.label}>
                <div className="pg-search-group">{g.label}</div>
                {g.items.map((hit) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  return (
                    <button
                      key={hit.id}
                      type="button"
                      id={`${listId}-${hit.id}`}
                      role="option"
                      aria-selected={idx === active}
                      className={`pg-search-hit${idx === active ? ' is-active' : ''}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(hit)}
                    >
                      <p className="pg-search-hit-title">{highlight(hit.title, query)}</p>
                      {hit.subtitle ? <p className="pg-search-hit-sub">{hit.subtitle}</p> : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

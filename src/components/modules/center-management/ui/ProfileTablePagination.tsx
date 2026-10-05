'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppSelect } from './AppDropdown';
import '../students.css';

export const PROFILE_PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

type ProfileTablePaginationProps = {
  page: number;
  pageSize: number;
  /** Total item count (preferred). */
  total?: number;
  /** Alias for `total` — used by profile / billing tables. */
  totalItems?: number;
  /** Optional; derived from total + pageSize when omitted. */
  totalPages?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
};

/** Max numbered buttons before collapsing with ellipsis. */
const MAX_VISIBLE_PAGES = 7;

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [1];
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);
  if (current <= 3) {
    start = 2;
    end = 4;
  }
  if (current >= total - 2) {
    start = total - 3;
    end = total - 1;
  }
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

/**
 * Canonical table footer matching Students list:
 * Left “Showing…”, center prev/pages/next, right AppSelect “N / page”.
 */
export function ProfileTablePagination({
  page,
  pageSize,
  total,
  totalItems,
  totalPages: totalPagesProp,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PROFILE_PAGE_SIZE_OPTIONS,
  className = '',
}: ProfileTablePaginationProps) {
  const itemCount = total ?? totalItems ?? 0;
  const totalPages = Math.max(
    1,
    totalPagesProp ?? (Math.ceil(itemCount / pageSize) || 1),
  );
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = itemCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, itemCount);
  const numbers = pageWindow(safePage, totalPages);

  const sizeOptions = pageSizeOptions.map((n) => ({
    value: String(n),
    label: `${n} / page`,
  }));

  return (
    <div
      className={`cm-footer cm-pagination ${className}`.trim()}
      role="navigation"
      aria-label="Table pagination"
    >
      <div className="cm-footer-meta">
        Showing {from}-{to} of {itemCount} results
      </div>
      <div className="cm-pager">
        <button
          type="button"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹
        </button>
        {numbers.map((n, i) =>
          n === '…' ? (
            <span key={`e-${i}`} className="cm-page-ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={n === safePage ? 'is-active' : undefined}
              aria-label={`Page ${n}`}
              aria-current={n === safePage ? 'page' : undefined}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          ›
        </button>
      </div>
      <div className="cm-page-size">
        <AppSelect
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={sizeOptions}
          align="end"
        />
      </div>
    </div>
  );
}

export function useClientPagination<T>(items: T[], initialPageSize = 10, resetKey?: string | number) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize, resetKey]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalItems: total,
    totalPages,
    pageItems,
  };
}

export type UseClientPaginationResult<T> = ReturnType<typeof useClientPagination<T>>;

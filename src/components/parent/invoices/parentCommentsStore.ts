import type { InvoiceComment } from '@/lib/billing-accounting/invoiceStore';

const STORAGE_KEY = 'parent-invoice-comments-v1';

type CommentsMap = Record<string, InvoiceComment[]>;

function readAll(): CommentsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CommentsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: CommentsMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Parent-visible comments only (hides staff-only entries from admin). */
export function visibleParentComments(comments: InvoiceComment[] | undefined | null): InvoiceComment[] {
  return (comments ?? []).filter((c) => !c.staffOnly);
}

export function loadParentInvoiceComments(invoiceId: string): InvoiceComment[] {
  const all = readAll();
  return Array.isArray(all[invoiceId]) ? all[invoiceId] : [];
}

export function saveParentInvoiceComments(invoiceId: string, comments: InvoiceComment[]) {
  const all = readAll();
  all[invoiceId] = comments;
  writeAll(all);
}

export function addParentInvoiceComment(
  invoiceId: string,
  text: string,
  author: string,
): InvoiceComment {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('empty');
  }
  const comment: InvoiceComment = {
    id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed,
    author: author.trim() || 'Parent',
    createdAt: new Date().toISOString(),
  };
  const next = [...loadParentInvoiceComments(invoiceId), comment];
  saveParentInvoiceComments(invoiceId, next);
  return comment;
}

export function formatCommentCountLabel(count: number) {
  return `${count} Comment${count === 1 ? '' : 's'}`;
}

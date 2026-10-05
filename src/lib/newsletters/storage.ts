import type { NewsletterItem } from '@/types/newsletter';
import { MOCK_NEWSLETTERS } from '@/lib/mock/mockNewsletters';

const LIST_KEY = 'panacea.newsletters.list';
const DOCS_KEY = 'panacea.newsletters.docs';

export type NewsletterBlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'divider'
  | 'columns'
  | 'video'
  | 'html';

export type NewsletterBlock = {
  id: string;
  type: NewsletterBlockType;
  content: string;
  align?: 'left' | 'center' | 'right';
};

export type NewsletterDocument = {
  id: string;
  title: string;
  blocks: NewsletterBlock[];
  updatedAtIso: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function loadNewsletterList(): NewsletterItem[] {
  if (!canUseStorage()) return MOCK_NEWSLETTERS.map((n) => ({ ...n }));
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    if (!raw) {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(MOCK_NEWSLETTERS));
      return MOCK_NEWSLETTERS.map((n) => ({ ...n }));
    }
    return JSON.parse(raw) as NewsletterItem[];
  } catch {
    return MOCK_NEWSLETTERS.map((n) => ({ ...n }));
  }
}

export function saveNewsletterList(items: NewsletterItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LIST_KEY, JSON.stringify(items));
}

export function loadNewsletterDocs(): Record<string, NewsletterDocument> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(DOCS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, NewsletterDocument>) : {};
  } catch {
    return {};
  }
}

export function saveNewsletterDoc(doc: NewsletterDocument) {
  if (!canUseStorage()) return;
  const docs = loadNewsletterDocs();
  docs[doc.id] = doc;
  window.localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function getNewsletterDoc(id: string): NewsletterDocument | null {
  return loadNewsletterDocs()[id] ?? null;
}

export function createDefaultBlocks(): NewsletterBlock[] {
  return [
    {
      id: 'blk-hero-1',
      type: 'heading',
      content: 'Create & Send',
      align: 'center',
    },
    {
      id: 'blk-hero-2',
      type: 'heading',
      content: 'Your Newsletter',
      align: 'center',
    },
    {
      id: 'blk-p-1',
      type: 'paragraph',
      content:
        'Share classroom highlights, upcoming events, and warm updates with parents in a beautiful email.',
      align: 'center',
    },
  ];
}

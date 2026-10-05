'use client';

import { FORMS_SEED } from './mockData';
import type { FormItem } from './types';

const KEY = 'panacea.forms.list';

function emptyAnalytics() {
  return {
    submitted: 0,
    rejected: 0,
    changesRequested: 0,
    pendingReview: 0,
    pendingSubmission: 0,
  };
}

export function loadForms(): FormItem[] {
  if (typeof window === 'undefined') return FORMS_SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(FORMS_SEED));
      return FORMS_SEED;
    }
    const parsed = JSON.parse(raw) as Array<FormItem & { analytics?: Record<string, number> }>;
    return parsed.map((f) => ({
      ...f,
      analytics: {
        submitted: f.analytics?.submitted ?? 0,
        rejected: f.analytics?.rejected ?? 0,
        changesRequested: f.analytics?.changesRequested ?? f.analytics?.views ?? 0,
        pendingReview: f.analytics?.pendingReview ?? f.analytics?.pending ?? 0,
        pendingSubmission: f.analytics?.pendingSubmission ?? 0,
      },
    }));
  } catch {
    return FORMS_SEED;
  }
}

export function saveForms(forms: FormItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(forms));
}

export function upsertForm(item: FormItem) {
  const list = loadForms();
  const idx = list.findIndex((f) => f.id === item.id);
  const next = idx >= 0 ? list.map((f, i) => (i === idx ? item : f)) : [item, ...list];
  saveForms(next);
  return next;
}

export function getFormById(id: string) {
  return loadForms().find((f) => f.id === id) ?? null;
}

export function createBlankAnalytics() {
  return emptyAnalytics();
}

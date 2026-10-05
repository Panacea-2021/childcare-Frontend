import {
  SEED_AUTOMATIONS,
  SEED_TEMPLATES,
  uid,
} from '@/components/modules/enquiries/marketing/mockData';
import type {
  AutomationTemplate,
  MarketingAutomation,
} from '@/components/modules/enquiries/marketing/types';

const AUTO_KEY = 'panacea.enquiries.marketingAutomations';
const TPL_KEY = 'panacea.enquiries.marketingAutomationTemplates';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function loadAutomations(): MarketingAutomation[] {
  const stored = readJson<MarketingAutomation[] | null>(AUTO_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writeJson(AUTO_KEY, SEED_AUTOMATIONS);
    return structuredClone(SEED_AUTOMATIONS);
  }
  return stored;
}

export function saveAutomations(items: MarketingAutomation[]) {
  writeJson(AUTO_KEY, items);
}

export function loadTemplates(): AutomationTemplate[] {
  const stored = readJson<AutomationTemplate[] | null>(TPL_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writeJson(TPL_KEY, SEED_TEMPLATES);
    return structuredClone(SEED_TEMPLATES);
  }
  return stored;
}

export function saveTemplates(items: AutomationTemplate[]) {
  writeJson(TPL_KEY, items);
}

export function createAutomationId() {
  return uid('auto');
}

export function createTemplateId() {
  return uid('tpl');
}

export function resetMarketingAutomationsStore() {
  writeJson(AUTO_KEY, SEED_AUTOMATIONS);
  writeJson(TPL_KEY, SEED_TEMPLATES);
}

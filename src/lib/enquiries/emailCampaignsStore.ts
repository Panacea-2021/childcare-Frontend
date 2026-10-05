import {
  SEED_CAMPAIGNS,
  SEED_TEMPLATES,
  uid,
} from '@/components/modules/enquiries/marketing/email-campaigns/mockData';
import type {
  EmailCampaign,
  EmailTemplate,
} from '@/components/modules/enquiries/marketing/email-campaigns/types';

const CAMPAIGN_KEY = 'panacea.enquiries.emailCampaigns';
const TEMPLATE_KEY = 'panacea.enquiries.emailCampaignTemplates';

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

export function loadCampaigns(): EmailCampaign[] {
  const stored = readJson<EmailCampaign[] | null>(CAMPAIGN_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writeJson(CAMPAIGN_KEY, SEED_CAMPAIGNS);
    return structuredClone(SEED_CAMPAIGNS);
  }
  return stored;
}

export function saveCampaigns(items: EmailCampaign[]) {
  writeJson(CAMPAIGN_KEY, items);
}

export function getCampaign(id: string): EmailCampaign | undefined {
  return loadCampaigns().find((c) => c.id === id);
}

export function upsertCampaign(campaign: EmailCampaign) {
  const list = loadCampaigns();
  const idx = list.findIndex((c) => c.id === campaign.id);
  const next =
    idx === -1
      ? [campaign, ...list]
      : list.map((c, i) => (i === idx ? campaign : c));
  saveCampaigns(next);
  return next;
}

export function deleteCampaign(id: string) {
  const next = loadCampaigns().filter((c) => c.id !== id);
  saveCampaigns(next);
  return next;
}

export function loadEmailTemplates(): EmailTemplate[] {
  const stored = readJson<EmailTemplate[] | null>(TEMPLATE_KEY, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    writeJson(TEMPLATE_KEY, SEED_TEMPLATES);
    return structuredClone(SEED_TEMPLATES);
  }
  return stored;
}

export function saveEmailTemplates(items: EmailTemplate[]) {
  writeJson(TEMPLATE_KEY, items);
}

export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return loadEmailTemplates().find((t) => t.id === id);
}

export function upsertEmailTemplate(template: EmailTemplate) {
  const list = loadEmailTemplates();
  const idx = list.findIndex((t) => t.id === template.id);
  const next =
    idx === -1
      ? [template, ...list]
      : list.map((t, i) => (i === idx ? template : t));
  saveEmailTemplates(next);
  return next;
}

export function deleteEmailTemplate(id: string) {
  const next = loadEmailTemplates().filter((t) => t.id !== id);
  saveEmailTemplates(next);
  return next;
}

export function createCampaignId() {
  return uid('cmp');
}

export function createTemplateId() {
  return uid('etpl');
}

export function createBlockId() {
  return uid('blk');
}

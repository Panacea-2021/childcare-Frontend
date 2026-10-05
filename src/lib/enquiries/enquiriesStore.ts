'use client';

import { SEED_ENQUIRIES } from '@/components/modules/enquiries/mockData';
import type { EnquiryRecord } from '@/components/modules/enquiries/types';

const KEY = 'panacea.enquiries.v1';

export function loadEnquiries(): EnquiryRecord[] {
  if (typeof window === 'undefined') return SEED_ENQUIRIES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED_ENQUIRIES));
      return SEED_ENQUIRIES.map((e) => ({ ...e }));
    }
    const parsed = JSON.parse(raw) as EnquiryRecord[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_ENQUIRIES;
  } catch {
    return SEED_ENQUIRIES;
  }
}

export function prospectEnquiries() {
  return loadEnquiries().filter(
    (e) => !['Admitted', 'Lost', 'Archived'].includes(String(e.stage)),
  );
}

'use client';

import type { AdmissionShareAudience, AdmissionShareRecord } from './types';
import { getAdmissionFillUrl } from './admissionShareUtils';

const KEY = 'panacea.admission.shares.v1';

function readAll(): AdmissionShareRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdmissionShareRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: AdmissionShareRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('panacea.admission.shares.changed'));
}

export function loadAdmissionShares(processId?: string) {
  const all = readAll();
  return processId ? all.filter((s) => s.processId === processId) : all;
}

export function recordAdmissionShare(input: {
  processId: string;
  processName: string;
  audience: AdmissionShareAudience;
  recipientId: string;
  recipientName: string;
  parentContact?: string;
  enquiryId?: string;
  studentId?: string;
}) {
  const fillUrl = getAdmissionFillUrl({
    processId: input.processId,
    enquiryId: input.enquiryId,
    studentId: input.studentId,
  });
  const record: AdmissionShareRecord = {
    id: `ash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    processId: input.processId,
    processName: input.processName,
    audience: input.audience,
    recipientId: input.recipientId,
    recipientName: input.recipientName,
    parentContact: input.parentContact,
    sharedAt: new Date().toISOString(),
    fillUrl,
  };
  writeAll([record, ...readAll()]);
  return record;
}

export function shareAdmissionWithRecipients(
  processId: string,
  processName: string,
  recipients: Array<{
    audience: AdmissionShareAudience;
    recipientId: string;
    recipientName: string;
    parentContact?: string;
    enquiryId?: string;
    studentId?: string;
  }>,
) {
  return recipients.map((r) =>
    recordAdmissionShare({
      processId,
      processName,
      audience: r.audience,
      recipientId: r.recipientId,
      recipientName: r.recipientName,
      parentContact: r.parentContact,
      enquiryId: r.enquiryId,
      studentId: r.studentId,
    }),
  );
}

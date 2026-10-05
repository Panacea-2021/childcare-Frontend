'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import './email-campaigns.css';
import { CampaignStats } from './CampaignStats';
import { CampaignTable } from './CampaignTable';
import { CampaignEmptyState } from './CampaignEmptyState';
import { CampaignsPageHeader } from './CampaignsPageHeader';
import type { CampaignActionKey } from './CampaignRowMenu';
import type { CampaignStatus, EmailCampaign } from './types';
import { createEmptyCampaign } from './mockData';
import {
  createCampaignId,
  loadCampaigns,
  saveCampaigns,
} from '@/lib/enquiries/emailCampaignsStore';

export function EmailCampaignsPage() {
  const router = useRouter();
  const [items, setItems] = useState<EmailCampaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CampaignStatus>('All');
  const [deleteTarget, setDeleteTarget] = useState<EmailCampaign | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => setItems(loadCampaigns()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const persist = (next: EmailCampaign[]) => {
    setItems(next);
    saveCampaigns(next);
  };

  const stats = useMemo(() => {
    const sent = items.filter((i) => i.status === 'Sent').length;
    const scheduled = items.filter((i) => i.status === 'Scheduled').length;
    const drafts = items.filter((i) => i.status === 'Draft').length;
    const recipients = items.reduce((s, i) => s + i.recipientCount, 0);
    const sentItems = items.filter((i) => i.status === 'Sent' && i.openRate != null);
    const avgOpen = sentItems.length
      ? Math.round(sentItems.reduce((s, i) => s + (i.openRate || 0), 0) / sentItems.length)
      : 0;
    const avgClick = sentItems.length
      ? Math.round(sentItems.reduce((s, i) => s + (i.clickRate || 0), 0) / sentItems.length)
      : 0;
    return { total: items.length, sent, scheduled, drafts, recipients, avgOpen, avgClick };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.audienceLabel.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const openCampaign = (c: EmailCampaign) => {
    if (c.status === 'Draft') {
      router.push(`/enquiries/marketing/email-campaigns/${c.id}/edit`);
      return;
    }
    router.push(`/enquiries/marketing/email-campaigns/${c.id}`);
  };

  const duplicate = (c: EmailCampaign) => {
    const now = new Date().toISOString();
    const copy = createEmptyCampaign({
      ...structuredClone(c),
      id: createCampaignId(),
      name: `${c.name} - Copy`,
      status: 'Draft',
      scheduledAt: undefined,
      sentAt: undefined,
      openRate: undefined,
      clickRate: undefined,
      analytics: undefined,
      recipients: undefined,
      createdAt: now,
      updatedAt: now,
    });
    persist([copy, ...items]);
    setToast('Campaign duplicated as draft');
  };

  const onAction = (c: EmailCampaign, action: CampaignActionKey) => {
    if (action === 'view') {
      openCampaign(c);
      return;
    }
    if (action === 'edit') {
      router.push(`/enquiries/marketing/email-campaigns/${c.id}/edit`);
      return;
    }
    if (action === 'duplicate') {
      duplicate(c);
      return;
    }
    if (action === 'pause') {
      persist(
        items.map((x) =>
          x.id === c.id ? { ...x, status: 'Paused', updatedAt: new Date().toISOString() } : x,
        ),
      );
      setToast('Campaign paused');
      return;
    }
    if (action === 'resume') {
      persist(
        items.map((x) =>
          x.id === c.id
            ? { ...x, status: 'Scheduled', updatedAt: new Date().toISOString() }
            : x,
        ),
      );
      setToast('Campaign resumed');
      return;
    }
    if (action === 'delete') setDeleteTarget(c);
  };

  return (
    <div className="mod-page ec-page">
      <div className="ec-ambient" aria-hidden>
        <span className="ec-blob b1" />
        <span className="ec-blob b2" />
        <span className="ec-blob b3" />
        <span className="ec-mesh" />
      </div>

      <div className="ec-page-inner">
        <CampaignsPageHeader
          onCreate={() => router.push('/enquiries/marketing/email-campaigns/create')}
          onTemplates={() => router.push('/enquiries/marketing/email-campaigns/templates')}
        />

        <CampaignStats {...stats} />

        <motion.div
          className="ec-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="ec-toolbar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            <input
              className="ui-input ec-search"
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="ui-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | CampaignStatus)}
            >
              <option value="All">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Sending">Sending</option>
              <option value="Sent">Sent</option>
              <option value="Paused">Paused</option>
              <option value="Failed">Failed</option>
            </select>
          </motion.div>

          {filtered.length === 0 ? (
            items.length === 0 ? (
              <CampaignEmptyState
                onCreate={() => router.push('/enquiries/marketing/email-campaigns/create')}
                onTemplates={() =>
                  router.push('/enquiries/marketing/email-campaigns/templates')
                }
              />
            ) : (
              <motion.p
                className="ec-muted"
                style={{ margin: '1rem 0' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No campaigns match your filters.
              </motion.p>
            )
          ) : (
            <CampaignTable campaigns={filtered} onAction={onAction} onOpen={openCampaign} />
          )}
        </motion.div>
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete campaign?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => {
                if (!deleteTarget) return;
                persist(items.filter((x) => x.id !== deleteTarget.id));
                setDeleteTarget(null);
                setToast('Campaign deleted');
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ec-toast"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

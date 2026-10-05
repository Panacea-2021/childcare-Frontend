'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import './email-campaigns.css';
import { TemplateCard } from './TemplateCard';
import {
  TEMPLATE_CATEGORIES,
  type EmailTemplate,
  type TemplateCategory,
} from './types';
import { formatCampaignDate } from './mockData';
import {
  createTemplateId,
  deleteEmailTemplate,
  loadEmailTemplates,
  upsertEmailTemplate,
} from '@/lib/enquiries/emailCampaignsStore';

export function TemplateGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectFor = searchParams.get('selectFor');
  const selecting = searchParams.get('select') === '1' || !!selectFor;

  const [items, setItems] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TemplateCategory | 'All'>('All');
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => setItems(loadEmailTemplates()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    });
  }, [items, search, category]);

  const useTemplate = (tpl: EmailTemplate) => {
    if (selectFor) {
      router.push(
        `/enquiries/marketing/email-campaigns/${selectFor}/edit?template=${tpl.id}`,
      );
      return;
    }
    router.push(`/enquiries/marketing/email-campaigns/create?template=${tpl.id}`);
  };

  const duplicate = (tpl: EmailTemplate) => {
    const copy: EmailTemplate = {
      ...structuredClone(tpl),
      id: createTemplateId(),
      name: `${tpl.name} - Copy`,
      updatedAt: new Date().toISOString(),
    };
    upsertEmailTemplate(copy);
    refresh();
    setToast('Template duplicated');
  };

  return (
    <div className="mod-page ec-page">
      <PageHeader
        crumbs={['Marketing', 'Email Campaigns', 'Templates']}
        title="Email Templates"
        description={
          selecting
            ? 'Choose a template to populate your campaign composer.'
            : 'Reusable email designs for admissions, events, and parent communication.'
        }
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() =>
              router.push('/enquiries/marketing/email-campaigns/templates/create')
            }
          >
            <Plus size={16} />
            Create Template
          </button>
        }
      />

      <div className="ec-panel">
        <div className="ec-toolbar">
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              className="ui-input ec-search"
              style={{ paddingLeft: 36, maxWidth: '100%', width: '100%' }}
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ec-filters">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ec-chip${category === c ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="ec-muted">No templates found.</p>
        ) : (
          <div className="ec-template-grid">
            {filtered.map((tpl, i) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                index={i}
                updatedLabel={formatCampaignDate(tpl.updatedAt)}
                onUse={() => useTemplate(tpl)}
                onEdit={() =>
                  router.push(
                    `/enquiries/marketing/email-campaigns/templates/create?id=${tpl.id}`,
                  )
                }
                onDuplicate={() => duplicate(tpl)}
                onDelete={() => setDeleteTarget(tpl)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete template?"
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
                deleteEmailTemplate(deleteTarget.id);
                setDeleteTarget(null);
                refresh();
                setToast('Template deleted');
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Delete <strong>{deleteTarget?.name}</strong>?
        </p>
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ec-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

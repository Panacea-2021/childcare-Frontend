'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import '@/components/ui/module.css';
import './email-campaigns.css';
import { EmailDesigner } from './EmailDesigner';
import { defaultBlocks } from './mockData';
import {
  TEMPLATE_CATEGORIES,
  type EmailTemplate,
  type TemplateCategory,
} from './types';
import {
  createTemplateId,
  getEmailTemplate,
  upsertEmailTemplate,
} from '@/lib/enquiries/emailCampaignsStore';

export function TemplateCreatorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [tpl, setTpl] = useState<EmailTemplate>(() => ({
    id: createTemplateId(),
    name: '',
    category: 'Announcements',
    subject: '',
    previewText: '',
    blocks: defaultBlocks('blank'),
    updatedAt: new Date().toISOString(),
    previewAccent: '#C7D2FE',
  }));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const existing = getEmailTemplate(editId);
    if (existing) setTpl(existing);
  }, [editId]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const save = (andUse: boolean) => {
    const next: EmailTemplate = {
      ...tpl,
      name: tpl.name.trim() || 'Untitled Template',
      updatedAt: new Date().toISOString(),
    };
    upsertEmailTemplate(next);
    setTpl(next);
    if (andUse) {
      router.push(`/enquiries/marketing/email-campaigns/create?template=${next.id}`);
      return;
    }
    setToast('Template saved');
    window.setTimeout(() => {
      router.push('/enquiries/marketing/email-campaigns/templates');
    }, 500);
  };

  const categories = TEMPLATE_CATEGORIES.filter((c): c is TemplateCategory => c !== 'All');

  return (
    <div className="mod-page ec-composer">
      <PageHeader
        crumbs={['Marketing', 'Email Campaigns', 'Templates', editId ? 'Edit' : 'Create']}
        title={editId ? 'Edit Email Template' : 'Create Email Template'}
        description="Design a reusable email layout for your school campaigns."
        actions={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push('/enquiries/marketing/email-campaigns/templates')}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => save(false)}>
              <Save size={16} />
              Save Template
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => save(true)}>
              Save &amp; Use Template
            </button>
          </>
        }
      />

      <div className="ec-composer-grid">
        <div className="ec-composer-main">
          <div className="ec-card">
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">Template Name</label>
                <input
                  className="ui-input"
                  value={tpl.name}
                  placeholder="e.g. Welcome New Parent"
                  onChange={(e) => setTpl((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Category</label>
                <select
                  className="ui-select"
                  value={tpl.category}
                  onChange={(e) =>
                    setTpl((p) => ({
                      ...p,
                      category: e.target.value as TemplateCategory,
                    }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ui-field">
                <label className="ui-label">Subject</label>
                <input
                  className="ui-input"
                  value={tpl.subject}
                  placeholder="Default subject line"
                  onChange={(e) => setTpl((p) => ({ ...p, subject: e.target.value }))}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Preview Text</label>
                <input
                  className="ui-input"
                  value={tpl.previewText}
                  placeholder="Inbox preview text"
                  onChange={(e) => setTpl((p) => ({ ...p, previewText: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="ec-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.15rem 0.5rem' }}>
              <h3 style={{ margin: 0 }}>Email Content</h3>
            </div>
            <EmailDesigner
              blocks={tpl.blocks}
              selectedId={selectedBlockId}
              device="desktop"
              onSelect={setSelectedBlockId}
              onChange={(blocks) => setTpl((p) => ({ ...p, blocks }))}
            />
          </div>
        </div>

        <aside className="ec-composer-side">
          <div className="ec-card">
            <h3>Preview accent</h3>
            <div className="ui-field">
              <label className="ui-label">Card color</label>
              <input
                className="ui-input"
                type="color"
                value={tpl.previewAccent}
                onChange={(e) => setTpl((p) => ({ ...p, previewAccent: e.target.value }))}
              />
            </div>
            <p className="ec-muted">
              Saved templates appear in the library and can populate any campaign composer.
            </p>
          </div>
        </aside>
      </div>

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

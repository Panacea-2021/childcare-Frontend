'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import './automations.css';
import {
  ACTION_LABELS,
  TRIGGER_LABELS,
  type AutomationTemplate,
} from './types';
import { formatRelativeDate } from './mockData';
import {
  createTemplateId,
  loadTemplates,
  saveTemplates,
} from '@/lib/enquiries/marketingAutomationsStore';

export function AutomationTemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickMode = searchParams.get('pick') === '1';

  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AutomationTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'Follow-up' });

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const persist = (next: AutomationTemplate[]) => {
    setTemplates(next);
    saveTemplates(next);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [templates, search]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', description: '', category: 'Follow-up' });
    setEditorOpen(true);
  };

  const openEdit = (tpl: AutomationTemplate) => {
    setEditId(tpl.id);
    setForm({
      name: tpl.name,
      description: tpl.description,
      category: tpl.category,
    });
    setEditorOpen(true);
  };

  const saveTemplateMeta = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    if (editId) {
      persist(
        templates.map((t) =>
          t.id === editId
            ? {
                ...t,
                name: form.name.trim(),
                description: form.description.trim(),
                category: form.category.trim() || 'General',
                updatedAt: now,
              }
            : t,
        ),
      );
    } else {
      const blank: AutomationTemplate = {
        id: createTemplateId(),
        name: form.name.trim(),
        description: form.description.trim() || 'Custom automation template',
        category: form.category.trim() || 'General',
        trigger: { type: 'stage_change', status: 'Interested', conditions: [] },
        actions: [
          {
            id: `act_${Date.now()}`,
            type: 'send_whatsapp',
            timing: { mode: 'immediate' },
            templateId: 'wa-interested-followup',
          },
        ],
        uses: 0,
        createdBy: 'You',
        updatedAt: now,
      };
      persist([blank, ...templates]);
    }
    setEditorOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(templates.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const useTemplate = (tpl: AutomationTemplate) => {
    router.push(`/enquiries/marketing/builder?templateId=${tpl.id}`);
  };

  return (
    <div className="mod-page ma-page">
      <PageHeader
        crumbs={['Marketing', 'Automations', 'Templates']}
        title={pickMode ? 'Use a Template' : 'Manage Templates'}
        description={
          pickMode
            ? 'Choose a pre-built automation to customize and launch.'
            : 'Browse, edit, and maintain reusable automation templates.'
        }
        actions={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push('/enquiries/marketing')}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {!pickMode ? (
              <button type="button" className="ui-btn ui-btn-primary" onClick={openCreate}>
                <Plus size={16} />
                New Template
              </button>
            ) : null}
          </>
        }
      />

      <section className="ma-panel">
        <div className="ma-toolbar">
          <div className="ma-search ui-field" style={{ margin: 0 }}>
            <label className="ui-label" htmlFor="ma-tpl-search">
              Search Templates
            </label>
            <input
              id="ma-tpl-search"
              className="ui-input"
              placeholder="Search by name or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="ma-empty">No templates found.</div>
        ) : (
          <div className="ma-tpl-grid">
            {filtered.map((tpl) => (
              <article key={tpl.id} className="ma-tpl-card">
                <span className="ui-badge ui-badge-lavender">{tpl.category}</span>
                <h3>{tpl.name}</h3>
                <p>{tpl.description}</p>
                <div className="ma-tpl-meta">
                  <span className="ui-badge">
                    {tpl.trigger.type ? TRIGGER_LABELS[tpl.trigger.type] : 'Trigger'}
                  </span>
                  <span className="ma-muted">
                    {tpl.actions.map((a) => ACTION_LABELS[a.type].replace('Send ', '')).join(' · ')}
                  </span>
                </div>
                <div className="ma-muted">
                  Used {tpl.uses} times · Updated {formatRelativeDate(tpl.updatedAt)}
                </div>
                <div className="ma-tpl-actions">
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => useTemplate(tpl)}
                  >
                    Use Template
                  </button>
                  {!pickMode ? (
                    <>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        onClick={() => openEdit(tpl)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        aria-label="Delete template"
                        onClick={() => setDeleteTarget(tpl)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editId ? 'Edit Template' : 'New Template'}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!form.name.trim()}
              onClick={saveTemplateMeta}
            >
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">Template Name</label>
            <input
              className="ui-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Category</label>
            <input
              className="ui-input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label">Description</label>
            <textarea
              className="ui-textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template"
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Delete template <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}

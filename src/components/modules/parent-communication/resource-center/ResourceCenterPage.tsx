'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState as UiEmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/parent-communication/shared/SearchBar';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';
import { BookOpen, FileText, Link2, Film, File as FileIcon, Download, Pencil, Trash2, Plus } from 'lucide-react';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import type { ResourceItem, ResourceType } from '@/types/resourceCenter';
import { RESOURCE_CATEGORIES, MOCK_RESOURCES } from '@/lib/mock/mockResources';
import { loadResources, saveResources } from './store';
import { ResourceModal } from './ResourceModal';
import '@/components/parent-communication/parent-communication-page.css';
import './resource-center.css';

const TYPE_META: Record<ResourceType, { label: string; icon: React.ReactNode; className: string }> = {
  PDF: { label: 'PDF', icon: <FileText size={14} />, className: 'rc-type-pdf' },
  DOC: { label: 'DOC', icon: <FileIcon size={14} />, className: 'rc-type-doc' },
  Link: { label: 'Link', icon: <Link2 size={14} />, className: 'rc-type-link' },
  Video: { label: 'Video', icon: <Film size={14} />, className: 'rc-type-video' },
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

export default function ResourceCenterPage() {
  const [resources, setResources] = useState<ResourceItem[]>(() =>
    loadResources().length ? loadResources() : MOCK_RESOURCES,
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState<ResourceType | 'All'>('All');
  const [status, setStatus] = useState<'published' | 'draft' | 'All'>('All');
  const [preview, setPreview] = useState<ResourceItem | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: ResourceItem | null }>({
    open: false,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (search.trim() && !`${r.title} ${r.category} ${r.description}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (category !== 'All' && r.category !== category) return false;
      if (type !== 'All' && r.type !== type) return false;
      if (status !== 'All' && r.status !== status) return false;
      return true;
    });
  }, [resources, search, category, type, status]);

  const counts = useMemo(
    () => ({
      total: resources.filter((r) => r.status === 'published').length + resources.filter((r) => r.status === 'draft').length,
      files: resources.filter((r) => r.type === 'PDF' || r.type === 'DOC').length,
      links: resources.filter((r) => r.type === 'Link' || r.type === 'Video').length,
      drafts: resources.filter((r) => r.status === 'draft').length,
    }),
    [resources],
  );

  const handleSave = (item: ResourceItem, isEdit: boolean) => {
    if (isEdit) {
      setResources((prev) => prev.map((r) => (r.id === item.id ? item : r)));
    } else {
      setResources((prev) => [item, ...prev]);
    }
    saveResources(
      isEdit
        ? resources.map((r) => (r.id === item.id ? item : r))
        : [item, ...resources],
    );
    setModal({ open: false, editing: null });
  };

  const handleDelete = (id: string) => {
    const next = resources.filter((r) => r.id !== id);
    setResources(next);
    saveResources(next);
    setDeleteTarget(null);
  };

  return (
    <div className="pc-page pc-page--resource-center rc-page">
      <ParentCommunicationPageHeader
        title="Resource Center"
        description="Share guides, documents, and resources with families."
        icon={<BookOpen />}
        actions={
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
            <Plus size={16} /> Add Resource
          </button>
        }
      />

      <div className="rc-stats">
        <div className="rc-stat rc-stat--all pc-tone-purple">
          <div className="rc-stat-copy">
            <div className="rc-stat-label">All resources</div>
            <div className="rc-stat-value">{counts.total}</div>
          </div>
          <span className="rc-stat-orb" aria-hidden />
        </div>
        <div className="rc-stat rc-stat--files pc-tone-coral">
          <div className="rc-stat-copy">
            <div className="rc-stat-label">Files</div>
            <div className="rc-stat-value">{counts.files}</div>
          </div>
          <span className="rc-stat-orb" aria-hidden />
        </div>
        <div className="rc-stat rc-stat--links pc-tone-green">
          <div className="rc-stat-copy">
            <div className="rc-stat-label">Links & videos</div>
            <div className="rc-stat-value">{counts.links}</div>
          </div>
          <span className="rc-stat-orb" aria-hidden />
        </div>
        <div className="rc-stat rc-stat--drafts pc-tone-amber">
          <div className="rc-stat-copy">
            <div className="rc-stat-label">Drafts</div>
            <div className="rc-stat-value">{counts.drafts}</div>
          </div>
          <span className="rc-stat-orb" aria-hidden />
        </div>
      </div>

      <div className="pc-panel rc-panel">
        <div className="rc-toolbar">
          <div className="rc-tabs" role="tablist">
            {(['All', 'Files', 'Links'] as const).map((t) => {
              const label = t === 'All' ? 'All' : t === 'Files' ? 'Files' : 'Links & Videos';
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={
                    t === 'All' ? type === 'All' : t === 'Files' ? type === 'PDF' || type === 'DOC' : type === 'Link' || type === 'Video'
                  }
                  className={
                    t === 'All'
                      ? type === 'All'
                        ? 'ui-tab is-active'
                        : 'ui-tab'
                      : t === 'Files'
                        ? type === 'PDF' || type === 'DOC'
                          ? 'ui-tab is-active'
                          : 'ui-tab'
                        : type === 'Link' || type === 'Video'
                          ? 'ui-tab is-active'
                          : 'ui-tab'
                  }
                  onClick={() => {
                    if (t === 'All') setType('All');
                    else if (t === 'Files') setType(type === 'PDF' || type === 'DOC' ? 'PDF' : 'PDF');
                    else setType('Link');
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="rc-filters">
            <SearchBar value={search} onChange={setSearch} placeholder="Search resources…" />
            <div className="rc-filter-dd">
              <SearchableSelect
                value={category}
                onChange={setCategory}
                options={RESOURCE_CATEGORIES.map((c) => ({ value: c, label: c === 'All' ? 'All categories' : c }))}
                searchable
                searchPlaceholder="Search categories…"
                placeholder="Category"
                ariaLabel="Filter by category"
              />
            </div>
            <div className="rc-filter-dd">
              <SearchableSelect
                value={type}
                onChange={(value) => setType(value as ResourceType | 'All')}
                options={[
                  { value: 'All', label: 'All types' },
                  { value: 'PDF', label: 'PDF' },
                  { value: 'DOC', label: 'DOC' },
                  { value: 'Link', label: 'Link' },
                  { value: 'Video', label: 'Video' },
                ]}
                searchable={false}
                placeholder="Type"
                ariaLabel="Filter by type"
              />
            </div>
            <div className="rc-filter-dd">
              <SearchableSelect
                value={status}
                onChange={(value) => setStatus(value as 'published' | 'draft' | 'All')}
                options={[
                  { value: 'All', label: 'All statuses' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                ]}
                searchable={false}
                placeholder="Status"
                ariaLabel="Filter by status"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <UiEmptyState title="No resources found" description="Try a different search or filter, or add a new resource." />
        ) : (
          <div className="rc-list">
            {filtered.map((r, index) => {
              const meta = TYPE_META[r.type];
              return (
                <div
                  key={r.id}
                  className={`rc-row rc-row--${r.type.toLowerCase()}${r.status === 'draft' ? ' rc-row-draft' : ''}`}
                  style={{ ['--rc-stagger' as string]: `${Math.min(index, 8) * 45}ms` }}
                >
                  <div className={`rc-type-badge ${meta.className}`} aria-hidden>
                    {meta.icon}
                  </div>
                  <div className="rc-main">
                    <div className="rc-title-row">
                      <button type="button" className="rc-title" onClick={() => setPreview(r)}>
                        {r.title}
                      </button>
                      {r.status === 'draft' ? <span className="ui-badge blush">Draft</span> : (
                        <span className="rc-chip">{meta.label}</span>
                      )}
                    </div>
                    <div className="rc-meta">
                      <span className="rc-cat">{r.category}</span>
                      <span aria-hidden>·</span>
                      <span>{r.audience}</span>
                      {r.size ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>{r.size}</span>
                        </>
                      ) : null}
                      <span aria-hidden>·</span>
                      <span>Updated {formatDate(r.updated)}</span>
                    </div>
                  </div>
                  <div className="rc-actions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => setPreview(r)}
                      aria-label={`Preview ${r.title}`}
                    >
                      <Download size={15} /> View
                    </button>
                    <button
                      type="button"
                      className="ui-icon-btn"
                      onClick={() => setModal({ open: true, editing: r })}
                      aria-label={`Edit ${r.title}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="ui-icon-btn"
                      onClick={() => setDeleteTarget(r)}
                      aria-label={`Delete ${r.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ResourceModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSave={handleSave}
      />

      <Drawer
        open={preview !== null}
        title={preview?.title ?? 'Resource'}
        onClose={() => setPreview(null)}
      >
        {preview ? (
          <div className="rc-preview">
            <div className="rc-preview-type">
              {TYPE_META[preview.type].icon} {preview.type}
            </div>
            <p className="rc-preview-desc">{preview.description || 'No description provided.'}</p>
            <div className="rc-preview-meta">
              <div><span>Category</span><strong>{preview.category}</strong></div>
              <div><span>Audience</span><strong>{preview.audience}</strong></div>
              <div><span>Updated</span><strong>{formatDate(preview.updated)}</strong></div>
              {preview.size ? <div><span>Size</span><strong>{preview.size}</strong></div> : null}
              {preview.url ? (
                <div>
                  <span>Link</span>
                  <strong>
                    <a href={preview.url} target="_blank" rel="noreferrer">
                      {preview.url}
                    </a>
                  </strong>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={deleteTarget !== null}
        title="Delete resource"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={() => handleDelete(deleteTarget!.id)}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.title}</strong>? This removes it from the Resource Center for all families.
        </p>
      </Modal>
    </div>
  );
}

'use client';

import { useMemo, useState, useEffect } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Download,
  ExternalLink,
  File as FileIcon,
  FileText,
  Film,
  FolderOpen,
  Link2,
  Search,
  X,
} from 'lucide-react';
import type { ResourceItem, ResourceType } from '@/types/resourceCenter';
import { RESOURCE_CATEGORIES, MOCK_RESOURCES } from '@/lib/mock/mockResources';
import { loadResources } from '@/components/modules/parent-communication/resource-center/store';
import { Drawer } from '@/components/ui/Drawer';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentEmptyState, ParentPageHeader, ParentSkeleton } from '../shared';
import '../shared/parent-shared.css';
import './parent-resources-page.css';

const TYPE_META: Record<ResourceType, { label: string; icon: React.ReactNode; className: string }> = {
  PDF: { label: 'PDF', icon: <FileText size={16} />, className: 'prc-type-pdf' },
  DOC: { label: 'DOC', icon: <FileIcon size={16} />, className: 'prc-type-doc' },
  Link: { label: 'Link', icon: <Link2 size={16} />, className: 'prc-type-link' },
  Video: { label: 'Video', icon: <Film size={16} />, className: 'prc-type-video' },
};

type TypeTab = 'All' | 'Files' | 'Links';

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, mo, d] = iso.split('-');
  if (!y || !mo || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(mo) - 1]} ${y}`;
}

function matchesTab(type: ResourceType, tab: TypeTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Files') return type === 'PDF' || type === 'DOC';
  return type === 'Link' || type === 'Video';
}

export function ParentResourcesPage() {
  const [booting, setBooting] = useState(true);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [typeTab, setTypeTab] = useState<TypeTab>('All');
  const [preview, setPreview] = useState<ResourceItem | null>(null);

  useEffect(() => {
    const all = loadResources().length ? loadResources() : MOCK_RESOURCES;
    setResources(all.filter((r) => r.status === 'published'));
    const t = window.setTimeout(() => setBooting(false), 400);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (search.trim() && !`${r.title} ${r.category} ${r.description}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (category !== 'All' && r.category !== category) return false;
      if (!matchesTab(r.type, typeTab)) return false;
      return true;
    });
  }, [resources, search, category, typeTab]);

  const counts = useMemo(
    () => ({
      total: resources.length,
      files: resources.filter((r) => r.type === 'PDF' || r.type === 'DOC').length,
      links: resources.filter((r) => r.type === 'Link' || r.type === 'Video').length,
    }),
    [resources],
  );

  const openResource = (r: ResourceItem) => {
    if (r.url) {
      window.open(r.url, '_blank', 'noopener,noreferrer');
    } else {
      setPreview(r);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="psh-page prc-page">
          <ParentPageHeader
            title="Resource Center"
            description="Browse guides, documents, and resources shared by your school."
            icon={<ParentModuleIcon id="resource-center" />}
          />

          {booting ? (
            <ParentSkeleton variant="cards" rows={3} />
          ) : (
            <>
              {/* Stats */}
              <div className="prc-stats">
                <div className="prc-stat prc-stat--all">
                  <div>
                    <div className="prc-stat-label">All resources</div>
                    <div className="prc-stat-value">
                      <span className="prc-count-enter" key={counts.total}>{counts.total}</span>
                    </div>
                  </div>
                  <span className="prc-stat-orb" aria-hidden />
                </div>
                <div className="prc-stat prc-stat--files">
                  <div>
                    <div className="prc-stat-label">Files</div>
                    <div className="prc-stat-value">
                      <span className="prc-count-enter" key={counts.files}>{counts.files}</span>
                    </div>
                  </div>
                  <span className="prc-stat-orb" aria-hidden />
                </div>
                <div className="prc-stat prc-stat--links">
                  <div>
                    <div className="prc-stat-label">Links & videos</div>
                    <div className="prc-stat-value">
                      <span className="prc-count-enter" key={counts.links}>{counts.links}</span>
                    </div>
                  </div>
                  <span className="prc-stat-orb" aria-hidden />
                </div>
              </div>

              {/* Main panel */}
              <m.div
                className="prc-shell"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                {/* Toolbar */}
                <div className="prc-toolbar">
                  <div className="prc-tabs" role="tablist">
                    {(['All', 'Files', 'Links'] as const).map((t) => {
                      const label = t === 'Links' ? 'Links & Videos' : t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="tab"
                          aria-selected={typeTab === t}
                          className={`prc-tab${typeTab === t ? ' is-active' : ''}`}
                          onClick={() => setTypeTab(t)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="prc-filters">
                    <div className="prc-searchWrap">
                      <span className="prc-searchIcon" aria-hidden>
                        <Search size={14} />
                      </span>
                      <input
                        className="prc-search"
                        type="search"
                        placeholder="Search resources…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search resources"
                      />
                      {search ? (
                        <button
                          type="button"
                          className="prc-searchClear"
                          aria-label="Clear search"
                          onClick={() => setSearch('')}
                        >
                          <X size={12} />
                        </button>
                      ) : null}
                    </div>
                    <select
                      className="prc-filter"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      aria-label="Filter by category"
                    >
                      {RESOURCE_CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                  <div style={{ padding: '20px' }}>
                    <ParentEmptyState
                      icon={<FolderOpen size={28} />}
                      title="No resources found"
                      description="Try a different search or filter to find what you're looking for."
                      action={
                        search || category !== 'All' || typeTab !== 'All' ? (
                          <button
                            type="button"
                            className="ui-btn ui-btn-outline"
                            onClick={() => {
                              setSearch('');
                              setCategory('All');
                              setTypeTab('All');
                            }}
                          >
                            Clear all filters
                          </button>
                        ) : undefined
                      }
                    />
                  </div>
                ) : (
                  <div className="prc-list">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((r, index) => {
                        const meta = TYPE_META[r.type];
                        return (
                          <m.div
                            key={r.id}
                            className={`prc-row prc-row--${r.type.toLowerCase()}`}
                            style={{ ['--prc-stagger' as string]: `${Math.min(index, 10) * 40}ms` }}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04 }}
                            onClick={() => setPreview(r)}
                          >
                            <div className={`prc-type-badge ${meta.className}`} aria-hidden>
                              {meta.icon}
                            </div>
                            <div className="prc-main">
                              <div className="prc-title-row">
                                <h3 className="prc-title">{r.title}</h3>
                                <span className="prc-chip">{meta.label}</span>
                              </div>
                              <div className="prc-meta">
                                <span className="prc-cat">{r.category}</span>
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
                            <button
                              type="button"
                              className="prc-view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreview(r);
                              }}
                              aria-label={`View ${r.title}`}
                            >
                              <Download size={14} /> View
                            </button>
                          </m.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </m.div>
            </>
          )}

          {/* Detail drawer */}
          <Drawer
            open={preview !== null}
            title={preview?.title ?? 'Resource'}
            onClose={() => setPreview(null)}
          >
            {preview ? (
              <div className="prc-detail">
                <div className="prc-detail-type">
                  {TYPE_META[preview.type].icon} {preview.type}
                </div>
                <p className="prc-detail-desc">
                  {preview.description || 'No description provided.'}
                </p>
                <div className="prc-detail-meta">
                  <div>
                    <span>Category</span>
                    <strong>{preview.category}</strong>
                  </div>
                  <div>
                    <span>Audience</span>
                    <strong>{preview.audience}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{formatDate(preview.updated)}</strong>
                  </div>
                  {preview.size ? (
                    <div>
                      <span>Size</span>
                      <strong>{preview.size}</strong>
                    </div>
                  ) : null}
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
                <div className="prc-detail-actions">
                  {preview.url ? (
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-btn ui-btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <ExternalLink size={15} /> Open Resource
                    </a>
                  ) : (
                    <button type="button" className="ui-btn ui-btn-primary" onClick={() => openResource(preview)}>
                      <Download size={15} /> Download
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </Drawer>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

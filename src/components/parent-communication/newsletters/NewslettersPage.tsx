'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsletterFilterState, NewsletterItem } from '@/types/newsletter';
import { loadNewsletterList, saveNewsletterList } from '@/lib/newsletters/storage';
import { NewslettersHeader } from './NewslettersHeader';
import { RecentDesigns } from './RecentDesigns';
import { NewslettersFilters } from './NewslettersFilters';
import { NewslettersTable } from './NewslettersTable';
import { Modal } from '@/components/ui/Modal';
import './newsletters.css';
import '@/components/parent-communication/parent-communication-page.css';

const DEFAULT_FILTERS: NewsletterFilterState = {
  title: '',
  createdBy: 'all',
  status: 'all',
};

export function NewslettersPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [filters, setFilters] = useState<NewsletterFilterState>(DEFAULT_FILTERS);
  const [viewing, setViewing] = useState<NewsletterItem | null>(null);

  useEffect(() => {
    setItems(loadNewsletterList());
  }, []);

  const filtered = useMemo(() => {
    const q = filters.title.trim().toLowerCase();
    return items
      .filter((item) => {
        if (q && !item.title.toLowerCase().includes(q)) return false;
        if (filters.createdBy !== 'all' && item.createdById !== filters.createdBy) return false;
        if (filters.status !== 'all' && item.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
  }, [items, filters]);

  const openCreate = () => {
    router.push('/parent-communication/newsletters/create');
  };

  const openEdit = (id: string) => {
    router.push(`/parent-communication/newsletters/create?id=${encodeURIComponent(id)}`);
  };

  const openView = (id: string) => {
    setViewing(items.find((n) => n.id === id) ?? null);
  };

  const duplicateItem = (id: string) => {
    const source = items.find((n) => n.id === id);
    if (!source) return;
    const copy: NewsletterItem = {
      ...source,
      id: `nl-${Date.now()}`,
      title: `${source.title} (Copy)`,
      status: 'draft',
      isTemplate: false,
      sentTo: '—',
      updatedOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      updatedAtIso: new Date().toISOString(),
      createdBy: 'Center Administrator',
      createdById: 'admin',
    };
    const next = [copy, ...items];
    setItems(next);
    saveNewsletterList(next);
  };

  const deleteItem = (id: string) => {
    const next = items.filter((n) => n.id !== id);
    setItems(next);
    saveNewsletterList(next);
  };

  return (
    <div className="pc-page pc-page--newsletters nl-page">
      <NewslettersHeader onCreate={openCreate} />
      <RecentDesigns items={items} onCreate={openCreate} onOpen={openView} />
      <NewslettersFilters filters={filters} onChange={setFilters} />
      <div className="nl-toolbar">
        <h2 className="nl-section-title" style={{ margin: 0 }}>
          All Newsletters
        </h2>
        <p className="nl-results">
          Showing <strong>{filtered.length}</strong> newsletters
        </p>
      </div>
      <div className="pc-panel nl-table-panel">
        <NewslettersTable
          items={filtered}
          onView={openView}
          onEdit={openEdit}
          onDuplicate={duplicateItem}
          onDelete={deleteItem}
        />
      </div>

      <Modal
        open={Boolean(viewing)}
        title={viewing?.title ?? 'Newsletter'}
        onClose={() => setViewing(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setViewing(null)}>
              Close
            </button>
            {viewing ? (
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => {
                  const id = viewing.id;
                  setViewing(null);
                  openEdit(id);
                }}
              >
                Open editor
              </button>
            ) : null}
          </>
        }
      >
        {viewing ? (
          <div className="ui-grid-2">
            <div className="ui-field">
              <span className="ui-label">Created By</span>
              <p style={{ margin: 0 }}>{viewing.createdBy}</p>
            </div>
            <div className="ui-field">
              <span className="ui-label">Status</span>
              <p style={{ margin: 0, textTransform: 'capitalize' }}>{viewing.status}</p>
            </div>
            <div className="ui-field">
              <span className="ui-label">Sent To</span>
              <p style={{ margin: 0 }}>{viewing.sentTo}</p>
            </div>
            <div className="ui-field">
              <span className="ui-label">Updated On</span>
              <p style={{ margin: 0 }}>{viewing.updatedOn}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

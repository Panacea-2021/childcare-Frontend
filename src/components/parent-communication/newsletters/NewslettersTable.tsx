'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import type { NewsletterItem, NewsletterStatus } from '@/types/newsletter';

type Props = {
  items: NewsletterItem[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

function statusLabel(status: NewsletterStatus) {
  if (status === 'template') return 'Template';
  if (status === 'sent') return 'Sent';
  if (status === 'scheduled') return 'Scheduled';
  return 'Draft';
}

export function NewslettersTable({ items, onView, onEdit, onDuplicate, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openId) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openId]);

  if (items.length === 0) {
    return (
      <div className="nl-empty">
        <strong>No newsletters found</strong>
        <p>Try another title, staff member, or status filter.</p>
      </div>
    );
  }

  return (
    <div className="nl-table-wrap">
      <table className="nl-table ui-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Created By</th>
            <th>Newsletter Sent To</th>
            <th>Updated On</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const menuOpen = openId === item.id;
            return (
              <tr key={item.id}>
                <td>
                  <span className="nl-title-cell">
                    <strong>{item.title}</strong>
                    <span className={`nl-status is-${item.status}`}>{statusLabel(item.status)}</span>
                  </span>
                </td>
                <td>{item.createdBy}</td>
                <td>{item.sentTo}</td>
                <td>{item.updatedOn}</td>
                <td>
                  <div className="nl-actions" ref={menuOpen ? menuRef : undefined}>
                    <button
                      type="button"
                      className="nl-menu-btn"
                      aria-label={`Actions for ${item.title}`}
                      aria-expanded={menuOpen}
                      onClick={() => setOpenId(menuOpen ? null : item.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen ? (
                      <div className="nl-menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => { onView(item.id); setOpenId(null); }}>
                          <Eye size={14} aria-hidden /> View
                        </button>
                        <button type="button" role="menuitem" onClick={() => { onEdit(item.id); setOpenId(null); }}>
                          <Pencil size={14} aria-hidden /> Edit
                        </button>
                        <button type="button" role="menuitem" onClick={() => { onDuplicate(item.id); setOpenId(null); }}>
                          <Copy size={14} aria-hidden /> Duplicate
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="is-danger"
                          onClick={() => { onDelete(item.id); setOpenId(null); }}
                        >
                          <Trash2 size={14} aria-hidden /> Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

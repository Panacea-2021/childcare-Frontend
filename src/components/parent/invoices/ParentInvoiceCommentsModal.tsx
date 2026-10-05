'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { InvoiceComment, ParentInvoice } from './types';
import {
  addParentInvoiceComment,
  formatCommentCountLabel,
  visibleParentComments,
} from './parentCommentsStore';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  authorName: string;
  onClose: () => void;
  onCommentsChange: (invoiceId: string, comments: InvoiceComment[]) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

function formatCommentTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function ParentInvoiceCommentsModal({
  open,
  invoice,
  authorName,
  onClose,
  onCommentsChange,
  onError,
  onSuccess,
}: Props) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const comments = useMemo(
    () =>
      visibleParentComments(invoice?.comments).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [invoice?.comments],
  );

  useEffect(() => {
    if (!open) {
      setText('');
      setLocalError(null);
      setSaving(false);
      return;
    }
    const t = window.setTimeout(() => textareaRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, invoice?.id]);

  const handleAdd = async () => {
    if (!invoice || saving) return;
    const value = text.trim();
    if (!value) {
      setLocalError('Please enter a comment.');
      return;
    }

    setSaving(true);
    setLocalError(null);
    try {
      await new Promise((r) => window.setTimeout(r, 280));
      const comment = addParentInvoiceComment(invoice.id, value, authorName);
      const byId = new Map(
        visibleParentComments([...(invoice.comments ?? []), comment]).map((c) => [c.id, c]),
      );
      onCommentsChange(
        invoice.id,
        Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
      setText('');
      onSuccess?.('Comment added');
    } catch {
      const msg = 'Unable to add comment. Please try again.';
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) {
    return (
      <Modal open={false} title="Invoice Comments" onClose={onClose} elevated>
        {null}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Invoice Comments"
      subtitle={formatCommentCountLabel(comments.length)}
      onClose={saving ? () => undefined : onClose}
      icon={<MessageSquare size={18} />}
      elevated
      iconClose
      className="pi-comments-modal"
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={handleAdd}
            disabled={saving || !text.trim()}
            aria-busy={saving}
          >
            {saving ? 'Adding…' : 'Add Comment'}
          </button>
        </>
      }
    >
      <div className="pi-comments">
        <h3 className="pi-comments-heading">Comments</h3>

        {comments.length === 0 ? (
          <p className="pi-comments-empty">No comments yet. Add the first one below.</p>
        ) : (
          <ul className="pi-comments-list" aria-label="Invoice comments">
            {comments.map((c) => (
              <li key={c.id} className="pi-comments-item">
                <p className="pi-comments-text">{c.text}</p>
                <div className="pi-comments-meta">
                  <strong>{c.author}</strong>
                  <time dateTime={c.createdAt}>{formatCommentTime(c.createdAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="ui-field pi-comments-composer">
          <label className="ui-label" htmlFor={`pi-comment-${invoice.id}`}>
            Add a comment
          </label>
          <textarea
            ref={textareaRef}
            id={`pi-comment-${invoice.id}`}
            className="ui-textarea"
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (localError) setLocalError(null);
            }}
            placeholder="Add a comment..."
            disabled={saving}
            aria-invalid={Boolean(localError)}
          />
        </div>

        {localError ? (
          <p className="pi-preview-error" role="alert">
            {localError}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

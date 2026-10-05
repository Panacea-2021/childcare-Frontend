'use client';

import { useMemo, useState } from 'react';
import { Check, ImagePlus, Languages, MessageCircle, Pencil, Send, Smile, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import {
  type CenterInvoice,
  type InvoiceComment,
  updateCenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';

type Props = {
  open: boolean;
  onClose: () => void;
  invoice: CenterInvoice;
  onChange: (next: CenterInvoice) => void;
};

export function CommentDrawer({ open, onClose, invoice, onChange }: Props) {
  const [text, setText] = useState('');
  const [staffOnly, setStaffOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const comments = invoice.comments ?? [];

  const empty = comments.length === 0;

  const persist = (nextComments: InvoiceComment[]) => {
    const next = updateCenterInvoice(invoice.id, { comments: nextComments });
    if (next) onChange(next);
  };

  const post = () => {
    const value = text.trim();
    if (!value) return;
    const comment: InvoiceComment = {
      id: `c-${Date.now()}`,
      text: value,
      author: 'You',
      createdAt: new Date().toISOString(),
      staffOnly,
    };
    persist([...comments, comment]);
    setText('');
    setStaffOnly(false);
  };

  const startEdit = (c: InvoiceComment) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const value = editText.trim();
    if (!value) return;
    persist(
      comments.map((c) => (c.id === editingId ? { ...c, text: value } : c)),
    );
    cancelEdit();
  };

  const remove = (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    persist(comments.filter((c) => c.id !== id));
    if (editingId === id) cancelEdit();
  };

  const sorted = useMemo(
    () => [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [comments],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Comments"
      subtitle="Collaborate with your team"
      icon={<MessageCircle size={18} />}
      bodyClassName="ivd-comments-body"
    >
      <div className="ivd-comments">
        {empty ? (
          <div className="ivd-empty-comments">
            <div className="ivd-empty-art" aria-hidden>
              <Sparkles size={28} />
            </div>
            <h3>No comments yet</h3>
            <p>Start the conversation. Mention staff with @ and keep parents in the loop.</p>
          </div>
        ) : (
          <ul className="ivd-comment-list">
            {sorted.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li key={c.id} className={`ivd-comment-item${isEditing ? ' is-editing' : ''}`}>
                  <div className="ivd-comment-avatar" aria-hidden>
                    {c.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="ivd-comment-body">
                    <div className="ivd-comment-head">
                      <strong>{c.author}</strong>
                      {c.staffOnly ? <span className="ivd-pill">Staff only</span> : null}
                      <time dateTime={c.createdAt}>
                        {new Date(c.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>

                    {isEditing ? (
                      <div className="ivd-comment-edit">
                        <textarea
                          className="ui-textarea"
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          aria-label="Edit comment"
                          autoFocus
                        />
                        <div className="ivd-comment-edit-actions">
                          <button type="button" className="ui-btn ui-btn-outline" onClick={cancelEdit}>
                            <X size={14} />
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="ui-btn ui-btn-primary"
                            onClick={saveEdit}
                            disabled={!editText.trim()}
                          >
                            <Check size={14} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{c.text}</p>
                        <div className="ivd-comment-actions">
                          <button type="button" onClick={() => startEdit(c)}>
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button type="button" className="is-danger" onClick={() => remove(c.id)}>
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="ivd-comment-composer">
          <textarea
            className="ui-textarea"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment (use @ to tag staff)"
            aria-label="Add a comment"
          />
          <div className="ivd-comment-toolbar">
            <div className="ivd-comment-tools">
              <button type="button" className="ivd-icon-btn" aria-label="Attach image">
                <ImagePlus size={16} />
              </button>
              <button type="button" className="ivd-icon-btn" aria-label="Emoji">
                <Smile size={16} />
              </button>
              <label className="ivd-staff-only">
                <input
                  type="checkbox"
                  checked={staffOnly}
                  onChange={(e) => setStaffOnly(e.target.checked)}
                />
                Staff Only
              </label>
              <button type="button" className="ivd-icon-btn" aria-label="Translate">
                <Languages size={16} />
              </button>
              <button type="button" className="ivd-icon-btn" aria-label="Assist">
                <Wand2 size={16} />
              </button>
            </div>
            <button
              type="button"
              className="ui-btn ui-btn-primary ivd-post-btn"
              onClick={post}
              disabled={!text.trim()}
            >
              <Send size={14} />
              Post
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

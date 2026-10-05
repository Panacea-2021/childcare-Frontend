'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useParentStudent } from '../ParentStudentContext';
import {
  addParentComment,
  deleteParentComment,
  formatTimelineDateLabel,
  formatTimelineTime,
  getParentTimelinePost,
  subscribeParentTimeline,
  toggleCommentLike,
  updateParentComment,
  type ParentTimelineComment,
  type ParentTimelinePost,
} from '@/lib/parent/parentTimelineStore';
import './parent-timeline.css';

export function ParentTimelineCommentsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = String(params?.postId || '');
  const { displayName, session } = useParentStudent();
  const parentId = session?.email || displayName || 'parent';
  const parentName = displayName || 'Parent';

  const [tick, setTick] = useState(0);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeParentTimeline(() => setTick((t) => t + 1)), []);

  const post: ParentTimelinePost | undefined = useMemo(() => {
    void tick;
    return getParentTimelinePost(postId);
  }, [postId, tick]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    // Keep newest comments in view when list mounts / grows
    listEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [post?.comments.length]);

  if (!post) {
    return (
      <div className="ptl-page">
        <button type="button" className="ptl-back" onClick={() => router.push('/parent/timeline')}>
          <ArrowLeft size={16} />
          Go back
        </button>
        <div className="ptl-empty">
          <span aria-hidden>💬</span>
          <h3>Activity not found</h3>
          <p>This update may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

  const comments = post.comments;

  const submit = async () => {
    if (!draft.trim() || posting) return;
    setPosting(true);
    await new Promise((r) => window.setTimeout(r, 180));
    addParentComment(post.id, {
      authorId: parentId,
      authorName: parentName,
      text: draft,
    });
    setDraft('');
    setPosting(false);
    setTick((t) => t + 1);
    window.setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 40);
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!updateParentComment(post.id, editingId, parentId, editText)) {
      setToast('Could not save comment');
      return;
    }
    setEditingId(null);
    setEditText('');
    setTick((t) => t + 1);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    if (!deleteParentComment(post.id, deleteId, parentId)) {
      setToast('Could not delete comment');
      setDeleteId(null);
      return;
    }
    setDeleteId(null);
    setTick((t) => t + 1);
    setToast('Comment deleted');
  };

  return (
    <div className="ptl-page ptl-comments-page">
      <div className="ptl-comments-shell">
        <header className="ptl-comments-top">
          <button type="button" className="ptl-back" onClick={() => router.push('/parent/timeline')}>
            <ArrowLeft size={16} />
            Go back
          </button>
          <div className="ptl-comments-head">
            <h1>Comments</h1>
            <p>
              {post.activityTypeName} · {formatTimelineDateLabel(post.createdAt)}
            </p>
          </div>
        </header>

        <div className="ptl-comments-scroll" ref={listRef}>
          {comments.length === 0 ? (
            <div className="ptl-empty ptl-empty-sm">
              <span aria-hidden>💬</span>
              <h3>No comments yet</h3>
              <p>Be the first to share your thoughts.</p>
            </div>
          ) : (
            <div className="ptl-comments-list">
              <AnimatePresence initial={false}>
                {comments.map((c) => (
                  <CommentRow
                    key={c.id}
                    comment={c}
                    parentId={parentId}
                    isEditing={editingId === c.id}
                    editText={editText}
                    menuOpen={menuId === c.id}
                    onToggleMenu={() => setMenuId((id) => (id === c.id ? null : c.id))}
                    onCloseMenu={() => setMenuId(null)}
                    onLike={() => {
                      toggleCommentLike(post.id, c.id, parentId);
                      setTick((t) => t + 1);
                    }}
                    onStartEdit={() => {
                      setMenuId(null);
                      setEditingId(c.id);
                      setEditText(c.text);
                    }}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setEditText('');
                    }}
                    onEditText={setEditText}
                    onSaveEdit={saveEdit}
                    onAskDelete={() => {
                      setMenuId(null);
                      setDeleteId(c.id);
                    }}
                  />
                ))}
              </AnimatePresence>
              <div ref={listEndRef} />
            </div>
          )}
        </div>

        <div className="ptl-composer">
          <textarea
            className="ui-textarea ptl-composer-input"
            rows={2}
            placeholder="Add your comment here..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!post.enableComments}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />
          <div className="ptl-composer-actions">
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!draft.trim() || posting || !post.enableComments}
              onClick={submit}
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(deleteId)}
        title="Delete comment?"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this comment? This action cannot be undone.
        </p>
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ptl-toast"
            initial={{ opacity: 0, y: 10 }}
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

function CommentRow({
  comment,
  parentId,
  isEditing,
  editText,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onLike,
  onStartEdit,
  onCancelEdit,
  onEditText,
  onSaveEdit,
  onAskDelete,
}: {
  comment: ParentTimelineComment;
  parentId: string;
  isEditing: boolean;
  editText: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onLike: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditText: (v: string) => void;
  onSaveEdit: () => void;
  onAskDelete: () => void;
}) {
  const [liked, setLiked] = useState(() => comment.likedBy.includes(parentId));
  const [likeCount, setLikeCount] = useState(comment.likesCount);
  const mine = comment.authorId === parentId;
  const initials = comment.authorName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setLiked(comment.likedBy.includes(parentId));
    setLikeCount(comment.likesCount);
  }, [comment.likedBy, comment.likesCount, parentId]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(`[data-comment-menu="${comment.id}"]`)) onCloseMenu();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen, comment.id, onCloseMenu]);

  return (
    <motion.article
      className="ptl-comment"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
    >
      <div className="ptl-comment-avatar" aria-hidden>
        {initials || 'P'}
      </div>
      <div className="ptl-comment-body">
        <div className="ptl-comment-top">
          <div>
            <strong>{comment.authorName}</strong>
            <p>
              {formatTimelineTime(comment.createdAt)} · {comment.authorRole}
            </p>
          </div>
          <div className="ptl-comment-actions">
            <button
              type="button"
              className={`ptl-comment-like${liked ? ' is-on' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const next = !liked;
                setLiked(next);
                setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
                onLike();
              }}
              aria-label={liked ? 'Unlike comment' : 'Like comment'}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>
            {mine ? (
              <div className="ptl-comment-menu" data-comment-menu={comment.id}>
                <button
                  type="button"
                  className="ptl-icon-btn"
                  aria-label="Comment actions"
                  aria-expanded={menuOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleMenu();
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen ? (
                  <div className="ptl-comment-pop is-up" role="menu">
                    <button type="button" role="menuitem" onClick={onStartEdit}>
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button type="button" role="menuitem" className="is-danger" onClick={onAskDelete}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <div className="ptl-comment-edit">
            <textarea
              className="ui-textarea"
              rows={2}
              value={editText}
              onChange={(e) => onEditText(e.target.value)}
            />
            <div className="ptl-comment-edit-actions">
              <button type="button" className="ui-btn ui-btn-outline" onClick={onCancelEdit}>
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={!editText.trim()}
                onClick={onSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="ptl-comment-text">{comment.text}</p>
        )}
      </div>
    </motion.article>
  );
}

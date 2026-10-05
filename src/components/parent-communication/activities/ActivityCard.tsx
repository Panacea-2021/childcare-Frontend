'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  Lock,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  FileText,
  Play,
  Pause,
  Volume2,
  Users,
  Eye,
  Check,
  ExternalLink,
  Trash2,
  Archive,
  Pencil,
  X,
  Send,
} from 'lucide-react';
import type { ActivityPost } from '@/types/activity';
import { getActivityIcon } from './activityIconMap';
import { AuthorAvatar } from './AuthorAvatar';
import { getMockComments, getMockViewers } from '@/lib/mock/mockEngagement';
import '@/components/modules/calendar/calendar.css';
import './activities.css';

interface ActivityCardProps {
  activity: ActivityPost;
  onToggleLike?: (id: string) => void;
  onToggleBookmark?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUpdate?: (id: string) => void;
}

export function ActivityCard({
  activity,
  onToggleLike,
  onToggleBookmark,
  onDelete,
  onArchive,
  onUpdate,
}: ActivityCardProps) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [draftComment, setDraftComment] = useState('');
  const [localComments, setLocalComments] = useState(() =>
    getMockComments(activity.id, activity.commentsCount),
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const TypeIcon = getActivityIcon(activity.activityIcon);
  const imageAttachments = activity.attachments?.filter((a) => a.type === 'image') ?? [];
  const fileAttachments = activity.attachments?.filter((a) => a.type !== 'image') ?? [];
  const viewers = useMemo(
    () => getMockViewers(activity.id, activity.viewsCount),
    [activity.id, activity.viewsCount],
  );

  const isLiked = activity.isLikedByMe ?? false;
  const isBookmarked = activity.isBookmarkedByMe ?? false;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const handleLike = useCallback(() => {
    onToggleLike?.(activity.id);
  }, [activity.id, onToggleLike]);

  const handleBookmark = useCallback(() => {
    onToggleBookmark?.(activity.id);
  }, [activity.id, onToggleBookmark]);

  const handleShare = useCallback(() => {
    setShowShareToast(true);
    window.setTimeout(() => setShowShareToast(false), 2500);
  }, []);

  const handleAddComment = () => {
    const text = draftComment.trim();
    if (!text) return;
    setLocalComments((prev) => [
      {
        id: `${activity.id}-c-new-${Date.now()}`,
        authorName: 'You',
        authorRole: 'Staff · Center',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
    setDraftComment('');
  };

  const cardClass = activity.isPinned ? 'act-card pinned' : 'act-card';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={cardClass}
    >
      <div className="act-card-top-bar">
        <span className="act-tag-badge">
          <TypeIcon size={12} aria-hidden />
          {activity.activityTypeName}
        </span>
        <span className="act-badge-room">{activity.room}</span>
        <span className="act-badge-students">
          <Users size={12} aria-hidden />
          {activity.studentCount} students
        </span>

        {activity.isPinned && (
          <span className="act-badge-pinned">
            <Pin size={12} aria-hidden />
            Pinned
          </span>
        )}

        {activity.visibility === 'staff_only' ? (
          <span className="act-badge-staff">
            <Lock size={12} aria-hidden />
            Staff Only
          </span>
        ) : (
          <span className="act-badge-parents">Parents</span>
        )}
      </div>

      <div className="act-card-top-bar">
        <div className="act-card-author">
          <AuthorAvatar
            name={activity.postedBy.name}
            src={activity.postedBy.avatar}
            alt={activity.postedBy.name}
          />
          <div>
            <p className="act-author-name">{activity.postedBy.name}</p>
            <p className="act-author-meta">
              {activity.postedBy.role} · {activity.createdDate} at {activity.createdTime}
            </p>
          </div>
        </div>

        <div className="act-more-wrap" ref={menuRef}>
          <button
            type="button"
            className="act-icon-btn"
            aria-label="More options"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal size={20} />
          </button>
          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                className="act-more-menu"
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="act-more-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onUpdate?.(activity.id);
                  }}
                >
                  <Pencil size={15} />
                  Update post
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="act-more-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive?.(activity.id);
                  }}
                >
                  <Archive size={15} />
                  Archive post
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="act-more-item act-more-item-danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(activity.id);
                  }}
                >
                  <Trash2 size={15} />
                  Delete post
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <h3 className="act-card-title">{activity.title}</h3>
        <p className="act-card-text">{activity.content}</p>
      </div>

      {activity.labels.length > 0 && (
        <div className="act-chips">
          {activity.labels.map((label) => (
            <span key={label} className="act-card-label">
              #{label}
            </span>
          ))}
        </div>
      )}

      {imageAttachments.length > 0 && (
        <div className="act-card-media">
          <img
            src={imageAttachments[0].url}
            alt={imageAttachments[0].name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {fileAttachments.map((attachment) => (
        <div key={attachment.id} className="act-card-attachment">
          <span>
            <FileText size={18} aria-hidden />
            {attachment.name}
            {attachment.size ? ` · ${attachment.size}` : ''}
          </span>
          <button type="button" className="act-card-btn act-icon-btn">
            <ExternalLink size={14} />
            Download
          </button>
        </div>
      ))}

      {activity.voiceNote && (
        <div className="act-card-voice">
          <div className="act-card-voice-left">
            <span className="act-card-voice-icon" aria-hidden>
              <Volume2 size={18} />
            </span>
            <div className="act-card-voice-meta">
              <strong>Voice Note</strong>
              <span>{activity.voiceNote.duration}</span>
            </div>
          </div>
          <button
            type="button"
            className="act-voice-play-btn"
            onClick={() => setIsPlayingAudio((prev) => !prev)}
            aria-label={isPlayingAudio ? 'Pause voice note' : 'Play voice note'}
          >
            {isPlayingAudio ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
          </button>
        </div>
      )}

      {activity.youtubePreview && (
        <div className="act-card-youtube">
          <img
            src={activity.youtubePreview.thumbnail}
            alt={activity.youtubePreview.title}
          />
          <div className="act-card-youtube-overlay">
            <div>
              <Play size={28} fill="currentColor" aria-hidden />
              <p>{activity.youtubePreview.title}</p>
            </div>
          </div>
        </div>
      )}

      <div className="act-card-footer">
        <div className="act-card-actions">
          <button
            type="button"
            onClick={handleLike}
            className={`act-card-btn${isLiked ? ' liked' : ''}`}
            aria-pressed={isLiked}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            {activity.likesCount} Likes
          </button>
          <button
            type="button"
            className="act-card-btn"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageCircle size={16} />
            {localComments.length} Comments
          </button>
          <button
            type="button"
            className="act-card-btn"
            onClick={() => setViewsOpen(true)}
          >
            <Eye size={16} />
            {activity.viewsCount} Views
          </button>
        </div>

        <div className="act-card-actions">
          <button
            type="button"
            onClick={handleBookmark}
            className="act-card-btn act-icon-btn"
            aria-pressed={isBookmarked}
            aria-label="Bookmark"
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="act-card-btn act-icon-btn"
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="act-share-toast"
          >
            <Check size={14} aria-hidden />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {commentsOpen ? (
                <motion.div
                  className="cal-dialog-backdrop"
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCommentsOpen(false)}
                >
                  <motion.div
                    className="cal-dialog act-engagement-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Comments"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <header className="cal-dialog-header">
                      <div className="cal-dialog-title-block">
                        <span className="cal-dialog-emoji" aria-hidden>
                          💬
                        </span>
                        <div>
                          <h2>Comments</h2>
                          <p>{localComments.length} people commented on this activity</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cal-dialog-close"
                        onClick={() => setCommentsOpen(false)}
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </header>
                    <div className="cal-dialog-body act-engagement-list">
                      {localComments.length === 0 ? (
                        <p className="act-engagement-empty">No comments yet. Be the first!</p>
                      ) : (
                        localComments.map((c) => (
                          <div key={c.id} className="act-engagement-row">
                            <AuthorAvatar name={c.authorName} src={c.avatar} alt="" />
                            <div className="act-engagement-body">
                              <div className="act-engagement-head">
                                <strong>{c.authorName}</strong>
                                <span>{c.createdAt}</span>
                              </div>
                              <p className="act-author-meta">{c.authorRole}</p>
                              <p className="act-engagement-text">{c.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <footer className="cal-dialog-footer act-comment-compose">
                      <input
                        className="ui-input"
                        placeholder="Write a comment…"
                        value={draftComment}
                        onChange={(e) => setDraftComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        aria-label="Write a comment"
                      />
                      <button
                        type="button"
                        className="cal-btn-save"
                        onClick={handleAddComment}
                        disabled={!draftComment.trim()}
                      >
                        <Send size={16} />
                        Post
                      </button>
                    </footer>
                  </motion.div>
                </motion.div>
              ) : null}

              {viewsOpen ? (
                <motion.div
                  className="cal-dialog-backdrop"
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setViewsOpen(false)}
                >
                  <motion.div
                    className="cal-dialog act-engagement-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Views"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <header className="cal-dialog-header">
                      <div className="cal-dialog-title-block">
                        <span className="cal-dialog-emoji" aria-hidden>
                          👁
                        </span>
                        <div>
                          <h2>Views</h2>
                          <p>
                            {viewers.length} {viewers.length === 1 ? 'person has' : 'people have'}{' '}
                            watched this activity
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cal-dialog-close"
                        onClick={() => setViewsOpen(false)}
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </header>
                    <div className="cal-dialog-body act-engagement-list">
                      {viewers.length === 0 ? (
                        <p className="act-engagement-empty">No views yet.</p>
                      ) : (
                        viewers.map((v) => (
                          <div key={v.id} className="act-engagement-row">
                            <AuthorAvatar name={v.name} src={v.avatar} alt="" />
                            <div className="act-engagement-body">
                              <div className="act-engagement-head">
                                <strong>{v.name}</strong>
                                <span>{v.viewedAt}</span>
                              </div>
                              <p className="act-author-meta">{v.role}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <footer className="cal-dialog-footer">
                      <button
                        type="button"
                        className="cal-btn-ghost"
                        onClick={() => setViewsOpen(false)}
                      >
                        Close
                      </button>
                    </footer>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </motion.article>
  );
}

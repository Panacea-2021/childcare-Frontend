'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, CheckCheck, ChevronDown, ChevronUp, Eye, Undo2 } from 'lucide-react';
import { StudentAvatar } from '@/components/parent-communication/shared/StudentAvatar';
import {
  formatNoteDate,
  formatNoteTime,
  NOTE_CATEGORY_META,
} from '@/components/parent-communication/notes/noteCategory';
import type { ParentNote } from '@/types/note';

interface NotesCardProps {
  note: ParentNote;
  index: number;
  mode?: 'inbox' | 'archived';
  onView: (note: ParentNote) => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function NotesCard({
  note,
  index,
  mode = 'inbox',
  onView,
  onMarkRead,
  onArchive,
  onRestore,
}: NotesCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = NOTE_CATEGORY_META[note.category];
  const long = note.content.length > 140;
  const archived = mode === 'archived' || note.isArchived;

  return (
    <motion.article
      className={`notes-card ${note.isRead ? 'is-read' : 'is-unread'} ${archived ? 'is-archived' : ''}`}
      style={
        {
          '--notes-border': meta.border,
          '--notes-glow': meta.glow,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      layout
    >
      <div className="notes-card-accent" aria-hidden />

      <header className="notes-card-head">
        <StudentAvatar
          name={note.studentName}
          initials={note.studentInitials}
          color={note.studentPhotoColor}
          className="notes-card-avatar"
        />
        <div className="notes-card-meta">
          <div className="notes-card-title-row">
            <h3 className="notes-card-name">{note.studentName}</h3>
            {!note.isRead && !archived ? (
              <span className="notes-unread-dot" aria-label="Unread" />
            ) : null}
            <span className={`notes-read-chip ${note.isRead ? 'is-read' : 'is-unread'}`}>
              {note.isRead ? 'Read' : 'Unread'}
            </span>
          </div>
          <p className="notes-card-room">{note.room}</p>
          <p className="notes-card-parent">
            {note.parentName}
            <span aria-hidden> · </span>
            {note.relationship}
          </p>
        </div>
        <div className="notes-card-when">
          <span>{formatNoteDate(note.date)}</span>
          <span>{formatNoteTime(note.time)}</span>
        </div>
      </header>

      <motion.span
        className="notes-category-badge"
        style={{ background: meta.badgeBg, color: meta.badgeColor }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.1 }}
      >
        {note.category}
      </motion.span>

      <p className={`notes-card-body ${expanded ? 'is-expanded' : ''}`}>{note.content}</p>

      {long ? (
        <button
          type="button"
          className="notes-read-more"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={14} />
            </>
          )}
        </button>
      ) : null}

      <footer className="notes-card-footer">
        <button
          type="button"
          className="ui-btn ui-btn-primary notes-card-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView(note);
          }}
          aria-label={`View full note for ${note.studentName}`}
        >
          <Eye size={15} />
          View Full
        </button>

        {archived ? (
          <button
            type="button"
            className="ui-btn ui-btn-outline notes-card-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRestore?.(note.id);
            }}
            aria-label={`Restore note for ${note.studentName}`}
          >
            <Undo2 size={15} />
            Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline notes-card-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!note.isRead) onMarkRead(note.id);
              }}
              disabled={note.isRead}
              aria-label={
                note.isRead ? 'Already marked as read' : `Mark note for ${note.studentName} as read`
              }
            >
              <CheckCheck size={15} />
              {note.isRead ? 'Read' : 'Mark Read'}
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary notes-card-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive(note.id);
              }}
              aria-label={`Archive note for ${note.studentName}`}
            >
              <Archive size={15} />
              Archive
            </button>
          </>
        )}
      </footer>
    </motion.article>
  );
}

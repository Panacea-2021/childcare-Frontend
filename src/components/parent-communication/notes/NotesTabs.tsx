'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Archive, Inbox } from 'lucide-react';

export type NotesListView = 'inbox' | 'archived';

interface NotesTabsProps {
  view: NotesListView;
  inboxCount: number;
  archivedCount: number;
  onChange: (view: NotesListView) => void;
}

export function NotesTabs({ view, inboxCount, archivedCount, onChange }: NotesTabsProps) {
  return (
    <div className="notes-tabs" role="tablist" aria-label="Notes lists">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'inbox'}
        className={`notes-tab ${view === 'inbox' ? 'is-active' : ''}`}
        onClick={() => onChange('inbox')}
      >
        <Inbox size={16} aria-hidden />
        Inbox
        <span className="notes-tab-count">{inboxCount}</span>
        {view === 'inbox' ? (
          <motion.span className="notes-tab-indicator" layoutId="notes-tab-indicator" />
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'archived'}
        className={`notes-tab ${view === 'archived' ? 'is-active' : ''}`}
        onClick={() => onChange('archived')}
      >
        <Archive size={16} aria-hidden />
        Archives
        <span className="notes-tab-count">{archivedCount}</span>
        {view === 'archived' ? (
          <motion.span className="notes-tab-indicator" layoutId="notes-tab-indicator" />
        ) : null}
      </button>
    </div>
  );
}

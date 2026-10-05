'use client';

import { motion } from 'framer-motion';
import {
  Archive,
  BellOff,
  Download,
  FileText,
  Image as ImageIcon,
  Link2,
  LogOut,
  Pin,
  Trash2,
  X,
} from 'lucide-react';
import type { Conversation } from './types';
import { avatarTone } from './utils';

type Props = {
  conversation: Conversation;
  onClose: () => void;
  onMute: () => void;
  onArchive: () => void;
  onClear: () => void;
  onExport: () => void;
  mobileOpen?: boolean;
};

export function DetailsPanel({
  conversation,
  onClose,
  onMute,
  onArchive,
  onClear,
  onExport,
  mobileOpen,
}: Props) {
  const isGroup = conversation.kind === 'group';
  const title = isGroup ? conversation.groupName : conversation.parentName;

  return (
    <aside
      className={`pm-panel pm-details-panel ${mobileOpen ? 'is-open-mobile' : ''}`}
      aria-label="Conversation details"
    >
      <div className="pm-details">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button type="button" className="pm-icon-btn" onClick={onClose} aria-label="Close details">
            <X size={16} />
          </button>
        </div>

        <motion.div
          className="pm-profile-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <div className={`pm-avatar lg ${avatarTone(conversation.avatar)}`}>{conversation.avatar}</div>
            {!isGroup ? (
              <div className={`pm-avatar lg ${avatarTone(conversation.studentAvatar)}`}>
                {conversation.studentAvatar}
              </div>
            ) : null}
          </div>
          <h3>{title}</h3>
          <p>
            {isGroup
              ? conversation.groupDescription
              : `${conversation.relationship} of ${conversation.studentName}`}
          </p>
          {isGroup && conversation.members ? (
            <div className="pm-avatar-stack">
              {conversation.members.slice(0, 4).map((m) => (
                <div key={m.id} className={`pm-avatar sm ${avatarTone(m.avatar)}`} title={m.name}>
                  {m.avatar}
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>

        <div className="pm-detail-section">
          <h4>{isGroup ? 'Group info' : 'Contact details'}</h4>
          {!isGroup ? (
            <>
              <div className="pm-detail-row">
                <span>Phone</span>
                <strong>{conversation.phone}</strong>
              </div>
              <div className="pm-detail-row">
                <span>Email</span>
                <strong>{conversation.email}</strong>
              </div>
              <div className="pm-detail-row">
                <span>Class</span>
                <strong>
                  {conversation.className}-{conversation.section}
                </strong>
              </div>
              <div className="pm-detail-row">
                <span>Admission No</span>
                <strong>{conversation.admissionNo}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="pm-detail-row">
                <span>Students</span>
                <strong>{conversation.studentCount}</strong>
              </div>
              <div className="pm-detail-row">
                <span>Parents</span>
                <strong>{conversation.parentCount}</strong>
              </div>
              <div className="pm-detail-row">
                <span>Class</span>
                <strong>
                  {conversation.className} {conversation.section}
                </strong>
              </div>
            </>
          )}
          <div className="pm-detail-row">
            <span>Media</span>
            <strong>{conversation.mediaCount}</strong>
          </div>
          <div className="pm-detail-row">
            <span>Files</span>
            <strong>{conversation.fileCount}</strong>
          </div>
          <div className="pm-detail-row">
            <span>Links</span>
            <strong>{conversation.linkCount}</strong>
          </div>
        </div>

        {isGroup && conversation.members ? (
          <div className="pm-detail-section">
            <h4>Members</h4>
            {conversation.members.map((m) => (
              <div key={m.id} className="pm-member-row">
                <div className={`pm-avatar sm ${avatarTone(m.avatar)}`}>{m.avatar}</div>
                <div className="meta">
                  <strong>{m.name}</strong>
                  <small>
                    {m.kind} · Joined {m.joinedAt}
                  </small>
                </div>
                {m.role === 'admin' ? <span className="pm-admin-badge">Admin</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="pm-detail-section">
          <h4>Recent photos</h4>
          <div className="pm-media-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pm-media-cell" aria-hidden>
                <ImageIcon size={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="pm-detail-section">
          <h4>Shared</h4>
          <div className="pm-action-list">
            <button type="button" className="pm-action-btn">
              <FileText size={16} /> Recent files ({conversation.fileCount})
            </button>
            <button type="button" className="pm-action-btn">
              <Link2 size={16} /> Shared links ({conversation.linkCount})
            </button>
            <button type="button" className="pm-action-btn">
              <Pin size={16} /> Pinned messages
            </button>
          </div>
        </div>

        <div className="pm-detail-section">
          <h4>Actions</h4>
          <div className="pm-action-list">
            <button type="button" className="pm-action-btn" onClick={onMute}>
              <BellOff size={16} /> {conversation.muted ? 'Unmute notifications' : 'Mute notifications'}
            </button>
            <button type="button" className="pm-action-btn" onClick={onArchive}>
              <Archive size={16} /> {conversation.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button type="button" className="pm-action-btn" onClick={onExport}>
              <Download size={16} /> Export chat
            </button>
            {isGroup ? (
              <button type="button" className="pm-action-btn danger">
                <LogOut size={16} /> Leave group
              </button>
            ) : null}
            <button type="button" className="pm-action-btn danger" onClick={onClear}>
              <Trash2 size={16} /> Clear chat
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

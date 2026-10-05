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
  const title = isGroup ? conversation.groupName : conversation.staffName;

  return (
    <aside
      className={`sm-panel sm-details-panel ${mobileOpen ? 'is-open-mobile' : ''}`}
      aria-label="Staff conversation details"
    >
      <div className="sm-details">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button type="button" className="sm-icon-btn" onClick={onClose} aria-label="Close details">
            <X size={16} />
          </button>
        </div>

        <motion.div
          className="sm-profile-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <div className={`sm-avatar lg ${avatarTone(conversation.avatar)}`}>{conversation.avatar}</div>
          </div>
          <h3>{title}</h3>
          <p>
            {isGroup
              ? conversation.groupDescription
              : `${conversation.designation} · ${conversation.department}`}
          </p>
          {isGroup && conversation.members ? (
            <div className="sm-avatar-stack">
              {conversation.members.slice(0, 4).map((m) => (
                <div key={m.id} className={`sm-avatar sm ${avatarTone(m.avatar)}`} title={m.name}>
                  {m.avatar}
                </div>
              ))}
            </div>
          ) : null}
          {!isGroup ? (
            <p style={{ marginTop: 8, fontSize: '0.8rem' }}>
              {conversation.online ? (
                <span className="sm-status-online">Online</span>
              ) : (
                `Last seen ${conversation.lastActive}`
              )}
            </p>
          ) : null}
        </motion.div>

        <div className="sm-detail-section">
          <h4>{isGroup ? 'Group info' : 'Staff profile'}</h4>
          {!isGroup ? (
            <>
              <div className="sm-detail-row">
                <span>Employee ID</span>
                <strong>{conversation.employeeId}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Designation</span>
                <strong>{conversation.designation}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Department</span>
                <strong>{conversation.department}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Email</span>
                <strong>{conversation.email}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Phone</span>
                <strong>{conversation.phone}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Joined</span>
                <strong>{conversation.joinedDate}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Status</span>
                <strong>{conversation.online ? 'Online' : 'Away'}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="sm-detail-row">
                <span>Members</span>
                <strong>{conversation.memberCount}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Department</span>
                <strong>{conversation.department}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Created by</span>
                <strong>{conversation.createdBy ?? '—'}</strong>
              </div>
              <div className="sm-detail-row">
                <span>Created</span>
                <strong>{conversation.createdDate ?? conversation.joinedDate}</strong>
              </div>
            </>
          )}
          <div className="sm-detail-row">
            <span>Media</span>
            <strong>{conversation.mediaCount}</strong>
          </div>
          <div className="sm-detail-row">
            <span>Files</span>
            <strong>{conversation.fileCount}</strong>
          </div>
          <div className="sm-detail-row">
            <span>Links</span>
            <strong>{conversation.linkCount}</strong>
          </div>
        </div>

        {isGroup && conversation.members ? (
          <div className="sm-detail-section">
            <h4>Members</h4>
            {conversation.members.map((m) => (
              <div key={m.id} className="sm-member-row">
                <div className={`sm-avatar sm ${avatarTone(m.avatar)}`}>{m.avatar}</div>
                <div className="meta">
                  <strong>{m.name}</strong>
                  <small>
                    {m.designation} · {m.department} · Joined {m.joinedAt}
                  </small>
                </div>
                {m.role === 'admin' ? <span className="sm-admin-badge">Admin</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="sm-detail-section">
          <h4>Recent photos</h4>
          <div className="sm-media-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sm-media-cell" aria-hidden>
                <ImageIcon size={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="sm-detail-section">
          <h4>Shared</h4>
          <div className="sm-action-list">
            <button type="button" className="sm-action-btn">
              <FileText size={16} /> Recent files ({conversation.fileCount})
            </button>
            <button type="button" className="sm-action-btn">
              <ImageIcon size={16} /> Recent images ({conversation.mediaCount})
            </button>
            <button type="button" className="sm-action-btn">
              <Link2 size={16} /> Shared links ({conversation.linkCount})
            </button>
            <button type="button" className="sm-action-btn">
              <Pin size={16} /> Pinned messages
            </button>
          </div>
        </div>

        <div className="sm-detail-section">
          <h4>Actions</h4>
          <div className="sm-action-list">
            <button type="button" className="sm-action-btn" onClick={onMute}>
              <BellOff size={16} /> {conversation.muted ? 'Unmute notifications' : 'Mute notifications'}
            </button>
            <button type="button" className="sm-action-btn" onClick={onArchive}>
              <Archive size={16} /> {conversation.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button type="button" className="sm-action-btn" onClick={onExport}>
              <Download size={16} /> Export chat
            </button>
            {isGroup ? (
              <button type="button" className="sm-action-btn danger">
                <LogOut size={16} /> Leave group
              </button>
            ) : null}
            <button type="button" className="sm-action-btn danger" onClick={onClear}>
              <Trash2 size={16} /> Clear chat
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  Building2,
  CalendarDays,
  Clock3,
  Eye,
  Link2,
  Mail,
  MessageSquare,
  Paperclip,
  Pencil,
  Smartphone,
  Trash2,
  Users,
} from 'lucide-react';
import type { Announcement } from './types';
import { roomOptions, staffOptions } from './mockData';
import { formatDisplayDate, formatDisplayTime } from './utils';

type Props = {
  announcement: Announcement;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const METHOD_META = {
  email: { label: 'Email', Icon: Mail },
  whatsapp: { label: 'WhatsApp', Icon: MessageSquare },
  sms: { label: 'SMS', Icon: Smartphone },
} as const;

export function AnnouncementCard({ announcement: a, index, onView, onEdit, onDelete }: Props) {
  const room = roomOptions.find((r) => r.id === a.roomId);
  const staffLabel =
    a.mode === 'staff'
      ? `${a.staffIds.length} staff`
      : room?.name ?? 'Room';

  return (
    <motion.article
      className="sa-card"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div className="sa-card-top">
        <h3>{a.title}</h3>
        <span className={`sa-status ${a.status}`}>
          <span className="sa-status-dot" aria-hidden />
          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
        </span>
      </div>

      <p className="sa-card-note">{a.note}</p>

      <div className="sa-meta-row">
        <span className="sa-meta-chip">
          <CalendarDays size={12} aria-hidden />
          {formatDisplayDate(a.date)}
        </span>
        <span className="sa-meta-chip muted">
          <Clock3 size={12} aria-hidden />
          {formatDisplayTime(a.time)}
        </span>
        <span className="sa-meta-chip">
          {a.mode === 'staff' ? <Users size={12} aria-hidden /> : <Building2 size={12} aria-hidden />}
          {a.mode === 'staff' ? 'Staff' : 'Room'} · {staffLabel}
        </span>
        {a.attachments.length > 0 ? (
          <span className="sa-meta-chip muted">
            <Paperclip size={12} aria-hidden />
            {a.attachments.length} file{a.attachments.length > 1 ? 's' : ''}
          </span>
        ) : null}
        {a.referenceLink ? (
          <span className="sa-meta-chip muted">
            <Link2 size={12} aria-hidden />
            Link
          </span>
        ) : null}
      </div>

      <div className="sa-methods">
        {a.methods.map((m) => {
          const meta = METHOD_META[m];
          const Icon = meta.Icon;
          return (
            <span key={m} className={`sa-method-pill ${m}`}>
              <Icon size={11} aria-hidden />
              {meta.label}
            </span>
          );
        })}
      </div>

      {a.mode === 'staff' && a.staffIds.length > 0 ? (
        <div className="sa-avatar-stack" aria-label="Recipients">
          {a.staffIds.slice(0, 5).map((id) => {
            const s = staffOptions.find((x) => x.id === id);
            return <span key={id}>{s?.avatar ?? '?'}</span>;
          })}
        </div>
      ) : null}

      <div className="sa-card-footer">
        <span className="sa-created">Created by {a.createdBy}</span>
        <div className="sa-card-actions">
          <motion.button
            type="button"
            className="sa-icon-btn"
            onClick={onView}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View announcement"
          >
            <span className="sa-tooltip">View</span>
            <Eye size={16} />
          </motion.button>
          <motion.button
            type="button"
            className="sa-icon-btn"
            onClick={onEdit}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Edit announcement"
          >
            <span className="sa-tooltip">Edit</span>
            <Pencil size={16} />
          </motion.button>
          <motion.button
            type="button"
            className="sa-icon-btn danger"
            onClick={onDelete}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Delete announcement"
          >
            <span className="sa-tooltip">Delete</span>
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

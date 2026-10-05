'use client';

import { motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Film,
  Image as ImageIcon,
  MapPin,
  Music,
  RotateCcw,
  User,
} from 'lucide-react';
import type { ChatMessage } from './types';
import { formatMessageTime } from './utils';

type Props = {
  message: ChatMessage;
  onReply?: (m: ChatMessage) => void;
  onRetry?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
};

function FileIcon({ type }: { type: ChatMessage['type'] }) {
  if (type === 'excel') return <FileSpreadsheet size={18} />;
  if (type === 'zip') return <FileArchive size={18} />;
  if (type === 'video') return <Film size={18} />;
  if (type === 'audio' || type === 'voice') return <Music size={18} />;
  if (type === 'image') return <ImageIcon size={18} />;
  return <FileText size={18} />;
}

function StatusTicks({ status, mine }: { status: ChatMessage['status']; mine: boolean }) {
  if (!mine) return null;
  if (status === 'failed') return <span aria-label="Failed">!</span>;
  if (status === 'sending') return <span aria-label="Sending">…</span>;
  if (status === 'read') return <CheckCheck size={14} style={{ color: '#93c5fd' }} aria-label="Read" />;
  if (status === 'delivered') return <CheckCheck size={14} aria-label="Delivered" />;
  return <Check size={14} aria-label="Sent" />;
}

export function MessageBubble({ message, onReply, onRetry, onReact }: Props) {
  if (message.type === 'system') {
    return (
      <motion.div
        className="pm-bubble system"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ alignSelf: 'center' }}
      >
        {message.content}
      </motion.div>
    );
  }

  if (message.deleted || message.type === 'deleted') {
    return (
      <div className={`pm-bubble-row ${message.mine ? 'mine' : 'theirs'}`}>
        <div className={`pm-bubble ${message.mine ? 'mine' : 'theirs'}`} style={{ opacity: 0.7, fontStyle: 'italic' }}>
          This message was deleted
          <div className="pm-bubble-foot">
            <span>{formatMessageTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`pm-bubble-row ${message.mine ? 'mine' : 'theirs'}`}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onDoubleClick={() => onReply?.(message)}
    >
      <div className={`pm-bubble ${message.mine ? 'mine' : 'theirs'}`}>
        {!message.mine && message.senderName !== 'You' ? (
          <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, opacity: 0.85 }}>
            {message.senderName}
          </div>
        ) : null}

        {message.forwarded ? (
          <div style={{ fontSize: '0.7rem', opacity: 0.75, marginBottom: 4 }}>Forwarded</div>
        ) : null}

        {message.replyTo ? (
          <div className="pm-reply-preview">
            <strong>{message.replyTo.senderName}</strong>
            <div>{message.replyTo.preview}</div>
          </div>
        ) : null}

        {message.type === 'image' || message.type === 'gif' ? (
          <div className="pm-media-thumb" aria-label={message.content}>
            <ImageIcon size={28} />
          </div>
        ) : null}

        {message.type === 'sticker' || message.type === 'emoji' ? (
          <div style={{ fontSize: '2.4rem', lineHeight: 1 }}>{message.content}</div>
        ) : null}

        {message.type === 'voice' || message.type === 'audio' ? (
          <div className="pm-voice-bar">
            <Music size={16} />
            <div className="pm-voice-wave" aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <i key={i} style={{ animationDelay: `${i * 0.05}s`, height: 6 + ((i * 7) % 14) }} />
              ))}
            </div>
            <span>{message.duration ?? '0:12'}</span>
          </div>
        ) : null}

        {['pdf', 'word', 'excel', 'powerpoint', 'zip', 'video'].includes(message.type) ? (
          <div className="pm-file-card">
            <span className="pm-file-icon">
              <FileIcon type={message.type} />
            </span>
            <span>
              <strong>{message.fileName ?? message.content}</strong>
              <small>{message.fileSize ?? 'File'}</small>
            </span>
          </div>
        ) : null}

        {message.type === 'location' && message.locationMeta ? (
          <div className="pm-file-card">
            <span className="pm-file-icon">
              <MapPin size={18} />
            </span>
            <span>
              <strong>{message.locationMeta.label}</strong>
              <small>{message.locationMeta.address}</small>
            </span>
          </div>
        ) : null}

        {message.type === 'contact' && message.contactMeta ? (
          <div className="pm-file-card">
            <span className="pm-file-icon">
              <User size={18} />
            </span>
            <span>
              <strong>{message.contactMeta.name}</strong>
              <small>{message.contactMeta.phone}</small>
            </span>
          </div>
        ) : null}

        {message.type === 'link' && message.linkMeta ? (
          <>
            <div>{message.content}</div>
            <div className="pm-link-card">
              <strong>{message.linkMeta.title}</strong>
              <p>{message.linkMeta.description}</p>
              <small>{message.linkMeta.domain}</small>
            </div>
          </>
        ) : null}

        {message.type === 'text' ? <div>{message.content}</div> : null}

        {message.reactions?.length ? (
          <div className="pm-reactions">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                className="pm-reaction"
                onClick={() => onReact?.(message.id, r.emoji)}
                aria-label={`Reaction ${r.emoji}`}
              >
                {r.emoji} {r.count}
              </button>
            ))}
          </div>
        ) : null}

        <div className="pm-bubble-foot">
          {message.edited ? <span>Edited</span> : null}
          <span>{formatMessageTime(message.timestamp)}</span>
          <StatusTicks status={message.status} mine={message.mine} />
          {message.status === 'failed' ? (
            <button
              type="button"
              className="pm-icon-btn"
              style={{ width: 22, height: 22 }}
              onClick={() => onRetry?.(message.id)}
              aria-label="Retry send"
            >
              <RotateCcw size={12} />
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

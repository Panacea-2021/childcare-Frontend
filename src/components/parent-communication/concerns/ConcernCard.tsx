'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Eye, GitBranch } from 'lucide-react';
import { StudentAvatar } from '@/components/parent-communication/shared/StudentAvatar';
import { StatusBadge } from '@/components/parent-communication/shared/StatusBadge';
import { PriorityBadge } from '@/components/parent-communication/shared/PriorityBadge';
import type { ConcernStatus, ParentConcern } from '@/types/concern';

interface ConcernCardProps {
  concern: ParentConcern;
  index: number;
  onView: (concern: ParentConcern) => void;
  onTimeline: (concern: ParentConcern) => void;
  onStatusChange: (id: string, status: ConcernStatus) => void;
}

const accent: Record<ParentConcern['priority'], string> = {
  High: '#E53935',
  Medium: '#F59E0B',
  Low: '#3B82F6',
};

function formatDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function ConcernCard({
  concern,
  index,
  onView,
  onTimeline,
  onStatusChange,
}: ConcernCardProps) {
  return (
    <motion.article
      className="concerns-card"
      style={{ '--concern-accent': accent[concern.priority] } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="concerns-card-ribbon">
        <PriorityBadge priority={concern.priority} variant="ribbon" />
      </div>

      <div className="concerns-card-accent" aria-hidden />

      <header className="concerns-card-head">
        <StudentAvatar
          name={concern.studentName}
          initials={concern.studentInitials}
          color={concern.studentPhotoColor}
          className="concerns-card-avatar"
        />
        <div className="concerns-card-meta">
          <h3 className="concerns-card-student">{concern.studentName}</h3>
          <p className="concerns-card-room">{concern.room}</p>
          <p className="concerns-card-raised">
            Raised by {concern.raisedBy}
            <span aria-hidden> · </span>
            {concern.relationship}
          </p>
        </div>
        <div className="concerns-card-when">
          <span>{formatDate(concern.date)}</span>
          <span>{formatTime(concern.time)}</span>
        </div>
      </header>

      <div className="concerns-card-body">
        <h4 className="concerns-card-title">{concern.title}</h4>
        <p className="concerns-card-desc">{concern.description}</p>
      </div>

      <footer className="concerns-card-footer">
        <StatusBadge status={concern.status} />
        <div className="concerns-card-actions">
          <div className="concerns-status-btn-wrap">
            <select
              className="concerns-status-btn"
              value={concern.status}
              onChange={(e) => onStatusChange(concern.id, e.target.value as ConcernStatus)}
              aria-label={`Update status for ${concern.title}`}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown size={14} className="concerns-status-btn-caret" aria-hidden />
          </div>
          <button
            type="button"
            className="ui-btn ui-btn-primary concerns-card-btn"
            onClick={() => onView(concern)}
            aria-label={`View details for ${concern.title}`}
          >
            <Eye size={15} />
            View Details
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline concerns-card-btn"
            onClick={() => onTimeline(concern)}
            aria-label={`View timeline for ${concern.title}`}
          >
            <GitBranch size={15} />
            Timeline
          </button>
        </div>
      </footer>
    </motion.article>
  );
}

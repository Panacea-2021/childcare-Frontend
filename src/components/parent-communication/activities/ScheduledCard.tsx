'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  Lock,
  Users,
  Edit3,
  Copy,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import type { ActivityPost } from '@/types/activity';
import { getActivityIcon } from './activityIconMap';
import { AuthorAvatar } from './AuthorAvatar';

interface ScheduledCardProps {
  post: ActivityPost;
  onDelete: (id: string) => void;
  onDuplicate?: (post: ActivityPost) => void;
  onUpdate?: (id: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(timestamp?: number): TimeLeft {
  if (!timestamp) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const diff = Math.max(0, timestamp - Date.now());
  if (diff === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

function padUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function ScheduledCard({ post, onDelete, onDuplicate, onUpdate }: ScheduledCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    computeTimeLeft(post.scheduledTimestamp),
  );

  useEffect(() => {
    setTimeLeft(computeTimeLeft(post.scheduledTimestamp));
    const interval = window.setInterval(() => {
      setTimeLeft(computeTimeLeft(post.scheduledTimestamp));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [post.scheduledTimestamp]);

  const handleEdit = useCallback(() => {
    onUpdate?.(post.id);
  }, [onUpdate, post.id]);

  const handleReschedule = useCallback(() => {
    window.alert('Reschedule post — UI preview only.');
  }, []);

  const TypeIcon = getActivityIcon(post.activityIcon);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="act-scheduled-card act-sched-card"
    >
      <div className="act-countdown-banner">
        <span>
          <Clock size={16} aria-hidden />
          {timeLeft.expired ? 'Ready to publish' : 'Publishing in:'}
        </span>
        {!timeLeft.expired && (
          <span>
            <span className="act-countdown-unit">{timeLeft.days}d</span>
            <span className="act-countdown-unit">{padUnit(timeLeft.hours)}h</span>
            <span className="act-countdown-unit">{padUnit(timeLeft.minutes)}m</span>
            <span className="act-countdown-unit">{padUnit(timeLeft.seconds)}s</span>
          </span>
        )}
      </div>

      <div className="act-card-top-bar">
        <span className="act-tag-badge">
          <TypeIcon size={12} aria-hidden />
          {post.activityTypeName}
        </span>
        <span className="act-badge-room">{post.room}</span>
        {post.visibility === 'staff_only' ? (
          <span className="act-badge-staff">
            <Lock size={12} aria-hidden />
            Staff Only
          </span>
        ) : (
          <span className="act-badge-parents">Parents</span>
        )}
      </div>

      <h3 className="act-card-title">{post.title}</h3>
      <p className="act-card-text">{post.content}</p>

      <div className="act-card-top-bar">
        <span className="act-badge-students">
          <Calendar size={14} aria-hidden />
          {post.scheduledDate ?? post.createdDate} at {post.scheduledTime ?? post.createdTime}
        </span>
        <span className="act-badge-students">
          <Users size={14} aria-hidden />
          {post.studentCount} students
        </span>
      </div>

      <div className="act-card-footer act-card-actions">
        <div className="act-card-author">
          <AuthorAvatar
            name={post.postedBy.name}
            src={post.postedBy.avatar}
            alt={post.postedBy.name}
            size={32}
          />
          <p className="act-author-meta">
            Scheduled by <strong className="act-author-name">{post.postedBy.name}</strong>
          </p>
        </div>

        <div className="act-card-actions">
          <button type="button" className="act-card-btn act-icon-btn" onClick={handleEdit}>
            <Edit3 size={14} />
            Edit
          </button>
          <button
            type="button"
            className="act-card-btn act-icon-btn"
            onClick={() => onDuplicate?.(post)}
          >
            <Copy size={14} />
            Duplicate
          </button>
          <button type="button" className="act-card-btn act-icon-btn" onClick={handleReschedule}>
            <CalendarDays size={14} />
            Reschedule
          </button>
          <button
            type="button"
            className="act-card-btn act-icon-btn"
            onClick={() => onDelete(post.id)}
            style={{ color: 'var(--color-danger, #e53935)' }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}

'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  ImageIcon,
  MessageCircle,
  Play,
  FileText,
} from 'lucide-react';
import { ACTIVITY_ICON_MAP } from '@/components/parent-communication/activities/ActivitySelector';
import {
  formatTimelineTime,
  togglePostLike,
  type ParentTimelinePost,
} from '@/lib/parent/parentTimelineStore';
import type { ActivityAttachment } from '@/types/activity';

type Props = {
  post: ParentTimelinePost;
  parentId: string;
  index: number;
  onOpenMedia: (items: ActivityAttachment[], index: number) => void;
  onChanged: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function TimelineActivityCard({
  post,
  parentId,
  index,
  onOpenMedia,
  onChanged,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(() => post.likedBy.includes(parentId));
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [burst, setBurst] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setLiked(post.likedBy.includes(parentId));
    setLikeCount(post.likesCount);
  }, [post.id, post.likesCount, post.likedBy, parentId]);

  const Icon = ACTIVITY_ICON_MAP[post.activityIcon] ?? ImageIcon;
  const media = post.attachments.filter(
    (a) => a.type === 'image' || a.type === 'video',
  );
  const commentLabel =
    post.comments.length === 1 ? '1 Comment' : `${post.comments.length} Comments`;

  const onLike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!post.allowParentReactions || liking) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    if (nextLiked) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 420);
    }

    setLiking(true);
    try {
      togglePostLike(post.id, parentId);
      onChanged();
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.article
      className="ptl-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.18), ease }}
    >
      <header className="ptl-card-head">
        <span
          className="ptl-card-type-ico"
          style={{ background: post.activityBgColor, color: post.activityColor }}
          aria-hidden
        >
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <div className="ptl-card-meta">
          <h3>{post.activityTypeName}</h3>
          <p>
            {formatTimelineTime(post.createdAt)}
            {post.postedByName ? ` · ${post.postedByName}` : ''}
          </p>
        </div>
      </header>

      {post.title ? <h4 className="ptl-card-title">{post.title}</h4> : null}

      {media.length > 0 ? (
        <div
          className={`ptl-media-grid ptl-media-count-${Math.min(media.length, 4)}${media.length > 4 ? ' has-more' : ''}`}
          role="group"
          aria-label={`${media.length} media item${media.length === 1 ? '' : 's'}`}
        >
          {media.slice(0, 4).map((item, i) => {
            const extra = i === 3 && media.length > 4 ? media.length - 4 : 0;
            return (
              <button
                key={item.id}
                type="button"
                className={`ptl-media-tile${item.type === 'video' ? ' is-video' : ''}`}
                onClick={() => onOpenMedia(media, i)}
                aria-label={
                  extra > 0
                    ? `View ${extra + 1} more media items`
                    : `View ${item.type === 'video' ? 'video' : 'image'} ${i + 1}`
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail || item.url}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.35';
                  }}
                />
                {item.type === 'video' && extra === 0 ? (
                  <span className="ptl-media-play" aria-hidden>
                    <Play size={18} fill="currentColor" />
                  </span>
                ) : null}
                {extra > 0 ? (
                  <span className="ptl-media-more">+{extra}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : post.attachments.length > 0 ? (
        <div className="ptl-files">
          {post.attachments.slice(0, 3).map((a) => (
            <span key={a.id} className="ptl-file-chip">
              <FileText size={14} />
              {a.name}
            </span>
          ))}
        </div>
      ) : null}

      {post.note ? (
        <div className="ptl-note">
          <span>Note</span>
          <p>{post.note}</p>
        </div>
      ) : null}

      {post.fieldValues && Object.keys(post.fieldValues).length > 0 ? (
        <div className="ptl-fields">
          {Object.entries(post.fieldValues).map(([key, val]) => (
            <div key={key} className="ptl-field-chip">
              <em>{key}</em>
              <strong>
                {Array.isArray(val)
                  ? val.join(', ')
                  : typeof val === 'boolean'
                    ? val
                      ? 'Yes'
                      : 'No'
                    : String(val)}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      <footer className="ptl-card-foot">
        <button
          type="button"
          className={`ptl-like${liked ? ' is-on' : ''}${burst ? ' is-burst' : ''}`}
          onClick={onLike}
          disabled={!post.allowParentReactions || liking}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>Liked by {likeCount}</span>
        </button>

        <button
          type="button"
          className="ptl-comments-btn"
          onClick={() => router.push(`/parent/timeline/${post.id}/comments`)}
          disabled={!post.enableComments}
          aria-label={commentLabel}
        >
          <MessageCircle size={16} />
          <span>{commentLabel}</span>
        </button>
      </footer>
    </motion.article>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownToLine, ImageIcon, Play } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import type { ActivityAttachment } from '@/types/activity';
import {
  ensureParentTimelineSeed,
  listParentTimelinePosts,
} from '@/lib/parent/parentTimelineStore';
import { listActivityMediaForStudent } from '@/lib/parent-communication/activitiesPostsStore';
import { AppSelect } from '@/components/modules/center-management/ui';
import { TimelineMediaViewer } from '@/components/parent/timeline/TimelineMediaViewer';
import '@/components/parent/timeline/parent-timeline.css';
import './parent-gallery.css';

type GalleryItem = ActivityAttachment & {
  postId: string;
  postTitle: string;
  activityTypeName: string;
  createdAt: string;
  favourite?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  student: Student;
};

export function ParentGalleryTab({ student }: Props) {
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState('all');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    ensureParentTimelineSeed(student.id);
    setTick((n) => n + 1);
    const onFocus = () => setTick((n) => n + 1);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, [student.id]);

  const items = useMemo(() => {
    void tick;
    ensureParentTimelineSeed(student.id);
    const list: GalleryItem[] = [];
    const seen = new Set<string>();

    for (const post of listParentTimelinePosts(student.id)) {
      for (const att of post.attachments ?? []) {
        if (att.type !== 'image' && att.type !== 'video') continue;
        if (!att.url || att.url === '#') continue;
        const key = `${post.id}-${att.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({
          ...att,
          postId: post.id,
          postTitle: post.title || post.activityTypeName,
          activityTypeName: post.activityTypeName,
          createdAt: post.createdAt,
        });
      }
    }

    for (const m of listActivityMediaForStudent(student.id, { parentsOnly: true })) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      list.push({
        id: m.id,
        name: m.name,
        type: m.type === 'Video' ? 'video' : 'image',
        url: m.url,
        thumbnail: m.thumbnail,
        postId: m.postId,
        postTitle: m.postTitle,
        activityTypeName: m.activityTypeName,
        createdAt: m.createdDate,
      });
    }

    return list;
  }, [student.id, tick]);

  const filtered = useMemo(() => {
    if (filter === 'Photo') return items.filter((i) => i.type === 'image');
    if (filter === 'Video') return items.filter((i) => i.type === 'video');
    if (filter === 'Favourite') return items.filter((i) => i.favourite);
    return items;
  }, [items, filter]);

  const viewerItems = useMemo(
    () =>
      filtered.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        url: i.url,
        thumbnail: i.thumbnail,
      })),
    [filtered],
  );

  return (
    <section className="cm-tab-card cm-tab-card-fill pg-gallery">
      <div className="cm-forms-head">
        <div className="cm-tab-card-title">
          <ImageIcon size={16} />
          <strong>
            Gallery <em>({filtered.length})</em>
          </strong>
        </div>
        <div className="cm-forms-toolbar">
          <div className="cm-toolbar-select">
            <AppSelect
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All Media' },
                { value: 'Favourite', label: 'Favourite' },
                { value: 'Photo', label: 'Photo' },
                { value: 'Video', label: 'Video' },
              ]}
            />
          </div>
          <button
            type="button"
            className="cm-icon-btn"
            aria-label="Download"
            title="Download"
            onClick={() => {
              const current = viewerIndex != null ? filtered[viewerIndex] : filtered[0];
              if (!current?.url) return;
              const a = document.createElement('a');
              a.href = current.url;
              a.download = current.name || 'gallery-media';
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.click();
            }}
          >
            <ArrowDownToLine size={16} />
          </button>
        </div>
      </div>

      {filtered.length ? (
        <div className="pg-gallery-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.button
                key={`${item.postId}-${item.id}`}
                type="button"
                className="pg-gallery-tile"
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ delay: Math.min(i * 0.04, 0.28), duration: 0.34, ease }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewerIndex(i)}
                aria-label={`Open ${item.name}`}
              >
                <span className="pg-gallery-media">
                  {item.type === 'video' ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnail || item.url} alt="" />
                      <span className="pg-gallery-play">
                        <Play size={18} fill="currentColor" />
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" loading="lazy" />
                  )}
                  <span className="pg-gallery-shine" aria-hidden />
                </span>
                <span className="pg-gallery-meta">
                  <strong>{item.postTitle}</strong>
                  <em>{item.activityTypeName}</em>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.p
          className="cm-empty-msg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No photos and videos available from activity posts yet.
        </motion.p>
      )}

      {viewerIndex != null && viewerItems.length ? (
        <TimelineMediaViewer
          items={viewerItems}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </section>
  );
}

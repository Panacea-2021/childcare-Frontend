'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import type { ActivityPost } from '@/types/activity';
import { ScheduledCard } from './ScheduledCard';

interface ActivityTimelineProps {
  scheduledPosts: ActivityPost[];
  onDeleteScheduled: (id: string) => void;
  onDuplicate?: (post: ActivityPost) => void;
  onUpdate?: (id: string) => void;
}

export function ActivityTimeline({
  scheduledPosts,
  onDeleteScheduled,
  onDuplicate,
  onUpdate,
}: ActivityTimelineProps) {
  if (scheduledPosts.length === 0) {
    return (
      <section className="act-empty" aria-label="No scheduled activities">
        <div className="act-empty-core" style={{ margin: '0 auto 20px', width: '80px', height: '80px' }}>
          <CalendarClock size={36} />
        </div>
        <h2 className="act-empty-title">No Scheduled Activities</h2>
        <p className="act-empty-desc">
          There are no posts currently scheduled in the queue.
        </p>
      </section>
    );
  }

  return (
    <motion.ol
      className="act-timeline act-timeline-wrap"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      aria-label="Scheduled activity timeline"
    >
      {scheduledPosts.map((post) => (
        <motion.li
          key={post.id}
          className="act-timeline-item"
          variants={{
            hidden: { opacity: 0, x: -16 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
          }}
        >
          <ScheduledCard
            post={post}
            onDelete={onDeleteScheduled}
            onDuplicate={onDuplicate}
            onUpdate={onUpdate}
          />
        </motion.li>
      ))}
    </motion.ol>
  );
}

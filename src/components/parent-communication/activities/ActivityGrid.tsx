'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ActivityPost } from '@/types/activity';
import { ActivityCard } from './ActivityCard';

interface ActivityGridProps {
  activities: ActivityPost[];
  onToggleLike?: (id: string) => void;
  onToggleBookmark?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUpdate?: (id: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function ActivityGrid({
  activities,
  onToggleLike,
  onToggleBookmark,
  onDelete,
  onArchive,
  onUpdate,
}: ActivityGridProps) {
  return (
    <motion.div
      className="act-grid act-feed-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="feed"
      aria-label="Activity posts"
    >
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, delay: index * 0.04 },
            },
          }}
        >
          <ActivityCard
            activity={activity}
            onToggleLike={onToggleLike}
            onToggleBookmark={onToggleBookmark}
            onDelete={onDelete}
            onArchive={onArchive}
            onUpdate={onUpdate}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

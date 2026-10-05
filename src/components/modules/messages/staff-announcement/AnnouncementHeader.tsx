'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';

type Props = {
  onPost: () => void;
};

export function AnnouncementHeader({ onPost }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    onPost();
  };

  return (
    <CenterManagementPageHeader
      title="Staff Announcements"
      description="Create and manage announcements for staff members or entire rooms."
      icon={<Megaphone />}
      actions={
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary sa-btn-post"
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Post announcement"
        >
          <span className="sa-btn-post-glow" aria-hidden />
          {ripples.map((r) => (
            <span
              key={r.id}
              className="sa-btn-ripple"
              style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
              aria-hidden
            />
          ))}
          <Plus size={16} aria-hidden />
          Post Announcement
        </motion.button>
      }
    />
  );
}

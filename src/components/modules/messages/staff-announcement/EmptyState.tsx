'use client';

import { motion } from 'framer-motion';
import { Bell, Mail, Plus } from 'lucide-react';

type Props = {
  onCreate: () => void;
};

export function EmptyState({ onCreate }: Props) {
  return (
    <div className="sa-empty">
      <div className="sa-empty-art" aria-hidden>
        <motion.div
          className="sa-empty-mail"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mail size={36} strokeWidth={1.8} />
        </motion.div>
        <motion.span
          style={{ position: 'absolute', top: 8, right: 4, color: 'var(--color-accent)', opacity: 0.55 }}
          animate={{ y: [0, -8, 0], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          <Bell size={18} />
        </motion.span>
        <motion.span
          style={{ position: 'absolute', bottom: 12, left: 0, color: '#16a34a', opacity: 0.5 }}
          animate={{ y: [0, 6, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
        >
          <Bell size={14} />
        </motion.span>
      </div>
      <h3>No announcements have been posted yet.</h3>
      <p>Share updates with staff or entire rooms — email, WhatsApp, and SMS in one place.</p>
      <motion.button
        type="button"
        className="sa-btn-post"
        onClick={onCreate}
        whileHover={{ y: -2, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{ marginTop: 8 }}
      >
        <span className="sa-btn-post-glow" aria-hidden />
        <Plus size={16} aria-hidden />
        Create First Announcement
      </motion.button>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Send, Mail, MessageSquare } from 'lucide-react';

export function EmptyState() {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="act-empty"
      aria-label="No activities"
    >
      <div className="act-empty-graphic">
        <div className="act-empty-graphic-glow" />

        <motion.div
          animate={{ y: [-6, 6, -6], x: [-4, 4, -4], rotate: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="act-floating-icon"
          style={{ top: '-8px', right: '-12px' }}
        >
          <Send size={22} style={{ transform: 'rotate(45deg)' }} />
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6], x: [4, -4, 4], rotate: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="act-floating-icon"
          style={{ bottom: '8px', left: '-16px' }}
        >
          <Mail size={22} />
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.08, 1], y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="act-floating-icon"
          style={{ top: '24px', left: '-20px' }}
        >
          <MessageSquare size={20} />
        </motion.div>

        <div className="act-empty-core">
          <Send size={48} strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="act-empty-title">No Activities Yet</h2>
      <p className="act-empty-desc">
        Start sharing wonderful classroom moments with parents.
      </p>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/parent-communication/activities/post')}
        className="ui-btn ui-btn-primary act-empty-cta"
      >
        <Plus size={18} strokeWidth={2.5} />
        Post Activity
      </motion.button>
    </motion.section>
  );
}

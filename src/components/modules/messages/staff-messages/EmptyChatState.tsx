'use client';

import { motion } from 'framer-motion';
import { MessagesSquare } from 'lucide-react';

type Props = { className?: string };

export function EmptyChatState({ className = '' }: Props) {
  return (
    <section className={`sm-panel sm-chat-panel ${className}`.trim()} aria-label="No conversation selected">
      <div className="sm-empty">
        <div className="sm-empty-art" aria-hidden>
          <motion.div
            className="sm-empty-orb"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MessagesSquare size={36} />
          </motion.div>
          <motion.span
            className="sm-empty-float"
            style={{ top: 8, left: 8 }}
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            💬
          </motion.span>
          <motion.span
            className="sm-empty-float"
            style={{ bottom: 12, right: 6 }}
            animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.8, repeat: Infinity, delay: 0.3 }}
          >
            ✨
          </motion.span>
          <motion.span
            className="sm-empty-float"
            style={{ top: 20, right: 18, fontSize: 14 }}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            ···
          </motion.span>
        </div>
        <h3>Select a staff conversation</h3>
        <p>Select a staff conversation to begin messaging.</p>
      </div>
    </section>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Users, X } from 'lucide-react';
import type { ParentConversation } from '@/lib/parent/parentMessagesStore';

type Props = {
  open: boolean;
  conversation: ParentConversation | null;
  onClose: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ChatInfoDrawer({ open, conversation, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && conversation ? (
        <motion.aside
          className="pmh-info"
          initial={{ x: '100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.6 }}
          transition={{ duration: 0.28, ease }}
          aria-label="Conversation info"
        >
          <header className="pmh-info-head">
            <h3>Conversation Info</h3>
            <button type="button" className="pmh-icon-btn" onClick={onClose} aria-label="Close info">
              <X size={18} />
            </button>
          </header>

          <div className="pmh-info-body">
            <div className={`pmh-avatar tone-${conversation.avatarTone % 5}`}>
              {conversation.title.slice(0, 1).toUpperCase()}
            </div>
            <h4>{conversation.title}</h4>
            {conversation.subtitle ? <p>{conversation.subtitle}</p> : null}

            <div className="pmh-info-section">
              <h5>
                <Users size={14} />
                Participants ({conversation.participants.length})
              </h5>
              <ul>
                {conversation.participants.map((p) => (
                  <li key={p.id}>
                    <span className={`pmh-avatar sm tone-${(p.name.length + conversation.avatarTone) % 5}`}>
                      {p.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <em>
                        {p.role}
                        {p.title ? ` · ${p.title}` : ''}
                      </em>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

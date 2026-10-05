'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ImageOff, Play, X } from 'lucide-react';
import type { ParentMessage } from '@/lib/parent/parentMessagesStore';
import { formatMsgTime } from '@/lib/parent/parentMessagesStore';

type Props = {
  open: boolean;
  items: ParentMessage[];
  onClose: () => void;
  onOpenItem: (index: number) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function GalleryDrawer({ open, items, onClose, onOpenItem }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="pmh-gallery"
          initial={{ x: '100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.6 }}
          transition={{ duration: 0.28, ease }}
          aria-label="View gallery"
        >
          <header className="pmh-gallery-head">
            <div>
              <h3>View Gallery</h3>
              <p className="pmh-gallery-count">
                {items.length === 0
                  ? 'No media'
                  : `${items.length} file${items.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <button type="button" className="pmh-icon-btn" onClick={onClose} aria-label="Close gallery">
              <X size={18} />
            </button>
          </header>

          {items.length === 0 ? (
            <div className="pmh-gallery-empty">
              <ImageOff size={28} aria-hidden />
              <p>No media yet</p>
              <span>Images and videos shared in this chat will appear here.</span>
            </div>
          ) : (
            <div className="pmh-gallery-grid" role="list">
              {items.map((m, i) =>
                m.attachment ? (
                  <button
                    key={m.id}
                    type="button"
                    role="listitem"
                    className="pmh-gallery-card"
                    onClick={() => onOpenItem(i)}
                    aria-label={`Open ${m.attachment.name || 'media'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.attachment.url} alt="" />
                    {m.type === 'voice' || m.attachment.mime?.startsWith('video') ? (
                      <span className="pmh-gallery-play" aria-hidden>
                        <Play size={16} fill="currentColor" />
                      </span>
                    ) : null}
                    <span className="pmh-gallery-card-meta">
                      {m.senderName} · {formatMsgTime(m.createdAt)}
                    </span>
                  </button>
                ) : null,
              )}
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ActivityAttachment } from '@/types/activity';

type Props = {
  items: ActivityAttachment[];
  startIndex?: number;
  onClose: () => void;
};

export function TimelineMediaViewer({ items, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const current = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(items.length - 1, i + 1));
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [items.length, onClose]);

  useEffect(() => {
    setZoom(1);
  }, [index]);

  if (typeof document === 'undefined' || !current) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={`ptl-viewer${fullscreen ? ' is-full' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Media viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="ptl-viewer-toolbar">
          <span>
            {index + 1} / {items.length}
          </span>
          <div className="ptl-viewer-actions">
            <button type="button" className="ptl-icon-btn" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}>
              <ZoomOut size={18} />
            </button>
            <button type="button" className="ptl-icon-btn" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="ptl-icon-btn"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              onClick={() => setFullscreen((v) => !v)}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button type="button" className="ptl-icon-btn" aria-label="Close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="ptl-viewer-nav is-prev"
          aria-label="Previous"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft size={28} />
        </button>
        <button
          type="button"
          className="ptl-viewer-nav is-next"
          aria-label="Next"
          disabled={index >= items.length - 1}
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
        >
          <ChevronRight size={28} />
        </button>

        <div className="ptl-viewer-stage">
          {current.type === 'video' ? (
            <video
              key={current.id}
              src={current.url}
              controls
              playsInline
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={current.url}
              alt={current.name || 'Media'}
              style={{ transform: `scale(${zoom})` }}
            />
          )}
        </div>

        {items.length > 1 ? (
          <div className="ptl-viewer-thumbs">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`ptl-viewer-thumb${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Media ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail || item.url} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

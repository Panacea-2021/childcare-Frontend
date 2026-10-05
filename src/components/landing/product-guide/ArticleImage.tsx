'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="pg-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged screenshot"
      onClick={onClose}
    >
      <div className="pg-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pg-lightbox-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
          draggable={false}
        />
        <div className="pg-lightbox-zoom">
          <button type="button" onClick={() => setScale((s) => Math.max(1, s - 0.25))} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => setScale(1)} aria-label="Reset zoom">
            Reset
          </button>
          <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.25))} aria-label="Zoom in">
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArticleImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <figure style={{ margin: 0 }}>
        <button
          type="button"
          className="pg-img-frame"
          onClick={() => setOpen(true)}
          aria-label={`Enlarge image: ${alt}`}
          style={{
            width: '100%',
            padding: 0,
            display: 'block',
            textAlign: 'left',
            position: 'relative',
            minHeight: 180,
          }}
        >
          {!loaded ? <span className="pg-img-skeleton" aria-hidden /> : null}
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={750}
            sizes="(max-width: 800px) 100vw, 760px"
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            className={loaded ? 'is-loaded' : ''}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
          <span className="pg-img-zoom-hint">Click to enlarge</span>
        </button>
        {caption ? <figcaption className="pg-img-caption">{caption}</figcaption> : null}
      </figure>
      {open ? <ImageLightbox src={src} alt={alt} onClose={close} /> : null}
    </>
  );
}

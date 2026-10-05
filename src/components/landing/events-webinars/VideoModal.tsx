'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  videoUrl: string;
  onClose: () => void;
};

/** Normalize YouTube / Vimeo / direct URLs into an iframe-ready embed with autoplay. */
export function toPlayableEmbedUrl(raw: string, autoplay = true): string {
  const url = (raw || '').trim();
  if (!url) return '';

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    let videoId = '';
    if (host === 'youtu.be') {
      videoId = u.pathname.replace(/^\//, '').split('/')[0] || '';
    } else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/embed/')) {
        videoId = u.pathname.split('/')[2] || '';
      } else if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.split('/')[2] || '';
      } else {
        videoId = u.searchParams.get('v') || '';
      }
    }

    if (videoId) {
      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
      });
      if (autoplay) {
        params.set('autoplay', '1');
        // User already clicked Play — keep sound on when the browser allows it.
        params.set('mute', '0');
      }
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }

    if (host.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop() || '';
      if (id) {
        const params = new URLSearchParams({ autopause: '0' });
        if (autoplay) params.set('autoplay', '1');
        return `https://player.vimeo.com/video/${id}?${params.toString()}`;
      }
    }
  } catch {
    /* fall through */
  }

  if (!autoplay) return url;
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}autoplay=1`;
}

export function VideoModal({ open, title, videoUrl, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const embedSrc = useMemo(
    () => (open ? toPlayableEmbedUrl(videoUrl, true) : ''),
    [open, videoUrl],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!mounted || !open || !embedSrc) return null;

  return createPortal(
    <div className="ew-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="ew-modalBackdrop" aria-label="Close video" onClick={onClose} />
      <div className="ew-modalPanel">
        <div className="ew-modalTop">
          <h3>{title}</h3>
          <button type="button" className="ew-modalClose" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="ew-modalFrame">
          <iframe
            key={embedSrc}
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

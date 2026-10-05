'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export function FormsPortalMenu({ open, anchor, onClose, className, children }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !anchor) return;

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = 228;
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setPos({
        top: rect.bottom + 6,
        left,
        width,
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchor]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, anchor, onClose]);

  if (!open || !mounted || !pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`forms-menu forms-menu-portal${className ? ` ${className}` : ''}`}
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      role="menu"
    >
      {children}
    </div>,
    document.body,
  );
}

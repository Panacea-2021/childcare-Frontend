'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

export type FloatAlign = 'start' | 'end' | 'center';

type Pos = { top: number; left: number; width: number; placement: 'top' | 'bottom' };

type Options = {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  align?: FloatAlign;
  offset?: number;
  minWidth?: number | 'trigger';
  maxHeight?: number;
  padding?: number;
};

export function useFloatingPosition({
  open,
  triggerRef,
  contentRef,
  align = 'start',
  offset = 8,
  minWidth = 'trigger',
  maxHeight = 320,
  padding = 12,
}: Options) {
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, width: 200, placement: 'bottom' });

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const contentH = content?.offsetHeight ?? Math.min(maxHeight, 240);
    const contentW =
      minWidth === 'trigger'
        ? Math.max(rect.width, content?.offsetWidth ?? 0)
        : Math.max(minWidth, content?.offsetWidth ?? 0);

    const spaceBelow = vh - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    const placement: 'top' | 'bottom' =
      spaceBelow < contentH && spaceAbove > spaceBelow ? 'top' : 'bottom';

    let top =
      placement === 'bottom' ? rect.bottom + offset : Math.max(padding, rect.top - offset - contentH);

    let left =
      align === 'end'
        ? rect.right - contentW
        : align === 'center'
          ? rect.left + rect.width / 2 - contentW / 2
          : rect.left;

    left = Math.min(Math.max(padding, left), vw - contentW - padding);
    top = Math.min(Math.max(padding, top), vh - Math.min(contentH, maxHeight) - padding);

    setPos({
      top,
      left,
      width: minWidth === 'trigger' ? Math.max(contentW, 140) : contentW,
      placement,
    });
  }, [align, contentRef, maxHeight, minWidth, offset, padding, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    const onScroll = () => update();
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    const id = window.setTimeout(update, 0);
    const content = contentRef.current;
    let ro: ResizeObserver | null = null;
    if (content && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(content);
    }
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      ro?.disconnect();
    };
  }, [open, update, contentRef]);

  return { pos, update };
}

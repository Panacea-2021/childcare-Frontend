'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RESOURCE_NAV_COLUMNS, RESOURCE_NAV_ITEMS } from './resourcesNavData';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import './features-mega-menu.css';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId?: string;
};

function activeResourceId(pathname: string | null) {
  if (!pathname) return RESOURCE_NAV_ITEMS[0]?.id ?? 'about';
  const match = RESOURCE_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.id ?? RESOURCE_NAV_ITEMS[0]?.id ?? 'about';
}

export function ResourcesMegaMenu({ open, onOpenChange, triggerId }: Props) {
  const panelId = useId();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(() => activeResourceId(pathname));

  useEffect(() => {
    setActiveId(activeResourceId(pathname));
  }, [pathname]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      const trigger = triggerId ? document.getElementById(triggerId) : null;
      if (trigger?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open, close, triggerId]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Resources"
          aria-modal="false"
          className="fmm-panel fmm-panel--resources"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.985 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fmm-resourcesGrid" role="list">
            {RESOURCE_NAV_COLUMNS.map((column, colIndex) => (
              <ul
                key={`col-${colIndex}`}
                className="fmm-resourcesCol"
                role="presentation"
              >
                {column.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeId === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      role="listitem"
                      initial={reduced ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduced ? 0 : 0.06 + (colIndex * 2 + index) * 0.04,
                        duration: 0.3,
                      }}
                    >
                      <Link
                        href={item.href}
                        className={`fmm-item${isActive ? ' is-active' : ''}`}
                        onMouseEnter={() => setActiveId(item.id)}
                        onFocus={() => setActiveId(item.id)}
                        onClick={close}
                        {...(item.openInNewTab
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        <span className="fmm-icon" aria-hidden="true">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <span className="fmm-itemBody">
                          <span className="fmm-itemTitle">{item.title}</span>
                          <span className="fmm-itemDesc">{item.description}</span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

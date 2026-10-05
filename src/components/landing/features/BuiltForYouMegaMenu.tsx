'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BUILT_FOR_YOU_INTRO, BUILT_FOR_YOU_ITEMS } from './builtForYouNavData';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import './features-mega-menu.css';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId?: string;
};

function activeBuiltForYouId(pathname: string | null) {
  if (!pathname) return BUILT_FOR_YOU_ITEMS[0]?.id ?? 'enterprise';
  const match = BUILT_FOR_YOU_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.id ?? BUILT_FOR_YOU_ITEMS[0]?.id ?? 'enterprise';
}

export function BuiltForYouMegaMenu({ open, onOpenChange, triggerId }: Props) {
  const panelId = useId();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(() => activeBuiltForYouId(pathname));

  useEffect(() => {
    setActiveId(activeBuiltForYouId(pathname));
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
          aria-label="Built for you"
          aria-modal="false"
          className="fmm-panel"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.985 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fmm-glow" aria-hidden="true" />
          <div className="fmm-grid">
            <motion.div
              className="fmm-intro"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.05, duration: 0.35 }}
            >
              <p className="fmm-kicker">Built for you</p>
              <h2 className="fmm-heading fmm-headingCompact">
                Why we&apos;re the Top Choice!
              </h2>
              <p className="fmm-copy">
                Compare Panacea with other childcare software providers.
              </p>
              <Link
                href={BUILT_FOR_YOU_INTRO.learnMoreHref}
                className="fmm-learnMore"
                onClick={close}
              >
                {BUILT_FOR_YOU_INTRO.learnMoreLabel}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </motion.div>

            <ul className="fmm-list fmm-list--2col" role="list">
              {BUILT_FOR_YOU_ITEMS.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <motion.li
                    key={item.id}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.08 + index * 0.045,
                      duration: 0.3,
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`fmm-item${isActive ? ' is-active' : ''}`}
                      onMouseEnter={() => setActiveId(item.id)}
                      onFocus={() => setActiveId(item.id)}
                      onClick={close}
                    >
                      <span className="fmm-itemBody">
                        <span className="fmm-itemTitle">{item.title}</span>
                        <span className="fmm-itemDesc">{item.description}</span>
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

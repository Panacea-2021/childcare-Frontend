'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FEATURE_NAV_ITEMS } from './featureNavData';
import { BUILT_FOR_YOU_ITEMS } from './builtForYouNavData';
import { RESOURCE_NAV_ITEMS } from './resourcesNavData';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import './features-mega-menu.css';

type FeaturesMegaMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerId?: string;
};

export function FeaturesMegaMenu({ open, onOpenChange, triggerId }: FeaturesMegaMenuProps) {
  const panelId = useId();
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(FEATURE_NAV_ITEMS[0]?.id ?? 'enrollments');

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
          aria-label="Features"
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
              <p className="fmm-kicker">Platform</p>
              <h2 className="fmm-heading">Childcare Software</h2>
              <p className="fmm-copy">
                Panacea is a modern childcare management platform designed to simplify
                operations, strengthen family engagement, and help childcare centers grow.
              </p>
            </motion.div>

            <ul className="fmm-list" role="list">
              {FEATURE_NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
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
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function FeaturesMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();

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

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fmm-backdrop"
            aria-label="Close features menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fmm-drawer"
            role="dialog"
            aria-label="Features"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="fmm-drawerHead">
              <h2>Features</h2>
              <button type="button" className="ui-btn ui-btn-outline fmm-drawerClose" onClick={onClose}>
                Close
              </button>
            </div>
            <p className="fmm-drawerLead">
              Panacea is a modern childcare management platform designed to simplify
              operations, strengthen family engagement, and help childcare centers grow.
            </p>
            <ul className="fmm-drawerList">
              {FEATURE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="fmm-drawerItem" onClick={onClose}>
                      <span className="fmm-icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="fmm-drawerLead fmm-drawerLeadSecondary">Built for you</p>
            <ul className="fmm-drawerList">
              {BUILT_FOR_YOU_ITEMS.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="fmm-drawerItem" onClick={onClose}>
                    <span>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="fmm-drawerLead fmm-drawerLeadSecondary">Resources</p>
            <ul className="fmm-drawerList">
              {RESOURCE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="fmm-drawerItem"
                      onClick={onClose}
                      {...(item.openInNewTab
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className="fmm-icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

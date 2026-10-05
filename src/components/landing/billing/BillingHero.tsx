'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const INVOICE_LINES = [
  {
    id: 'tuition',
    description: 'Spring Toddlers 5 Day Tuition',
    qty: '1.00',
    amount: '$285.00',
    highlightable: true,
  },
  {
    id: 'extra',
    description: 'Extracurricular',
    tag: 'Add-on',
    qty: '1.00',
    amount: '$250.00',
    highlightable: true,
  },
  {
    id: 'late',
    description: 'Late Payment Fee',
    tag: 'Auto applied',
    qty: '1.00',
    amount: '$25.00',
    highlightable: true,
  },
  {
    id: 'proration',
    description: 'Proration (3 Days)',
    amount: '-$2.99',
    discount: true,
    highlightable: false,
  },
  {
    id: 'discount',
    description: 'Employee Discount',
    amount: '-$228.00',
    discount: true,
    highlightable: false,
  },
] as const;

const HIGHLIGHT_IDS = INVOICE_LINES.filter((l) => l.highlightable).map((l) => l.id);

export function BillingHero() {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.55);
  const [activeLine, setActiveLine] = useState<string>(HIGHLIGHT_IDS[0] ?? 'extra');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => {
      setActiveLine((current) => {
        const idx = HIGHLIGHT_IDS.indexOf(current);
        return HIGHLIGHT_IDS[(idx + 1) % HIGHLIGHT_IDS.length] ?? HIGHLIGHT_IDS[0];
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  return (
    <div className="bl-hero">
      <div className="bl-heroInner">
        <motion.div
          className="bl-heroCopy"
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="bl-kicker">AI-powered childcare billing software</p>
          <h1>Stop Chasing. Automate Tuition, Subsidy and Payments.</h1>
          <p className="bl-lead">
            From tuition to subsidies and collections, everything runs automatically so your
            team doesn&apos;t have to.
          </p>
          <motion.div
            className="bl-heroCtas"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.4 }}
          >
            <Link href="/book-demo" className="ui-btn ui-btn-primary">
              Book a Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="bl-heroStage"
          initial={reduced ? false : { opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={onMove}
          onMouseLeave={() => {
            onLeave();
            setPaused(false);
          }}
        >
          <div
            ref={ref}
            className="bl-heroPerspective"
            style={
              reduced
                ? undefined
                : {
                    transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${tilt.tx * 0.4}px, ${tilt.ty * 0.4}px, 0)`,
                  }
            }
          >
            <article className="bl-invoice" aria-label="Sample invoice animation">
              <aside className="bl-invoiceRail">
                <span className="bl-invoiceRailLabel">Invoice</span>
                <strong className="bl-invoiceNumber">#PN-337</strong>
                <p className="bl-invoiceName">Sebastian Flores</p>
                <div className="bl-invoiceDue">
                  <strong>$329.01</strong>
                  <span>due Apr 22</span>
                </div>
                <span className="bl-invoiceOverdue">
                  <i /> Overdue
                </span>
              </aside>

              <div className="bl-invoiceBody">
                <div className="bl-invoiceCols" aria-hidden="true">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Amount</span>
                </div>

                <ul className="bl-invoiceRows">
                  {INVOICE_LINES.map((line) => {
                    const isActive = line.highlightable && line.id === activeLine;
                    return (
                      <li
                        key={line.id}
                        className={[
                          'bl-invoiceRow',
                          line.discount ? 'is-discount' : '',
                          isActive ? 'is-active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onMouseEnter={() => {
                          if (line.highlightable) {
                            setPaused(true);
                            setActiveLine(line.id);
                          }
                        }}
                        onMouseLeave={() => setPaused(false)}
                      >
                        <AnimatePresence>
                          {isActive ? (
                            <motion.span
                              className="bl-invoiceAccent"
                              layoutId="bl-invoice-accent"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              aria-hidden
                            />
                          ) : null}
                        </AnimatePresence>
                        <div className="bl-invoiceDesc">
                          <strong>{line.description}</strong>
                          {'tag' in line && line.tag ? (
                            <em className="bl-invoiceTag">{line.tag}</em>
                          ) : null}
                        </div>
                        <span className="bl-invoiceQty">{'qty' in line ? line.qty : ''}</span>
                        <span className="bl-invoiceAmt">{line.amount}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="bl-invoiceTotal">
                  <span>Total Due</span>
                  <strong>$329.01</strong>
                </div>
              </div>
            </article>
          </div>

          <motion.div
            className="bl-invoiceGlow"
            aria-hidden
            animate={reduced ? undefined : { opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  );
}

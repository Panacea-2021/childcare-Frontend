'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, LogIn, LogOut, QrCode } from 'lucide-react';
import { fadeUp, floatAnim, scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const CHILDREN = [
  { name: 'Violet', tone: 'a', checked: true },
  { name: 'Jimmy', tone: 'b', checked: true },
  { name: 'Akash', tone: 'c', checked: false },
  { name: 'Mia', tone: 'd', checked: true },
  { name: 'Noah', tone: 'e', checked: false },
  { name: 'Ava', tone: 'a', checked: true },
  { name: 'Leo', tone: 'b', checked: false },
  { name: 'Sofia', tone: 'c', checked: true },
] as const;

export function AttendanceHero() {
  const reduced = usePrefersReducedMotion();
  const ring = 2 * Math.PI * 38;

  return (
    <div className="att-hero">
      <div className="att-blob att-blob-a" aria-hidden />
      <div className="att-blob att-blob-b" aria-hidden />
      <div className="att-blob att-blob-c" aria-hidden />
      <div className="att-heroGrid" aria-hidden />

      <div className="att-heroInner">
        <motion.div
          className="att-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="att-kicker" variants={fadeUp}>
            Attendance &amp; Occupancy
          </motion.p>
          <motion.h1 variants={fadeUp}>
            Ensure <span className="att-accentWord">100% Accuracy</span> with our Childcare
            Attendance Software
          </motion.h1>
          <motion.p className="att-lead" variants={fadeUp}>
            Track attendance digitally, strengthen security, and stay compliant. As easy as using
            Sheets. With easy to use mobile apps.
          </motion.p>
          <motion.div className="att-heroCtas" variants={fadeUp}>
            <Link href="/book-demo" className="ui-btn ui-btn-primary att-btnPrimary">
              Book a Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="att-heroStage"
          variants={scaleIn}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          {/* Main Check-In dashboard — Illumine-style tablet */}
          <motion.div
            className="att-heroDash"
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div {...(reduced ? {} : floatAnim(6, 6.2))}>
              <div className="att-heroDashTop">
                <strong className="att-heroDashBrand">Panacea</strong>
                <span className="att-live">Live</span>
              </div>

              <div className="att-heroDashBody">
                <div className="att-checkPanel">
                  <div className="att-checkPanelHead">
                    <strong>Check In</strong>
                    <em>Toddlers · Room B</em>
                  </div>
                  <div className="att-childGrid" aria-hidden>
                    {CHILDREN.map((child) => (
                      <div key={child.name} className="att-childTile">
                        <span className={`att-childAvatar tone-${child.tone}`}>
                          {child.name[0]}
                          {child.checked ? (
                            <i>
                              <Check size={10} strokeWidth={3} />
                            </i>
                          ) : null}
                        </span>
                        <em>{child.name}</em>
                      </div>
                    ))}
                  </div>
                  <div className="att-checkActions">
                    <button type="button" className="att-checkBtn is-in">
                      <LogIn size={14} aria-hidden />
                      Check In
                    </button>
                    <button type="button" className="att-checkBtn is-out">
                      <LogOut size={14} aria-hidden />
                      Check Out
                    </button>
                  </div>
                </div>

                <aside className="att-ratioPanel" aria-label="Live ratio">
                  <strong>Live Ratio</strong>
                  <div className="att-ratioRing" aria-hidden>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" className="att-ratioTrack" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="att-ratioStaff"
                        strokeDasharray={`${ring * 0.17} ${ring}`}
                        initial={reduced ? false : { strokeDashoffset: ring }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ delay: 0.55, duration: 0.9 }}
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="att-ratioStudents"
                        strokeDasharray={`${ring * 0.83} ${ring}`}
                        strokeDashoffset={-ring * 0.17}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75, duration: 0.5 }}
                      />
                    </svg>
                  </div>
                  <div className="att-ratioStats">
                    <div className="is-staff">
                      <strong>5</strong>
                      <span>Staff</span>
                    </div>
                    <div className="is-students">
                      <strong>25</strong>
                      <span>Students</span>
                    </div>
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone QR check-in */}
          <motion.div
            className="att-heroPhone"
            initial={reduced ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div {...(reduced ? {} : floatAnim(9, 5.4))}>
              <div className="att-heroPhoneScreen">
                <strong>Check In</strong>
                <div className="att-qr" aria-hidden>
                  <QrCode size={92} strokeWidth={1.4} />
                </div>
                <button type="button" className="att-qrEnter">
                  Enter
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Today's Attendance stats strip */}
          <motion.div
            className="att-heroStats"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.55 }}
          >
            <motion.div {...(reduced ? {} : floatAnim(5, 5.1))}>
              <strong>Today&apos;s Attendance</strong>
              <div className="att-heroStatRow">
                <div className="att-heroStat tone-in">
                  <em>25</em>
                  <span>Checked in</span>
                </div>
                <div className="att-heroStat tone-absent">
                  <em>1</em>
                  <span>Absent</span>
                </div>
                <div className="att-heroStat tone-pending">
                  <em>20</em>
                  <span>Pending</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

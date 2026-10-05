'use client';

import Image from 'next/image';
import { Check, UserRound } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PS_DAILY } from './data';
import { PsReveal } from './PsReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'] as const;
const ROWS = [
  { name: 'Maya C.', marks: [true, true, true, false] },
  { name: 'Leo P.', marks: [true, true, false, true] },
  { name: 'Ava R.', marks: [true, false, true, true] },
] as const;

export function PsDaily() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 24, reduced ? 0 : -24]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.3);

  return (
    <div ref={ref} className="ps-split ps-daily">
      <motion.div
        className="ps-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="ps-eyebrow" variants={fadeUp}>
          {PS_DAILY.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{PS_DAILY.title}</motion.h2>
        <motion.p className="ps-sectionLead" variants={fadeUp}>
          {PS_DAILY.lead}
        </motion.p>
        <ul className="ps-checkList">
          {PS_DAILY.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="ps-check" aria-hidden>
                <Check size={14} strokeWidth={2.8} />
              </span>
              <div>
                <strong>{p.title}</strong>
                <em>{p.detail}</em>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <PsReveal variants={slideFromRight} className="ps-splitVisual">
        <div
          className="ps-dailyStage"
          ref={tiltRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            transform: reduced
              ? undefined
              : `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div className="ps-dailyPhoto" style={{ y }}>
            <Image
              src={PS_DAILY.image}
              alt="Preschool staff managing daily operations"
              fill
              sizes="(max-width: 900px) 90vw, 420px"
              className="ps-coverImg"
            />
          </motion.div>

          <motion.div
            className="ps-dailyMetric"
            style={{ transform: 'translateZ(28px)' }}
            {...(reduced ? {} : floatAnim(6, 5.8, 0.3))}
          >
            <strong>Today&apos;s Attendance</strong>
            <div className="ps-metricRow">
              <span>
                <b>23</b> Present
              </span>
              <span>
                <b>05</b> Absent
              </span>
            </div>
          </motion.div>

          <motion.div
            className="ps-dailyTable"
            style={{ transform: 'translateZ(36px)' }}
            {...(reduced ? {} : floatAnim(5, 6.4, 0.8))}
          >
            <div className="ps-dailyTableHead">
              <UserRound size={14} aria-hidden />
              <strong>Attendance</strong>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Child</th>
                  {DAYS.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    {row.marks.map((ok, i) => (
                      <td key={`${row.name}-${i}`}>
                        {ok ? (
                          <i className="ps-dayOk" aria-label="Present">
                            <Check size={11} strokeWidth={3} />
                          </i>
                        ) : (
                          <i className="ps-dayMiss" aria-label="Absent" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </PsReveal>
    </div>
  );
}

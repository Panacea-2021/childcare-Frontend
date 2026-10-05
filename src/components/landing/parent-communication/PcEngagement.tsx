'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PC_ENGAGE_POINTS } from './data';
import { PcFeatureList } from './PcFeatureList';
import { PcReveal } from './PcReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const RINGS = [
  { label: 'Social', value: 80 },
  { label: 'Language', value: 72 },
  { label: 'Motor', value: 88 },
] as const;

function TiltCard({
  children,
  reduced,
  live,
}: {
  children: ReactNode;
  reduced: boolean;
  live: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotX = useSpring(useTransform(y, [0, 1], [5, -5]), { stiffness: 180, damping: 22 });
  const rotY = useSpring(useTransform(x, [0, 1], [-5, 5]), { stiffness: 180, damping: 22 });

  if (!live || reduced) return <div className="pc-tilt">{children}</div>;

  return (
    <motion.div
      ref={ref}
      className="pc-tilt"
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

function ProgressRing({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  const circ = 176;
  const [dash, setDash] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.requestAnimationFrame(() => setDash((value / 100) * circ));
    return () => window.cancelAnimationFrame(id);
  }, [active, value]);

  return (
    <div className="pc-ring">
      <svg viewBox="0 0 72 72" aria-hidden>
        <circle className="track" cx="36" cy="36" r="28" />
        <circle
          className="value"
          cx="36"
          cy="36"
          r="28"
          style={{ strokeDasharray: `${dash} ${circ}` }}
        />
      </svg>
      <strong>{value}%</strong>
      <span>{label}</span>
    </div>
  );
}

function MilestoneDonut({ active }: { active: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [active]);

  return (
    <div className="pc-mileDonut" aria-hidden>
      <svg viewBox="0 0 120 120">
        <circle className="track" cx="60" cy="60" r="42" />
        <circle
          className={`seg seg-a${ready ? ' is-on' : ''}`}
          cx="60"
          cy="60"
          r="42"
          pathLength={100}
        />
        <circle
          className={`seg seg-b${ready ? ' is-on' : ''}`}
          cx="60"
          cy="60"
          r="42"
          pathLength={100}
        />
        <circle
          className={`seg seg-c${ready ? ' is-on' : ''}`}
          cx="60"
          cy="60"
          r="42"
          pathLength={100}
        />
      </svg>
      <div className="pc-mileDonutLabel">
        <strong>40</strong>
        <em>Milestones</em>
      </div>
    </div>
  );
}

export function PcEngagement() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const ringsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ringsRef, { once: true, amount: 0.4 });
  const live = mounted && !reduced;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pc-split">
      <PcReveal className="pc-splitCopy" variants={slideFromLeft}>
        <p className="pc-eyebrow">Parent engagement</p>
        <h2>Engage Parents. Encourage Child Growth.</h2>
        <p className="pc-support">
          Turn everyday moments into meaningful communication that helps families understand and
          celebrate their child&apos;s progress.
        </p>
        <PcFeatureList points={PC_ENGAGE_POINTS} />
      </PcReveal>

      <PcReveal className="pc-splitVisual pc-engageVisual" variants={slideFromRight}>
        <div className="pc-engageBlob" aria-hidden />
        <span className="pc-engageSpark s1" aria-hidden />
        <span className="pc-engageSpark s2" aria-hidden />
        <span className="pc-engageSpark s3" aria-hidden />

        <motion.div
          className="pc-mileCard"
          initial={false}
          {...(live ? floatAnim(5, 5.2) : {})}
        >
          <strong>Milestones</strong>
          <MilestoneDonut active={reduced || inView} />
          <ul className="pc-mileLegend">
            <li>
              <i className="c-started" /> Started
            </li>
            <li>
              <i className="c-developing" /> Developing
            </li>
            <li>
              <i className="c-expert" /> Expert
            </li>
          </ul>
        </motion.div>

        <TiltCard reduced={reduced} live={live}>
          <div className="pc-engageDash" ref={ringsRef}>
            <div className="pc-engageHead">
              <strong>Development snapshot</strong>
              <em>Emma · This month</em>
            </div>
            <div className="pc-rings">
              {RINGS.map((item) => (
                <ProgressRing
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  active={reduced || inView}
                />
              ))}
            </div>
            <div className="pc-portfolio">
              <img
                className="pc-portfolioArt"
                src="/images/parent-communication/activity.jpg"
                alt=""
                loading="lazy"
              />
              <div>
                <strong>Art activity</strong>
                <p>Explored colors during today&apos;s activity.</p>
                <em>Teacher note · Emma participated enthusiastically.</em>
              </div>
            </div>
          </div>
        </TiltCard>

        <motion.div
          className="pc-folioCard"
          initial={false}
          {...(live ? floatAnim(6, 5.8) : {})}
        >
          <span className="pc-folioTag">Portfolio</span>
          <div className="pc-folioSchool">
            <span className="pc-folioMark" aria-hidden />
            <em>Little Stars Preschool</em>
          </div>
          <div className="pc-folioBody">
            <img
              src="/images/parent-communication/classroom.jpg"
              alt=""
              loading="lazy"
            />
            <div>
              <strong>Emma Smith</strong>
              <span className="pc-folioJourney">Learning Journey</span>
              <p>01 Nov 2025 – 10 Nov 2025</p>
            </div>
          </div>
          <div className="pc-folioDecor" aria-hidden>
            <i className="hand h1" />
            <i className="hand h2" />
            <div className="blocks">
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            <i className="squiggle" />
          </div>
        </motion.div>

        <motion.div
          className="pc-obsCard"
          initial={false}
          {...(live ? floatAnim(5, 4.9) : {})}
        >
          <div className="pc-obsHead">
            <img
              src="/images/parent-communication/teacher.jpg"
              alt=""
              loading="lazy"
            />
            <strong>Rachel&apos;s Observation Record</strong>
          </div>
          <span className="pc-obsPill">Communication &amp; Languages</span>
          <p>
            Rachel used new words today to describe her favourite toy during circle time.
          </p>
        </motion.div>
      </PcReveal>
    </div>
  );
}

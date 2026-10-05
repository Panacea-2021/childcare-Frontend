'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Check,
  Clock3,
  Languages,
  MessageCircle,
  Sparkles,
  Star,
  Utensils,
} from 'lucide-react';
import { floatAnim } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ease = [0.22, 1, 0.36, 1] as const;

export function ParentCommunicationHeroVisual() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 90, damping: 18 });
  const springY = useSpring(my, { stiffness: 90, damping: 18 });

  const phoneRotY = useTransform(springX, [0, 1], [-7, -2]);
  const phoneRotX = useTransform(springY, [0, 1], [4, 0]);
  const layerA = useTransform(springX, [0, 1], [-8, 8]);
  const layerB = useTransform(springX, [0, 1], [10, -6]);
  const layerC = useTransform(springY, [0, 1], [6, -8]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const scrollPhone = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const scrollAi = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const scrollFood = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const scrollMsg = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const scrollReport = useTransform(scrollYProgress, [0, 1], [0, -22]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  const onMove = (e: MouseEvent) => {
    if (!live) return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div
      ref={stageRef}
      className="pc-heroVisual"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pc-heroMintBlob" aria-hidden />
      <div className="pc-heroLavenderGlow" aria-hidden />

      <motion.div
        className="pc-hvCard pc-hvAi"
        style={live ? { y: scrollAi, x: layerA } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={live ? { y: -4, scale: 1.03 } : undefined}
      >
        <motion.div {...(live ? floatAnim(6, 4.5) : {})}>
          <span className="pc-hvAiIcon" aria-hidden>
            <Sparkles size={14} />
          </span>
          Write with AI
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvCard pc-hvFood"
        style={live ? { y: scrollFood, x: layerB } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={live ? { y: -3 } : undefined}
      >
        <motion.div {...(live ? floatAnim(5, 6) : {})}>
          <Utensils size={14} aria-hidden />
          <div>
            <strong>Food</strong>
            <p>Lunch · veggies &amp; rice</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvPhoneWrap"
        style={
          live
            ? {
                y: scrollPhone,
                rotateX: phoneRotX,
                rotateY: phoneRotY,
                transformPerspective: 1100,
              }
            : undefined
        }
        initial={false}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="pc-hvPhone"
          {...(live ? floatAnim(9, 5.8) : {})}
          whileHover={live ? { scale: 1.015 } : undefined}
        >
          <div className="pc-hvPhoneBezel">
            <div className="pc-hvStatus" aria-hidden>
              <em>9:41</em>
              <i />
            </div>
            <div className="pc-hvPhoneTop">
              <div>
                <strong>Parent Feed</strong>
                <span>Emma · Room B</span>
              </div>
              <em>Today</em>
            </div>

            <div className="pc-hvFeed">
              <div className="pc-hvFeedCard is-checkin">
                <Clock3 size={14} aria-hidden />
                <div>
                  <strong>Checked in</strong>
                  <p>Emma arrived at 8:42 AM</p>
                </div>
              </div>

              <div className="pc-hvFeedCard is-photo">
                <img
                  src="/images/parent-communication/classroom.jpg"
                  alt=""
                  loading="lazy"
                />
                <div>
                  <strong>Learning moment</strong>
                  <p>Outdoor exploration with friends</p>
                </div>
              </div>

              <div className="pc-hvFeedCard is-msg">
                <img
                  className="pc-hvAvatar"
                  src="/images/parent-communication/teacher.jpg"
                  alt=""
                  loading="lazy"
                />
                <div>
                  <strong>Ms. Sarah</strong>
                  <p>Emma had a wonderful morning outdoors!</p>
                  <em>9:42 AM</em>
                </div>
              </div>

              <div className="pc-hvFeedCard is-milestone">
                <Star size={14} aria-hidden />
                <div>
                  <strong>New milestone</strong>
                  <p>Shared confidently during circle time</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvCard pc-hvTeacher"
        style={live ? { y: scrollMsg, x: layerC } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={live ? { y: -4 } : undefined}
      >
        <motion.div {...(live ? floatAnim(7, 5.1) : {})}>
          <div className="pc-hvTeacherHead">
            <img src="/images/parent-communication/teacher.jpg" alt="" loading="lazy" />
            <div>
              <strong>Ms. Sarah</strong>
              <em>Voice note · 0:18</em>
            </div>
            <i className="pc-hvDot" aria-hidden />
          </div>
          <div className="pc-hvWave" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ height: `${8 + ((i * 7) % 16)}px` }} />
            ))}
          </div>
          <p>Emma participated beautifully in today&apos;s story activity.</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvCard pc-hvTranslate"
        style={live ? { y: scrollMsg } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={live ? { scale: 1.04 } : undefined}
      >
        <motion.div {...(live ? floatAnim(5, 4.8) : {})}>
          <Languages size={15} aria-hidden />
          <div>
            <strong>Translate</strong>
            <em>EN → ES</em>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvCard pc-hvNotify"
        style={live ? { y: scrollAi, x: layerB } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={live ? { y: -3 } : undefined}
      >
        <motion.div {...(live ? floatAnim(6, 5.4) : {})}>
          <span className="pc-hvNotifyIcon" aria-hidden>
            <MessageCircle size={14} />
            <i />
          </span>
          <div>
            <strong>New message</strong>
            <p>From Ms. Sarah</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="pc-hvCard pc-hvReport"
        style={live ? { y: scrollReport, x: layerA } : undefined}
        initial={false}
        animate={{ opacity: 1 }}
        whileHover={
          live ? { y: -5, boxShadow: '0 28px 50px rgba(15,23,42,0.14)' } : undefined
        }
      >
        <motion.div {...(live ? floatAnim(6, 6.6) : {})}>
          <img
            className="pc-hvReportAvatar"
            src="/images/parent-communication/classroom.jpg"
            alt=""
            loading="lazy"
          />
          <strong>Emma&apos;s Daily Report</strong>
          <ul>
            <li>
              <span>Food</span>
              <em>Breakfast · Lunch</em>
              <Check size={13} aria-hidden />
            </li>
            <li>
              <span>Nap</span>
              <em>Quiet rest</em>
              <Check size={13} aria-hidden />
            </li>
            <li>
              <span>Milestone</span>
              <em>Shared in circle</em>
              <Check size={13} aria-hidden />
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}

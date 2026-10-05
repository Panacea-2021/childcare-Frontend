'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Heart, MapPin, Sparkles, Star } from 'lucide-react';
import { HERO_CONTENT, type HeroPolaroid } from './data';
import { EventImage } from './EventImage';
import { floatAnim } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Slot = 'left' | 'cleft' | 'center' | 'cright' | 'right';

type Props = {
  titleLine1?: string;
  titleLine2?: string;
  collage?: HeroPolaroid[];
};

const SLOT_ORDER: Slot[] = ['left', 'cleft', 'center', 'cright', 'right'];

const DEFAULT_ROTATE: Record<Slot, number> = {
  left: -7,
  cleft: -3,
  center: 0,
  cright: 3,
  right: 7,
};

const BLOB_TONE: Record<Slot, string> = {
  left: 'pink',
  cleft: 'lavender',
  center: 'cyan',
  cright: 'peach',
  right: 'violet',
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
};

const polaroidVariants: Record<Slot, Variants> = {
  left: {
    hidden: { opacity: 0, x: -80, scale: 0.9 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  },
  cleft: {
    hidden: { opacity: 0, x: -40, scale: 0.92 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.75, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  },
  center: {
    hidden: { opacity: 0, y: 50, scale: 0.88 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, delay: 0.48, ease: [0.22, 1, 0.36, 1] },
    },
  },
  cright: {
    hidden: { opacity: 0, x: 40, scale: 0.92 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.75, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  },
  right: {
    hidden: { opacity: 0, x: 80, scale: 0.9 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

function PolaroidCard({
  photo,
  slot,
  reduced,
  tilt,
  scrollY,
}: {
  photo: HeroPolaroid;
  slot: Slot;
  reduced: boolean;
  tilt: { rx: number; ry: number };
  scrollY: number;
}) {
  const rotate = photo.rotate ?? DEFAULT_ROTATE[slot];
  const tone = BLOB_TONE[slot];
  const scrollLift =
    reduced || scrollY === 0
      ? 0
      : slot === 'left' || slot === 'right'
        ? scrollY * -0.04
        : slot === 'center'
          ? 0
          : scrollY * -0.025;

  return (
    <motion.div
      className={`ew-collageCell ew-collageCell--${slot}`}
      variants={reduced ? undefined : polaroidVariants[slot]}
      initial={reduced ? false : 'hidden'}
      animate="show"
      style={{ y: scrollLift }}
    >
      <div className={`ew-polaroidGlow ew-polaroidGlow--${tone}`} aria-hidden />

      <motion.article
        className="ew-polaroid"
        style={{
          rotate,
          ...(reduced ? {} : { rotateX: tilt.rx, rotateY: tilt.ry }),
        }}
        whileHover={
          reduced
            ? undefined
            : {
                y: -8,
                scale: 1.04,
                rotate: rotate * 0.55,
                transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }
        }
      >
        <div className="ew-polaroidMedia">
          <EventImage
            imageUrl={photo.imageUrl}
            alt={photo.alt}
            loading={slot === 'center' || slot === 'cleft' ? 'eager' : 'lazy'}
            fetchPriority={slot === 'center' ? 'high' : undefined}
            width={720}
            height={800}
          />
        </div>
        <div className="ew-polaroidFooter">
          {photo.location ? (
            <span className="ew-locTicket">
              <span className="ew-locTicketIcon" aria-hidden>
                <MapPin size={11} strokeWidth={2.4} />
              </span>
              <span className="ew-locTicketText">{photo.location}</span>
              <span className="ew-locTicketStub" aria-hidden />
            </span>
          ) : (
            <span className="ew-locTicket ew-locTicket--empty" aria-hidden />
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}

export function EwHero({
  titleLine1 = HERO_CONTENT.titleLine1,
  titleLine2 = HERO_CONTENT.titleLine2,
  collage = HERO_CONTENT.collage,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w <= 720) setBp('mobile');
      else if (w <= 1024) setBp('tablet');
      else setBp('desktop');
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    if (reduced || bp === 'mobile') return;
    const onScroll = () => setScrollY(Math.min(120, window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [bp, reduced]);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || bp === 'mobile' || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      setPointer({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    },
    [bp, reduced],
  );

  const onLeave = useCallback(() => setPointer({ x: 0, y: 0 }), []);

  const desktopSlots = collage.slice(0, 5).map((photo, i) => ({
    photo,
    slot: SLOT_ORDER[i] ?? 'center',
  }));

  const visible =
    bp === 'mobile'
      ? desktopSlots.filter((s) => s.slot === 'cleft' || s.slot === 'center' || s.slot === 'cright')
      : bp === 'tablet'
        ? desktopSlots.filter((s) => s.slot === 'left' || s.slot === 'center' || s.slot === 'right')
        : desktopSlots;

  const tiltFor = (slot: Slot) => {
    if (reduced || bp === 'mobile') return { rx: 0, ry: 0 };
    const side =
      slot === 'left' || slot === 'cleft' ? -1 : slot === 'right' || slot === 'cright' ? 1 : 0;
    return {
      rx: pointer.y * -2,
      ry: pointer.x * 3 * (side === 0 ? 0.15 : side),
    };
  };

  return (
    <section className="ew-hero">
      <div className="ew-heroAtmosphere" aria-hidden>
        <span className="ew-heroWash ew-heroWash--pink" />
        <span className="ew-heroWash ew-heroWash--lav" />
        <span className="ew-heroWash ew-heroWash--cyan" />
      </div>

      <motion.span
        className="ew-deco ew-deco--star"
        aria-hidden
        {...(reduced ? {} : floatAnim(7, 6.5, 0.2))}
      >
        <Star size={13} fill="currentColor" strokeWidth={0} />
      </motion.span>
      <motion.span
        className="ew-deco ew-deco--spark"
        aria-hidden
        {...(reduced ? {} : floatAnim(5, 7.2, 0.6))}
      >
        <Sparkles size={14} />
      </motion.span>
      <motion.span
        className="ew-deco ew-deco--heart"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 8, 1.1))}
      >
        <Heart size={12} fill="currentColor" strokeWidth={0} />
      </motion.span>
      <span className="ew-deco ew-deco--dot a" aria-hidden />
      <span className="ew-deco ew-deco--dot b" aria-hidden />

      <div className="ew-heroInner">
        <div className="ew-heroCopy">
          <motion.h1
            initial={reduced ? false : 'hidden'}
            animate="show"
            variants={titleVariants}
          >
            <span className="ew-heroAccent">{titleLine1}</span>
          </motion.h1>
          <motion.p
            className="ew-heroSub"
            initial={reduced ? false : 'hidden'}
            animate="show"
            variants={subtitleVariants}
          >
            {titleLine2}
          </motion.p>
        </div>

        <div
          ref={stageRef}
          className={`ew-collage ew-collage--${bp}`}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          aria-label="Event photo collage"
        >
          {visible.map(({ photo, slot }) => (
            <PolaroidCard
              key={photo.id}
              photo={photo}
              slot={slot}
              reduced={reduced}
              tilt={tiltFor(slot)}
              scrollY={scrollY}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import QRCode from 'qrcode';
import { AlertTriangle, Clock3, MapPin, Pill, ShieldCheck } from 'lucide-react';
import { PC_SAFETY_FLOATS, PC_SAFETY_POINTS } from './data';
import { PcFeatureList } from './PcFeatureList';
import { PcReveal } from './PcReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = {
  radius: MapPin,
  allergy: AlertTriangle,
  med: Pill,
  checkin: Clock3,
} as const;

const QR_PAYLOAD = 'https://panacea.app/verify/emma-smith';

export function PcSafety() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 100, damping: 20 });
  const sy = useSpring(my, { stiffness: 100, damping: 20 });
  const rotY = useTransform(sx, [0, 1], [-4, 4]);
  const rotX = useTransform(sy, [0, 1], [3, -3]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    QRCode.toDataURL(QR_PAYLOAD, {
      width: 168,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#1f2937', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrSrc(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const live = mounted && !reduced;

  return (
    <div className="pc-split is-reverse">
      <PcReveal className="pc-splitVisual pc-safetyVisual" variants={slideFromLeft}>
        <div className="pc-safetyBlob" aria-hidden />
        <div
          ref={ref}
          className="pc-safetyStage"
          onMouseMove={(e) => {
            if (!live) return;
            const el = ref.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width);
            my.set((e.clientY - r.top) / r.height);
          }}
          onMouseLeave={() => {
            mx.set(0.5);
            my.set(0.5);
          }}
        >
          <motion.div
            className="pc-idCard"
            style={live ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1000 } : undefined}
            initial={false}
            whileHover={live ? { scale: 1.015 } : undefined}
          >
            <div className="pc-idBunting" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="pc-idStar s1" aria-hidden />
            <span className="pc-idStar s2" aria-hidden />
            <span className="pc-idSquiggle" aria-hidden />

            <div className="pc-idTop">
              <div className="pc-idBrand">
                <span className="pc-idLogo" aria-hidden />
                <strong>Little Stars</strong>
              </div>
              <em>
                <ShieldCheck size={12} aria-hidden /> Verified profile
              </em>
            </div>

            <img
              className="pc-idPhoto"
              src="/images/parent-communication/classroom.jpg"
              alt=""
              loading="lazy"
            />
            <h3>Emma Smith</h3>
            <span className="pc-idRole">Student</span>

            <div className="pc-idMeta">
              <div>
                <em>Center</em>
                <strong>Little Stars Preschool</strong>
              </div>
              <div>
                <em>Room</em>
                <strong>Sunflower Room</strong>
              </div>
            </div>

            <div className="pc-idQr">
              <div className="pc-idQrFrame">
                {qrSrc ? (
                  <img src={qrSrc} alt="" width={132} height={132} />
                ) : (
                  <div className="pc-idQrSkeleton" aria-hidden />
                )}
                <i className="pc-idScan" aria-hidden />
              </div>
              <p>Scan to verify</p>
            </div>

            <div className="pc-idBlocks" aria-hidden>
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>

            <div className="pc-idVerified">
              <ShieldCheck size={14} aria-hidden /> Verified Child
            </div>
          </motion.div>

          {PC_SAFETY_FLOATS.map((item, i) => {
            const Icon = ICONS[item.id as keyof typeof ICONS] ?? MapPin;
            return (
              <motion.div
                key={item.id}
                className={`pc-secFloat f${i} tone-${item.tone}`}
                initial={false}
              >
                <motion.div {...(live ? floatAnim(5 + (i % 3), 4.6 + i * 0.4) : {})}>
                  <Icon size={13} aria-hidden />
                  <div>
                    <strong>{item.title}</strong>
                    {item.detail ? <p>{item.detail}</p> : null}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </PcReveal>

      <PcReveal className="pc-splitCopy" variants={slideFromRight}>
        <p className="pc-eyebrow">Ensure Every Child&apos;s Safety</p>
        <h2>Safety First, Parents Reassured</h2>
        <p className="pc-support">
          Give parents peace of mind with safety-first features built into Panacea.
        </p>
        <PcFeatureList points={PC_SAFETY_POINTS} />
      </PcReveal>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Headphones, Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { AU_WHY } from './data';
import { AuReveal } from './AuReveal';
import { AuWhyModal, type WhyModalPayload } from './AuWhyModal';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

type Card = (typeof AU_WHY.cards)[number];

function PrivacyScene() {
  return (
    <div className="au-scene au-scene--mint" aria-hidden>
      <div className="au-sceneCloud">
        <Cloud size={54} strokeWidth={1.4} />
        <span className="au-sceneLock">
          <Lock size={22} strokeWidth={2} />
        </span>
      </div>
      <ShieldCheck className="au-sceneBadge" size={22} strokeWidth={2} />
    </div>
  );
}

function SupportScene() {
  return (
    <div className="au-scene au-scene--pink" aria-hidden>
      <div className="au-sceneChat">
        <span className="au-sceneAvatar" />
        <em>24/7 in-app support</em>
      </div>
      <Headphones className="au-sceneBadge" size={20} strokeWidth={2} />
      <MessageCircle className="au-sceneBadge au-sceneBadge--tr" size={18} strokeWidth={2} />
    </div>
  );
}

function IntegrationsScene({ logos }: { logos?: readonly string[] }) {
  const items = logos ?? ['Xero', 'Google', 'Excel'];
  return (
    <div className="au-scene au-scene--yellow" aria-hidden>
      <div className="au-sceneHub">
        <strong>P</strong>
      </div>
      {items.slice(0, 5).map((label, i) => (
        <span key={label} className={`au-sceneLogo au-sceneLogo--${i + 1}`}>
          {label}
        </span>
      ))}
    </div>
  );
}

function WhyVisual({ card }: { card: Card }) {
  if (card.id === 'privacy') return <PrivacyScene />;
  if (card.id === 'support') return <SupportScene />;
  return <IntegrationsScene logos={card.logos} />;
}

function WhyCard({
  card,
  index,
  onOpen,
}: {
  card: Card;
  index: number;
  onOpen: (card: Card) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.4);

  return (
    <motion.article className="au-whyCard" variants={fadeUp}>
      <button
        type="button"
        className="au-whyVisualBtn"
        onClick={() => onOpen(card)}
        aria-label={`Learn more about ${card.title}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <motion.div
          ref={ref}
          className={`au-whyVisual au-whyVisual--${card.theme}`}
          style={{
            rotateX: reduced ? 0 : `${tilt.rx}deg`,
            rotateY: reduced ? 0 : `${tilt.ry}deg`,
            transformStyle: 'preserve-3d',
            perspective: 900,
          }}
          {...(reduced ? {} : floatAnim(5, 6 + index * 0.4, index * 0.35))}
        >
          <WhyVisual card={card} />
        </motion.div>
      </button>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </motion.article>
  );
}

export function AuWhy() {
  const [active, setActive] = useState<WhyModalPayload | null>(null);

  return (
    <div className="au-why">
      <AuReveal className="au-sectionHead au-center">
        <h2>{AU_WHY.title}</h2>
      </AuReveal>

      <motion.div
        className="au-whyGrid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {AU_WHY.cards.map((card, index) => (
          <WhyCard
            key={card.id}
            card={card}
            index={index}
            onOpen={(c) =>
              setActive({
                id: c.id,
                title: c.title,
                description: c.description,
                modalBody: c.modalBody,
                modalPoints: c.modalPoints,
                theme: c.theme,
                logos: c.logos,
              })
            }
          />
        ))}
      </motion.div>

      <AuWhyModal
        open={Boolean(active)}
        item={active}
        onClose={() => setActive(null)}
        visual={
          active ? (
            <WhyVisual
              card={
                AU_WHY.cards.find((c) => c.id === active.id) ?? AU_WHY.cards[0]
              }
            />
          ) : null
        }
      />
    </div>
  );
}

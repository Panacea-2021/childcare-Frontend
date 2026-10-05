'use client';

import { memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock3, Star } from 'lucide-react';
import type { ReportDefinition } from './data/reportCatalog';
import { getCategoryLabel } from './data/reportCatalog';
import { REPORT_ICONS } from './reportIcons';
import { GenerateButton } from './GenerateButton';

type Props = {
  report: ReportDefinition;
  favorite: boolean;
  generating?: boolean;
  onToggleFavorite: (id: string) => void;
  onGenerate: (report: ReportDefinition) => void;
  index?: number;
};

function ReportCardBase({
  report,
  favorite,
  generating,
  onToggleFavorite,
  onGenerate,
  index = 0,
}: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const Icon = REPORT_ICONS[report.icon];

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotX = ((y - midY) / midY) * -4;
    const rotY = ((x - midX) / midX) * 4;
    el.style.setProperty('--rp-mx', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--rp-my', `${(y / rect.height) * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.015)`;
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
  };

  return (
    <motion.article
      ref={cardRef}
      className="rp-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.24) }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="rp-card-shimmer" aria-hidden />

      <div className="rp-card-top">
        <span className="rp-card-icon">
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <motion.button
          type="button"
          className={`rp-fav-btn${favorite ? ' is-on' : ''}`}
          aria-label={favorite ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(report.id)}
          whileTap={{ scale: 0.88 }}
          animate={favorite ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <Star size={18} fill={favorite ? 'currentColor' : 'none'} strokeWidth={1.75} />
          <AnimatePresence>
            {favorite ? (
              <motion.span
                key="glow"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.6, 1.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '999px',
                  boxShadow: '0 0 18px rgba(245, 179, 1, 0.55)',
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="rp-card-body">
        <h3>{report.name}</h3>
        <p>{report.description}</p>
      </div>

      <div className="rp-card-footer">
        <div className="rp-card-meta">
          <span className="rp-badge">{getCategoryLabel(report.categoryId)}</span>
          <span className="rp-eta">
            <Clock3 size={13} />
            {report.estimatedTime}
          </span>
        </div>
        <GenerateButton loading={generating} onClick={() => onGenerate(report)} />
      </div>
    </motion.article>
  );
}

export const ReportCard = memo(ReportCardBase);

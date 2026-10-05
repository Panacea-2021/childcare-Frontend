'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, Play } from 'lucide-react';
import { ADR_VIDEO } from './data';
import { AdrReveal } from './AdrReveal';
import { fadeUp, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AdrVideo() {
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);

  return (
    <div id="adr-video" className="adr-video">
      <AdrReveal className="adr-videoHead" variants={fadeUp}>
        <h2>{ADR_VIDEO.overlayTitle}</h2>
        <p className="adr-videoWatch">
          <MonitorPlay size={16} aria-hidden />
          {ADR_VIDEO.watchLabel}
        </p>
      </AdrReveal>

      <AdrReveal className="adr-videoFrame" variants={scaleIn} amount={0.28}>
        <div className="adr-videoStage">
          <span className="adr-videoSweep" aria-hidden />
          {playing ? (
            <iframe
              className="adr-videoIframe"
              src={ADR_VIDEO.embedSrc}
              title="Panacea AI Daily Reports demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="adr-videoPoster"
              onClick={() => setPlaying(true)}
              aria-label="Play daily reports demo video"
            >
              <img
                src={ADR_VIDEO.poster}
                alt=""
                width={1200}
                height={675}
                loading="lazy"
              />
              <span className="adr-videoPosterShade" aria-hidden />
              <motion.span
                className="adr-videoPlay glass"
                aria-hidden
                whileHover={reduced ? undefined : { scale: 1.06 }}
                whileTap={reduced ? undefined : { scale: 0.96 }}
              >
                <Play size={28} fill="currentColor" />
              </motion.span>
              <span className="adr-videoCaption glass">
                <strong>{ADR_VIDEO.captionName}</strong>
                <em>·</em>
                <span>{ADR_VIDEO.captionMeta}</span>
              </span>
            </button>
          )}
        </div>
      </AdrReveal>
    </div>
  );
}

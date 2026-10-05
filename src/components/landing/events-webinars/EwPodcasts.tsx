'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { PODCASTS, getFeaturedPodcast, type Podcast } from './data';
import { EventImage } from './EventImage';
import { EwCarousel } from './EwCarousel';
import { EwReveal } from './EwReveal';
import { VideoModal } from './VideoModal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function EwPodcasts() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<Podcast>(getFeaturedPodcast());
  const [modalOpen, setModalOpen] = useState(false);

  const playPodcast = (pod: Podcast) => {
    setActive(pod);
    setModalOpen(true);
  };

  return (
    <section className="ew-podcasts" aria-labelledby="ew-podcasts-title">
      <div className="ew-wrap">
        <div className="ew-podTop">
          <EwReveal className="ew-podIntro">
            <h2 id="ew-podcasts-title">Fresh Podcasts</h2>
            <p>
              Listen in to childcare leaders speak openly about the most pressing issues and their
              solutions.
            </p>
          </EwReveal>

          <EwReveal className="ew-podFeatured" delay={0.08}>
            <AnimatePresence mode="wait">
              <motion.button
                key={active.id}
                type="button"
                className="ew-podFeaturedBtn"
                onClick={() => playPodcast(active)}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`Play podcast: ${active.title}`}
              >
                <EventImage
                  imageUrl={active.imageUrl}
                  alt={active.title}
                  width={1100}
                  height={620}
                />
                <span className="ew-podOverlay">
                  <span className="ew-play" aria-hidden>
                    <Play size={28} fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="ew-podFeaturedTitle">{active.title}</span>
                </span>
              </motion.button>
            </AnimatePresence>
          </EwReveal>
        </div>

        <EwReveal delay={0.1}>
          <EwCarousel label="Podcast episodes" autoplayMs={0}>
            {PODCASTS.map((pod) => (
              <button
                key={pod.id}
                type="button"
                className={`ew-podThumb${pod.id === active.id ? ' is-active' : ''}`}
                onClick={() => playPodcast(pod)}
                aria-pressed={pod.id === active.id}
                aria-label={`Play podcast: ${pod.title}`}
              >
                <span className="ew-podThumbMedia">
                  <EventImage imageUrl={pod.imageUrl} alt="" width={480} height={270} />
                  <span className="ew-play ew-play--sm" aria-hidden>
                    <Play size={16} fill="currentColor" strokeWidth={0} />
                  </span>
                </span>
                <span className="ew-podThumbTitle">{pod.title}</span>
              </button>
            ))}
          </EwCarousel>
        </EwReveal>
      </div>

      <VideoModal
        open={modalOpen}
        title={active.title}
        videoUrl={active.videoUrl}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

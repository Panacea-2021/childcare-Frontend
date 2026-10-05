'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPastEvents, type ResourceEvent } from './data';
import { EventImage } from './EventImage';
import { EwReveal } from './EwReveal';
import { VideoModal } from './VideoModal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const INITIAL = 5;

function PastCard({
  event,
  onWatch,
}: {
  event: ResourceEvent;
  onWatch: (event: ResourceEvent) => void;
}) {
  const hasRecording = Boolean(event.recordingUrl);

  return (
    <article className="ew-pastCard">
      <Link href={`/resources/events-webinars/${event.slug}`} className="ew-pastMedia">
        <EventImage imageUrl={event.imageUrl} alt={event.title} width={640} height={360} />
      </Link>
      <div className="ew-pastBody">
        <h3>
          <Link href={`/resources/events-webinars/${event.slug}`}>{event.title}</Link>
        </h3>
        {hasRecording ? (
          <button type="button" className="ew-action" onClick={() => onWatch(event)}>
            Watch Recording <span aria-hidden>→</span>
          </button>
        ) : (
          <Link href={`/resources/events-webinars/${event.slug}`} className="ew-action">
            View details <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}

export function EwPast() {
  const reduced = usePrefersReducedMotion();
  const all = getPastEvents();
  const [visible, setVisible] = useState(INITIAL);
  const [modal, setModal] = useState<ResourceEvent | null>(null);
  const list = all.slice(0, visible);
  const hasMore = visible < all.length;

  return (
    <section className="ew-past" aria-labelledby="ew-past-title">
      <div className="ew-wrap">
        <EwReveal className="ew-sectionHead">
          <h2 id="ew-past-title">Past Events &amp; Webinars</h2>
        </EwReveal>

        {all.length === 0 ? (
          <div className="ew-empty">
            <p>No recordings available yet.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="ew-pastList"
              variants={staggerContainer}
              initial={reduced ? false : 'hidden'}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {list.map((event) => (
                <motion.div key={event.id} variants={fadeUp}>
                  <PastCard event={event} onWatch={setModal} />
                </motion.div>
              ))}
            </motion.div>

            {hasMore ? (
              <div className="ew-viewAll">
                <button
                  type="button"
                  className="ui-btn ui-btn-primary ew-viewAllBtn"
                  onClick={() => setVisible((v) => Math.min(v + 3, all.length))}
                >
                  View all
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <VideoModal
        open={Boolean(modal)}
        title={modal?.title ?? ''}
        videoUrl={modal?.recordingUrl ?? ''}
        onClose={() => setModal(null)}
      />
    </section>
  );
}

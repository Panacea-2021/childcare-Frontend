'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { MapPin, Quote } from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from './EnrollmentFooter';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import {
  getCustomerStory,
  relatedStories,
  type CustomerStory,
} from './demoScheduleData';
import '../landing.css';
import '../features/features-mega-menu.css';
import './enrollments.css';
import './customer-story.css';

type Props = {
  slug: string;
};

function AnimatedStat({
  value,
  suffix,
  label,
  reduced,
}: {
  value: number;
  suffix: string;
  label: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) {
      setN(value);
      return;
    }
    let frame = 0;
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduced]);

  return (
    <div className="cs-stat" ref={ref}>
      <strong>
        {n}
        {suffix}
      </strong>
      <p>{label}</p>
    </div>
  );
}

function ProductMock({ variant }: { variant: 'a' | 'b' }) {
  return (
    <div className={`cs-mock cs-mock-${variant}`} aria-hidden>
      <div className="cs-mockTablet">
        <span className="cs-mockBar" />
        <span className="cs-mockBar short" />
        <div className="cs-mockRows">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="cs-mockPhone">
        <span className="cs-mockDot" />
        <span className="cs-mockBar" />
        <span className="cs-mockBar short" />
      </div>
    </div>
  );
}

export function CustomerStoryExperience({ slug }: Props) {
  const reduced = usePrefersReducedMotion();
  const story = getCustomerStory(slug);
  const related = relatedStories(slug, 3);

  if (!story) {
    return (
      <CenterScopeProvider>
        <div className="lp-page en-page">
          <LandingHeader />
          <main className="en-wrap cs-missing">
            <h1>Story not found</h1>
            <Link href="/features/enrollments/book-demo" className="ui-btn ui-btn-primary">
              Back to booking
            </Link>
          </main>
          <EnrollmentFooter />
        </div>
      </CenterScopeProvider>
    );
  }

  return (
    <CenterScopeProvider>
      <div className="lp-page en-page cs-page">
        <div className="cs-atmosphere" aria-hidden>
          <span className="cs-orb cs-orb-a" />
          <span className="cs-orb cs-orb-b" />
        </div>
        <LandingHeader />

        <main>
          <section className="cs-hero">
            <div className="en-wrap cs-heroGrid">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="cs-kicker">Case study</p>
                <h1>{story.headline}</h1>
                <p className="cs-loc">
                  <MapPin size={16} /> {story.flag} {story.location}
                </p>
              </motion.div>

              <motion.aside
                className={`cs-profile tone-${story.tone}`}
                initial={reduced ? false : { opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5 }}
              >
                <span className="cs-profileMark">{story.title.split(' ')[0]}</span>
                <strong>{story.title}</strong>
                <div className="cs-profileTags">
                  {story.profileTags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </motion.aside>
            </div>
          </section>

          <section className="cs-band">
            <div className="en-wrap cs-narrow">
              <motion.p
                className="cs-intro"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {story.intro}
              </motion.p>

              <motion.blockquote
                className="cs-quote"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Quote className="cs-quoteIcon" size={28} aria-hidden />
                <p>“{story.quote}”</p>
                <cite>{story.person}</cite>
              </motion.blockquote>
            </div>
          </section>

          <section className="cs-band">
            <div className="en-wrap cs-split">
              <motion.div
                initial={reduced ? false : { opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2>The challenges</h2>
                <p>{story.challenges}</p>
              </motion.div>
              <ProductMock variant="a" />
            </div>
          </section>

          <section className="cs-band">
            <div className="en-wrap cs-split is-reverse">
              <motion.div
                initial={reduced ? false : { opacity: 0, x: 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2>How Panacea helped</h2>
                <p>{story.solutions}</p>
              </motion.div>
              <ProductMock variant="b" />
            </div>
          </section>

          <section className="cs-band cs-statsBand">
            <div className="en-wrap cs-stats">
              {story.stats.map((s) => (
                <AnimatedStat
                  key={s.label}
                  value={s.value}
                  suffix={s.suffix}
                  label={s.label}
                  reduced={reduced}
                />
              ))}
            </div>
          </section>

          <section className="cs-band">
            <div className="en-wrap">
              <div className="cs-moreHead">
                <h2>Discover more stories</h2>
                <Link href="/features/enrollments/book-demo" className="cs-pillLink">
                  View all
                </Link>
              </div>
              <div className="cs-moreGrid">
                {related.map((item, index) => (
                  <RelatedCard key={item.slug} story={item} index={index} reduced={reduced} />
                ))}
              </div>
            </div>
          </section>

          <section className="cs-ctaBand">
            <div className="en-wrap cs-ctaInner">
              <h2>Excited to Try Our AI-Powered Childcare Platform?</h2>
              <p>See how Panacea enrollments, tours, and waitlists work for your centers.</p>
              <Link href="/book-demo" className="ui-btn ui-btn-primary">
                Book a Demo
              </Link>
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}

function RelatedCard({
  story,
  index,
  reduced,
}: {
  story: CustomerStory;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.article
      className={`cs-moreCard tone-${story.tone}`}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="cs-moreVisual" aria-hidden>
        <strong>{story.title.split(' ')[0]}</strong>
      </div>
      <span className="cs-moreTag">Case Study</span>
      <h3>{story.headline}</h3>
      <Link href={`/features/enrollments/stories/${story.slug}`} className="ds-readMore">
        Read More
      </Link>
    </motion.article>
  );
}

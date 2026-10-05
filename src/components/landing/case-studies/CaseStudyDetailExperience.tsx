'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import type { CaseStudy } from './data';
import { getRelatedCaseStudies } from './data';
import { CaseStudyCard } from './CaseStudyCard';
import { CsCountUp } from './CsCountUp';
import { CsCta } from './CsCta';
import { CsReveal } from './CsReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './case-studies.css';

type Props = {
  study: CaseStudy | null;
};

export function CaseStudyDetailExperience({ study }: Props) {
  if (!study) {
    return (
      <CenterScopeProvider>
        <div className="lp-page cs-page">
          <LandingHeader />
          <main className="cs-main">
            <section className="cs-error">
              <div className="cs-wrap">
                <h1>Case study unavailable</h1>
                <p>We couldn&apos;t find this story. It may have moved or been unpublished.</p>
                <Link href="/resources/case-studies" className="ui-btn ui-btn-primary">
                  Back to Case Studies
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

  return <CaseStudyDetailBody study={study} />;
}

function CaseStudyDetailBody({ study }: { study: CaseStudy }) {
  const reduced = usePrefersReducedMotion();
  const related = getRelatedCaseStudies(study);

  return (
    <CenterScopeProvider>
      <div className="lp-page cs-page cs-detailPage">
        <LandingHeader />
        <main className="cs-main">
          <section className="cs-dHero">
            <div className="cs-dHeroGlow" aria-hidden />
            <div className="cs-wrap cs-dHeroGrid">
              <motion.div
                className="cs-dHeroCopy"
                variants={staggerContainer}
                initial={reduced ? false : 'hidden'}
                animate="show"
              >
                <motion.div variants={fadeUp}>
                  <Link href="/resources/case-studies" className="cs-back">
                    <ArrowLeft size={14} aria-hidden />
                    Case Studies
                  </Link>
                </motion.div>
                <motion.h1 variants={fadeUp}>{study.title}</motion.h1>
                <motion.div className="cs-dLocBlock" variants={fadeUp}>
                  <span className="cs-dLocLabel">
                    <MapPin size={12} aria-hidden />
                    Location
                  </span>
                  <strong className="cs-dLocValue">{study.location}</strong>
                </motion.div>
              </motion.div>

              <motion.div
                className="cs-dHeroVisual"
                initial={reduced ? false : { opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <aside className="cs-spotlight" aria-label="Customer spotlight">
                  <div className="cs-spotlightTop">
                    <span className="cs-spotlightBadge">Customer Spotlight</span>
                    <span className={`cs-logoMark cs-logoMark--${study.logoTone}`} aria-hidden>
                      {study.logoText.slice(0, 1)}
                    </span>
                  </div>
                  <div className="cs-spotlightBody">
                    <div className="cs-spotlightCopy">
                      <h2>{study.customer}</h2>
                      <div className="cs-spotlightPerson">
                        <div>
                          <strong>{study.author}</strong>
                          <em>
                            {study.role}
                            <span aria-hidden> · </span>
                            {study.location}
                          </em>
                        </div>
                        <span className={`cs-logoMark cs-logoMark--sm cs-logoMark--${study.logoTone}`}>
                          {study.logoText.slice(0, 1)}
                        </span>
                      </div>
                    </div>
                    <div className="cs-spotlightPhoto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={study.heroImage}
                        alt={study.author}
                        width={280}
                        height={320}
                        decoding="async"
                        fetchPriority="high"
                      />
                    </div>
                  </div>
                </aside>
              </motion.div>
            </div>
          </section>

          <SectionWave
            id="cs-dh"
            variant="softS"
            from="#fff5f8"
            to="#ffffff"
            accent="rgba(244, 114, 182, 0.22)"
          />

          <section className="cs-article">
            <div className="cs-wrap cs-articleInner">
              <CsReveal>
                <h2>{study.challenge.title}</h2>
                <p>{study.challenge.content}</p>
              </CsReveal>

              <CsReveal className="cs-pullQuote" delay={0.05}>
                <span className="cs-pullMark" aria-hidden>
                  &ldquo;
                </span>
                <blockquote>
                  <p>{study.testimonial}</p>
                  <footer>
                    {study.author}, {study.role}
                  </footer>
                </blockquote>
              </CsReveal>

              <CsReveal>
                <h2>{study.needs.title}</h2>
                <p>{study.needs.content}</p>
              </CsReveal>

              <CsReveal className="cs-process" delay={0.04}>
                <ol className="cs-processTrack">
                  {study.process.map((step, i) => (
                    <li key={step.title}>
                      <span className="cs-processNum">{i + 1}</span>
                      <strong>{step.title}</strong>
                      {step.description ? <em>{step.description}</em> : null}
                      {i < study.process.length - 1 ? (
                        <ArrowRight className="cs-processArrow" size={16} aria-hidden />
                      ) : null}
                    </li>
                  ))}
                </ol>
              </CsReveal>

              <CsReveal>
                <h2>{study.solution.title}</h2>
                <p>{study.solution.content}</p>
              </CsReveal>

              <div className="cs-solutionGallery">
                {study.solution.images.map((img, i) => (
                  <CsReveal key={img.src + i} className="cs-shot" delay={i * 0.08}>
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        decoding="async"
                        width={640}
                        height={420}
                      />
                      {img.caption ? <figcaption>{img.caption}</figcaption> : null}
                    </figure>
                    {i < study.solution.images.length - 1 ? (
                      <ArrowRight className="cs-shotArrow" size={18} aria-hidden />
                    ) : null}
                  </CsReveal>
                ))}
              </div>

              <CsReveal>
                <h2>{study.whatsNext.title}</h2>
                <p>{study.whatsNext.content}</p>
              </CsReveal>

              <CsReveal className="cs-stats" amount={0.4}>
                <ul>
                  {study.stats.map((stat) => (
                    <li key={stat.label}>
                      <CsCountUp
                        className="cs-statValue"
                        value={stat.value}
                        suffix={stat.suffix}
                      />
                      <span className="cs-statLabel">{stat.label}</span>
                    </li>
                  ))}
                </ul>
              </CsReveal>
            </div>
          </section>

          {related.length > 0 ? (
            <>
              <SectionWave
                id="cs-rel"
                variant="valley"
                from="#ffffff"
                to="#f8f5ff"
                accent="rgba(167, 139, 250, 0.22)"
              />
              <section className="cs-related" aria-labelledby="cs-related-title">
                <div className="cs-wrap">
                  <CsReveal>
                    <h2 id="cs-related-title">Discover More Inspiring Stories</h2>
                  </CsReveal>
                  <motion.div
                    className="cs-grid cs-grid--related"
                    variants={staggerContainer}
                    initial={reduced ? false : 'hidden'}
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                  >
                    {related.map((item) => (
                      <motion.div key={item.id} variants={fadeUp}>
                        <CaseStudyCard study={item} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </section>
            </>
          ) : null}

          <SectionWave
            id="cs-dcta"
            variant="ribbon"
            from="#f8f5ff"
            to="#e8f7fb"
            accent="rgba(56, 189, 248, 0.25)"
          />
          <CsCta />
          <SectionWave
            id="cs-df"
            variant="softS"
            from="#e8f7fb"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.28)"
          />
        </main>
        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}

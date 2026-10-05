'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { CaseStudy } from './data';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

type Props = {
  study: CaseStudy;
  priority?: boolean;
  className?: string;
};

export function CaseStudyCard({ study, priority = false, className = '' }: Props) {
  const { ref, tilt, onMove, onLeave, reduced } = useParallaxTilt(0.28);
  const href = `/resources/case-studies/${study.slug}`;

  return (
    <div
      ref={ref}
      className={`cs-cardTilt ${className}`.trim()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduced
          ? undefined
          : {
              transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }
      }
    >
      <article className={`cs-card cs-card--${study.logoTone}`}>
        <div className="cs-cardFace cs-cardFace--default">
          <header className="cs-cardTop">
            <span className={`cs-logoMark cs-logoMark--${study.logoTone}`} aria-hidden>
              {study.logoText.slice(0, 1)}
            </span>
            <span className="cs-logoName">{study.customer}</span>
            <span className="cs-readMore">
              Read more
              <span aria-hidden>→</span>
            </span>
          </header>
          <div className="cs-cardRule" aria-hidden />
          <h3 className="cs-cardTitle">{study.title}</h3>
          <span className="cs-pill">{study.category}</span>

          <div className={`cs-cardVisual cs-cardVisual--${study.cardStyle}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.image}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={study.imageFit === 'contain' ? 'is-contain' : 'is-cover'}
            />
            {study.cardStyle === 'graphic' ? (
              <div className="cs-cardGraphicOverlay">
                <strong>{study.customer}</strong>
                <em>{study.location}</em>
                {study.graphicTags?.length ? (
                  <ul>
                    {study.graphicTags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <footer className="cs-cardFoot">
            <p className="cs-result">{study.result}</p>
            <p className="cs-loc">
              <MapPin size={14} aria-hidden />
              {study.location}
            </p>
          </footer>
        </div>

        <div className="cs-cardFace cs-cardFace--quote" aria-hidden>
          <header className="cs-cardTop">
            <span className={`cs-logoMark cs-logoMark--${study.logoTone}`}>
              {study.logoText.slice(0, 1)}
            </span>
            <span className="cs-logoName">{study.customer}</span>
            <span className="cs-readMore">
              Read more
              <span>→</span>
            </span>
          </header>
          <div className="cs-cardRule" />
          <blockquote className="cs-quote">
            <p>&ldquo;{study.testimonial}&rdquo;</p>
          </blockquote>
          <div className="cs-quoteBy">
            <strong>{study.author}</strong>
            <em>{study.role}</em>
          </div>
        </div>

        <Link href={href} className="cs-cardHit" aria-label={`Read case study: ${study.title}`} />
      </article>
    </div>
  );
}

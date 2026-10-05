'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ENROLLMENT_FEATURES, type EnrollmentFeatureId } from './data';
import { useAutoRotate } from './hooks/useAutoRotate';
import { useParallaxTilt } from './hooks/useParallaxTilt';
import { WaitlistMockup } from './mockups/WaitlistMockup';
import { RegistrationMockup } from './mockups/RegistrationMockup';
import { FamilyEnrollmentMockup } from './mockups/FamilyEnrollmentMockup';
import { EnrollmentWorkflowMockup } from './mockups/EnrollmentWorkflowMockup';

function FeatureVisual({ id }: { id: EnrollmentFeatureId }) {
  switch (id) {
    case 'waitlists':
      return <WaitlistMockup />;
    case 'registrations':
      return <RegistrationMockup />;
    case 'families':
      return <FamilyEnrollmentMockup />;
    case 'workflows':
      return <EnrollmentWorkflowMockup />;
    default:
      return null;
  }
}

export function EnrollmentGrowth() {
  const [paused, setPaused] = useState(false);
  const { activeId, progress, select } = useAutoRotate(ENROLLMENT_FEATURES, { paused });
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.55);
  const active = (activeId || ENROLLMENT_FEATURES[0].id) as EnrollmentFeatureId;

  return (
    <section
      id="enrollment-growth"
      className="en-growth"
      aria-labelledby="en-growth-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="en-sectionHead">
        <h2 id="en-growth-title">Turn enrollment chaos into predictable growth</h2>
        <p>
          Capture inquiries, automate follow-ups, schedule tours, manage waitlists, and
          enroll families from one intelligent platform.
        </p>
      </div>

      <div className="en-growthShell">
        <div className="en-growthLayout">
          <div className="en-featureList" role="tablist" aria-label="Enrollment features">
            {ENROLLMENT_FEATURES.map((feature) => {
              const isActive = feature.id === active;
              return (
                <button
                  key={feature.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`en-featureTab${isActive ? ' is-active' : ''}`}
                  onClick={() => select(feature.id)}
                >
                  {isActive ? (
                    <span className="en-featureProgress" aria-hidden="true">
                      <span style={{ width: `${progress * 100}%` }} />
                    </span>
                  ) : null}
                  <span className="en-featureTitle">{feature.title}</span>
                  {isActive ? (
                    <span className="en-featureDesc">{feature.description}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            ref={ref}
            className="en-featureStage"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="en-featureStagePad"
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.34 }}
              >
                <FeatureVisual id={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="en-growthCta">
          <span>How enrollment software aids growth</span>
          <Link href="/login" className="ui-btn ui-btn-primary">
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}

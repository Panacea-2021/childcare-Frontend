'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { AUDIO_EXPERIENCES, HERO_EXPERIENCES, type HeroExperienceId } from './data';
import { HeroScene } from './HeroScene';
import { useExclusiveAudioPlayer, formatTime } from './hooks/useExclusiveAudioPlayer';
import { useParallaxTilt } from './hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  experienceId: HeroExperienceId;
  onExperienceChange: (id: HeroExperienceId) => void;
  onSeeInAction: () => void;
};

export function EnrollmentHero({ experienceId, onExperienceChange, onSeeInAction }: Props) {
  const audio = useExclusiveAudioPlayer();
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.55);
  const active = HERO_EXPERIENCES.find((e) => e.id === experienceId) ?? HERO_EXPERIENCES[0];
  const activeAudio = AUDIO_EXPERIENCES.find((a) => a.id === audio.activeId);

  return (
    <section className="en-hero" aria-labelledby="en-hero-title">
      <motion.div
        className="en-heroIntro"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="en-kicker">Panacea Enrollments</p>
        <h1 id="en-hero-title">Capture every family inquiry, automatically.</h1>
        <p className="en-lead">
          Lead capture, AI conversations, tour booking, waitlists and registration —
          one intelligent enrollment journey from first message to day one.
        </p>
      </motion.div>

      <div className="en-expTabs" role="tablist" aria-label="Enrollment experiences">
        {HERO_EXPERIENCES.map((exp) => (
          <button
            key={exp.id}
            type="button"
            role="tab"
            aria-selected={exp.id === experienceId}
            className={exp.id === experienceId ? 'is-active' : undefined}
            onClick={() => onExperienceChange(exp.id)}
          >
            {exp.label}
          </button>
        ))}
      </div>

      <motion.div
        className="en-heroStage"
        initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="en-heroStageGlow" aria-hidden="true" />

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="en-heroStageGrid"
            initial={reduced ? { opacity: 1 } : { opacity: 0, x: -16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 12, filter: 'blur(6px)' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="en-heroStageCopy">
              <h2>{active.title}</h2>
              <ul className="en-pointList">
                {active.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button type="button" className="en-textLink" onClick={onSeeInAction}>
                {active.ctaLabel}
              </button>
            </div>

            <div
              ref={ref}
              className="en-heroVisual"
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{
                transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              }}
            >
              <HeroScene
                experienceId={experienceId}
                audioActive={audio.playing}
                audioLevel={audio.level}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {experienceId === 'ai' ? (
          <div className="en-audioRail" aria-label="AI conversation samples">
            <div className="en-audioPills">
              {AUDIO_EXPERIENCES.map((item) => {
                const isActive = audio.activeId === item.id;
                const playing = isActive && audio.playing;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`en-audioPill${isActive ? ' is-active' : ''}${playing ? ' is-playing' : ''}`}
                    onClick={() => void audio.play(item.id, item.src)}
                    aria-pressed={playing}
                    aria-label={`${playing ? 'Pause' : 'Play'} ${item.title}`}
                  >
                    <span className="en-audioPillIcon" aria-hidden="true">
                      {playing ? <Pause size={12} /> : <Play size={12} />}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            {activeAudio ? (
              <div className="en-audioNow" aria-live="polite">
                <div className="en-audioWaveMini" aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${6 + (audio.playing ? audio.level * 18 : 4) * (0.4 + (i % 4) * 0.2)}px`,
                      }}
                    />
                  ))}
                </div>
                <span>
                  {formatTime(audio.current)} / {formatTime(audio.duration || 0)}
                </span>
                <div className="en-audioTrack">
                  <div
                    className="en-audioFill"
                    style={{
                      width: `${audio.duration ? Math.min(100, (audio.current / audio.duration) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="en-audioHint">Press play to hear a sample enrollment conversation.</p>
            )}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}

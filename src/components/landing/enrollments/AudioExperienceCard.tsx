'use client';

import { Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AudioExperience } from './data';
import { formatTime } from './hooks/useExclusiveAudioPlayer';

type Props = {
  item: AudioExperience;
  active: boolean;
  playing: boolean;
  current: number;
  duration: number;
  level: number;
  onToggle: () => void;
};

export function AudioExperienceCard({
  item,
  active,
  playing,
  current,
  duration,
  level,
  onToggle,
}: Props) {
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  return (
    <motion.button
      type="button"
      className={`en-audioCard${active ? ' is-active' : ''}${playing ? ' is-playing' : ''}`}
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={`${playing ? 'Pause' : 'Play'} ${item.title}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="en-audioTop">
        <span className="en-audioNum">{item.number}</span>
        <span className="en-audioPlay" aria-hidden="true">
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </span>
      </div>
      <strong className="en-audioTitle">{item.title}</strong>
      <p className="en-audioDesc">{item.description}</p>

      <div className="en-audioWave" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => {
          const base = 6 + ((i * 7) % 10);
          const boost = active ? level * 22 : 0;
          const h = base + boost * (0.4 + (i % 5) * 0.12);
          return <span key={i} style={{ height: `${h}px` }} />;
        })}
      </div>

      {active ? (
        <div className="en-audioProgress" aria-hidden="true">
          <span>{formatTime(current)}</span>
          <div className="en-audioTrack">
            <div className="en-audioFill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span>{formatTime(duration || 0)}</span>
        </div>
      ) : null}
    </motion.button>
  );
}

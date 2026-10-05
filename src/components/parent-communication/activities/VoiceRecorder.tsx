'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Volume2, Check } from 'lucide-react';
import type { VoiceNoteData } from '@/types/activity';
import './activities.css';

interface VoiceRecorderProps {
  voiceNote: VoiceNoteData | null;
  onChange: (v: VoiceNoteData | null) => void;
  /** Compact bar layout for Post Activity page */
  compact?: boolean;
}

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const WAVE_HEIGHTS = [12, 28, 18, 32, 22, 36, 26, 14];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  voiceNote,
  onChange,
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isRecording) return undefined;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setSeconds(0);
    setIsPlaying(false);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    const durationStr = formatTimer(seconds);
    onChange({
      id: `vn-${Date.now()}`,
      duration: durationStr,
      recordedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const deleteRecording = () => {
    setIsRecording(false);
    setSeconds(0);
    setIsPlaying(false);
    onChange(null);
  };

  return (
    <div className={`act-voice-recorder act-step${compact ? ' is-compact' : ''}`}>
      {!compact ? (
        <div className="act-voice-header">
          <span className="act-voice-title">
            <Volume2 size={16} />
            Step 6: Voice Note
          </span>
          {voiceNote && (
            <span className="act-voice-ready-badge">
              <Check size={12} />
              Ready
            </span>
          )}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {!voiceNote && !isRecording && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {compact ? (
              <div className="act-voice-compact-bar">
                <span>Voice Note</span>
                <button
                  type="button"
                  className="act-voice-compact-mic"
                  onClick={startRecording}
                  aria-label="Record audio"
                  title="Record Audio"
                >
                  <Mic size={18} />
                </button>
              </div>
            ) : (
              <motion.button
                type="button"
                className="act-voice-record-btn"
                onClick={startRecording}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mic size={20} />
                Tap to Record Voice Note
              </motion.button>
            )}
          </motion.div>
        )}

        {isRecording && (
          <motion.div
            key="recording"
            className="act-voice-recording"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                className="act-voice-pulse"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Square size={16} fill="currentColor" />
              </motion.div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-danger, #e53935)',
                  }}
                >
                  Recording...
                </p>
                <p className="act-voice-timer">{formatTimer(seconds)}</p>
              </div>
            </div>

            <div className="act-voice-waveform">
              {WAVE_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="act-voice-wave-bar"
                  animate={{ height: [6, h, 6] }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    delay: i * 0.06,
                  }}
                  style={{ height: h }}
                />
              ))}
            </div>

            <button type="button" className="act-voice-stop-btn" onClick={stopRecording}>
              Stop & Save
            </button>
          </motion.div>
        )}

        {voiceNote && !isRecording && (
          <motion.div
            key="playback"
            className="act-voice-playback"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="act-voice-play-btn"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
              >
                {isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} style={{ marginLeft: 2 }} />
                )}
              </button>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700 }}>
                  Voice Note Recorded
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '0.68rem',
                    color: 'var(--text-secondary, #6b7280)',
                  }}
                >
                  Duration: {voiceNote.duration} • {voiceNote.recordedAt}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="act-voice-delete-btn"
              onClick={deleteRecording}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

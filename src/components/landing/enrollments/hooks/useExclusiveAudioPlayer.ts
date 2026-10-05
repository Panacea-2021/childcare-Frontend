'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type AudioState = {
  activeId: string | null;
  playing: boolean;
  current: number;
  duration: number;
  level: number;
};

export function useExclusiveAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [state, setState] = useState<AudioState>({
    activeId: null,
    playing: false,
    current: 0,
    duration: 0,
    level: 0,
  });

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = useCallback(() => {
    const audio = audioRef.current;
    const analyser = analyserRef.current;
    if (!audio) return;

    let level = 0;
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum += data[i] ?? 0;
      level = sum / (data.length * 255);
    } else {
      level = audio.paused ? 0 : 0.35 + Math.sin(audio.currentTime * 6) * 0.15;
    }

    setState((prev) => ({
      ...prev,
      current: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : prev.duration,
      level,
      playing: !audio.paused,
    }));

    if (!audio.paused) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }, []);

  const ensureGraph = useCallback(async (audio: HTMLAudioElement) => {
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    if (!sourceRef.current) {
      try {
        sourceRef.current = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;
        sourceRef.current.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      } catch {
        // Already connected or unsupported — fall back to simulated levels.
      }
    }
  }, []);

  const play = useCallback(
    async (id: string, src: string) => {
      stopRaf();
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';
        audioRef.current = audio;
      }

      if (activeIdRef.current === id && !audio.paused) {
        audio.pause();
        setState((prev) => ({ ...prev, playing: false, level: 0 }));
        return;
      }

      if (activeIdRef.current !== id) {
        audio.pause();
        audio.src = src;
        audio.currentTime = 0;
        activeIdRef.current = id;
      } else if (!audio.src) {
        audio.src = src;
      }

      try {
        await ensureGraph(audio);
        await audio.play();
        setState({
          activeId: id,
          playing: true,
          current: audio.currentTime || 0,
          duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          level: 0.2,
        });
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setState((prev) => ({ ...prev, activeId: id, playing: false, level: 0 }));
      }
    },
    [ensureGraph, tick],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    stopRaf();
    setState((prev) => ({ ...prev, playing: false, level: 0 }));
  }, []);

  useEffect(() => {
    const audio = audioRef.current ?? new Audio();
    if (!audioRef.current) audioRef.current = audio;
    const onEnded = () => {
      stopRaf();
      setState((prev) => ({
        ...prev,
        playing: false,
        level: 0,
        current: prev.duration,
      }));
    };
    const onLoaded = () => {
      setState((prev) => ({
        ...prev,
        duration: Number.isFinite(audio.duration) ? audio.duration : prev.duration,
      }));
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopRaf();
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
      void ctxRef.current?.close();
      ctxRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      audioRef.current = null;
    };
  }, []);

  return { ...state, play, pause };
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

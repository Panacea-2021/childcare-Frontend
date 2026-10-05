'use client';

import { HeroBackground } from './HeroBackground';
import { HeroCopy } from './HeroCopy';
import { HeroDashboard } from './HeroDashboard';
import { useMouseSpotlight } from './useMouseSpotlight';
import './hero.css';

export function HeroSection() {
  const { ref, point, onMove, onLeave } = useMouseSpotlight();

  return (
    <section
      ref={ref}
      className="ph-hero"
      aria-label="Panacea product hero"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="ph-borderBeam" aria-hidden="true" />
      <HeroBackground />

      <div
        className="ph-spotlight"
        style={{
          background: `radial-gradient(640px circle at ${point.x}% ${point.y}%, rgba(93,95,239,0.12), rgba(208,213,237,0.06) 40%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="ph-inner is-ready">
        <HeroCopy ready />
        <HeroDashboard ready />
      </div>
    </section>
  );
}

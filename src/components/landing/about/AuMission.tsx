'use client';

import Link from 'next/link';
import { AuReveal } from './AuReveal';
import { AU_MISSION } from './data';
import { scaleIn } from './motion';

export function AuMission() {
  return (
    <div className="au-mission">
      <div className="au-missionGlow" aria-hidden />
      <div className="au-missionOrb au-missionOrb--a" aria-hidden />
      <div className="au-missionOrb au-missionOrb--b" aria-hidden />
      <AuReveal className="au-missionInner" variants={scaleIn}>
        <h2>{AU_MISSION.title}</h2>
        <p>{AU_MISSION.body}</p>
        <Link href={AU_MISSION.ctaHref} className="ui-btn ui-btn-primary au-missionBtn">
          {AU_MISSION.ctaLabel}
        </Link>
      </AuReveal>
    </div>
  );
}

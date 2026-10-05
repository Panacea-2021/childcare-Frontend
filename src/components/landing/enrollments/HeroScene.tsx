'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PanaceaAICore } from './PanaceaAICore';
import type { HeroExperienceId } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  experienceId: HeroExperienceId;
  audioActive: boolean;
  audioLevel: number;
};

export function HeroScene({ experienceId, audioActive, audioLevel }: Props) {
  const reduced = usePrefersReducedMotion();
  const transition = reduced
    ? { duration: 0.15 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="en-heroScene">
      <AnimatePresence mode="wait">
        <motion.div
          key={experienceId}
          className="en-heroSceneInner"
          initial={reduced ? { opacity: 1 } : { opacity: 0, x: -18, scale: 0.97, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: 14, scale: 0.98, filter: 'blur(6px)' }}
          transition={transition}
        >
          {experienceId === 'ai' ? <AiScene active={audioActive} level={audioLevel} /> : null}
          {experienceId === 'tours' ? <ToursScene /> : null}
          {experienceId === 'leads' ? <LeadsScene /> : null}
          {experienceId === 'walkins' ? <WalkinsScene /> : null}
          {experienceId === 'forms' ? <FormsScene /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AiScene({ active, level }: { active: boolean; level: number }) {
  return (
    <div className="en-aiScene">
      <PanaceaAICore active={active} level={level} />
    </div>
  );
}

function ToursScene() {
  const dates = [
    { d: 'TUE', n: '27' },
    { d: 'WED', n: '28', active: true },
    { d: 'THU', n: '29' },
    { d: 'FRI', n: '30' },
  ];
  const slots = [
    { t: '10:00 AM', tone: 'warn', label: 'Filling Soon' },
    { t: '11:00 AM', tone: 'warn', label: 'Filling Soon', selected: true },
    { t: '1:30 PM', tone: 'ok', label: 'Available' },
    { t: '3:00 PM', tone: 'ok', label: 'Available' },
    { t: '4:15 PM', tone: 'off', label: 'Not Available' },
  ];

  return (
    <div className="en-scenePad">
      <div className="en-sceneGlow" aria-hidden="true" />
      <motion.div
        className="en-uiCard en-tourBook"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="en-uiHead">
          <strong>Book a Centre Tour</strong>
          <span className="en-uiAvatar" aria-hidden="true">
            SR
          </span>
        </div>
        <div className="en-dateRow">
          {dates.map((date) => (
            <span key={date.n} className={date.active ? 'is-active' : undefined}>
              <small>{date.d}</small>
              <b>{date.n}</b>
            </span>
          ))}
        </div>
        <div className="en-slotGrid">
          {slots.map((slot) => (
            <div
              key={slot.t}
              className={`en-slotChip tone-${slot.tone}${slot.selected ? ' is-selected' : ''}`}
            >
              <strong>{slot.t}</strong>
              <span>{slot.label}</span>
            </div>
          ))}
        </div>
        <div className="en-uiActions">
          <button type="button" className="ui-btn ui-btn-outline">
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary">
            Book Tour
          </button>
        </div>
      </motion.div>
      <div className="en-lifeShot en-lifeShot-a" aria-hidden="true">
        <span>Parent booking on mobile</span>
      </div>
    </div>
  );
}

function LeadsScene() {
  return (
    <div className="en-scenePad">
      <div className="en-sceneGlow pink" aria-hidden="true" />
      <motion.div
        className="en-uiCard en-leadCard"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="en-uiHead">
          <strong>Facebook Lead</strong>
        </div>
        <div className="en-leadBody">
          <div className="en-leadBrand" aria-hidden="true">
            P
          </div>
          <div>
            <strong>Spring Admissions</strong>
            <p>
              <i className="en-liveDot" /> Live Campaign
            </p>
          </div>
        </div>
        <p className="en-uiLabel">Upcoming leads</p>
        <div className="en-leadRows">
          <div>
            <strong>Maya Patel</strong>
            <span>Toddler · Austin</span>
          </div>
          <div>
            <strong>Noah Kim</strong>
            <span>Preschool · Dallas</span>
          </div>
          <div>
            <strong>Emma Brooks</strong>
            <span>Infant · Houston</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function WalkinsScene() {
  return (
    <div className="en-scenePad">
      <div className="en-sceneGlow" aria-hidden="true" />
      <motion.div className="en-uiCard en-walkDash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="en-uiHead">
          <strong>Inquiry Forms</strong>
          <span className="en-uiAvatar" aria-hidden="true">
            AM
          </span>
        </div>
        <div className="en-walkTable">
          <div className="en-walkHead">
            <span>Form Name</span>
            <span>Type</span>
            <span>Actions</span>
          </div>
          <div className="en-walkRow">
            <span className="en-bar" />
            <span className="en-bar" />
            <span className="en-bar" />
          </div>
          <div className="en-walkRow">
            <span className="en-bar" />
            <span className="en-bar" />
            <span className="en-bar" />
          </div>
        </div>
        <div className="en-actionMenu" aria-hidden="true">
          <button type="button">Share Link</button>
          <button type="button" className="is-accent">
            Download Form QR
          </button>
          <button type="button">Embed on Website</button>
        </div>
      </motion.div>
      <motion.div
        className="en-qrCard"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <div className="en-qrTop">
          <span className="en-leadBrand sm" aria-hidden="true">
            P
          </span>
          <strong>The Blossom Tots</strong>
        </div>
        <div className="en-qrBody">
          <div className="en-qrCode" aria-hidden="true" />
          <div>
            <p>Spring Admissions 2026</p>
            <button type="button" className="ui-btn ui-btn-primary">
              Download PNG
            </button>
          </div>
        </div>
      </motion.div>
      <div className="en-lifeShot en-lifeShot-b" aria-hidden="true">
        <span>Staff converting walk-ins</span>
      </div>
    </div>
  );
}

function FormsScene() {
  return (
    <div className="en-scenePad">
      <div className="en-sceneGlow pink" aria-hidden="true" />
      <motion.div
        className="en-badgeFloat top"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        3 new inquiries received via website form today
      </motion.div>
      <motion.div className="en-uiCard en-webForm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="en-uiHead">
          <strong>Website Form</strong>
        </div>
        <label>
          Student Name
          <input className="ui-input" readOnly value="Mia Thompson" />
        </label>
        <label>
          Parent Email
          <input className="ui-input" readOnly value="parent@email.com" />
        </label>
        <label>
          Date of Birth
          <input className="ui-input" readOnly value="03 / 14 / 2023" />
        </label>
        <button type="button" className="ui-btn ui-btn-primary">
          Submit Form
        </button>
        <p className="en-powered">Powered by Panacea</p>
      </motion.div>
      <motion.div
        className="en-badgeFloat side"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        24/7 Online Admissions activated
      </motion.div>
      <div className="en-lifeShot en-lifeShot-c" aria-hidden="true">
        <span>Director reviewing inquiries</span>
      </div>
    </div>
  );
}

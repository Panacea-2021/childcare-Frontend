'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import type { StudentProfile } from '@/lib/students/profileTypes';
import { initialsOf } from '@/lib/students/profileStore';
import { staggerItem } from './animations';

type Props = {
  student: StudentProfile;
};

const STATUS_TONE: Record<string, string> = {
  Active: 'mint',
  Enrolled: 'lavender',
  'On Hold': 'amber',
  Withdrawn: 'coral',
  Prospect: 'sky',
};

export function StudentProfileHeader({ student }: Props) {
  const tone = STATUS_TONE[student.status] ?? 'lavender';

  return (
    <motion.header className="sp-hero" variants={staggerItem}>
      <div className="sp-hero-identity">
        <div className="sp-hero-avatar">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt="" />
          ) : (
            <span>{initialsOf(student.name)}</span>
          )}
        </div>
        <div className="sp-hero-title">
          <div className="sp-hero-name-row">
            <h2>{student.name}</h2>
            <span className={`sp-status-pill ${tone}`}>{student.status}</span>
          </div>
          <p className="sp-hero-id">
            <UserRound size={14} aria-hidden />
            {student.studentId}
          </p>
        </div>
      </div>

      <ul className="sp-hero-facts">
        <li>
          <GraduationCap size={15} aria-hidden />
          <span>
            Program <strong>{student.program}</strong>
          </span>
        </li>
        <li>
          <MapPin size={15} aria-hidden />
          <span>
            Campus <strong>{student.campus}</strong>
          </span>
        </li>
        <li>
          <UserRound size={15} aria-hidden />
          <span>
            Counselor <strong>{student.counselor}</strong>
          </span>
        </li>
        <li>
          <Phone size={15} aria-hidden />
          <span>
            Mobile <strong>{student.mobile}</strong>
          </span>
        </li>
        <li>
          <Mail size={15} aria-hidden />
          <span>
            Email <strong>{student.email}</strong>
          </span>
        </li>
      </ul>
    </motion.header>
  );
}

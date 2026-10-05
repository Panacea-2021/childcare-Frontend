'use client';

import { motion } from 'framer-motion';
import { BookOpen, Layers, MapPin } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import {
  groupNames,
  initials,
  programNames,
  roomName,
} from '@/lib/center-management/studentsStore';
import { AnimatedBadge } from './AnimatedBadge';

type Props = {
  student: Student;
};

export function StudentInfoCard({ student }: Props) {
  const classroom = student.roomIds[0] ? roomName(student.roomIds[0]) : '—';
  const program = programNames(student.programIds);
  const group = groupNames(student.groupIds);

  return (
    <motion.section
      className="slq-info"
      key={student.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Student information"
    >
      <div className="slq-info-top">
        <span className="slq-info-avatar">
          {student.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photoUrl} alt="" />
          ) : (
            initials(student.name)
          )}
        </span>
        <div className="slq-info-copy">
          <AnimatedBadge tone="green" shimmer>
            Kiosk Ready
          </AnimatedBadge>
          <h3>{student.name}</h3>
          <p>Admission · {student.admissionNumber || '—'}</p>
        </div>
      </div>

      <ul className="slq-info-meta">
        <li>
          <MapPin size={14} aria-hidden />
          <div>
            <span>Classroom</span>
            <strong>{classroom}</strong>
          </div>
        </li>
        <li>
          <BookOpen size={14} aria-hidden />
          <div>
            <span>Program</span>
            <strong>{program}</strong>
          </div>
        </li>
        <li>
          <Layers size={14} aria-hidden />
          <div>
            <span>Group</span>
            <strong>{group}</strong>
          </div>
        </li>
      </ul>
    </motion.section>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import { initials } from '@/lib/center-management/studentsStore';

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  student: Student;
  qrUrl: string;
  centerLabel: string;
  index: number;
  total: number;
  dir: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (i: number) => void;
};

export function QRCodePreviewCard({
  student,
  qrUrl,
  centerLabel,
  index,
  total,
  dir,
  onPrev,
  onNext,
  onGo,
}: Props) {
  return (
    <div className="slq-preview">
      <div className="slq-preview-glow" aria-hidden />
      <AnimatePresence mode="wait" custom={dir}>
        <motion.article
          key={student.id}
          className="slq-preview-card"
          custom={dir}
          initial={{ opacity: 0, x: dir * 36, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: dir * -36, scale: 0.96 }}
          transition={{ duration: 0.34, ease }}
          aria-label={`QR preview for ${student.name}`}
        >
          <div className="slq-preview-brand">
            <span className="slq-preview-logo" aria-hidden />
            <strong>{centerLabel}</strong>
          </div>

          <div className="slq-preview-student">
            <span className="slq-preview-avatar">
              {student.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.photoUrl} alt="" />
              ) : (
                initials(student.name)
              )}
            </span>
            <div>
              <strong>{student.name}</strong>
              <span>Admission · {student.admissionNumber || '—'}</span>
            </div>
          </div>

          <motion.div
            className="slq-qr-frame"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                key={qrUrl}
                src={qrUrl}
                alt={`QR for ${student.name}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease }}
              />
            ) : (
              <span className="slq-qr-skeleton" aria-hidden />
            )}
          </motion.div>

          <p className="slq-scan-pulse">
            <span className="slq-scan-dot" aria-hidden />
            Scan to Check In
          </p>
        </motion.article>
      </AnimatePresence>

      {total > 1 ? (
        <div className="slq-carousel" role="navigation" aria-label="QR pagination">
          <button
            type="button"
            className="slq-nav-btn"
            disabled={index <= 0}
            onClick={onPrev}
            aria-label="Previous student QR"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="slq-dots" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`slq-dot${i === index ? ' is-on' : ''}`}
                onClick={() => onGo(i)}
                aria-label={`Show QR ${i + 1} of ${total}`}
              />
            ))}
          </div>
          <span className="slq-page-count">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            className="slq-nav-btn"
            disabled={index >= total - 1}
            onClick={onNext}
            aria-label="Next student QR"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

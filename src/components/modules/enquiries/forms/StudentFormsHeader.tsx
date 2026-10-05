'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ClipboardList, FileStack, Plus, Sparkles } from 'lucide-react';
import { EnquiriesPageHeader } from '../EnquiriesPageHeader';

type Props = {
  onTemplates: () => void;
  onAi: () => void;
  onCreate: () => void;
};

export function StudentFormsHeader({ onTemplates, onAi, onCreate }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <EnquiriesPageHeader
          title="Student Forms"
          description="Create, manage and generate official digital forms for students and parents."
          icon={<ClipboardList size={22} strokeWidth={2.1} />}
          actions={
            <>
              <m.button
                type="button"
                className="sf-ss-btn sf-ss-btn-outline"
                onClick={onTemplates}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="sf-ss-btn-ripple" aria-hidden />
                <FileStack size={16} aria-hidden />
                Templates
              </m.button>
              <m.button
                type="button"
                className="sf-ss-btn sf-ss-btn-outline"
                onClick={onAi}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="sf-ss-btn-ripple" aria-hidden />
                <Sparkles size={16} aria-hidden />
                AI Form Creator
              </m.button>
              <m.button
                type="button"
                className="sf-ss-btn sf-ss-btn-primary"
                onClick={onCreate}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="sf-ss-btn-shine" aria-hidden />
                <span className="sf-ss-btn-ripple" aria-hidden />
                <Plus size={16} aria-hidden />
                Create Form
              </m.button>
            </>
          }
        />
      </MotionConfig>
    </LazyMotion>
  );
}

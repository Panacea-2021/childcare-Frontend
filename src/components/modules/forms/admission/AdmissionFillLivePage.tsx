'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { loadEnquiries } from '@/lib/enquiries/enquiriesStore';
import { getProcessById } from './admissionStore';
import type { AdmissionProcess, AdmissionStudentProgress } from './types';
import './admission.css';

type Props = {
  processId: string;
};

function stepProgressForStudent(
  process: AdmissionProcess,
  student: AdmissionStudentProgress | null,
  stepIndex: number,
) {
  if (!student || !process.steps.length) return stepIndex === 0 ? 'current' : 'upcoming';
  const overall = student.progress / 100;
  const threshold = (stepIndex + 1) / process.steps.length;
  const prevThreshold = stepIndex / process.steps.length;
  if (overall >= threshold) return 'done';
  if (overall >= prevThreshold) return 'current';
  return 'upcoming';
}

export function AdmissionFillLivePage({ processId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get('enquiry');
  const studentId = searchParams.get('student');

  const [process, setProcess] = useState<AdmissionProcess | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setProcess(getProcessById(processId));
    setReady(true);
  }, [processId]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const enquiry = useMemo(() => {
    if (!enquiryId) return null;
    return loadEnquiries().find((e) => e.id === enquiryId) ?? null;
  }, [enquiryId]);

  const student = useMemo(() => {
    if (!process) return null;
    if (studentId) return process.students.find((s) => s.id === studentId) ?? null;
    if (enquiry) {
      return (
        process.students.find(
          (s) => s.name.toLowerCase() === enquiry.studentName.toLowerCase(),
        ) ?? null
      );
    }
    return null;
  }, [process, studentId, enquiry]);

  const childName = student?.name ?? enquiry?.studentName ?? 'Your child';
  const parentName =
    enquiry?.motherName ?? enquiry?.fatherName ?? (student ? `Parent of ${student.name.split(' ')[0]}` : 'Parent');

  const overallProgress = student?.progress ?? 0;

  if (!ready) {
    return (
      <div className="ap-fill-page">
        <p className="ap-fill-loading">Loading admission journey…</p>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="ap-fill-page">
        <div className="ap-fill-missing">
          <Workflow size={28} color="var(--color-accent)" />
          <h1>Admission process not found</h1>
          <p>This link may have expired or the process was removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-fill-page">
      <span className="ap-fill-orb ap-fill-orb-a" aria-hidden />
      <span className="ap-fill-orb ap-fill-orb-b" aria-hidden />

      <motion.header
        className="ap-fill-toolbar"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <button type="button" className="ui-btn ui-btn-outline" onClick={() => router.back()}>
          <ArrowLeft size={15} aria-hidden />
          Back
        </button>
        <div className="ap-fill-toolbar-copy">
          <span className="ap-fill-badge">
            <Sparkles size={12} aria-hidden />
            Parent admission portal
          </span>
        </div>
      </motion.header>

      <motion.div
        className="ap-fill-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <h1>{process.name}</h1>
        <p>
          Welcome, <strong>{parentName}</strong> — complete the steps below for{' '}
          <strong>{childName}</strong>.
        </p>
        <div className="ap-fill-overall">
          <div className="ap-fill-overall-bar" aria-hidden>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span>{overallProgress}% complete</span>
        </div>
      </motion.div>

      <div className="ap-fill-steps">
        {process.steps.length === 0 ? (
          <p className="ap-fill-empty">No steps configured for this process yet.</p>
        ) : (
          process.steps.map((step, index) => {
            const state = stepProgressForStudent(process, student, index);
            return (
              <motion.article
                key={step.id}
                className={`ap-fill-step is-${state}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.06, duration: 0.35 }}
              >
                <div className="ap-fill-step-marker" aria-hidden>
                  {state === 'done' ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <Circle size={22} strokeWidth={state === 'current' ? 2.2 : 1.6} />
                  )}
                </div>
                <div className="ap-fill-step-body">
                  <div className="ap-fill-step-head">
                    <h2>
                      Step {index + 1}: {step.name}
                    </h2>
                    {step.category ? <span className="ap-fill-step-cat">{step.category}</span> : null}
                    {state === 'current' ? <span className="ap-fill-step-now">Current step</span> : null}
                  </div>

                  {step.forms.length === 0 ? (
                    <p className="ap-fill-step-empty">No forms attached to this step yet.</p>
                  ) : (
                    <ul className="ap-fill-form-list">
                      {step.forms.map((form, fi) => (
                        <motion.li
                          key={form.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 + index * 0.06 + fi * 0.04 }}
                        >
                          <Link
                            href={`/forms/fill/${encodeURIComponent(form.formId)}`}
                            className="ap-fill-form-link"
                            onClick={() => setToast(`Opening “${form.formName}”`)}
                          >
                            <FileText size={16} aria-hidden />
                            <span>
                              <strong>{form.formName}</strong>
                              <em>Tap to fill this form</em>
                            </span>
                            <ArrowRight size={16} aria-hidden />
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ap-fill-toast"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Sparkles, TriangleAlert, UserRound } from 'lucide-react';
import type {
  ProfileDocument,
  SharedForm,
  StudentInvoice,
  StudentProfile,
  StudentProfileTab,
} from '@/lib/students/profileTypes';
import {
  addDocumentPlaceholder,
  addFolder,
  loadDocuments,
  loadInvoices,
  loadSharedForms,
  loadStudentProfile,
  removeSharedForm,
  shareForm,
  updateFormStatus,
} from '@/lib/students/profileStore';
import { AboutTab } from './AboutTab';
import { DocumentsTab } from './DocumentsTab';
import { FormsTab } from './FormsTab';
import { InvoicesTab } from './InvoicesTab';
import { ShareFormModal } from './ShareFormModal';
import { StudentProfileHeader } from './StudentProfileHeader';
import { StudentProfileTabs } from './StudentProfileTabs';
import { pageMotion, staggerContainer, tabPanelMotion } from './animations';
import '@/components/ui/module.css';
import './student-profile.css';

type Props = { studentId: string };

function ProfilePageHeader({ onBack }: { onBack: () => void }) {
  return (
    <motion.header
      className="sp-page-header"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sp-page-header-left">
        <div className="sp-page-header-art" aria-hidden>
          <motion.div
            className="sp-page-header-icon"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect x="6" y="8" width="40" height="36" rx="14" fill="url(#spHeadGrad)" />
              <circle cx="26" cy="22" r="7" fill="rgba(255,255,255,0.92)" />
              <path
                d="M14 38c2.8-6.2 7.4-9 12-9s9.2 2.8 12 9"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="spHeadGrad" x1="6" y1="8" x2="46" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5D5FEF" />
                  <stop offset="1" stopColor="#8B8DF5" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.span
            className="sp-page-header-sparkle s1"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Sparkles size={12} />
          </motion.span>
          <motion.span
            className="sp-page-header-sparkle s2"
            animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: 0.4 }}
          />
          <UserRound size={14} className="sp-page-header-badge" aria-hidden />
        </div>
        <div className="sp-page-header-copy">
          <h1>Student Profile</h1>
          <p>Central profile, documents, forms, and invoices</p>
        </div>
      </div>
      <div className="sp-page-header-actions">
        <motion.button
          type="button"
          className="sp-btn-back"
          onClick={onBack}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to Tasks
        </motion.button>
      </div>
    </motion.header>
  );
}

export function StudentProfilePage({ studentId }: Props) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tab, setTab] = useState<StudentProfileTab>('about');
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [forms, setForms] = useState<SharedForm[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = loadStudentProfile(studentId);
    setStudent(profile);
    if (profile) {
      setDocuments(loadDocuments(studentId));
      setForms(loadSharedForms(studentId));
      setInvoices(loadInvoices(studentId));
    }
    setReady(true);
  }, [studentId]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const goBack = useCallback(() => router.push('/tasks'), [router]);

  const openShare = useCallback(() => {
    setSelectedForm('');
    setShareOpen(true);
  }, []);

  const handleUpload = useCallback(() => {
    setDocuments(addDocumentPlaceholder(studentId));
    setTab('documents');
    setToast('Document uploaded');
  }, [studentId]);

  const handleAddFolder = useCallback(() => {
    const name = window.prompt('Folder name', 'New Folder');
    if (name === null) return;
    setDocuments(addFolder(studentId, name));
    setTab('documents');
    setToast('Folder created');
  }, [studentId]);

  const handleShare = useCallback(() => {
    if (!selectedForm) return;
    setForms(shareForm(studentId, selectedForm));
    setShareOpen(false);
    setSelectedForm('');
    setTab('forms');
    setToast(`${selectedForm} shared`);
  }, [selectedForm, studentId]);

  const handleResend = useCallback(
    (form: SharedForm) => {
      setForms(updateFormStatus(studentId, form.id, 'Shared'));
      setToast(`${form.formName} resent`);
    },
    [studentId],
  );

  const handleRemove = useCallback(
    (form: SharedForm) => {
      setForms(removeSharedForm(studentId, form.id));
      setToast(`${form.formName} removed`);
    },
    [studentId],
  );

  if (!ready) {
    return <div className="shell-loading">Loading student profile…</div>;
  }

  if (!student) {
    return (
      <div className="sp-page">
        <ProfilePageHeader onBack={goBack} />
        <div className="sp-empty">
          <div className="sp-empty-art is-warn" aria-hidden>
            <TriangleAlert size={34} />
          </div>
          <h4>Student not found</h4>
          <p>This profile link may be outdated. Return to My Tasks and open a student again.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="sp-page" {...pageMotion}>
      <ProfilePageHeader onBack={goBack} />

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <StudentProfileHeader student={student} />
      </motion.div>

      <StudentProfileTabs active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} {...tabPanelMotion}>
          {tab === 'about' ? <AboutTab student={student} /> : null}
          {tab === 'documents' ? (
            <DocumentsTab
              documents={documents}
              onUpload={handleUpload}
              onAddFolder={handleAddFolder}
            />
          ) : null}
          {tab === 'forms' ? (
            <FormsTab
              forms={forms}
              onShare={openShare}
              onResend={handleResend}
              onRemove={handleRemove}
            />
          ) : null}
          {tab === 'invoices' ? <InvoicesTab invoices={invoices} /> : null}
        </motion.div>
      </AnimatePresence>

      <ShareFormModal
        open={shareOpen}
        selected={selectedForm}
        onChange={setSelectedForm}
        onClose={() => setShareOpen(false)}
        onShare={handleShare}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="sp-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

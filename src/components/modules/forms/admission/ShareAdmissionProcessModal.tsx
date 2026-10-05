'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ClipboardCopy,
  HeartHandshake,
  Link2,
  QrCode,
  Search,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { prospectEnquiries } from '@/lib/enquiries/enquiriesStore';
import { parentContactOf } from '@/components/modules/enquiries/mockData';
import type { EnquiryRecord } from '@/components/modules/enquiries/types';
import {
  copyAdmissionFillLink,
  downloadAdmissionQr,
  getAdmissionFillUrl,
} from './admissionShareUtils';
import { shareAdmissionWithRecipients } from './admissionShareStore';
import type { AdmissionProcess, AdmissionStudentProgress } from './types';
import '../forms.css';
import './admission.css';

type Tab = 'prospects' | 'parents' | 'link';

type Props = {
  open: boolean;
  process: AdmissionProcess | null;
  onClose: () => void;
  onShared: (count: number) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function parentLabelForStudent(student: AdmissionStudentProgress, enquiries: EnquiryRecord[]) {
  const match = enquiries.find(
    (e) => e.studentName.toLowerCase() === student.name.toLowerCase(),
  );
  if (match?.motherName) return match.motherName;
  if (match?.fatherName) return match.fatherName;
  return `Parent of ${student.name.split(' ')[0]}`;
}

function contactForStudent(student: AdmissionStudentProgress, enquiries: EnquiryRecord[]) {
  const match = enquiries.find(
    (e) => e.studentName.toLowerCase() === student.name.toLowerCase(),
  );
  return match ? parentContactOf(match) : '—';
}

export function ShareAdmissionProcessModal({ open, process, onClose, onShared }: Props) {
  const [tab, setTab] = useState<Tab>('prospects');
  const [q, setQ] = useState('');
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const prospects = useMemo(() => (open ? prospectEnquiries() : []), [open]);
  const enquiriesAll = useMemo(() => (open ? prospectEnquiries() : []), [open]);
  const parents = process?.students ?? [];

  useEffect(() => {
    if (!open) return;
    setTab('prospects');
    setQ('');
    setSelectedProspects([]);
    setSelectedParents([]);
    setBusy(false);
    setCopied(false);
  }, [open, process?.id]);

  const filteredProspects = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return prospects;
    return prospects.filter(
      (e) =>
        e.studentName.toLowerCase().includes(query) ||
        e.stage.toLowerCase().includes(query) ||
        (e.motherName?.toLowerCase().includes(query) ?? false) ||
        (e.fatherName?.toLowerCase().includes(query) ?? false),
    );
  }, [prospects, q]);

  const filteredParents = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return parents;
    return parents.filter((s) => {
      const label = parentLabelForStudent(s, enquiriesAll);
      return (
        s.name.toLowerCase().includes(query) ||
        label.toLowerCase().includes(query) ||
        s.room.toLowerCase().includes(query)
      );
    });
  }, [parents, q, enquiriesAll]);

  const toggleProspect = (id: string) => {
    setSelectedProspects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleParent = (id: string) => {
    setSelectedParents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllProspects = () => {
    const ids = filteredProspects.map((e) => e.id);
    const allOn = ids.length > 0 && ids.every((id) => selectedProspects.includes(id));
    if (allOn) {
      setSelectedProspects((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }
    setSelectedProspects((prev) => [...new Set([...prev, ...ids])]);
  };

  const toggleAllParents = () => {
    const ids = filteredParents.map((s) => s.id);
    const allOn = ids.length > 0 && ids.every((id) => selectedParents.includes(id));
    if (allOn) {
      setSelectedParents((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }
    setSelectedParents((prev) => [...new Set([...prev, ...ids])]);
  };

  const handleShare = async () => {
    if (!process || busy) return;
    const recipients =
      tab === 'prospects'
        ? selectedProspects
            .map((id) => prospects.find((e) => e.id === id))
            .filter(Boolean)
            .map((e) => ({
              audience: 'prospect' as const,
              recipientId: e!.id,
              recipientName: e!.studentName,
              parentContact: parentContactOf(e!),
              enquiryId: e!.id,
            }))
        : tab === 'parents'
          ? selectedParents
              .map((id) => parents.find((s) => s.id === id))
              .filter(Boolean)
              .map((s) => ({
                audience: 'parent' as const,
                recipientId: s!.id,
                recipientName: parentLabelForStudent(s!, enquiriesAll),
                parentContact: contactForStudent(s!, enquiriesAll),
                studentId: s!.id,
              }))
          : [];

    if (!recipients.length) return;
    setBusy(true);
    shareAdmissionWithRecipients(process.id, process.name, recipients);
    onShared(recipients.length);
    setBusy(false);
    onClose();
  };

  const publicUrl = process ? getAdmissionFillUrl({ processId: process.id }) : '';

  const handleCopyPublic = async () => {
    if (!process) return;
    await copyAdmissionFillLink({ processId: process.id });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const selectedCount =
    tab === 'prospects'
      ? selectedProspects.length
      : tab === 'parents'
        ? selectedParents.length
        : 0;

  return (
    <Modal
      open={open}
      wide
      title="Share Admission Process"
      subtitle={
        process
          ? `Send “${process.name}” to families so parents can complete each step`
          : undefined
      }
      icon={<Share2 size={18} />}
      iconClose
      onClose={() => {
        if (!busy) onClose();
      }}
      footer={
        tab === 'link' ? (
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary"
              onClick={() => {
                if (!process) return;
                void downloadAdmissionQr(process.name, { processId: process.id });
              }}
            >
              <QrCode size={15} aria-hidden />
              Download QR
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => void handleCopyPublic()}>
              <ClipboardCopy size={15} aria-hidden />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!selectedCount || busy || !process}
              onClick={() => void handleShare()}
            >
              Share with {selectedCount || 0} famil{selectedCount === 1 ? 'y' : 'ies'}
            </button>
          </>
        )
      }
    >
      <div className="ap-share-modal">
        <div className="ap-share-hero">
          <Sparkles size={16} aria-hidden />
          <p>
            Parents receive a secure link to complete forms step-by-step — tour booking, application,
            health info, and more.
          </p>
        </div>

        <div className="ap-share-tabs" role="tablist" aria-label="Share audience">
          {(
            [
              { id: 'prospects' as Tab, label: 'Prospects', icon: HeartHandshake },
              { id: 'parents' as Tab, label: 'Parents in pipeline', icon: Users },
              { id: 'link' as Tab, label: 'Link & QR', icon: Link2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'is-active' : undefined}
              onClick={() => {
                setTab(id);
                setQ('');
              }}
            >
              <Icon size={15} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'link' ? (
            <motion.div
              key="link"
              className="ap-share-link-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              <label className="ui-label">Public parent fill link</label>
              <div className="ap-share-link-row">
                <input className="ui-input" readOnly value={publicUrl} aria-label="Admission fill link" />
                <button type="button" className="ui-btn ui-btn-outline" onClick={() => void handleCopyPublic()}>
                  <ClipboardCopy size={15} aria-hidden />
                  Copy
                </button>
              </div>
              <p className="ap-share-link-hint">
                Share via email, WhatsApp, or SMS. Families open this link to view steps and fill forms.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              className="ap-share-picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              <div className="ap-share-toolbar">
                <label className="forms-search ap-share-search">
                  <span aria-hidden>
                    <Search size={16} />
                  </span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                      tab === 'prospects'
                        ? 'Search child or parent name…'
                        : 'Search student or parent…'
                    }
                    aria-label="Search recipients"
                  />
                </label>
                <button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  onClick={tab === 'prospects' ? toggleAllProspects : toggleAllParents}
                >
                  Select visible
                </button>
              </div>

              <p className="forms-share-meta">
                {selectedCount} selected ·{' '}
                {tab === 'prospects' ? filteredProspects.length : filteredParents.length} shown
              </p>

              <div className="forms-share-list ap-share-list" role="listbox" aria-multiselectable="true">
                {tab === 'prospects'
                  ? filteredProspects.map((e, i) => {
                      const checked = selectedProspects.includes(e.id);
                      return (
                        <motion.button
                          key={e.id}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          className={`forms-share-row ap-share-row${checked ? ' is-selected' : ''}`}
                          onClick={() => toggleProspect(e.id)}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.25 }}
                        >
                          <span className={`forms-share-check${checked ? ' is-on' : ''}`} aria-hidden>
                            {checked ? <Check size={14} strokeWidth={2.5} /> : null}
                          </span>
                          <span className="forms-share-avatar ap-share-avatar-prospect" aria-hidden>
                            {initials(e.studentName)}
                          </span>
                          <span className="forms-share-copy">
                            <strong>{e.studentName}</strong>
                            <span>
                              {e.stage} · {parentContactOf(e)}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })
                  : filteredParents.map((s, i) => {
                      const checked = selectedParents.includes(s.id);
                      const parentName = parentLabelForStudent(s, enquiriesAll);
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          className={`forms-share-row ap-share-row${checked ? ' is-selected' : ''}`}
                          onClick={() => toggleParent(s.id)}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.25 }}
                        >
                          <span className={`forms-share-check${checked ? ' is-on' : ''}`} aria-hidden>
                            {checked ? <Check size={14} strokeWidth={2.5} /> : null}
                          </span>
                          <span className="forms-share-avatar" aria-hidden>
                            {initials(s.name)}
                          </span>
                          <span className="forms-share-copy">
                            <strong>{s.name}</strong>
                            <span>
                              {parentName} · {s.progress}% complete · {s.room}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}

                {tab === 'prospects' && !filteredProspects.length ? (
                  <div className="forms-share-empty">No prospects match your search.</div>
                ) : null}
                {tab === 'parents' && !filteredParents.length ? (
                  <div className="forms-share-empty">No students in this admission pipeline yet.</div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

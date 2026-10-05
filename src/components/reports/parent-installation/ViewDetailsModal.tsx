'use client';

import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { GraduationCap, Smartphone, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { InstallationRecord } from './types';
import { InstallationStatusBadge, InvitationStatusBadge } from './StatusBadges';

type Props = {
  open: boolean;
  record: InstallationRecord | null;
  onClose: () => void;
  onEditEmail: () => void;
  onResendInvite: () => void;
};

export function ViewDetailsModal({ open, record, onClose, onEditEmail, onResendInvite }: Props) {
  const reduce = useReducedMotion();
  const show = open && !!record;

  return (
    <Modal
      open={show}
      title="Parent Installation Details"
      subtitle={record ? `${record.studentName} · ${record.admissionNumber}` : undefined}
      icon={<Smartphone size={18} />}
      wide
      onClose={onClose}
      footer={
        <>
          <m.button
            type="button"
            className="ui-btn ui-btn-outline transition-all duration-200"
            onClick={onClose}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Close
          </m.button>
          <m.button
            type="button"
            className="ui-btn ui-btn-secondary transition-all duration-200"
            onClick={onEditEmail}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Edit Parent Email
          </m.button>
          <m.button
            type="button"
            className="ui-btn ui-btn-primary transition-all duration-200"
            onClick={onResendInvite}
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Resend Invite
          </m.button>
        </>
      }
    >
      <AnimatePresence mode="wait">
        {record ? (
          <m.div
            key={record.id}
            className="pai-view"
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Section title="Student Information" icon={<GraduationCap size={15} />} delay={0.04}>
              <div className="ui-grid-2">
                <ReadField label="Student Name" value={record.studentName} />
                <ReadField label="Admission Number" value={record.admissionNumber} />
                <ReadField label="Campus" value={record.campus} />
                <ReadField label="Program" value={record.program} />
                <ReadField label="Student Status" value={record.studentStatus} />
              </div>
            </Section>

            <Section title="Parent Information" icon={<Users size={15} />} delay={0.08}>
              <div className="ui-grid-2">
                <ReadField label="Mother Name" value={record.mother.name} />
                <ReadField label="Mother Email" value={record.mother.email || '—'} />
                <ReadField label="Father Name" value={record.father.name} />
                <ReadField label="Father Email" value={record.father.email || '—'} />
              </div>
            </Section>

            <Section title="Installation Details" icon={<Smartphone size={15} />} delay={0.12}>
              <div className="pai-view-status-row">
                <div>
                  <span className="pai-view-label">Invitation Status</span>
                  <InvitationStatusBadge status={record.invitationStatus} />
                </div>
                <div>
                  <span className="pai-view-label">Parent Installation Status</span>
                  <InstallationStatusBadge status={record.installationStatus} />
                </div>
              </div>
              <div className="ui-grid-2" style={{ marginTop: 12 }}>
                <ReadField
                  label="Installed On"
                  value={
                    record.installedOn
                      ? `${record.installedOn}${record.installedTime ? ` · ${record.installedTime}` : ''}`
                      : '—'
                  }
                />
                <ReadField
                  label="Last Invite Sent"
                  value={
                    record.lastInviteSent
                      ? `${record.lastInviteSent}${record.lastInviteTime ? ` · ${record.lastInviteTime}` : ''}`
                      : '—'
                  }
                />
              </div>
            </Section>
          </m.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}

function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <m.section
      className="pai-view-section"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
    >
      <header className="pai-view-section-head">
        <span className="pai-view-section-ico" aria-hidden>
          {icon}
        </span>
        <h3>{title}</h3>
      </header>
      <div className="pai-view-section-body">{children}</div>
    </m.section>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="pai-field-read">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

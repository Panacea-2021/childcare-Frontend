'use client';

import { motion } from 'framer-motion';
import { Briefcase, Mail, Smartphone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { StaffInstallationRecord } from './types';
import { InstallationStatusBadge, InvitationStatusBadge } from './StatusBadges';

type Props = {
  open: boolean;
  record: StaffInstallationRecord | null;
  onClose: () => void;
  onEditEmail: () => void;
  onResendInvite: () => void;
};

export function ViewDetailsModal({ open, record, onClose, onEditEmail, onResendInvite }: Props) {
  return (
    <Modal
      open={open && !!record}
      title="Staff Installation Details"
      subtitle={record ? `${record.staffName} · ${record.employeeId}` : undefined}
      icon={<Smartphone size={18} />}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onEditEmail}>
            Edit Staff Email
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onResendInvite}>
            Resend Invite
          </button>
        </>
      }
    >
      {record ? (
        <motion.div
          className="pai-view"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <Section title="Staff Information" icon={<Briefcase size={15} />} delay={0.04}>
            <div className="ui-grid-2">
              <ReadField label="Staff Name" value={record.staffName} />
              <ReadField label="Employee ID" value={record.employeeId} />
              <ReadField label="Campus" value={record.campus} />
              <ReadField label="Department" value={record.department} />
              <ReadField label="Designation" value={record.designation} />
              <ReadField label="Staff Status" value={record.staffStatus} />
            </div>
          </Section>

          <Section title="Contact Information" icon={<Mail size={15} />} delay={0.08}>
            <div className="ui-grid-2">
              <ReadField label="Email Address" value={record.email || '—'} />
              <ReadField label="Phone Number" value={record.phone || '—'} />
            </div>
          </Section>

          <Section title="Installation Details" icon={<Smartphone size={15} />} delay={0.12}>
            <div className="pai-view-status-row">
              <div>
                <span className="pai-view-label">Invitation Status</span>
                <InvitationStatusBadge status={record.invitationStatus} />
              </div>
              <div>
                <span className="pai-view-label">Staff Installation Status</span>
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
        </motion.div>
      ) : null}
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
  return (
    <motion.section
      className="pai-view-section"
      initial={{ opacity: 0, y: 10 }}
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
    </motion.section>
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

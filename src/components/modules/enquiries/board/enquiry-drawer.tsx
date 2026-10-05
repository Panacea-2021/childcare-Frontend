'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Baby,
  ClipboardList,
  Contact,
  UserRound,
  SlidersHorizontal,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import type { EnquiryRecord } from '../types';
import { initialsOf } from '../mockData';
import { drawerSectionMotion, staggerContainer } from '../animations';
import { StageSelector } from './stage-selector';

type Props = {
  open: boolean;
  enquiry: EnquiryRecord | null;
  stages: EnquiryStageConfig[];
  stageColor?: string;
  onClose: () => void;
  onRequestStageChange: (toStage: string) => void;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="enq-detail-row">
      <span className="enq-detail-label">{label}</span>
      <span className="enq-detail-value">{value?.trim() ? value : '—'}</span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section className="enq-drawer-section" variants={drawerSectionMotion}>
      <header className="enq-drawer-section-head">
        <span className="enq-drawer-section-icon" aria-hidden>
          {icon}
        </span>
        <h3>{title}</h3>
      </header>
      <div className="enq-drawer-section-body">{children}</div>
    </motion.section>
  );
}

export const EnquiryDrawer = memo(function EnquiryDrawer({
  open,
  enquiry,
  stages,
  stageColor,
  onClose,
  onRequestStageChange,
}: Props) {
  const activities = useMemo(() => {
    if (!enquiry?.activities?.length) return [];
    return [...enquiry.activities].sort((a, b) => b.at.localeCompare(a.at));
  }, [enquiry]);

  const customEntries = useMemo(() => {
    if (!enquiry?.customValues) return [];
    return Object.entries(enquiry.customValues);
  }, [enquiry]);

  return (
    <Drawer
      open={open}
      title={enquiry ? enquiry.studentName : 'Enquiry details'}
      subtitle={enquiry?.preferredName ? `Preferred: ${enquiry.preferredName}` : 'Read-only enquiry profile'}
      onClose={onClose}
      wide
      plainHeader
      meta={enquiry?.stage}
    >
      {enquiry ? (
        <motion.div
          className="enq-drawer"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <div className="enq-drawer-hero">
            <span className="enq-drawer-avatar" aria-hidden>
              {initialsOf(enquiry.studentName)}
            </span>
            <div>
              <h2 className="enq-drawer-name">{enquiry.studentName}</h2>
              <span
                className="enq-badge"
                style={
                  stageColor
                    ? {
                        background: `color-mix(in srgb, ${stageColor} 16%, #fff)`,
                        color: stageColor,
                        borderColor: `color-mix(in srgb, ${stageColor} 30%, transparent)`,
                      }
                    : undefined
                }
              >
                {enquiry.stage}
              </span>
            </div>
          </div>

          <StageSelector
            stages={stages}
            value={enquiry.stage}
            onChange={onRequestStageChange}
          />

          <Section icon={<Baby size={16} />} title="Child Information">
            <DetailRow label="Student name" value={enquiry.studentName} />
            <DetailRow label="Preferred name" value={enquiry.preferredName} />
            <DetailRow label="Gender" value={enquiry.gender} />
            <DetailRow label="Date of birth" value={enquiry.dateOfBirth} />
            <DetailRow label="School" value={enquiry.school} />
            <DetailRow label="Address" value={enquiry.address} />
            <DetailRow label="Emergency contact" value={enquiry.emergencyContactName} />
            <DetailRow label="Emergency number" value={enquiry.emergencyContactNumber} />
          </Section>

          <Section icon={<ClipboardList size={16} />} title="Enquiry Information">
            <DetailRow label="Stage" value={enquiry.stage} />
            <DetailRow label="Lost reason" value={enquiry.lostReason} />
            <DetailRow label="Source" value={enquiry.source} />
            <DetailRow label="Sub source" value={enquiry.subSource} />
            <DetailRow label="Program" value={enquiry.program} />
            <DetailRow label="Assigned to" value={enquiry.assignedTo} />
            <DetailRow label="Expected start" value={enquiry.expectedStartDate} />
            <DetailRow label="Created on" value={enquiry.createdOn} />
            <DetailRow label="Notes" value={enquiry.interest} />
          </Section>

          <Section icon={<Contact size={16} />} title="Mother Information">
            <DetailRow label="Name" value={enquiry.motherName} />
            <DetailRow label="Phone" value={enquiry.motherPhone} />
            <DetailRow label="Email" value={enquiry.motherEmail} />
            <DetailRow label="Company" value={enquiry.motherCompany} />
          </Section>

          <Section icon={<UserRound size={16} />} title="Father Information">
            <DetailRow label="Name" value={enquiry.fatherName} />
            <DetailRow label="Phone" value={enquiry.fatherPhone} />
            <DetailRow label="Email" value={enquiry.fatherEmail} />
            <DetailRow label="Company" value={enquiry.fatherCompany} />
          </Section>

          <Section icon={<SlidersHorizontal size={16} />} title="Custom Fields">
            {customEntries.length ? (
              customEntries.map(([key, value]) => (
                <DetailRow
                  key={key}
                  label={key}
                  value={typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                />
              ))
            ) : (
              <p className="enq-drawer-empty">No custom fields recorded.</p>
            )}
          </Section>

          <Section icon={<Activity size={16} />} title="Activity Timeline">
            {activities.length ? (
              <ol className="enq-timeline">
                {activities.map((a) => (
                  <li key={a.id} className="enq-timeline-item">
                    <span className="enq-timeline-dot" aria-hidden />
                    <div>
                      <strong>{a.title}</strong>
                      {a.description ? <p>{a.description}</p> : null}
                      <time dateTime={a.at}>
                        {new Date(a.at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="enq-drawer-empty">No activity yet.</p>
            )}
          </Section>
        </motion.div>
      ) : null}
    </Drawer>
  );
});

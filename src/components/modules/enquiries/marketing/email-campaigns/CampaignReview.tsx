'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { EmailCampaign } from './types';
import { formatCampaignDate } from './mockData';

type Props = {
  open: boolean;
  campaign: EmailCampaign;
  checks: Record<string, boolean>;
  onClose: () => void;
  onBack: () => void;
  onSendTest: () => void;
  onConfirm: () => void;
};

export function CampaignReview({
  open,
  campaign,
  checks,
  onClose,
  onBack,
  onSendTest,
  onConfirm,
}: Props) {
  const scheduleLabel =
    campaign.scheduleMode === 'later'
      ? `${formatCampaignDate(campaign.scheduledAt)} · ${campaign.timezone}`
      : 'Send now';

  const rows = [
    { label: 'Campaign Name', value: campaign.name || '—' },
    { label: 'Audience', value: campaign.audienceLabel },
    { label: 'Recipients', value: String(campaign.recipientCount) },
    { label: 'From', value: `${campaign.fromName} <${campaign.fromEmail}>` },
    { label: 'Reply-To', value: campaign.replyTo || '—' },
    { label: 'Subject', value: campaign.subject || '—' },
    { label: 'Preview Text', value: campaign.previewText || '—' },
    {
      label: 'Attachments',
      value:
        campaign.attachments.length > 0
          ? campaign.attachments.map((a) => a.name).join(', ')
          : 'None',
    },
    { label: 'Scheduled Time', value: scheduleLabel },
  ];

  const checklist = [
    { key: 'audience', label: 'Audience selected' },
    { key: 'subject', label: 'Subject added' },
    { key: 'content', label: 'Email content added' },
    { key: 'sender', label: 'Sender configured' },
    { key: 'replyTo', label: 'Reply-to configured' },
    { key: 'preview', label: 'Mobile preview checked' },
  ] as const;

  return (
    <Modal
      open={open}
      title="Review Campaign"
      lg
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onBack}>
            Back to Edit
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onSendTest}>
            Send Test
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onConfirm}>
            {campaign.scheduleMode === 'later' ? 'Schedule Campaign' : 'Send Campaign'}
          </button>
        </>
      }
    >
      <div className="ec-review-grid">
        {rows.map((r) => (
          <div key={r.label} className="ec-review-item">
            <label>{r.label}</label>
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>
      <ul className="ec-checklist">
        {checklist.map((c) => {
          const ok = checks[c.key];
          return (
            <li key={c.key}>
              {ok ? (
                <CheckCircle2 size={16} className="ec-check-ok" />
              ) : (
                <Circle size={16} className="ec-check-miss" />
              )}
              {c.label}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

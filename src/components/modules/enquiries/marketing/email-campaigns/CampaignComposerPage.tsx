'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Monitor,
  PenLine,
  Save,
  Send,
  Smartphone,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import '@/components/ui/module.css';
import './email-campaigns.css';
import { AudienceSelector } from './AudienceSelector';
import { AttachmentUploader } from './AttachmentUploader';
import { CampaignReview } from './CampaignReview';
import { EmailDesigner } from './EmailDesigner';
import { SendTestModal } from './SendTestModal';
import { ViewRecipientsModal } from './ViewRecipientsModal';
import {
  audienceLabel,
  createEmptyCampaign,
  defaultBlocks,
  estimateRecipients,
} from './mockData';
import { SENDER_OPTIONS, STATUS_BADGE_CLASS, type EmailCampaign } from './types';
import {
  createCampaignId,
  getCampaign,
  getEmailTemplate,
  upsertCampaign,
} from '@/lib/enquiries/emailCampaignsStore';

type Props = {
  campaignId?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.06, duration: 0.4, ease },
  }),
};

function ComposerHeroArt() {
  const reduce = useReducedMotion();
  return (
    <div className="ec-hero-art" aria-hidden>
      <motion.div
        className="ec-hero-mark"
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="ec-hero-mark-inner ec-hero-mark-composer">
          <PenLine size={24} strokeWidth={2.2} />
        </span>
      </motion.div>
      <motion.span
        className="ec-hero-sparkle s1"
        animate={
          reduce ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.85, 1.1, 0.85] }
        }
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        <Sparkles size={12} />
      </motion.span>
      <motion.span
        className="ec-hero-sparkle s2"
        animate={reduce ? undefined : { opacity: [0.2, 0.9, 0.2], y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, delay: 0.4 }}
      />
      <motion.span
        className="ec-hero-sparkle s3"
        animate={reduce ? undefined : { opacity: [0.15, 0.8, 0.15], y: [0, -5, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, delay: 0.8 }}
      />
      <motion.span
        className="ec-hero-butterfly"
        animate={
          reduce
            ? undefined
            : { x: [0, 8, 0], y: [0, -6, 0], rotate: [0, 12, -8, 0] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✦
      </motion.span>
    </div>
  );
}

export function CampaignComposerPage({ campaignId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [campaign, setCampaign] = useState<EmailCampaign>(() =>
    createEmptyCampaign({ id: createCampaignId() }),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobilePreviewChecked, setMobilePreviewChecked] = useState(false);
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(!campaignId && !templateId);

  const goBack = () => router.push('/enquiries/marketing/email-campaigns');

  const patch = useCallback((partial: Partial<EmailCampaign>) => {
    setCampaign((prev) => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
  }, []);

  useEffect(() => {
    let base = createEmptyCampaign({ id: createCampaignId() });

    if (campaignId) {
      const existing = getCampaign(campaignId);
      if (existing) {
        if (existing.status === 'Sent') {
          router.replace(`/enquiries/marketing/email-campaigns/${campaignId}`);
          return;
        }
        base = existing;
      }
    }

    const tplKey = templateId;
    if (tplKey) {
      const tpl = getEmailTemplate(tplKey);
      if (tpl) {
        base = {
          ...base,
          subject: tpl.subject,
          previewText: tpl.previewText,
          blocks: structuredClone(tpl.blocks),
          templateId: tpl.id,
          name: base.name || tpl.name,
        };
      }
    }

    setCampaign(base);
    setReady(true);
  }, [campaignId, templateId, router]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const count = estimateRecipients(campaign.audience);
    const label = audienceLabel(campaign.audience);
    if (count !== campaign.recipientCount || label !== campaign.audienceLabel) {
      patch({ recipientCount: count, audienceLabel: label });
    }
  }, [campaign.audience, campaign.recipientCount, campaign.audienceLabel, patch]);

  const checks = useMemo(
    () => ({
      audience: !!campaign.audience.audienceType,
      subject: !!campaign.subject.trim(),
      content: campaign.blocks.some(
        (b) =>
          ['heading', 'paragraph', 'button', 'image', 'html'].includes(b.type) &&
          b.content.trim().length > 0,
      ),
      sender: !!campaign.fromEmail && !!campaign.fromName,
      replyTo: !!campaign.replyTo.trim(),
      preview: mobilePreviewChecked,
    }),
    [campaign, mobilePreviewChecked],
  );

  const saveDraft = () => {
    const next: EmailCampaign = {
      ...campaign,
      status: campaign.status === 'Scheduled' ? campaign.status : 'Draft',
      name: campaign.name.trim() || 'Untitled Campaign',
      updatedAt: new Date().toISOString(),
    };
    setCampaign(next);
    upsertCampaign(next);
    setToast('Draft saved');
    if (!campaignId) {
      router.replace(`/enquiries/marketing/email-campaigns/${next.id}/edit`);
    }
  };

  const confirmSend = () => {
    const now = new Date().toISOString();
    const next: EmailCampaign = {
      ...campaign,
      name: campaign.name.trim() || 'Untitled Campaign',
      status: campaign.scheduleMode === 'later' ? 'Scheduled' : 'Sent',
      scheduledAt:
        campaign.scheduleMode === 'later' ? campaign.scheduledAt || now : undefined,
      sentAt: campaign.scheduleMode === 'now' ? now : undefined,
      openRate: campaign.scheduleMode === 'now' ? 0 : undefined,
      clickRate: campaign.scheduleMode === 'now' ? 0 : undefined,
      updatedAt: now,
      analytics:
        campaign.scheduleMode === 'now'
          ? {
              delivered: campaign.recipientCount,
              opened: 0,
              clicked: 0,
              bounced: 0,
              unsubscribed: 0,
              conversions: 0,
            }
          : undefined,
    };
    upsertCampaign(next);
    setReviewOpen(false);
    setToast(campaign.scheduleMode === 'later' ? 'Campaign scheduled' : 'Campaign sent');
    window.setTimeout(() => {
      router.push('/enquiries/marketing/email-campaigns');
    }, 600);
  };

  if (!ready) {
    return <div className="shell-loading">Loading…</div>;
  }

  const isEdit = !!campaignId;
  let cardIndex = 0;

  return (
    <div className="mod-page ec-composer">
      <div className="ec-ambient" aria-hidden>
        <span className="ec-blob b1" />
        <span className="ec-blob b2" />
        <span className="ec-blob b3" />
        <span className="ec-mesh" />
      </div>

      <div className="ec-composer-inner">
        <motion.button
          type="button"
          className="ec-back-link"
          onClick={goBack}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to Email Campaigns
        </motion.button>

        <motion.header
          className="ec-composer-top"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="ec-composer-header-left">
            <ComposerHeroArt />
            <div className="ec-composer-header-copy">
              <p className="ec-page-crumbs">
                Marketing / Email Campaigns /{' '}
                <strong>{isEdit ? 'Edit Campaign' : 'Create Campaign'}</strong>
              </p>
              <div className="ec-composer-title-row">
                <h1>{isEdit ? 'Edit Email Campaign' : 'Create Email Campaign'}</h1>
                <motion.span
                  className={STATUS_BADGE_CLASS[campaign.status]}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                >
                  {campaign.status}
                </motion.span>
              </div>
              <p>
                Design a beautiful email for parents and your school community — then
                preview, test, and send.
              </p>
            </div>
          </div>

          <div className="ec-composer-actions">
            <motion.button
              type="button"
              className="ec-btn-outline"
              onClick={saveDraft}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="ec-btn-outline-glow" aria-hidden />
              <Save size={16} aria-hidden />
              Save Draft
            </motion.button>
            <motion.button
              type="button"
              className="ec-btn-outline"
              onClick={() => {
                setDevice('desktop');
                setToast('Preview updated');
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="ec-btn-outline-glow" aria-hidden />
              <Eye size={16} aria-hidden />
              Preview
            </motion.button>
            <motion.button
              type="button"
              className="ec-btn-outline"
              onClick={() => setTestOpen(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="ec-btn-outline-glow" aria-hidden />
              <FlaskConical size={16} aria-hidden />
              Send Test
            </motion.button>
            <motion.button
              type="button"
              className="ec-btn-primary"
              onClick={() => setReviewOpen(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="ec-btn-shine" aria-hidden />
              <Send size={16} aria-hidden />
              Schedule / Send
            </motion.button>
          </div>
        </motion.header>

        <div className="ec-composer-grid">
          <div className="ec-composer-main">
            <motion.div
              className="ec-card"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <div className="ec-card-head">
                <span className="ec-card-accent" aria-hidden />
                <h3>Campaign details</h3>
              </div>
              <div className="ui-grid-2">
                <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="ui-label">Campaign Name</label>
                  <input
                    className="ui-input"
                    placeholder="Enter campaign name"
                    value={campaign.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">From</label>
                  <select
                    className="ui-select"
                    value={campaign.fromName}
                    onChange={(e) => {
                      const sender = SENDER_OPTIONS.find((s) => s.name === e.target.value);
                      if (sender) patch({ fromName: sender.name, fromEmail: sender.email });
                    }}
                  >
                    {SENDER_OPTIONS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ui-field">
                  <label className="ui-label">Sender Email</label>
                  <input className="ui-input" value={campaign.fromEmail} readOnly />
                </div>
                <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="ui-label">Reply-To</label>
                  <input
                    className="ui-input"
                    type="email"
                    placeholder="Enter reply-to email"
                    value={campaign.replyTo}
                    onChange={(e) => patch({ replyTo: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="ec-card"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
            >
              <div className="ec-card-head">
                <span className="ec-card-accent mint" aria-hidden />
                <h3>Recipients</h3>
              </div>
              <AudienceSelector
                value={campaign.audience}
                onChange={(audience) => patch({ audience })}
                onViewRecipients={() => setRecipientsOpen(true)}
              />
            </motion.div>

            <motion.div
              className="ec-card"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
            >
              <div className="ec-card-head">
                <span className="ec-card-accent peach" aria-hidden />
                <h3>Subject</h3>
              </div>
              <div className="ui-field">
                <label className="ui-label">Subject</label>
                <input
                  className="ui-input"
                  placeholder="Enter email subject"
                  value={campaign.subject}
                  onChange={(e) => patch({ subject: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Preview Text</label>
                <input
                  className="ui-input"
                  placeholder="Add a short preview that appears beside the subject in the inbox."
                  value={campaign.previewText}
                  onChange={(e) => patch({ previewText: e.target.value })}
                />
              </div>
              <motion.div
                className="ec-inbox-preview"
                key={`${campaign.subject}-${campaign.previewText}`}
                initial={{ opacity: 0.6, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="from">From: {campaign.fromName}</div>
                <div className="subject">
                  {campaign.subject || 'Your subject will appear here'}
                </div>
                <div className="preview">
                  {campaign.previewText ||
                    'Preview text appears beside the subject in the inbox.'}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="ec-card"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
            >
              <div className="ec-card-head">
                <span className="ec-card-accent coral" aria-hidden />
                <h3>Email Template</h3>
              </div>
              <div className="ec-template-choice">
                <motion.button
                  type="button"
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    const next = {
                      ...campaign,
                      name: campaign.name.trim() || 'Untitled Campaign',
                      status: (campaign.status === 'Scheduled'
                        ? campaign.status
                        : 'Draft') as EmailCampaign['status'],
                      updatedAt: new Date().toISOString(),
                    };
                    setCampaign(next);
                    upsertCampaign(next);
                    router.push(
                      `/enquiries/marketing/email-campaigns/templates?selectFor=${next.id}`,
                    );
                  }}
                >
                  <strong>Choose Template</strong>
                  <span>Browse the template library</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    patch({ blocks: defaultBlocks('blank'), templateId: undefined });
                    setToast('Started from scratch');
                  }}
                >
                  <strong>Start from Scratch</strong>
                  <span>Build a fresh email canvas</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="ec-card ec-card-flush"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div
                className="ec-card-head"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '1rem 1.15rem 0.5rem',
                  marginBottom: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span className="ec-card-accent" aria-hidden />
                  <h3 style={{ margin: 0 }}>Email design</h3>
                </div>
                <div className="ec-preview-toggle">
                  <button
                    type="button"
                    className={device === 'desktop' ? 'is-active' : ''}
                    onClick={() => setDevice('desktop')}
                  >
                    <Monitor size={14} />
                    Desktop
                  </button>
                  <button
                    type="button"
                    className={device === 'mobile' ? 'is-active' : ''}
                    onClick={() => {
                      setDevice('mobile');
                      setMobilePreviewChecked(true);
                    }}
                  >
                    <Smartphone size={14} />
                    Mobile
                  </button>
                </div>
              </div>
              <EmailDesigner
                blocks={campaign.blocks}
                selectedId={selectedBlockId}
                device={device}
                onSelect={setSelectedBlockId}
                onChange={(blocks) => patch({ blocks })}
              />
            </motion.div>

            <motion.div
              className="ec-card"
              custom={cardIndex++}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2 }}
            >
              <div className="ec-card-head">
                <span className="ec-card-accent peach" aria-hidden />
                <h3>Attachments</h3>
              </div>
              <AttachmentUploader
                attachments={campaign.attachments}
                onChange={(attachments) => patch({ attachments })}
              />
            </motion.div>
          </div>

          <motion.aside
            className="ec-composer-side"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease }}
          >
            <div className="ec-card ec-settings-card">
              <div className="ec-card-head">
                <span className="ec-card-accent" aria-hidden />
                <h3>Campaign Settings</h3>
              </div>
              <div className="ec-side-section">
                <h4>Sender</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {campaign.fromName}
                  <br />
                  <span className="ec-muted">{campaign.fromEmail}</span>
                </p>
              </div>
              <div className="ec-side-section">
                <h4>Reply-To</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{campaign.replyTo || '—'}</p>
              </div>
              <div className="ec-side-section">
                <h4>Audience</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {campaign.audienceLabel}
                  <br />
                  <span className="ec-muted">
                    {campaign.recipientCount.toLocaleString()} recipients
                  </span>
                </p>
              </div>
              <div className="ec-side-section">
                <h4>Subject</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{campaign.subject || '—'}</p>
              </div>
              <div className="ec-side-section">
                <h4>Preview Text</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {campaign.previewText || '—'}
                </p>
              </div>
              <div className="ec-side-section">
                <h4>Attachments</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {campaign.attachments.length
                    ? `${campaign.attachments.length} file(s)`
                    : 'None'}
                </p>
              </div>
              <div className="ec-side-section">
                <h4>Schedule</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label
                    className="ui-label"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <input
                      type="radio"
                      className="ui-radio"
                      name="ec-schedule"
                      checked={campaign.scheduleMode === 'now'}
                      onChange={() => patch({ scheduleMode: 'now' })}
                    />
                    Send Now
                  </label>
                  <label
                    className="ui-label"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <input
                      type="radio"
                      className="ui-radio"
                      name="ec-schedule"
                      checked={campaign.scheduleMode === 'later'}
                      onChange={() => patch({ scheduleMode: 'later' })}
                    />
                    Schedule for later
                  </label>
                </div>
                <AnimatePresence>
                  {campaign.scheduleMode === 'later' ? (
                    <motion.div
                      className="ui-grid-2"
                      style={{ marginTop: '0.5rem' }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="ui-field">
                        <label className="ui-label">Date</label>
                        <input
                          className="ui-input"
                          type="date"
                          value={(campaign.scheduledAt || '2026-08-12').slice(0, 10)}
                          onChange={(e) => {
                            const time = (campaign.scheduledAt || 'T04:30:00.000Z').slice(10);
                            patch({
                              scheduledAt: `${e.target.value}${time || 'T04:30:00.000Z'}`,
                            });
                          }}
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label">Time</label>
                        <input className="ui-input" type="time" defaultValue="10:00" />
                      </div>
                      <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                        <label className="ui-label">Timezone</label>
                        <select
                          className="ui-select"
                          value={campaign.timezone}
                          onChange={(e) => patch({ timezone: e.target.value })}
                        >
                          <option value="IST">IST</option>
                          <option value="GMT">GMT</option>
                          <option value="EST">EST</option>
                        </select>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <motion.button
                type="button"
                className="ec-btn-primary"
                style={{ width: '100%' }}
                onClick={() => setReviewOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="ec-btn-shine" aria-hidden />
                Review &amp; Send
              </motion.button>
            </div>
          </motion.aside>
        </div>
      </div>

      <ViewRecipientsModal
        open={recipientsOpen}
        count={campaign.recipientCount}
        onClose={() => setRecipientsOpen(false)}
      />
      <SendTestModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        onSend={(email) => setToast(`Test email queued for ${email}`)}
      />
      <CampaignReview
        open={reviewOpen}
        campaign={campaign}
        checks={checks}
        onClose={() => setReviewOpen(false)}
        onBack={() => setReviewOpen(false)}
        onSendTest={() => {
          setReviewOpen(false);
          setTestOpen(true);
        }}
        onConfirm={confirmSend}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ec-toast"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

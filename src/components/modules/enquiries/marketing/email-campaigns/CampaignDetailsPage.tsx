'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Pencil } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import '@/components/ui/module.css';
import './email-campaigns.css';
import { STATUS_BADGE_CLASS, type EmailCampaign, type RecipientActivityStatus } from './types';
import { createEmptyCampaign, formatCampaignDate } from './mockData';
import {
  createCampaignId,
  getCampaign,
  loadCampaigns,
  saveCampaigns,
} from '@/lib/enquiries/emailCampaignsStore';

type Props = { campaignId: string };

export function CampaignDetailsPage({ campaignId }: Props) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RecipientActivityStatus>('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCampaign(getCampaign(campaignId) ?? null);
  }, [campaignId]);

  const analytics = campaign?.analytics;
  const chartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Delivered', value: analytics.delivered },
      { name: 'Opened', value: analytics.opened },
      { name: 'Clicked', value: analytics.clicked },
      { name: 'Converted', value: analytics.conversions },
      { name: 'Bounced', value: analytics.bounced },
      { name: 'Unsub', value: analytics.unsubscribed },
    ];
  }, [analytics]);

  const recipients = campaign?.recipients ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipients.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.contactName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    });
  }, [recipients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!campaign) {
    return (
      <div className="mod-page">
        <p className="ec-muted">Campaign not found.</p>
        <button
          type="button"
          className="ui-btn ui-btn-outline"
          onClick={() => router.push('/enquiries/marketing/email-campaigns')}
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  const duplicate = () => {
    const now = new Date().toISOString();
    const copy = createEmptyCampaign({
      ...structuredClone(campaign),
      id: createCampaignId(),
      name: `${campaign.name} - Copy`,
      status: 'Draft',
      scheduledAt: undefined,
      sentAt: undefined,
      openRate: undefined,
      clickRate: undefined,
      analytics: undefined,
      recipients: undefined,
      createdAt: now,
      updatedAt: now,
    });
    const list = loadCampaigns();
    saveCampaigns([copy, ...list]);
    router.push(`/enquiries/marketing/email-campaigns/${copy.id}/edit`);
  };

  return (
    <div className="mod-page ec-page">
      <PageHeader
        crumbs={['Marketing', 'Email Campaigns', 'Overview']}
        title={campaign.name}
        description="Campaign overview and recipient activity."
        actions={
          <>
            {campaign.status === 'Draft' || campaign.status === 'Paused' ? (
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() =>
                  router.push(`/enquiries/marketing/email-campaigns/${campaign.id}/edit`)
                }
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : null}
            <button type="button" className="ui-btn ui-btn-primary" onClick={duplicate}>
              <Copy size={16} />
              Duplicate
            </button>
          </>
        }
      />

      <div className="ec-panel">
        <div className="ec-review-grid">
          <div className="ec-review-item">
            <label>Status</label>
            <strong>
              <span className={STATUS_BADGE_CLASS[campaign.status]}>{campaign.status}</span>
            </strong>
          </div>
          <div className="ec-review-item">
            <label>Sent Date</label>
            <strong>{formatCampaignDate(campaign.sentAt || campaign.scheduledAt)}</strong>
          </div>
          <div className="ec-review-item">
            <label>Audience</label>
            <strong>{campaign.audienceLabel}</strong>
          </div>
          <div className="ec-review-item">
            <label>Recipients</label>
            <strong>{campaign.recipientCount.toLocaleString()}</strong>
          </div>
          <div className="ec-review-item">
            <label>Subject</label>
            <strong>{campaign.subject || '—'}</strong>
          </div>
          <div className="ec-review-item">
            <label>From</label>
            <strong>
              {campaign.fromName} &lt;{campaign.fromEmail}&gt;
            </strong>
          </div>
        </div>
      </div>

      {analytics ? (
        <div className="ec-panel" style={{ marginTop: '1rem' }}>
          <h3 className="ec-panel-title">Analytics</h3>
          <div className="ec-analytics-grid">
            <div className="ec-metric">
              <p>Delivered</p>
              <strong>{analytics.delivered.toLocaleString()}</strong>
            </div>
            <div className="ec-metric">
              <p>Opened</p>
              <strong>{analytics.opened.toLocaleString()}</strong>
            </div>
            <div className="ec-metric">
              <p>Clicked</p>
              <strong>{analytics.clicked.toLocaleString()}</strong>
            </div>
            <div className="ec-metric">
              <p>Bounced</p>
              <strong>{analytics.bounced.toLocaleString()}</strong>
            </div>
            <div className="ec-metric">
              <p>Unsubscribed</p>
              <strong>{analytics.unsubscribed.toLocaleString()}</strong>
            </div>
            <div className="ec-metric">
              <p>Conversions</p>
              <strong>{analytics.conversions.toLocaleString()}</strong>
            </div>
          </div>
          <div className="ec-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#5D5FEF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="ec-panel" style={{ marginTop: '1rem' }}>
          <p className="ec-muted" style={{ margin: 0 }}>
            Analytics appear after a campaign is sent.
          </p>
        </div>
      )}

      <div className="ec-panel" style={{ marginTop: '1rem' }}>
        <h3 className="ec-panel-title">Recipient Activity</h3>
        <div className="ec-toolbar">
          <input
            className="ui-input ec-search"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="ui-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'All' | RecipientActivityStatus);
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Opened">Opened</option>
            <option value="Clicked">Clicked</option>
            <option value="Bounced">Bounced</option>
            <option value="Unsubscribed">Unsubscribed</option>
          </select>
        </div>
        <div className="ec-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Parent / Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Delivered</th>
                <th>Opened</th>
                <th>Clicked</th>
                <th>Converted</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ec-muted">
                    No recipient activity yet.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.contactName}</td>
                    <td>{r.email}</td>
                    <td>{r.status}</td>
                    <td>{r.deliveredAt ? formatCampaignDate(r.deliveredAt) : '—'}</td>
                    <td>{r.openedAt ? formatCampaignDate(r.openedAt) : '—'}</td>
                    <td>{r.clickedAt ? formatCampaignDate(r.clickedAt) : '—'}</td>
                    <td>{r.converted ? 'Yes' : 'No'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '0.85rem',
          }}
        >
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="ec-muted" style={{ alignSelf: 'center' }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

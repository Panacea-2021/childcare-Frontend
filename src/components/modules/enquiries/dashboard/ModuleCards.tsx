'use client';

import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  Bot,
  CheckCircle2,
  FileText,
  ListTodo,
  Mail,
  MessageCircle,
  Sparkles,
  Table2,
  UserPlus,
  Zap,
} from 'lucide-react';
import { FacebookGlyph } from '../facebook/FacebookGlyph';
import { CampaignChartBlock, MiniLineChart } from './ChartCards';
import { ChartTooltip, DashCard } from './shared';
import type {
  ActivityItem,
  AutomationsOverview,
  CampaignKpis,
  CampaignRow,
  DashboardTaskRow,
  FacebookOverview,
  FormsOverview,
  RecentEnquiryRow,
  SectionState,
  TaskStatusMetric,
  WhatsAppOverview,
} from './types';

function ActivityIcon({ kind }: { kind: ActivityItem['kind'] }) {
  if (kind === 'facebook') return <FacebookGlyph size={14} />;
  const map = {
    enquiry: UserPlus,
    whatsapp: MessageCircle,
    task: CheckCircle2,
    email: Mail,
    form: FileText,
    automation: Zap,
    facebook: UserPlus,
  } as const;
  const Icon = map[kind];
  return <Icon size={14} />;
}

function priorityClass(p: string) {
  if (p === 'High' || p === 'Urgent') return 'is-error';
  if (p === 'Medium') return 'is-paused';
  return 'is-active';
}

function statusClass(s: string) {
  if (s === 'Completed') return 'is-active';
  if (s === 'Overdue') return 'is-error';
  if (s === 'In Progress') return 'is-active';
  return 'is-paused';
}

export const TaskOverviewCard = memo(function TaskOverviewCard({
  metrics,
  rows,
  state,
  onRetry,
}: {
  metrics: TaskStatusMetric[];
  rows: DashboardTaskRow[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Task Overview"
      accent="coral"
      icon={<ListTodo size={15} />}
      actionHref="/tasks"
      actionLabel="View All Tasks →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-task-viz">
        <div className="edash-donut-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={metrics} dataKey="count" nameKey="status" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {metrics.map((m) => (
                  <Cell key={m.status} fill={m.color} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip content={(props) => <ChartTooltip {...props} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="edash-task-metrics">
          {metrics.map((m) => (
            <li key={m.status}>
              <span className="edash-dot" style={{ background: m.color }} />
              {m.status}
              <strong>{m.count}</strong>
            </li>
          ))}
        </ul>
      </div>
      <h3 className="edash-subhead">Tasks Due Today</h3>
      <ul className="edash-task-list">
        {rows.map((t) => (
          <li key={t.id}>
            <div>
              <p className="edash-task-title">{t.title}</p>
              <p className="edash-task-meta">
                {t.assignedTo} · {t.dueTime}
              </p>
            </div>
            <div className="edash-task-badges">
              <span className={`edash-pill ${priorityClass(t.priority)}`}>{t.priority}</span>
              <span className={`edash-pill ${statusClass(t.status)}`}>{t.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </DashCard>
  );
});

export const ActivityTimelineCard = memo(function ActivityTimelineCard({
  items,
  state,
  onRetry,
}: {
  items: ActivityItem[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Recent Enquiry Activity"
      accent="lavender"
      icon={<Sparkles size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <ol className="edash-timeline">
        {items.map((item, i) => {
          return (
            <li key={item.id} style={{ ['--i' as string]: i }}>
              <span className={`edash-tl-icon is-${item.kind}`} aria-hidden>
                <ActivityIcon kind={item.kind} />
              </span>
              <div>
                <p className="edash-tl-title">{item.title}</p>
                <p className="edash-tl-desc">{item.description}</p>
                <time className="edash-tl-time">{item.timeAgo}</time>
              </div>
            </li>
          );
        })}
      </ol>
    </DashCard>
  );
});

export const FormsOverviewCard = memo(function FormsOverviewCard({
  forms,
  state,
  onRetry,
}: {
  forms: FormsOverview;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Enquiry Forms"
      accent="mint"
      icon={<FileText size={15} />}
      actionHref="/enquiries/forms"
      actionLabel="Manage Forms →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-mini-kpis">
        <div>
          <strong>{forms.activeForms}</strong>
          <span>Active Forms</span>
        </div>
        <div>
          <strong>{forms.submissions.toLocaleString()}</strong>
          <span>Total Submissions</span>
        </div>
        <div>
          <strong>{forms.conversionRate}%</strong>
          <span>Conversion Rate</span>
        </div>
      </div>
      <h3 className="edash-subhead">Top Performing Forms</h3>
      <ol className="edash-ranked">
        {forms.topForms.map((f, i) => (
          <li key={f.id}>
            <span>{i + 1}</span>
            <em>{f.title}</em>
            <strong>{f.submissions.toLocaleString()}</strong>
          </li>
        ))}
      </ol>
    </DashCard>
  );
});

export const AutomationsCard = memo(function AutomationsCard({
  data,
  state,
  onRetry,
}: {
  data: AutomationsOverview;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Automation Performance"
      accent="purple"
      icon={<Bot size={15} />}
      actionHref="/enquiries/marketing"
      actionLabel="Manage Automations →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-mini-kpis edash-mini-kpis-4">
        <div>
          <strong>{data.active}</strong>
          <span>Active</span>
        </div>
        <div>
          <strong>{data.triggeredToday}</strong>
          <span>Triggered Today</span>
        </div>
        <div>
          <strong>{data.completed}</strong>
          <span>Completed</span>
        </div>
        <div>
          <strong>{data.failed}</strong>
          <span>Failed</span>
        </div>
      </div>
      <div className="edash-chart-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Bar dataKey="value" name="Runs" fill="#5D5FEF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="edash-table-wrap">
        <table className="ui-table edash-table">
          <thead>
            <tr>
              <th>Automation</th>
              <th>Trigger</th>
              <th>Status</th>
              <th>Last</th>
              <th>Perf.</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.trigger}</td>
                <td>
                  <span className={`edash-pill is-${row.status.toLowerCase()}`}>{row.status}</span>
                </td>
                <td>{row.lastTriggered}</td>
                <td>{row.performance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
});

export const CampaignPerformanceCard = memo(function CampaignPerformanceCard({
  kpis,
  chart,
  rows,
  state,
  onRetry,
}: {
  kpis: CampaignKpis;
  chart: { label: string; sent: number; delivered: number; opened: number; clicked: number }[];
  rows: CampaignRow[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Email Campaign Performance"
      accent="sky"
      icon={<Mail size={15} />}
      actionHref="/enquiries/marketing/email-campaigns"
      actionLabel="View Campaigns →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-mini-kpis edash-mini-kpis-6">
        <div>
          <strong>{kpis.sent.toLocaleString()}</strong>
          <span>Sent</span>
        </div>
        <div>
          <strong>{kpis.delivered.toLocaleString()}</strong>
          <span>Delivered</span>
        </div>
        <div>
          <strong>{kpis.opened.toLocaleString()}</strong>
          <span>Opened</span>
        </div>
        <div>
          <strong>{kpis.clicked.toLocaleString()}</strong>
          <span>Clicked</span>
        </div>
        <div>
          <strong>{kpis.openRate}%</strong>
          <span>Open Rate</span>
        </div>
        <div>
          <strong>{kpis.clickRate}%</strong>
          <span>Click Rate</span>
        </div>
      </div>
      <CampaignChartBlock data={chart} />
      <h3 className="edash-subhead">Recent Campaigns</h3>
      <div className="edash-table-wrap">
        <table className="ui-table edash-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Recipients</th>
              <th>Open Rate</th>
              <th>Click Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.recipients.toLocaleString()}</td>
                <td>{row.openRate}%</td>
                <td>{row.clickRate}%</td>
                <td>
                  <span className="edash-pill is-active">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
});

export const FacebookOverviewCard = memo(function FacebookOverviewCard({
  data,
  state,
  onRetry,
}: {
  data: FacebookOverview;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Facebook Lead Performance"
      accent="pink"
      icon={<FacebookGlyph size={15} />}
      actionHref="/enquiries/facebook"
      actionLabel="Open Facebook Integration →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-mini-kpis edash-mini-kpis-4">
        <div>
          <strong>{data.leads.toLocaleString()}</strong>
          <span>Facebook Leads</span>
        </div>
        <div>
          <strong>{data.contacted.toLocaleString()}</strong>
          <span>Contacted</span>
        </div>
        <div>
          <strong>{data.converted.toLocaleString()}</strong>
          <span>Converted</span>
        </div>
        <div>
          <strong>{data.conversionRate}%</strong>
          <span>Conversion Rate</span>
        </div>
      </div>
      <MiniLineChart data={data.chart} dataKey="leads" color="#EC4899" />
    </DashCard>
  );
});

export const WhatsAppOverviewCard = memo(function WhatsAppOverviewCard({
  data,
  state,
  onRetry,
}: {
  data: WhatsAppOverview;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="WhatsApp Engagement"
      accent="green"
      icon={<MessageCircle size={15} />}
      actionHref="/enquiries/whatsapp"
      actionLabel="Open WhatsApp →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-mini-kpis edash-mini-kpis-4">
        <div>
          <strong>{data.sent.toLocaleString()}</strong>
          <span>Messages Sent</span>
        </div>
        <div>
          <strong>{data.received.toLocaleString()}</strong>
          <span>Received</span>
        </div>
        <div>
          <strong>{data.activeChats}</strong>
          <span>Active Chats</span>
        </div>
        <div>
          <strong>{data.unread}</strong>
          <span>Unread</span>
        </div>
      </div>
      <div className="edash-chart-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Bar dataKey="sent" name="Sent" fill="#5D5FEF" radius={[3, 3, 0, 0]} />
            <Bar dataKey="received" name="Received" fill="#3D7A55" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h3 className="edash-subhead">Recent WhatsApp Activity</h3>
      <ul className="edash-wa-list">
        {data.recent.map((row) => (
          <li key={row.id}>
            <span className="edash-wa-avatar" aria-hidden>
              {row.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)}
            </span>
            <div>
              <p className="edash-wa-name">{row.name}</p>
              <p className="edash-wa-msg">{row.lastMessage}</p>
            </div>
            <div className="edash-wa-meta">
              <time>{row.time}</time>
              <span className={`edash-pill is-${row.status.toLowerCase()}`}>{row.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </DashCard>
  );
});

export const RecentEnquiriesCard = memo(function RecentEnquiriesCard({
  rows,
  state,
  onRetry,
}: {
  rows: RecentEnquiryRow[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Recent Enquiries"
      accent="purple"
      icon={<Table2 size={15} />}
      actionHref="/enquiries"
      actionLabel="View All Enquiries →"
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-table-wrap">
        <table className="ui-table edash-table">
          <thead>
            <tr>
              <th>Student / Parent</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Enquiry Type</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.studentParent}</td>
                <td>{row.contact}</td>
                <td>{row.source}</td>
                <td>{row.enquiryType}</td>
                <td>{row.assignedTo}</td>
                <td>
                  <span className={`enq-badge enq-badge-${row.statusTone}`}>{row.status}</span>
                </td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
});

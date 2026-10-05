'use client';

import { memo } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Funnel,
  GitBranch,
  PieChart as PieIcon,
  Radio,
  Trophy,
} from 'lucide-react';
import { DashCard, ChartTooltip, ProgressBar } from './shared';
import type {
  ChannelPerformance,
  ChartRange,
  ConversionBySource,
  FunnelStage,
  OverviewPoint,
  SectionState,
  SourceSlice,
  TopSourceRow,
} from './types';

const CHART_STROKE = '#E8EDF5';
const ACCENT = '#5D5FEF';
const ACCENT_2 = '#EC4899';
const ACCENT_3 = '#3D7A55';
const ACCENT_4 = '#8B5CF6';
const CONV_COLORS = ['#5D5FEF', '#EC4899', '#3D7A55', '#8B5CF6', '#F59E0B'];

export const EnquiryOverviewCard = memo(function EnquiryOverviewCard({
  data,
  range,
  onRangeChange,
  state,
  onRetry,
}: {
  data: OverviewPoint[];
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Enquiry Overview"
      accent="purple"
      icon={<BarChart3 size={15} />}
      state={state}
      onRetry={onRetry}
      toolbar={
        <div className="edash-seg" role="group" aria-label="Chart range">
          {([7, 30, 90] as ChartRange[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`edash-seg-btn${range === r ? ' is-active' : ''}`}
              onClick={() => onRangeChange(r)}
              aria-pressed={range === r}
            >
              {r} Days
            </button>
          ))}
        </div>
      }
    >
      <div className="edash-chart-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="edashTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Enquiries"
              stroke={ACCENT}
              fill="url(#edashTotal)"
              strokeWidth={2.5}
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="newEnquiries"
              name="New Enquiries"
              stroke={ACCENT_2}
              strokeWidth={2}
              dot={false}
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="converted"
              name="Converted"
              stroke={ACCENT_3}
              strokeWidth={2}
              dot={false}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </DashCard>
  );
});

export const EnquirySourcesCard = memo(function EnquirySourcesCard({
  sources,
  total,
  state,
  onRetry,
}: {
  sources: SourceSlice[];
  total: number;
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Enquiry Sources"
      accent="pink"
      icon={<PieIcon size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-sources">
        <div className="edash-donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                dataKey="count"
                nameKey="name"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                animationDuration={850}
              >
                {sources.map((s) => (
                  <Cell key={s.id} fill={s.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  const src = sources.find((s) => s.name === name);
                  return [`${v.toLocaleString()} (${src?.percentage ?? 0}%)`, String(name)];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="edash-donut-center">
            <strong>{total.toLocaleString()}</strong>
            <span>Total Enquiries</span>
          </div>
        </div>
        <ul className="edash-source-list">
          {sources.map((s) => (
            <li key={s.id}>
              <span className="edash-dot" style={{ background: s.color }} />
              <span className="edash-source-name">{s.name}</span>
              <span className="edash-source-count">{s.count.toLocaleString()}</span>
              <span className="edash-source-pct">{s.percentage}%</span>
            </li>
          ))}
        </ul>
      </div>
    </DashCard>
  );
});

export const ConversionFunnelCard = memo(function ConversionFunnelCard({
  stages,
  state,
  onRetry,
}: {
  stages: FunnelStage[];
  state: SectionState;
  onRetry?: () => void;
}) {
  const max = stages[0]?.count || 1;
  return (
    <DashCard
      title="Enquiry Conversion Funnel"
      accent="lavender"
      icon={<Funnel size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <ol className="edash-funnel">
        {stages.map((stage, i) => (
          <li key={stage.id}>
            <motion.button
              type="button"
              className="edash-funnel-stage"
              style={{ ['--funnel-w' as string]: `${Math.max(28, (stage.count / max) * 100)}%` }}
              whileHover={{ scale: 1.01, x: 2 }}
              transition={{ duration: 0.18 }}
              aria-label={`${stage.label}: ${stage.count} enquiries, ${stage.conversionRate}% of top`}
            >
              <span className="edash-funnel-label">{stage.label}</span>
              <span className="edash-funnel-bar" />
              <span className="edash-funnel-meta">
                <strong>{stage.count.toLocaleString()}</strong>
                <em>{stage.conversionRate}%</em>
              </span>
            </motion.button>
            {i < stages.length - 1 ? <span className="edash-funnel-arrow" aria-hidden>↓</span> : null}
          </li>
        ))}
      </ol>
    </DashCard>
  );
});

export const CommunicationCard = memo(function CommunicationCard({
  channels,
  state,
  onRetry,
}: {
  channels: ChannelPerformance[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Communication Performance"
      accent="sky"
      icon={<Radio size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-chart-md">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={channels} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="leads" name="Leads" fill={ACCENT} radius={[6, 6, 0, 0]} animationDuration={800} />
            <Bar dataKey="engagement" name="Engagement" fill={ACCENT_2} radius={[6, 6, 0, 0]} animationDuration={800} />
            <Bar dataKey="conversions" name="Conversions" fill={ACCENT_3} radius={[6, 6, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashCard>
  );
});

export const ConversionPerformanceCard = memo(function ConversionPerformanceCard({
  overall,
  bySource,
  state,
  onRetry,
}: {
  overall: number;
  bySource: ConversionBySource[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Conversion Performance"
      accent="green"
      icon={<GitBranch size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-conv">
        <div className="edash-conv-hero">
          <span>Overall Conversion Rate</span>
          <strong>{overall}%</strong>
        </div>
        <ul className="edash-conv-list">
          {bySource.map((row, i) => (
            <li key={row.source}>
              <div className="edash-conv-row">
                <span>{row.source}</span>
                <strong>{row.rate}%</strong>
              </div>
              <ProgressBar value={row.rate * 4} color={CONV_COLORS[i % CONV_COLORS.length]} />
            </li>
          ))}
        </ul>
      </div>
    </DashCard>
  );
});

export const TopSourcesCard = memo(function TopSourcesCard({
  rows,
  state,
  onRetry,
}: {
  rows: TopSourceRow[];
  state: SectionState;
  onRetry?: () => void;
}) {
  return (
    <DashCard
      title="Top Performing Sources"
      accent="coral"
      icon={<Trophy size={15} />}
      state={state}
      onRetry={onRetry}
    >
      <div className="edash-table-wrap">
        <table className="ui-table edash-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Enquiries</th>
              <th>Conversions</th>
              <th>Conversion Rate</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.source}>
                <td>{row.source}</td>
                <td>{row.enquiries.toLocaleString()}</td>
                <td>{row.conversions.toLocaleString()}</td>
                <td>{row.conversionRate}%</td>
                <td className={`edash-trend is-${row.trend}`}>
                  {row.trend === 'up' ? '↑' : row.trend === 'down' ? '↓' : '→'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
});

export const CampaignChartBlock = memo(function CampaignChartBlock({
  data,
}: {
  data: { label: string; sent: number; delivered: number; opened: number; clicked: number }[];
}) {
  return (
    <div className="edash-chart-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Bar dataKey="sent" name="Sent" fill={ACCENT} radius={[4, 4, 0, 0]} />
          <Bar dataKey="delivered" name="Delivered" fill={ACCENT_4} radius={[4, 4, 0, 0]} />
          <Bar dataKey="opened" name="Opened" fill={ACCENT_2} radius={[4, 4, 0, 0]} />
          <Bar dataKey="clicked" name="Clicked" fill={ACCENT_3} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export const MiniLineChart = memo(function MiniLineChart({
  data,
  dataKey,
  color = ACCENT,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  color?: string;
}) {
  return (
    <div className="edash-chart-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STROKE} vertical={false} />
          <XAxis dataKey="label" hide />
          <YAxis hide />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} animationDuration={800} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export type ChartRange = 7 | 30 | 90;

export type TrendDirection = 'up' | 'down' | 'flat';

export type SectionState = 'ready' | 'loading' | 'empty' | 'error';

export type KpiTone = 'pink' | 'purple' | 'green' | 'coral' | 'lavender' | 'mint';

export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  displayValue?: string;
  support: string;
  trend: string;
  trendDirection: TrendDirection;
  sparkline: number[];
  icon: 'inbox' | 'folderOpen' | 'checkCircle' | 'listTodo' | 'zap' | 'megaphone';
  tone: KpiTone;
};

export type CardAccent = 'pink' | 'purple' | 'green' | 'coral' | 'lavender' | 'mint' | 'sky';

export type OverviewPoint = {
  label: string;
  total: number;
  newEnquiries: number;
  converted: number;
};

export type SourceSlice = {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export type FunnelStage = {
  id: string;
  label: string;
  count: number;
  conversionRate: number;
};

export type TaskStatusMetric = {
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  count: number;
  color: string;
};

export type DashboardTaskRow = {
  id: string;
  title: string;
  assignedTo: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  kind: 'enquiry' | 'whatsapp' | 'task' | 'email' | 'facebook' | 'form' | 'automation';
};

export type FormsOverview = {
  totalForms: number;
  activeForms: number;
  submissions: number;
  conversionRate: number;
  topForms: { id: string; title: string; submissions: number }[];
};

export type AutomationRow = {
  id: string;
  name: string;
  trigger: string;
  status: 'Active' | 'Paused' | 'Error';
  lastTriggered: string;
  performance: number;
};

export type AutomationsOverview = {
  active: number;
  triggeredToday: number;
  completed: number;
  failed: number;
  chart: { label: string; value: number }[];
  rows: AutomationRow[];
};

export type CampaignKpis = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
};

export type CampaignChartPoint = {
  label: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
};

export type CampaignRow = {
  id: string;
  name: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  status: string;
};

export type FacebookOverview = {
  leads: number;
  newLeads: number;
  contacted: number;
  converted: number;
  conversionRate: number;
  chart: { label: string; leads: number }[];
};

export type WhatsAppOverview = {
  sent: number;
  received: number;
  activeChats: number;
  unread: number;
  chart: { label: string; sent: number; received: number }[];
  recent: {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    status: 'Unread' | 'Replied' | 'Pending';
  }[];
};

export type ChannelPerformance = {
  channel: string;
  leads: number;
  engagement: number;
  conversions: number;
};

export type ConversionBySource = {
  source: string;
  rate: number;
};

export type TopSourceRow = {
  source: string;
  enquiries: number;
  conversions: number;
  conversionRate: number;
  trend: TrendDirection;
};

export type RecentEnquiryRow = {
  id: string;
  studentParent: string;
  contact: string;
  source: string;
  enquiryType: string;
  assignedTo: string;
  status: string;
  statusTone: 'stored' | 'admitted' | 'interested' | 'waitlisted' | 'lost' | 'custom';
  date: string;
};

export type EnquiriesDashboardData = {
  kpis: DashboardKpi[];
  overview: OverviewPoint[];
  sources: SourceSlice[];
  funnel: FunnelStage[];
  taskMetrics: TaskStatusMetric[];
  tasksDueToday: DashboardTaskRow[];
  activity: ActivityItem[];
  forms: FormsOverview;
  automations: AutomationsOverview;
  campaignKpis: CampaignKpis;
  campaignChart: CampaignChartPoint[];
  campaigns: CampaignRow[];
  facebook: FacebookOverview;
  whatsapp: WhatsAppOverview;
  channels: ChannelPerformance[];
  conversionOverall: number;
  conversionBySource: ConversionBySource[];
  topSources: TopSourceRow[];
  recentEnquiries: RecentEnquiryRow[];
};

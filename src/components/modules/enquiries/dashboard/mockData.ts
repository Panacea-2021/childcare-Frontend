import { SEED_ENQUIRIES } from '../mockData';
import { loadStudentForms } from '../forms/formsStore';
import { loadAutomations } from '@/lib/enquiries/marketingAutomationsStore';
import { loadCampaigns } from '@/lib/enquiries/emailCampaignsStore';
import { loadTasks } from '@/lib/tasks/tasksStore';
import { TRIGGER_LABELS } from '../marketing/types';
import type {
  AutomationsOverview,
  ChartRange,
  DashboardKpi,
  DashboardTaskRow,
  DateRangePreset,
  EnquiriesDashboardData,
  OverviewPoint,
} from './types';

const SOURCE_COLORS: Record<string, string> = {
  Website: '#5D5FEF',
  Facebook: '#EC4899',
  WhatsApp: '#3D7A55',
  'Enquiry Forms': '#8B5CF6',
  Email: '#0EA5E9',
  'Manual Entry': '#F59E0B',
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromPreset(preset: DateRangePreset, customKey: string) {
  const map: Record<DateRangePreset, number> = {
    today: 11,
    yesterday: 22,
    last7: 33,
    last30: 44,
    thisMonth: 55,
    lastMonth: 66,
    custom: 77,
  };
  let h = map[preset] * 9973;
  for (let i = 0; i < customKey.length; i++) h = (h * 33 + customKey.charCodeAt(i)) >>> 0;
  return h || 1;
}

function scaleForPreset(preset: DateRangePreset): number {
  switch (preset) {
    case 'today':
      return 0.04;
    case 'yesterday':
      return 0.035;
    case 'last7':
      return 0.22;
    case 'last30':
      return 1;
    case 'thisMonth':
      return 0.85;
    case 'lastMonth':
      return 0.92;
    case 'custom':
      return 0.7;
    default:
      return 1;
  }
}

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return n.toLocaleString('en-IN');
  return String(n);
}

function buildOverview(range: ChartRange, rnd: () => number): OverviewPoint[] {
  const points: OverviewPoint[] = [];
  const step = range === 7 ? 1 : range === 30 ? 1 : 7;
  const count = range === 7 ? 7 : range === 30 ? 30 : 13;

  for (let i = 0; i < count; i++) {
    const dayOffset = range === 90 ? i * step : i;
    const base = 28 + Math.sin(i / 2.4) * 10 + rnd() * 14;
    const total = Math.round(base + (range === 7 ? 8 : 0));
    const newEnquiries = Math.round(total * (0.55 + rnd() * 0.2));
    const converted = Math.round(total * (0.12 + rnd() * 0.08));
    const label =
      range === 90
        ? `W${i + 1}`
        : range === 7
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] ?? `D${i + 1}`
          : `D${dayOffset + 1}`;
    points.push({ label, total, newEnquiries, converted });
  }
  return points;
}

function spark(rnd: () => number, base: number): number[] {
  return Array.from({ length: 8 }, (_, i) =>
    Math.max(2, Math.round(base * (0.65 + Math.sin(i) * 0.15 + rnd() * 0.35))),
  );
}

function mapStatusTone(
  stage: string,
): 'stored' | 'admitted' | 'interested' | 'waitlisted' | 'lost' | 'custom' {
  const s = stage.toLowerCase();
  if (s.includes('admit') || s.includes('convert')) return 'admitted';
  if (s.includes('interest')) return 'interested';
  if (s.includes('wait')) return 'waitlisted';
  if (s.includes('lost')) return 'lost';
  if (s.includes('stor') || s.includes('new')) return 'stored';
  return 'custom';
}

export function buildEnquiriesDashboardData(
  preset: DateRangePreset,
  chartRange: ChartRange,
  customKey = '',
): EnquiriesDashboardData {
  const rnd = mulberry32(seedFromPreset(preset, customKey));
  const scale = scaleForPreset(preset);

  const totalEnquiries = Math.max(24, Math.round(1248 * scale));
  const openEnquiries = Math.max(8, Math.round(326 * scale));
  const converted = Math.max(4, Math.round(184 * scale));
  const pendingTasksBase = Math.max(2, Math.round(42 * scale));
  const campaignReach = Math.max(800, Math.round(24800 * scale));

  let activeAutomations = 12;
  let triggeredToday = 3;
  let formsActive = 12;
  let formSubmissions = Math.max(40, Math.round(1842 * scale));
  let topForms = [
    { id: 'f1', title: 'Student Admission Form', submissions: Math.round(642 * scale) },
    { id: 'f2', title: 'Course Enquiry Form', submissions: Math.round(428 * scale) },
    { id: 'f3', title: 'Callback Request Form', submissions: Math.round(318 * scale) },
    { id: 'f4', title: 'Demo Class Form', submissions: Math.round(264 * scale) },
  ];

  let automationsOverview: AutomationsOverview = {
    active: activeAutomations,
    triggeredToday,
    completed: Math.round(186 * scale),
    failed: Math.max(1, Math.round(7 * scale)),
    chart: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({
      label,
      value: Math.round(12 + rnd() * 28),
    })),
    rows: [
      {
        id: 'a1',
        name: 'New Enquiry Follow-up',
        trigger: 'Form Submission',
        status: 'Active',
        lastTriggered: '12 min ago',
        performance: 94,
      },
      {
        id: 'a2',
        name: 'Welcome Email',
        trigger: 'Stage Change',
        status: 'Active',
        lastTriggered: '28 min ago',
        performance: 88,
      },
      {
        id: 'a3',
        name: 'WhatsApp Reminder',
        trigger: 'Tour Booked',
        status: 'Active',
        lastTriggered: '1 hr ago',
        performance: 91,
      },
      {
        id: 'a4',
        name: 'Lead Assignment',
        trigger: 'Form Submission',
        status: 'Paused',
        lastTriggered: 'Yesterday',
        performance: 76,
      },
      {
        id: 'a5',
        name: 'Follow-up Reminder',
        trigger: 'Stage Change',
        status: 'Error',
        lastTriggered: '3 hrs ago',
        performance: 42,
      },
    ],
  };

  let taskMetrics = [
    { status: 'Pending' as const, count: Math.round(18 * scale) || 4, color: '#F59E0B' },
    { status: 'In Progress' as const, count: Math.round(12 * scale) || 3, color: '#5D5FEF' },
    { status: 'Completed' as const, count: Math.round(64 * scale) || 10, color: '#3D7A55' },
    { status: 'Overdue' as const, count: Math.round(8 * scale) || 2, color: '#ED70A8' },
  ];

  let tasksDueToday: DashboardTaskRow[] = [
    {
      id: 't1',
      title: 'Call parent about campus tour',
      assignedTo: 'Darshan',
      dueTime: '10:30 AM',
      priority: 'High' as const,
      status: 'Pending' as const,
    },
    {
      id: 't2',
      title: 'Send fee structure email',
      assignedTo: 'Priya Nair',
      dueTime: '12:00 PM',
      priority: 'Medium' as const,
      status: 'In Progress' as const,
    },
    {
      id: 't3',
      title: 'Follow up WhatsApp lead',
      assignedTo: 'Ananya Rao',
      dueTime: '2:15 PM',
      priority: 'High' as const,
      status: 'Pending' as const,
    },
    {
      id: 't4',
      title: 'Confirm demo class booking',
      assignedTo: 'Vikram Shah',
      dueTime: '4:00 PM',
      priority: 'Low' as const,
      status: 'Pending' as const,
    },
    {
      id: 't5',
      title: 'Verify documents — Aarav Sharma',
      assignedTo: 'Meera Iyer',
      dueTime: '5:30 PM',
      priority: 'Medium' as const,
      status: 'Overdue' as const,
    },
  ];

  let campaignRows = [
    {
      id: 'c1',
      name: 'August Admissions',
      recipients: 5240,
      openRate: 62.4,
      clickRate: 21.8,
      status: 'Sent',
    },
    {
      id: 'c2',
      name: 'Course Promotion',
      recipients: 3820,
      openRate: 54.1,
      clickRate: 16.3,
      status: 'Sent',
    },
    {
      id: 'c3',
      name: 'Demo Campaign',
      recipients: 2150,
      openRate: 48.7,
      clickRate: 12.2,
      status: 'Scheduled',
    },
  ];

  let recentEnquiries = SEED_ENQUIRIES.slice(0, 8).map((e) => ({
    id: e.id,
    studentParent: e.studentName,
    contact: e.motherPhone || e.motherEmail || '—',
    source: e.source,
    enquiryType: e.program || e.interest || 'General',
    assignedTo: e.assignedTo,
    status: e.stage,
    statusTone: mapStatusTone(e.stage),
    date: e.createdOn,
  }));

  // Enrich from live frontend stores when available (client-only).
  if (typeof window !== 'undefined') {
    try {
      const forms = loadStudentForms();
      const published = forms.filter((f) => f.status === 'published');
      formsActive = published.length || forms.length;
      topForms = forms.slice(0, 4).map((f, i) => ({
        id: f.id,
        title: f.title,
        submissions: topForms[i]?.submissions ?? Math.round(120 * (4 - i) * scale),
      }));
    } catch {
      /* keep fallback */
    }

    try {
      const autos = loadAutomations();
      activeAutomations = autos.filter((a) => a.status === 'Active').length || autos.length;
      const rows = autos.slice(0, 5).map((a) => {
        const status: 'Active' | 'Paused' | 'Error' =
          a.status === 'Active' ? 'Active' : a.status === 'Paused' ? 'Paused' : 'Error';
        return {
          id: a.id,
          name: a.name,
          trigger: a.trigger.type ? TRIGGER_LABELS[a.trigger.type] : '—',
          status,
          lastTriggered: a.updatedAt ? relativeFromIso(a.updatedAt) : '—',
          performance: Math.min(99, Math.max(35, Math.round(55 + a.runs / 3))),
        };
      });
      if (rows.length) {
        automationsOverview = {
          ...automationsOverview,
          active: activeAutomations,
          rows,
        };
      }
    } catch {
      /* keep fallback */
    }

    try {
      const campaigns = loadCampaigns();
      if (campaigns.length) {
        campaignRows = campaigns.slice(0, 4).map((c) => ({
          id: c.id,
          name: c.name,
          recipients: c.recipientCount,
          openRate: c.openRate ?? 0,
          clickRate: c.clickRate ?? 0,
          status: c.status,
        }));
      }
    } catch {
      /* keep fallback */
    }

    try {
      const tasks = loadTasks();
      const counts = {
        Pending: tasks.filter((t) => t.status === 'Pending').length,
        'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
        Completed: tasks.filter((t) => t.status === 'Completed').length,
        Overdue: tasks.filter((t) => t.status === 'Overdue').length,
      };
      taskMetrics = [
        { status: 'Pending', count: counts.Pending, color: '#F59E0B' },
        { status: 'In Progress', count: counts['In Progress'], color: '#5D5FEF' },
        { status: 'Completed', count: counts.Completed, color: '#10B981' },
        { status: 'Overdue', count: counts.Overdue, color: '#EF4444' },
      ];
      const today = new Date().toISOString().slice(0, 10);
      const due: typeof tasksDueToday = tasks
        .filter((t) => t.dueDate === today || t.status === 'Overdue' || t.status === 'Pending')
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.name,
          assignedTo: t.assignedTo,
          dueTime: t.dueTime || '—',
          priority: (t.priority === 'Urgent' ? 'High' : t.priority) as 'High' | 'Medium' | 'Low',
          status: (t.status === 'Cancelled' ? 'Pending' : t.status) as
            | 'Pending'
            | 'In Progress'
            | 'Completed'
            | 'Overdue',
        }));
      if (due.length) tasksDueToday = due;
    } catch {
      /* keep fallback */
    }
  }

  const openPct = totalEnquiries ? ((openEnquiries / totalEnquiries) * 100).toFixed(1) : '0';

  const kpis: DashboardKpi[] = [
    {
      id: 'total',
      label: 'Total Enquiries',
      value: totalEnquiries,
      displayValue: fmt(totalEnquiries),
      support: '+12.5% from last month',
      trend: '+12.5%',
      trendDirection: 'up',
      sparkline: spark(rnd, 40),
      icon: 'inbox',
      tone: 'purple',
    },
    {
      id: 'open',
      label: 'Open Enquiries',
      value: openEnquiries,
      displayValue: fmt(openEnquiries),
      support: `${openPct}% of total enquiries`,
      trend: `${openPct}%`,
      trendDirection: 'flat',
      sparkline: spark(rnd, 28),
      icon: 'folderOpen',
      tone: 'lavender',
    },
    {
      id: 'converted',
      label: 'Converted',
      value: converted,
      displayValue: fmt(converted),
      support: '+8.4% conversion growth',
      trend: '+8.4%',
      trendDirection: 'up',
      sparkline: spark(rnd, 18),
      icon: 'checkCircle',
      tone: 'green',
    },
    {
      id: 'tasks',
      label: 'Pending Tasks',
      value: taskMetrics[0]?.count ?? pendingTasksBase,
      displayValue: fmt(taskMetrics[0]?.count ?? pendingTasksBase),
      support: '18 due today',
      trend: '18 today',
      trendDirection: 'flat',
      sparkline: spark(rnd, 14),
      icon: 'listTodo',
      tone: 'coral',
    },
    {
      id: 'automations',
      label: 'Active Automations',
      value: activeAutomations,
      displayValue: String(activeAutomations),
      support: `${triggeredToday} triggered today`,
      trend: `${triggeredToday} today`,
      trendDirection: 'up',
      sparkline: spark(rnd, 10),
      icon: 'zap',
      tone: 'mint',
    },
    {
      id: 'reach',
      label: 'Campaign Reach',
      value: campaignReach,
      displayValue: fmt(campaignReach),
      support: '+15.2% this month',
      trend: '+15.2%',
      trendDirection: 'up',
      sparkline: spark(rnd, 50),
      icon: 'megaphone',
      tone: 'pink',
    },
  ];

  const sourceBase = [
    { id: 'website', name: 'Website', share: 0.23 },
    { id: 'facebook', name: 'Facebook', share: 0.34 },
    { id: 'whatsapp', name: 'WhatsApp', share: 0.25 },
    { id: 'forms', name: 'Enquiry Forms', share: 0.08 },
    { id: 'email', name: 'Email', share: 0.06 },
    { id: 'manual', name: 'Manual Entry', share: 0.04 },
  ];

  let remaining = totalEnquiries;
  const sources = sourceBase.map((s, i) => {
    const count =
      i === sourceBase.length - 1 ? remaining : Math.round(totalEnquiries * s.share);
    remaining -= count;
    return {
      id: s.id,
      name: s.name,
      count: Math.max(0, count),
      percentage: totalEnquiries ? Math.round((count / totalEnquiries) * 1000) / 10 : 0,
      color: SOURCE_COLORS[s.name] ?? '#5D5FEF',
    };
  });

  const funnelDefs = [
    { id: 'new', label: 'New', ratio: 1 },
    { id: 'contacted', label: 'Contacted', ratio: 0.715 },
    { id: 'followup', label: 'Follow-up', ratio: 0.524 },
    { id: 'interested', label: 'Interested', ratio: 0.351 },
    { id: 'meeting', label: 'Meeting Scheduled', ratio: 0.214 },
    { id: 'converted', label: 'Converted', ratio: 0.147 },
  ];
  const funnel = funnelDefs.map((f) => {
    const count = Math.max(1, Math.round(totalEnquiries * f.ratio));
    return {
      id: f.id,
      label: f.label,
      count,
      conversionRate: Math.round(f.ratio * 1000) / 10,
    };
  });

  return {
    kpis,
    overview: buildOverview(chartRange, rnd),
    sources,
    funnel,
    taskMetrics,
    tasksDueToday,
    activity: [
      {
        id: 'act1',
        title: 'New enquiry received',
        description: 'Rahul Sharma submitted an enquiry form',
        timeAgo: '5 min ago',
        kind: 'enquiry',
      },
      {
        id: 'act2',
        title: 'WhatsApp conversation started',
        description: 'Parent contacted through WhatsApp',
        timeAgo: '18 min ago',
        kind: 'whatsapp',
      },
      {
        id: 'act3',
        title: 'Task completed',
        description: 'Follow-up task completed by Staff Member',
        timeAgo: '42 min ago',
        kind: 'task',
      },
      {
        id: 'act4',
        title: 'Email campaign sent',
        description: '"August Admissions Campaign"',
        timeAgo: '1 hour ago',
        kind: 'email',
      },
      {
        id: 'act5',
        title: 'Facebook enquiry received',
        description: 'New lead received from Facebook',
        timeAgo: '2 hours ago',
        kind: 'facebook',
      },
      {
        id: 'act6',
        title: 'Automation triggered',
        description: 'Welcome Email ran for 3 new leads',
        timeAgo: '3 hours ago',
        kind: 'automation',
      },
    ],
    forms: {
      totalForms: Math.max(formsActive, 12),
      activeForms: formsActive,
      submissions: formSubmissions,
      conversionRate: 28.6,
      topForms,
    },
    automations: {
      ...automationsOverview,
      active: activeAutomations,
      triggeredToday,
    },
    campaignKpis: {
      sent: Math.round(24820 * scale),
      delivered: Math.round(24210 * scale),
      opened: Math.round(13482 * scale),
      clicked: Math.round(4281 * scale),
      openRate: 55.7,
      clickRate: 17.7,
    },
    campaignChart: ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => ({
      label,
      sent: Math.round((5200 + i * 400 + rnd() * 600) * Math.min(1, scale + 0.3)),
      delivered: Math.round((5000 + i * 380 + rnd() * 500) * Math.min(1, scale + 0.3)),
      opened: Math.round((2800 + i * 220 + rnd() * 300) * Math.min(1, scale + 0.3)),
      clicked: Math.round((900 + i * 80 + rnd() * 120) * Math.min(1, scale + 0.3)),
    })),
    campaigns: campaignRows,
    facebook: {
      leads: Math.round(428 * scale),
      newLeads: Math.round(86 * scale),
      contacted: Math.round(302 * scale),
      converted: Math.round(86 * scale),
      conversionRate: 20.1,
      chart: Array.from({ length: 7 }, (_, i) => ({
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] ?? `D${i}`,
        leads: Math.round(40 + rnd() * 35 + Math.sin(i) * 10),
      })),
    },
    whatsapp: {
      sent: Math.round(2842 * scale),
      received: Math.round(3418 * scale),
      activeChats: Math.round(128 * Math.min(1, scale + 0.4)),
      unread: Math.round(34 * Math.min(1, scale + 0.4)),
      chart: Array.from({ length: 7 }, (_, i) => ({
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] ?? `D${i}`,
        sent: Math.round(280 + rnd() * 120),
        received: Math.round(320 + rnd() * 140),
      })),
      recent: [
        {
          id: 'w1',
          name: 'Neha Mehta',
          lastMessage: 'Can we visit the campus this weekend?',
          time: '8 min',
          status: 'Unread' as const,
        },
        {
          id: 'w2',
          name: 'Rohan Desai',
          lastMessage: 'Thanks for the brochure!',
          time: '25 min',
          status: 'Replied' as const,
        },
        {
          id: 'w3',
          name: 'Anika Kapoor',
          lastMessage: 'What is the fee for Little Learners?',
          time: '1 hr',
          status: 'Pending' as const,
        },
        {
          id: 'w4',
          name: 'Kabir Banerjee',
          lastMessage: 'Looking forward to the demo class.',
          time: '2 hr',
          status: 'Replied' as const,
        },
      ],
    },
    channels: [
      { channel: 'Email', leads: Math.round(142 * scale), engagement: 72, conversions: Math.round(18 * scale) },
      { channel: 'WhatsApp', leads: Math.round(312 * scale), engagement: 88, conversions: Math.round(59 * scale) },
      { channel: 'Facebook', leads: Math.round(428 * scale), engagement: 81, conversions: Math.round(86 * scale) },
      {
        channel: 'Website Forms',
        leads: Math.round(286 * scale),
        engagement: 64,
        conversions: Math.round(41 * scale),
      },
      {
        channel: 'Manual Enquiries',
        leads: Math.round(80 * scale),
        engagement: 55,
        conversions: Math.round(12 * scale),
      },
    ],
    conversionOverall: 14.7,
    conversionBySource: [
      { source: 'Website', rate: 12.4 },
      { source: 'Facebook', rate: 20.1 },
      { source: 'WhatsApp', rate: 18.8 },
      { source: 'Email', rate: 15.6 },
      { source: 'Forms', rate: 16.9 },
    ],
    topSources: [
      { source: 'Facebook', enquiries: Math.round(428 * scale), conversions: Math.round(86 * scale), conversionRate: 20.1, trend: 'up' },
      { source: 'WhatsApp', enquiries: Math.round(312 * scale), conversions: Math.round(59 * scale), conversionRate: 18.9, trend: 'up' },
      { source: 'Website', enquiries: Math.round(286 * scale), conversions: Math.round(41 * scale), conversionRate: 14.3, trend: 'up' },
      { source: 'Email', enquiries: Math.round(142 * scale), conversions: Math.round(18 * scale), conversionRate: 12.7, trend: 'flat' },
      { source: 'Forms', enquiries: Math.round(80 * scale), conversions: Math.round(12 * scale), conversionRate: 15.0, trend: 'up' },
    ],
    recentEnquiries,
  };
}

function relativeFromIso(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

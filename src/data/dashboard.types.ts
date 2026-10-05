export type KpiPanelId = 'rooms' | 'staff' | 'students' | 'ratio';

export type AttendanceScope = 'center' | 'class';

export type AttendanceCounts = {
  in: number;
  out: number;
  absent: number;
  pending: number;
};

export type AttendanceSnapshot = {
  studentLeave: number;
  staffLeave: number;
  absentFrom3Days: number;
  students: AttendanceCounts;
  staff: AttendanceCounts;
};

export type DashboardKpi = {
  id: KpiPanelId;
  label: string;
  value: number | string;
  animateNumber?: number;
  icon: string;
  tone: 'pink' | 'purple' | 'green' | 'coral';
};

export type RoomRecord = {
  id: string;
  name: string;
  students: number;
  staff: number;
  capacity: number;
  ageRange: string;
  occupancyPct: number;
  status: 'active' | 'quiet' | 'full';
};

export type StaffRecord = {
  id: string;
  name: string;
  role: string;
  room: string;
  status: 'Active' | 'On Leave' | 'Pending';
  initials: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  age: string;
  room: string;
  status: 'Active' | 'On Leave' | 'Pending';
  initials: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  time: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
};

export type DashboardBundle = {
  kpis: DashboardKpi[];
  attendance: Record<AttendanceScope, AttendanceSnapshot>;
  rooms: RoomRecord[];
  staff: StaffRecord[];
  students: StudentRecord[];
  activity: {
    incidents: number;
    photos: number;
    videos: number;
    announcements: number;
    approvalPending: number;
  };
  parentCommunication: {
    concernsPending: number;
    concernsReportedToday: number;
    notesPending: number;
    notesCreatedToday: number;
    leavesPending: number;
    leavesOutToday: number;
  };
  enquiries: {
    newEnquiries: number;
    totalAdmissions: number;
    followupOverdue: number;
    periodLabel: string;
    chart: { label: string; value: number }[];
  };
  billing: {
    totalBilled: number;
    totalCollected: number;
    currency: string;
    periodLabel: string;
    ageing: { label: string; value: number; color: string }[];
  };
  installations: {
    parentsInstalled: number;
    parentsNotInstalled: number;
    staffInstalled: number;
    staffNotInstalled: number;
  };
  weeklyAttendance: { day: string; present: number; absent: number }[];
  ageGroups: { label: string; count: number }[];
  quickActions: { id: string; title: string; description: string; href: string }[];
  recentActivities: ActivityItem[];
  announcements: { id: string; title: string; body: string; when: string }[];
  notifications: { id: string; title: string; when: string; unread: boolean }[];
  upcomingBirthdays: { name: string; when: string; room: string }[];
  upcomingHolidays: { title: string; when: string }[];
  upcomingEvents: { title: string; when: string; room: string }[];
  todaySummary: {
    checkIns: number;
    checkOuts: number;
    posts: number;
    messages: number;
    utilization: number;
  };
  ratioInsights: {
    target: string;
    current: string;
    compliantRooms: number;
    watchRooms: number;
    byRoom: { room: string; ratio: string; status: 'ok' | 'watch' }[];
  };
};

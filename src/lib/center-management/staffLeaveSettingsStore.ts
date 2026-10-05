import { STAFF_ROLES } from './staffStore';

export type PolicyLeaveRow = {
  id: string;
  leaveType: string;
  totalLeave: number;
  monthlyIncrement: number;
  defaultLeave: number;
  halfDay: boolean;
};

export type RolePolicyGroup = {
  id: string;
  roles: string[];
  allowNegative: boolean;
  rows: PolicyLeaveRow[];
  collapsed?: boolean;
};

export type LeaveHoliday = {
  id: string;
  name: string;
  start: string;
  end: string;
};

export type WeekendDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type WeekendConfig = {
  days: WeekendDay[];
  /** day -> weeks 1..5 enabled */
  weeks: Record<string, boolean[]>;
};

export type StaffLeaveSettings = {
  sessionFrom: string;
  sessionTo: string;
  allRolesAllowNegative: boolean;
  allRolesRows: PolicyLeaveRow[];
  roleGroups: RolePolicyGroup[];
  holidays: LeaveHoliday[];
  weekend: WeekendConfig;
};

const STORAGE_KEY = 'panacea.cm.staffLeaveSettings';
const VERSION_KEY = 'panacea.cm.staffLeaveSettings.version';
const VERSION = '1';

export const SETTINGS_ROLE_OPTIONS = [
  'Finance Admin',
  ...STAFF_ROLES,
];

export const WEEKEND_DAY_OPTIONS: WeekendDay[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function defaultRows(): PolicyLeaveRow[] {
  return [
    {
      id: 'plt-sick',
      leaveType: 'Sick Leave',
      totalLeave: 12,
      monthlyIncrement: 1,
      defaultLeave: 12,
      halfDay: true,
    },
    {
      id: 'plt-casual',
      leaveType: 'Casual Leave',
      totalLeave: 12,
      monthlyIncrement: 1,
      defaultLeave: 12,
      halfDay: true,
    },
    {
      id: 'plt-medical',
      leaveType: 'Medical Leave',
      totalLeave: 12,
      monthlyIncrement: 1,
      defaultLeave: 12,
      halfDay: false,
    },
  ];
}

function emptyWeeks(): boolean[] {
  return [true, true, true, true, true];
}

function seedSettings(): StaffLeaveSettings {
  const year = new Date().getFullYear();
  return {
    sessionFrom: `${year}-01-01`,
    sessionTo: `${year + 1}-01-01`,
    allRolesAllowNegative: true,
    allRolesRows: defaultRows(),
    roleGroups: [
      {
        id: 'rpg-teacher',
        roles: ['Teacher'],
        allowNegative: true,
        rows: defaultRows().map((r) => ({ ...r, id: `${r.id}-teacher` })),
        collapsed: false,
      },
    ],
    holidays: [
      {
        id: 'hol-1',
        name: 'Special Holiday',
        start: `${year}-07-31`,
        end: `${year}-08-01`,
      },
    ],
    weekend: {
      days: ['Sunday'],
      weeks: { Sunday: emptyWeeks() },
    },
  };
}

export function loadStaffLeaveSettings(): StaffLeaveSettings {
  if (typeof window === 'undefined') return seedSettings();
  try {
    if (localStorage.getItem(VERSION_KEY) !== VERSION) {
      const seeded = seedSettings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(VERSION_KEY, VERSION);
      return seeded;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedSettings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as StaffLeaveSettings;
  } catch {
    return seedSettings();
  }
}

export function saveStaffLeaveSettings(next: StaffLeaveSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(VERSION_KEY, VERSION);
  } catch {
    /* ignore */
  }
}

export function holidayDayCount(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end || start}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

export function formatHolidayRange(start: string, end: string) {
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      weekday: 'short',
    });
  };
  if (!end || end === start) return fmt(start);
  return `${fmt(start)} - ${fmt(end)}`;
}

export function cloneDefaultPolicyRows(suffix: string): PolicyLeaveRow[] {
  return defaultRows().map((r) => ({ ...r, id: `${r.id}-${suffix}` }));
}

export type UserRole = 'organization_admin' | 'center_admin' | 'staff';

export type CenterStatus = 'active' | 'inactive';

export type Center = {
  id: string;
  name: string;
  code: string;
  city: string;
  status: CenterStatus;
  /** Display short label in switcher */
  shortName: string;
};

export type Organization = {
  id: string;
  name: string;
  centers: Center[];
};

/** Active workspace scope for the shell + modules */
export type CenterScope = 'all' | string;

export type CenterStats = {
  centerId: string;
  students: number;
  staff: number;
  rooms: number;
  attendanceIn: number;
  attendancePending: number;
  enquiriesOpen: number;
  formsLive: number;
};

export type OrgSession = {
  role: UserRole;
  orgId: string;
  /** Centers this user can access */
  centerIds: string[];
  /** Persisted UI scope */
  activeScope: CenterScope;
};

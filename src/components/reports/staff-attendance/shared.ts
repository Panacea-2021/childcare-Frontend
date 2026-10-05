import {
  MOCK_STAFF,
  type MockStaff,
  type StaffAttendanceBaseForm,
  type StaffFilterBy,
} from './types';

export function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function eachDate(start: string, end: string) {
  const out: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function filterStaffMembers(
  values: Pick<StaffAttendanceBaseForm, 'filterBy' | 'departments' | 'staffId'>,
  opts?: { activeOnly?: boolean },
): MockStaff[] {
  let list = [...MOCK_STAFF];

  if (opts?.activeOnly) {
    list = list.filter((s) => s.status === 'Active' || s.status === 'Probation' || s.status === 'On Leave');
  }

  if (values.filterBy === 'staff') {
    if (!values.staffId) return [];
    return list.filter((s) => s.id === values.staffId);
  }

  if (values.departments.length) {
    list = list.filter((s) => values.departments.includes(s.department));
  }

  return list;
}

export function staffSelectionLabel(values: {
  filterBy: StaffFilterBy;
  departments: string[];
  staffId: string | null;
}) {
  if (values.filterBy === 'staff') {
    const staff = MOCK_STAFF.find((s) => s.id === values.staffId);
    return staff ? staff.name : 'No staff selected';
  }
  if (values.departments.length) return values.departments.join(', ');
  return 'All departments';
}

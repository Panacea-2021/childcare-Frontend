'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Palmtree } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsStaffLeaveSection.module.css';

type LeaveType = {
  id: string;
  name: string;
  total: number;
  monthlyIncrement: number;
  defaultLeave: number;
  halfDay: boolean;
};

type RolePolicy = {
  id: string;
  name: string;
  isGeneral: boolean;
  allowNegative: boolean;
  leaves: LeaveType[];
  open: boolean;
};

type Holiday = {
  id: string;
  name: string;
  start: string;
  end: string;
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

type TabId = 'policy' | 'holiday' | 'weekend';

const SESSION_LABEL = '01/01/2026 - 01/01/2027';
const POLICIES_STORAGE_KEY = 'panacea.settings.staffLeave.policies.v2';
const HOLIDAYS_STORAGE_KEY = 'panacea.settings.staffLeave.holidays.v1';

const ROLE_OPTIONS = [
  'Center Head',
  'Super Admin',
  'Principal',
  'Finance Admin',
  'Administrator',
  'Senior Teacher',
  'Head Teacher',
  'Super User',
  'Teacher',
];

const WEEKEND_DAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WEEK_COLS = ['1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week'] as const;

const DEFAULT_LEAVES: LeaveType[] = [
  { id: 'l-sick', name: 'Sick Leave', total: 12, monthlyIncrement: 1, defaultLeave: 12, halfDay: true },
  { id: 'l-casual', name: 'Casual Leave', total: 12, monthlyIncrement: 1, defaultLeave: 12, halfDay: false },
  { id: 'l-medical', name: 'Medical Leave', total: 12, monthlyIncrement: 1, defaultLeave: 12, halfDay: true },
];

function cloneLeaves(): LeaveType[] {
  return DEFAULT_LEAVES.map((l) => ({ ...l, id: `${l.id}-${Math.random().toString(36).slice(2, 7)}` }));
}

function defaultPolicies(): RolePolicy[] {
  return [
    {
      id: 'all-roles',
      name: 'All Roles',
      isGeneral: true,
      allowNegative: true,
      leaves: cloneLeaves(),
      open: true,
    },
    {
      id: 'teacher',
      name: 'Teacher',
      isGeneral: false,
      allowNegative: true,
      leaves: cloneLeaves(),
      open: true,
    },
  ];
}

function loadPolicies(): RolePolicy[] {
  if (typeof window === 'undefined') return defaultPolicies();
  try {
    const raw = window.sessionStorage.getItem(POLICIES_STORAGE_KEY);
    if (!raw) return defaultPolicies();
    const parsed = JSON.parse(raw) as RolePolicy[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultPolicies();
    return parsed.map((p) => ({
      ...p,
      leaves: Array.isArray(p.leaves) ? p.leaves.map((l) => ({ ...l })) : cloneLeaves(),
    }));
  } catch {
    return defaultPolicies();
  }
}

function savePoliciesToSession(list: RolePolicy[]) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function defaultHolidays(): Holiday[] {
  return [{ id: 'h1', name: 'Special Holiday', start: '2026-07-31', end: '2026-08-01' }];
}

function loadHolidays(): Holiday[] {
  if (typeof window === 'undefined') return defaultHolidays();
  try {
    const raw = window.sessionStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (!raw) return defaultHolidays();
    const parsed = JSON.parse(raw) as Holiday[];
    if (!Array.isArray(parsed)) return defaultHolidays();
    return parsed.map((h) => ({ ...h }));
  } catch {
    return defaultHolidays();
  }
}

function saveHolidaysToSession(list: Holiday[]) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function formatHolidayRange(start: string, end: string) {
  const fmt = (iso: string) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
  };
  const a = fmt(start);
  const b = fmt(end || start);
  return `${a} - ${b}`;
}

function holidayDays(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${(end || start)}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const diff = Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
  return Math.max(1, diff);
}

function CircleCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className={styles.check} htmlFor={id}>
      <input
        id={id}
        className={styles.checkInput}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.circle} ${checked ? styles.circleOn : ''}`} aria-hidden>
        {checked ? (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span>{label}</span>
    </label>
  );
}

export function SettingsStaffLeaveSection() {
  const [tab, setTab] = useState<TabId>('policy');
  const [toast, setToast] = useState<ToastState>(null);

  const [policies, setPoliciesState] = useState<RolePolicy[]>(() => loadPolicies());

  const setPolicies = useCallback((next: RolePolicy[] | ((prev: RolePolicy[]) => RolePolicy[])) => {
    setPoliciesState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      savePoliciesToSession(resolved);
      return resolved;
    });
  }, []);

  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leavePolicyId, setLeavePolicyId] = useState<string | null>(null);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    name: '',
    total: '12',
    monthlyIncrement: '1',
    defaultLeave: '12',
    halfDay: true,
  });

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [roleQuery, setRoleQuery] = useState('');
  const [pickedRoles, setPickedRoles] = useState<string[]>([]);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const pickedRolesRef = useRef<string[]>([]);
  pickedRolesRef.current = pickedRoles;

  const [year, setYear] = useState('2026');
  const [holidays, setHolidaysState] = useState<Holiday[]>(() => loadHolidays());
  const setHolidays = useCallback((next: Holiday[] | ((prev: Holiday[]) => Holiday[])) => {
    setHolidaysState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      saveHolidaysToSession(resolved);
      return resolved;
    });
  }, []);
  const [holidaySortAsc, setHolidaySortAsc] = useState(true);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayForm, setHolidayForm] = useState({ name: '', start: '', end: '' });

  const [weekendDays, setWeekendDays] = useState<string[]>(['Sunday']);
  const [weekendMatrix, setWeekendMatrix] = useState<Record<string, boolean[]>>({
    Sunday: [true, true, true, true, true],
  });
  const [weekendBaseline, setWeekendBaseline] = useState(() =>
    JSON.stringify({ days: ['Sunday'], matrix: { Sunday: [true, true, true, true, true] } }),
  );
  const [weekendOpen, setWeekendOpen] = useState(false);
  const weekendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuKey(null);
      // While Add Role modal is open, do NOT auto-close the role list on
      // mousedown — closing it shrinks the modal and can swallow the Submit click.
      if (
        !roleModalOpen &&
        roleRef.current &&
        !roleRef.current.contains(target)
      ) {
        setRoleOpen(false);
      }
      if (weekendRef.current && !weekendRef.current.contains(target)) setWeekendOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [roleModalOpen]);

  const syncPickedRoles = (next: string[]) => {
    pickedRolesRef.current = next;
    setPickedRoles(next);
  };

  const togglePickedRole = (role: string) => {
    const cur = pickedRolesRef.current;
    const next = cur.includes(role) ? cur.filter((x) => x !== role) : [...cur, role];
    syncPickedRoles(next);
  };

  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    const taken = new Set(
      policies
        .filter((p) => !p.isGeneral && p.id !== editingPolicyId)
        .map((p) => p.name.toLowerCase()),
    );
    return ROLE_OPTIONS.filter((r) => {
      if (taken.has(r.toLowerCase())) return false;
      return !q || r.toLowerCase().includes(q);
    });
  }, [roleQuery, policies, editingPolicyId]);

  const openConfigureRoles = () => {
    setEditingPolicyId(null);
    syncPickedRoles([]);
    setRoleQuery('');
    setRoleOpen(true);
    setRoleModalOpen(true);
  };

  const openEditPolicyRoles = (policy: RolePolicy) => {
    setEditingPolicyId(policy.id);
    syncPickedRoles([policy.name]);
    setRoleQuery('');
    setRoleOpen(true);
    setRoleModalOpen(true);
  };

  const closeRoleModal = useCallback(() => {
    setRoleModalOpen(false);
    setEditingPolicyId(null);
    pickedRolesRef.current = [];
    setPickedRoles([]);
    setRoleQuery('');
    setRoleOpen(false);
  }, []);

  const yearHolidays = useMemo(() => {
    let list = holidays.filter((h) => h.start.startsWith(year) || (h.end && h.end.startsWith(year)));
    list = [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return holidaySortAsc ? cmp : -cmp;
    });
    return list;
  }, [holidays, year, holidaySortAsc]);

  const weekendDirty =
    JSON.stringify({ days: weekendDays, matrix: weekendMatrix }) !== weekendBaseline;

  const togglePolicy = (id: string) => {
    setPolicies((list) => list.map((p) => (p.id === id ? { ...p, open: !p.open } : p)));
  };

  const setAllowNegative = (id: string, next: boolean) => {
    setPolicies((list) => list.map((p) => (p.id === id ? { ...p, allowNegative: next } : p)));
  };

  const openAddLeave = (policyId: string) => {
    setLeavePolicyId(policyId);
    setEditingLeaveId(null);
    setLeaveForm({ name: '', total: '12', monthlyIncrement: '1', defaultLeave: '12', halfDay: true });
    setMenuKey(null);
    setLeaveModalOpen(true);
  };

  const openEditLeave = (policyId: string, leave: LeaveType) => {
    setLeavePolicyId(policyId);
    setEditingLeaveId(leave.id);
    setLeaveForm({
      name: leave.name,
      total: String(leave.total),
      monthlyIncrement: String(leave.monthlyIncrement),
      defaultLeave: String(leave.defaultLeave),
      halfDay: leave.halfDay,
    });
    setMenuKey(null);
    setLeaveModalOpen(true);
  };

  const saveLeave = () => {
    if (!leavePolicyId) return;
    if (!leaveForm.name.trim()) {
      setToast({ type: 'err', message: 'Leave type is required' });
      return;
    }
    const next: LeaveType = {
      id: editingLeaveId ?? `l-${Date.now()}`,
      name: leaveForm.name.trim(),
      total: Number(leaveForm.total) || 0,
      monthlyIncrement: Number(leaveForm.monthlyIncrement) || 0,
      defaultLeave: Number(leaveForm.defaultLeave) || 0,
      halfDay: leaveForm.halfDay,
    };
    setPolicies((list) =>
      list.map((p) => {
        if (p.id !== leavePolicyId) return p;
        if (editingLeaveId) {
          return { ...p, leaves: p.leaves.map((l) => (l.id === editingLeaveId ? next : l)) };
        }
        return { ...p, leaves: [...p.leaves, next] };
      }),
    );
    setLeaveModalOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const deleteLeave = (policyId: string, leaveId: string) => {
    setPolicies((list) =>
      list.map((p) => (p.id === policyId ? { ...p, leaves: p.leaves.filter((l) => l.id !== leaveId) } : p)),
    );
    setMenuKey(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const deletePolicy = (id: string) => {
    setPolicies((list) => list.filter((p) => p.id !== id));
    setToast({ type: 'ok', message: 'Saved' });
  };

  const saveRolePolicy = () => {
    let selected = [...pickedRolesRef.current];

    // If user typed a role name but didn't chip-select it, still accept the match.
    if (selected.length === 0) {
      const q = roleQuery.trim().toLowerCase();
      if (q) {
        const exact = ROLE_OPTIONS.find((r) => r.toLowerCase() === q);
        const soft =
          exact ??
          ROLE_OPTIONS.find(
            (r) =>
              r.toLowerCase().includes(q) ||
              q.includes(r.toLowerCase()) ||
              // common typo: principle → principal
              (q.startsWith('princip') && r.toLowerCase() === 'principal'),
          );
        if (soft) selected = [soft];
      }
    }

    if (selected.length === 0) {
      setToast({ type: 'err', message: 'Please select at least one role from the list' });
      return;
    }

    if (editingPolicyId) {
      const nextName = selected[0];
      const clash = policies.some(
        (p) => p.id !== editingPolicyId && !p.isGeneral && p.name.toLowerCase() === nextName.toLowerCase(),
      );
      if (clash) {
        setToast({ type: 'err', message: 'A leave policy for this role already exists' });
        return;
      }

      setPolicies((list) => {
        const renamed = list.map((p) =>
          p.id === editingPolicyId ? { ...p, name: nextName, open: true } : p,
        );
        const existing = new Set(renamed.map((p) => p.name.toLowerCase()));
        const extras = selected
          .slice(1)
          .filter((role) => !existing.has(role.toLowerCase()))
          .map((role, index) => ({
            id: `role-${Date.now()}-${index}-${role.toLowerCase().replace(/\s+/g, '-')}`,
            name: role,
            isGeneral: false,
            allowNegative: true,
            leaves: cloneLeaves(),
            open: true,
          }));
        return extras.length ? [...renamed, ...extras] : renamed;
      });
      closeRoleModal();
      setToast({ type: 'ok', message: `Leave policy saved for ${selected.join(', ')}` });
      return;
    }

    const existingNow = new Set(policies.map((p) => p.name.trim().toLowerCase()));
    const toCreate = selected.filter((role) => !existingNow.has(role.trim().toLowerCase()));
    if (toCreate.length === 0) {
      setToast({ type: 'err', message: 'Selected roles already have leave policies' });
      closeRoleModal();
      return;
    }

    setPolicies((list) => {
      const existing = new Set(list.map((p) => p.name.trim().toLowerCase()));
      const additions = toCreate
        .filter((role) => !existing.has(role.trim().toLowerCase()))
        .map((role, index) => ({
          id: `role-${Date.now()}-${index}-${role.toLowerCase().replace(/\s+/g, '-')}`,
          name: role,
          isGeneral: false,
          allowNegative: true,
          leaves: cloneLeaves(),
          open: true,
        }));
      if (additions.length === 0) return list;
      return [...list, ...additions];
    });

    closeRoleModal();
    setToast({
      type: 'ok',
      message:
        toCreate.length === 1
          ? `Leave policy created for ${toCreate[0]}`
          : `Leave policies created for ${toCreate.join(', ')}`,
    });
    window.setTimeout(() => {
      const el = document.querySelector(`[data-policy-name="${CSS.escape(toCreate[0])}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const openAddHoliday = () => {
    setEditingHolidayId(null);
    setHolidayForm({ name: '', start: '', end: '' });
    setHolidayModalOpen(true);
  };

  const openEditHoliday = (h: Holiday) => {
    setEditingHolidayId(h.id);
    setHolidayForm({ name: h.name, start: h.start, end: h.end });
    setHolidayModalOpen(true);
  };

  const closeHolidayModal = () => {
    setHolidayModalOpen(false);
    setEditingHolidayId(null);
    setHolidayForm({ name: '', start: '', end: '' });
  };

  const saveHoliday = () => {
    if (!holidayForm.name.trim() || !holidayForm.start) {
      setToast({ type: 'err', message: 'Please fill Name and Start Date' });
      return;
    }
    const start = holidayForm.start;
    const end = holidayForm.end || holidayForm.start;
    if (end < start) {
      setToast({ type: 'err', message: 'End Date cannot be before Start Date' });
      return;
    }
    const next: Holiday = {
      id: editingHolidayId ?? `h-${Date.now()}`,
      name: holidayForm.name.trim(),
      start,
      end,
    };
    setHolidays((list) =>
      editingHolidayId ? list.map((h) => (h.id === editingHolidayId ? next : h)) : [next, ...list],
    );
    // Keep year filter on the holiday so it shows up in the list immediately
    setYear(start.slice(0, 4));
    closeHolidayModal();
    setToast({
      type: 'ok',
      message: editingHolidayId ? 'Holiday updated' : 'Holiday added',
    });
  };

  const deleteHoliday = (id: string) => {
    setHolidays((list) => list.filter((h) => h.id !== id));
    setToast({ type: 'ok', message: 'Holiday deleted' });
  };

  const addWeekendDay = (day: string) => {
    if (weekendDays.includes(day)) return;
    setWeekendDays((d) => [...d, day]);
    // New days start with all weeks unchecked — user must pick at least one before Save.
    setWeekendMatrix((m) => ({ ...m, [day]: [false, false, false, false, false] }));
  };

  const removeWeekendDay = (day: string) => {
    setWeekendDays((d) => d.filter((x) => x !== day));
    setWeekendMatrix((m) => {
      const copy = { ...m };
      delete copy[day];
      return copy;
    });
  };

  const toggleWeek = (day: string, weekIdx: number) => {
    setWeekendMatrix((m) => {
      const row = [...(m[day] ?? [false, false, false, false, false])];
      row[weekIdx] = !row[weekIdx];
      return { ...m, [day]: row };
    });
  };

  const saveWeekend = () => {
    if (weekendDays.length === 0) {
      setToast({ type: 'err', message: 'Please select at least one weekend day.' });
      return;
    }
    const missingWeek = weekendDays.some((day) => {
      const row = weekendMatrix[day] ?? [false, false, false, false, false];
      return !row.some(Boolean);
    });
    if (missingWeek) {
      setToast({
        type: 'err',
        message: 'Please select at least one week for each selected weekend day.',
      });
      return;
    }
    setWeekendBaseline(JSON.stringify({ days: weekendDays, matrix: weekendMatrix }));
    setToast({ type: 'ok', message: 'Weekend configuration saved' });
  };

  const renderLeaveTable = (policy: RolePolicy) => (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Total Leave</th>
              <th>Monthly Increment</th>
              <th>Default Leave</th>
              <th>Half Day Leave</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {policy.leaves.map((leave) => {
              const key = `${policy.id}:${leave.id}`;
              return (
                <tr key={leave.id}>
                  <td className={styles.leaveName}>{leave.name}</td>
                  <td>{leave.total}</td>
                  <td>{leave.monthlyIncrement.toFixed(2)}</td>
                  <td>{leave.defaultLeave}</td>
                  <td>{leave.halfDay ? 'Yes' : 'No'}</td>
                  <td className={styles.actionsCell}>
                    <div ref={menuKey === key ? menuRef : undefined}>
                      <button
                        type="button"
                        className={styles.menuBtn}
                        aria-label={`Actions for ${leave.name}`}
                        onClick={() => setMenuKey((k) => (k === key ? null : key))}
                      >
                        ⋮
                      </button>
                      {menuKey === key ? (
                        <div className={styles.menu} role="menu">
                          <button
                            type="button"
                            className={styles.menuItem}
                            onClick={() => openEditLeave(policy.id, leave)}
                          >
                            <span aria-hidden>✎</span> Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.menuItem} ${styles.menuDanger}`}
                            onClick={() => deleteLeave(policy.id, leave.id)}
                          >
                            <span aria-hidden>🗑</span> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className={`ui-btn ui-btn-outline ${styles.addOutline}`} onClick={() => openAddLeave(policy.id)}>
        + Add
      </button>
    </>
  );

  return (
    <SettingsSectionShell
      title="Staff Leave Management"
      description="Configure leave policies, holidays, and weekend rules."
      icon={<Palmtree />}
    >
    <div className={styles.root}>
      <div className={styles.tabs} role="tablist">
        {(
          [
            { id: 'policy', label: 'Leave Policy' },
            { id: 'holiday', label: 'Holiday Calendar' },
            { id: 'weekend', label: 'Weekend Configuration' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'policy' ? (
        <div className={styles.tabBody}>
          <p className={styles.sessionNote}>
            <span aria-hidden>ⓘ</span> The leave policies will be applicable for the entire session year (
            {SESSION_LABEL}).
          </p>

          {policies.map((policy) => (
            <section
              key={policy.id}
              className={styles.policyCard}
              data-policy-name={policy.name}
            >
              <div className={styles.policyHead}>
                <button type="button" className={styles.policyToggle} onClick={() => togglePolicy(policy.id)}>
                  <span className={`${styles.chevron} ${policy.open ? styles.chevronOpen : ''}`} aria-hidden>
                    ›
                  </span>
                  <span className={styles.policyTitleBlock}>
                    <span className={styles.policyTitle}>{policy.name}</span>
                    {!policy.isGeneral ? (
                      <span className={styles.policyHint}>
                        This policy overrides the general leave policy for these roles
                      </span>
                    ) : null}
                  </span>
                </button>
                <div className={styles.policyHeadActions}>
                  <CircleCheck
                    id={`neg-${policy.id}`}
                    label="Allow Negative Leave Balance"
                    checked={policy.allowNegative}
                    onChange={(n) => setAllowNegative(policy.id, n)}
                  />
                  {!policy.isGeneral ? (
                    <>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={`Edit ${policy.name}`}
                        onClick={() => openEditPolicyRoles(policy)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconDanger}`}
                        aria-label={`Delete ${policy.name}`}
                        onClick={() => deletePolicy(policy.id)}
                      >
                        🗑
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              {policy.open ? <div className={styles.policyBody}>{renderLeaveTable(policy)}</div> : null}
            </section>
          ))}

          <section className={styles.configureCard}>
            <p className={styles.configureText}>Create a separate leave policy for selected roles</p>
            <button
              type="button"
              className={`ui-btn ui-btn-outline ${styles.addOutline}`}
              onClick={openConfigureRoles}
            >
              Configure
            </button>
          </section>
        </div>
      ) : null}

      {tab === 'holiday' ? (
        <div className={styles.tabBody}>
          <div className={styles.holidayToolbar}>
            <select className={`ui-select ${styles.yearSelect}`} value={year} onChange={(e) => setYear(e.target.value)}>
              {['2025', '2026', '2027'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openAddHoliday}>
              + Add Holiday
            </button>
          </div>

          <section className={styles.card}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className={styles.sortBtn}
                        onClick={() => setHolidaySortAsc((v) => !v)}
                        title="Click to sort ascending"
                      >
                        Holidays <span aria-hidden>↑↓</span>
                      </button>
                    </th>
                    <th>Date range</th>
                    <th>Number of days</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {yearHolidays.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className={styles.empty}>No holidays for {year}</div>
                      </td>
                    </tr>
                  ) : (
                    yearHolidays.map((h) => (
                      <tr key={h.id}>
                        <td className={styles.leaveName}>{h.name}</td>
                        <td>{formatHolidayRange(h.start, h.end)}</td>
                        <td>{holidayDays(h.start, h.end)}</td>
                        <td className={styles.holidayActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            aria-label={`Edit ${h.name}`}
                            title="Edit"
                            onClick={() => openEditHoliday(h)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M12 20h9"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                              <path
                                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconDanger}`}
                            aria-label={`Delete ${h.name}`}
                            title="Delete"
                            onClick={() => deleteHoliday(h.id)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M4 7h16"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <path
                                d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'weekend' ? (
        <div className={styles.tabBody}>
          <div className={styles.weekendLabel}>
            Configure Weekend Days <span className={styles.infoDot} aria-hidden>i</span>
          </div>
          <div className={styles.multiSelect} ref={weekendRef}>
            <button
              type="button"
              className={styles.multiTrigger}
              aria-expanded={weekendOpen}
              onClick={() => setWeekendOpen((v) => !v)}
            >
              {weekendDays.length === 0 ? (
                <span className={styles.placeholder}>Select days</span>
              ) : (
                weekendDays.map((day) => (
                  <span key={day} className={styles.chip}>
                    {day}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      aria-label={`Remove ${day}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWeekendDay(day);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </button>
            {weekendOpen ? (
              <div className={styles.multiMenu} role="listbox">
                {WEEKEND_DAY_OPTIONS.map((day) => {
                  const on = weekendDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                      onClick={() => (on ? removeWeekendDay(day) : addWeekendDay(day))}
                    >
                      {day}
                      {on ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <section className={`${styles.card} ${styles.weekendCard}`}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Selected days</th>
                    {WEEK_COLS.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekendDays.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.empty}>Select weekend days above</div>
                      </td>
                    </tr>
                  ) : (
                    weekendDays.map((day) => (
                      <tr key={day}>
                        <td className={styles.leaveName}>{day}</td>
                        {(weekendMatrix[day] ?? [false, false, false, false, false]).map((on, idx) => (
                          <td key={`${day}-${idx}`} className={styles.weekCell}>
                            <button
                              type="button"
                              className={`${styles.weekCheck} ${on ? styles.weekCheckOn : ''}`}
                              aria-pressed={on}
                              aria-label={`${day} ${WEEK_COLS[idx]}`}
                              onClick={() => toggleWeek(day, idx)}
                            >
                              {on ? '✓' : ''}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.weekendFooter}>
              {weekendDirty ? <span className={styles.unsaved}>Unsaved changes</span> : <span />}
              <button type="button" className="ui-btn ui-btn-primary" onClick={saveWeekend}>
                Save
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <Modal
        open={leaveModalOpen}
        title={editingLeaveId ? 'Edit Leave Type' : 'Add Leave Type'}
        onClose={() => setLeaveModalOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveLeave}>
              Submit
            </button>
          </>
        }
      >
        <div className={styles.modalStack}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="leave-name">
              <span className={styles.req}>*</span> Leave Type
            </label>
            <input
              id="leave-name"
              className="ui-input"
              value={leaveForm.name}
              onChange={(e) => setLeaveForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sick Leave"
            />
          </div>
          <div className={styles.grid2}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="leave-total">
                Total Leave
              </label>
              <input
                id="leave-total"
                className="ui-input"
                type="number"
                value={leaveForm.total}
                onChange={(e) => setLeaveForm((f) => ({ ...f, total: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="leave-inc">
                Monthly Increment
              </label>
              <input
                id="leave-inc"
                className="ui-input"
                type="number"
                step="0.01"
                value={leaveForm.monthlyIncrement}
                onChange={(e) => setLeaveForm((f) => ({ ...f, monthlyIncrement: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.grid2}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="leave-default">
                Default Leave
              </label>
              <input
                id="leave-default"
                className="ui-input"
                type="number"
                value={leaveForm.defaultLeave}
                onChange={(e) => setLeaveForm((f) => ({ ...f, defaultLeave: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <div className="ui-label">Half Day Leave</div>
              <CircleCheck
                id="leave-half"
                label="Allow half day leave"
                checked={leaveForm.halfDay}
                onChange={(n) => setLeaveForm((f) => ({ ...f, halfDay: n }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={roleModalOpen}
        title="Add Role"
        onClose={closeRoleModal}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeRoleModal}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onMouseDown={(e) => {
                // Fire on mousedown so a layout shift from closing the dropdown
                // cannot redirect the click onto the modal backdrop/Cancel.
                e.preventDefault();
                e.stopPropagation();
                saveRolePolicy();
              }}
            >
              Submit
            </button>
          </>
        }
      >
        <p className={styles.modalNote}>
          <span aria-hidden>ⓘ</span> You can set up a separate leave policy for selected roles
        </p>
        <div className={styles.rolePicker} ref={roleRef}>
          {pickedRoles.length > 0 ? (
            <div className={styles.roleChips}>
              {pickedRoles.map((r) => (
                <span key={r} className={styles.chip}>
                  {r}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${r}`}
                    onClick={() => syncPickedRoles(pickedRolesRef.current.filter((x) => x !== r))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className={`${styles.roleField} ${roleOpen ? styles.roleFieldOpen : ''}`}>
            <input
              className={styles.roleInput}
              value={roleQuery}
              placeholder="Select Roles"
              aria-label="Select Roles"
              aria-expanded={roleOpen}
              aria-controls="staff-leave-role-menu"
              onChange={(e) => {
                setRoleQuery(e.target.value);
                setRoleOpen(true);
              }}
              onFocus={() => setRoleOpen(true)}
              onClick={() => setRoleOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const first = filteredRoles[0];
                  if (first) togglePickedRole(first);
                }
              }}
            />
            <span className={styles.roleSearchIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16.5 16.5L21 21" />
              </svg>
            </span>
          </div>
          {roleOpen ? (
            <div id="staff-leave-role-menu" className={styles.roleMenu} role="listbox">
              {filteredRoles.length === 0 ? (
                <div className={styles.roleEmpty}>No roles found</div>
              ) : (
                filteredRoles.map((r) => {
                  const on = pickedRoles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`${styles.roleOption} ${on ? styles.roleOptionOn : ''}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => togglePickedRole(r)}
                    >
                      {r}
                    </button>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={holidayModalOpen}
        title="Holiday Calendar"
        onClose={closeHolidayModal}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeHolidayModal}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveHoliday}>
              Submit
            </button>
          </>
        }
      >
        <div className={styles.modalStack}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="hol-name">
              <span className={styles.req}>*</span> Name
            </label>
            <input
              id="hol-name"
              className="ui-input"
              placeholder="Holiday name"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="hol-start">
              <span className={styles.req}>*</span> Start Date
            </label>
            <FieldDatePicker
              value={holidayForm.start}
              onChange={(start) =>
                setHolidayForm((f) => ({
                  ...f,
                  start,
                  end: f.end && f.end < start ? start : f.end,
                }))
              }
              ariaLabel="Start Date"
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="hol-end">
              End Date
            </label>
            <FieldDatePicker
              value={holidayForm.end}
              onChange={(end) => setHolidayForm((f) => ({ ...f, end }))}
              ariaLabel="End Date"
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '×'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppMultiSelect, AppSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import {
  SETTINGS_ROLE_OPTIONS,
  WEEKEND_DAY_OPTIONS,
  cloneDefaultPolicyRows,
  formatHolidayRange,
  holidayDayCount,
  loadStaffLeaveSettings,
  saveStaffLeaveSettings,
  type LeaveHoliday,
  type PolicyLeaveRow,
  type RolePolicyGroup,
  type StaffLeaveSettings,
  type WeekendDay,
} from '@/lib/center-management/staffLeaveSettingsStore';
import './staff-leave-settings.css';

const ease = [0.22, 1, 0.36, 1] as const;

type TabId = 'policy' | 'holiday' | 'weekend';
type DraftRow = {
  leaveType: string;
  totalLeave: string;
  monthlyIncrement: string;
  defaultLeave: string;
  halfDay: 'yes' | 'no';
};

type Props = {
  onBack: () => void;
  onToast: (t: { type: 'ok' | 'err'; message: string }) => void;
};

const emptyDraft = (): DraftRow => ({
  leaveType: '',
  totalLeave: '12',
  monthlyIncrement: '1.00',
  defaultLeave: '12',
  halfDay: 'yes',
});

const halfOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const roleSelectOptions = SETTINGS_ROLE_OPTIONS.map((r) => ({ value: r, label: r }));
const weekendOptions = WEEKEND_DAY_OPTIONS.map((d) => ({ value: d, label: d }));

function formatSession(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function PolicyTable({
  rows,
  adding,
  draft,
  editingId,
  onDraftChange,
  onStartAdd,
  onCancelAdd,
  onSaveAdd,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  rows: PolicyLeaveRow[];
  adding: boolean;
  draft: DraftRow;
  editingId: string | null;
  onDraftChange: (d: DraftRow) => void;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onSaveAdd: () => void;
  onStartEdit: (row: PolicyLeaveRow) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="sls-table-wrap">
      <table className="ui-table sls-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Total Leave</th>
            <th>Monthly Increment</th>
            <th>Default Leave</th>
            <th>Half Day Leave</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const editing = editingId === row.id;
            return (
              <motion.tr
                key={row.id}
                className={editing ? 'sls-row-edit' : undefined}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.28, ease }}
              >
                {editing ? (
                  <>
                    <td>
                      <input
                        className="ui-input sls-inline-input"
                        value={draft.leaveType}
                        onChange={(e) => onDraftChange({ ...draft, leaveType: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="ui-input sls-inline-input sls-num"
                        value={draft.totalLeave}
                        onChange={(e) => onDraftChange({ ...draft, totalLeave: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="ui-input sls-inline-input sls-num"
                        value={draft.monthlyIncrement}
                        onChange={(e) => onDraftChange({ ...draft, monthlyIncrement: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="ui-input sls-inline-input sls-num"
                        value={draft.defaultLeave}
                        onChange={(e) => onDraftChange({ ...draft, defaultLeave: e.target.value })}
                      />
                    </td>
                    <td>
                      <AppSelect
                        value={draft.halfDay}
                        onChange={(v) => onDraftChange({ ...draft, halfDay: v as 'yes' | 'no' })}
                        options={halfOptions}
                        className="sls-half-dd"
                      />
                    </td>
                    <td>
                      <div className="sls-inline-actions">
                        <button type="button" className="sls-ico ok" aria-label="Save" onClick={onSaveEdit}>
                          <Check size={15} />
                        </button>
                        <button type="button" className="sls-ico cancel" aria-label="Cancel" onClick={onCancelEdit}>
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <strong>{row.leaveType}</strong>
                    </td>
                    <td>{row.totalLeave}</td>
                    <td>{row.monthlyIncrement.toFixed(2)}</td>
                    <td>{row.defaultLeave}</td>
                    <td>{row.halfDay ? 'Yes' : 'No'}</td>
                    <td>
                      <AppMenu
                        align="end"
                        minWidth={140}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Pencil size={14} />,
                            onSelect: () => onStartEdit(row),
                          },
                          {
                            id: 'delete',
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            onSelect: () => onDelete(row.id, row.leaveType),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button type="button" className="sa-icon-btn" aria-label="Leave type actions" {...buttonProps}>
                            <MoreVertical size={16} />
                          </button>
                        )}
                      />
                    </td>
                  </>
                )}
              </motion.tr>
            );
          })}

          <AnimatePresence initial={false}>
            {adding ? (
              <motion.tr
                key="adding"
                className="sls-row-edit"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease }}
              >
                <td>
                  <input
                    className="ui-input sls-inline-input"
                    placeholder="Leave type"
                    value={draft.leaveType}
                    onChange={(e) => onDraftChange({ ...draft, leaveType: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="ui-input sls-inline-input sls-num"
                    value={draft.totalLeave}
                    onChange={(e) => onDraftChange({ ...draft, totalLeave: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="ui-input sls-inline-input sls-num"
                    value={draft.monthlyIncrement}
                    onChange={(e) => onDraftChange({ ...draft, monthlyIncrement: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="ui-input sls-inline-input sls-num"
                    value={draft.defaultLeave}
                    onChange={(e) => onDraftChange({ ...draft, defaultLeave: e.target.value })}
                  />
                </td>
                <td>
                  <AppSelect
                    value={draft.halfDay}
                    onChange={(v) => onDraftChange({ ...draft, halfDay: v as 'yes' | 'no' })}
                    options={halfOptions}
                    className="sls-half-dd"
                  />
                </td>
                <td>
                  <div className="sls-inline-actions">
                    <button type="button" className="sls-ico ok" aria-label="Save" onClick={onSaveAdd}>
                      <Check size={15} />
                    </button>
                    <button type="button" className="sls-ico cancel" aria-label="Cancel" onClick={onCancelAdd}>
                      <X size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ) : null}
          </AnimatePresence>
        </tbody>
      </table>

      {!adding && !editingId ? (
        <motion.button
          type="button"
          className="sls-add-link"
          onClick={onStartAdd}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={15} /> Add
        </motion.button>
      ) : null}
    </div>
  );
}

export function StaffLeaveSettingsPanel({ onBack, onToast }: Props) {
  const [tab, setTab] = useState<TabId>('policy');
  const [settings, setSettings] = useState<StaffLeaveSettings | null>(null);
  const [allCollapsed, setAllCollapsed] = useState(false);

  const [draftTarget, setDraftTarget] = useState<'all' | string | null>(null);
  const [draftMode, setDraftMode] = useState<'add' | 'edit' | null>(null);
  const [draft, setDraft] = useState<DraftRow>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureRoles, setConfigureRoles] = useState<string[]>([]);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);

  const [holidayOpen, setHolidayOpen] = useState(false);
  const [holidayEdit, setHolidayEdit] = useState<LeaveHoliday | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [holidayYear, setHolidayYear] = useState(String(new Date().getFullYear()));
  const [holidayDelete, setHolidayDelete] = useState<{ id: string; name: string } | null>(null);
  const [policyDelete, setPolicyDelete] = useState<
    | { kind: 'row'; target: 'all' | string; id: string; name: string }
    | { kind: 'group'; id: string; name: string }
    | null
  >(null);

  const [weekendDirty, setWeekendDirty] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setSettings(loadStaffLeaveSettings()), 180);
    return () => window.clearTimeout(t);
  }, []);

  const persist = (next: StaffLeaveSettings) => {
    setSettings(next);
    saveStaffLeaveSettings(next);
  };

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1, y + 2].map((n) => ({ value: String(n), label: String(n) }));
  }, []);

  const holidaysFiltered = useMemo(() => {
    if (!settings) return [];
    return settings.holidays.filter((h) => h.start.startsWith(holidayYear));
  }, [settings, holidayYear]);

  if (!settings) {
    return (
      <div className="sls-root">
        <div className="sls-skel">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const parseDraft = (): PolicyLeaveRow | null => {
    const leaveType = draft.leaveType.trim();
    const totalLeave = Number(draft.totalLeave);
    const monthlyIncrement = Number(draft.monthlyIncrement);
    const defaultLeave = Number(draft.defaultLeave);
    if (!leaveType || Number.isNaN(totalLeave) || Number.isNaN(monthlyIncrement) || Number.isNaN(defaultLeave)) {
      onToast({ type: 'err', message: 'Fill valid leave fields' });
      return null;
    }
    return {
      id: editingId || `plt-${Date.now()}`,
      leaveType,
      totalLeave,
      monthlyIncrement,
      defaultLeave,
      halfDay: draft.halfDay === 'yes',
    };
  };

  const startAdd = (target: 'all' | string) => {
    setDraftTarget(target);
    setDraftMode('add');
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const startEdit = (target: 'all' | string, row: PolicyLeaveRow) => {
    setDraftTarget(target);
    setDraftMode('edit');
    setEditingId(row.id);
    setDraft({
      leaveType: row.leaveType,
      totalLeave: String(row.totalLeave),
      monthlyIncrement: row.monthlyIncrement.toFixed(2),
      defaultLeave: String(row.defaultLeave),
      halfDay: row.halfDay ? 'yes' : 'no',
    });
  };

  const cancelDraft = () => {
    setDraftTarget(null);
    setDraftMode(null);
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const saveDraft = () => {
    if (!draftTarget || !draftMode) return;
    const row = parseDraft();
    if (!row) return;

    if (draftTarget === 'all') {
      const rows =
        draftMode === 'add'
          ? [...settings.allRolesRows, row]
          : settings.allRolesRows.map((r) => (r.id === row.id ? row : r));
      persist({ ...settings, allRolesRows: rows });
    } else {
      const roleGroups = settings.roleGroups.map((g) => {
        if (g.id !== draftTarget) return g;
        const rows =
          draftMode === 'add' ? [...g.rows, row] : g.rows.map((r) => (r.id === row.id ? row : r));
        return { ...g, rows };
      });
      persist({ ...settings, roleGroups });
    }
    cancelDraft();
    onToast({ type: 'ok', message: draftMode === 'add' ? 'Leave type added' : 'Leave type updated' });
  };

  const confirmPolicyDelete = () => {
    if (!policyDelete) return;
    if (policyDelete.kind === 'row') {
      if (policyDelete.target === 'all') {
        persist({ ...settings, allRolesRows: settings.allRolesRows.filter((r) => r.id !== policyDelete.id) });
      } else {
        persist({
          ...settings,
          roleGroups: settings.roleGroups.map((g) =>
            g.id === policyDelete.target ? { ...g, rows: g.rows.filter((r) => r.id !== policyDelete.id) } : g,
          ),
        });
      }
      onToast({ type: 'ok', message: 'Leave type removed' });
    } else {
      persist({ ...settings, roleGroups: settings.roleGroups.filter((g) => g.id !== policyDelete.id) });
      onToast({ type: 'ok', message: 'Role policy deleted' });
    }
    setPolicyDelete(null);
  };

  const openConfigure = (group?: RolePolicyGroup) => {
    if (group) {
      setEditGroupId(group.id);
      setConfigureRoles([...group.roles]);
    } else {
      setEditGroupId(null);
      setConfigureRoles([]);
    }
    setConfigureOpen(true);
  };

  const saveConfigure = () => {
    if (configureRoles.length === 0) {
      onToast({ type: 'err', message: 'Select at least one role' });
      return;
    }
    if (editGroupId) {
      persist({
        ...settings,
        roleGroups: settings.roleGroups.map((g) =>
          g.id === editGroupId ? { ...g, roles: configureRoles } : g,
        ),
      });
      onToast({ type: 'ok', message: 'Role policy updated' });
    } else {
      const group: RolePolicyGroup = {
        id: `rpg-${Date.now()}`,
        roles: configureRoles,
        allowNegative: true,
        rows: cloneDefaultPolicyRows(String(Date.now())),
        collapsed: false,
      };
      persist({ ...settings, roleGroups: [...settings.roleGroups, group] });
      onToast({ type: 'ok', message: 'Role policy created' });
    }
    setConfigureOpen(false);
    setConfigureRoles([]);
    setEditGroupId(null);
  };

  const openHolidayModal = (h?: LeaveHoliday) => {
    if (h) {
      setHolidayEdit(h);
      setHolidayName(h.name);
      setHolidayStart(h.start);
      setHolidayEnd(h.end);
    } else {
      setHolidayEdit(null);
      setHolidayName('');
      setHolidayStart(`${holidayYear}-01-01`);
      setHolidayEnd('');
    }
    setHolidayOpen(true);
  };

  const saveHoliday = () => {
    if (!holidayName.trim() || !holidayStart) {
      onToast({ type: 'err', message: 'Name and start date are required' });
      return;
    }
    const end = holidayEnd || holidayStart;
    if (end < holidayStart) {
      onToast({ type: 'err', message: 'End date must be on or after start date' });
      return;
    }
    const row: LeaveHoliday = {
      id: holidayEdit?.id || `hol-${Date.now()}`,
      name: holidayName.trim(),
      start: holidayStart,
      end,
    };
    const holidays = holidayEdit
      ? settings.holidays.map((h) => (h.id === row.id ? row : h))
      : [...settings.holidays, row];
    persist({ ...settings, holidays });
    setHolidayOpen(false);
    onToast({ type: 'ok', message: holidayEdit ? 'Holiday updated' : 'Holiday added' });
  };

  const confirmDeleteHoliday = () => {
    if (!holidayDelete) return;
    persist({ ...settings, holidays: settings.holidays.filter((h) => h.id !== holidayDelete.id) });
    setHolidayDelete(null);
    onToast({ type: 'ok', message: 'Holiday deleted' });
  };

  const setWeekendDays = (days: string[]) => {
    const typed = days as WeekendDay[];
    const weeks = { ...settings.weekend.weeks };
    for (const d of typed) {
      if (!weeks[d]) weeks[d] = [true, true, true, true, true];
    }
    persist({ ...settings, weekend: { days: typed, weeks } });
    setWeekendDirty(true);
  };

  const toggleWeekendWeek = (day: string, weekIdx: number) => {
    const prev = settings.weekend.weeks[day] || [false, false, false, false, false];
    const next = [...prev];
    next[weekIdx] = !next[weekIdx];
    persist({
      ...settings,
      weekend: {
        ...settings.weekend,
        weeks: { ...settings.weekend.weeks, [day]: next },
      },
    });
    setWeekendDirty(true);
  };

  const saveWeekend = () => {
    setWeekendDirty(false);
    onToast({ type: 'ok', message: 'Weekend configuration saved' });
  };

  return (
    <motion.div
      className="sls-root"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <div className="sls-hero">
        <button type="button" className="sl-back" onClick={onBack}>
          <ArrowLeft size={16} /> Leaves
        </button>
        <div className="sls-hero-title">
          <span className="sls-hero-badge">
            <Settings2 size={16} />
          </span>
          <div>
            <h2>Staff Leaves</h2>
            <p>Policies, holidays, and weekends for your center</p>
          </div>
        </div>
      </div>

      <div className="sls-tabs" role="tablist">
        {(
          [
            ['policy', 'Leave Policy'],
            ['holiday', 'Holiday Calendar'],
            ['weekend', 'Weekend Configuration'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={`sls-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
            {tab === id ? <motion.span layoutId="sls-tab-line" className="sls-tab-line" /> : null}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'policy' ? (
          <motion.div
            key="policy"
            className="sls-panel"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.32, ease }}
          >
            <p className="sls-session">
              <Info size={14} />
              The leave policies will be applicable for the entire session year (
              {formatSession(settings.sessionFrom)} - {formatSession(settings.sessionTo)}).
            </p>

            <motion.section
              className={`sls-card ${allCollapsed ? 'is-collapsed' : ''}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
            >
              <div className="sls-card-head">
                <button type="button" className="sls-card-toggle" onClick={() => setAllCollapsed((v) => !v)}>
                  <ChevronDown size={18} className={allCollapsed ? 'is-closed' : ''} />
                  <strong>All Roles</strong>
                </button>
                <label className="sls-check">
                  <input
                    type="checkbox"
                    checked={settings.allRolesAllowNegative}
                    onChange={(e) => persist({ ...settings, allRolesAllowNegative: e.target.checked })}
                  />
                  <span>Allow Negative Leave Balance</span>
                </label>
              </div>
              <div className={`sls-card-body ${allCollapsed ? 'is-closed' : 'is-open'}`}>
                <div className="sls-card-body-inner">
                  <PolicyTable
                    rows={settings.allRolesRows}
                    adding={draftTarget === 'all' && draftMode === 'add'}
                    draft={draft}
                    editingId={draftTarget === 'all' ? editingId : null}
                    onDraftChange={setDraft}
                    onStartAdd={() => startAdd('all')}
                    onCancelAdd={cancelDraft}
                    onSaveAdd={saveDraft}
                    onStartEdit={(row) => startEdit('all', row)}
                    onSaveEdit={saveDraft}
                    onCancelEdit={cancelDraft}
                    onDelete={(id, name) => setPolicyDelete({ kind: 'row', target: 'all', id, name })}
                  />
                </div>
              </div>
            </motion.section>

            {settings.roleGroups.map((group, gi) => (
              <motion.section
                key={group.id}
                className={`sls-card sls-card-role ${group.collapsed ? 'is-collapsed' : ''}`}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + gi * 0.05, duration: 0.35, ease }}
              >
                <div className="sls-card-head">
                  <button
                    type="button"
                    className="sls-card-toggle"
                    onClick={() =>
                      persist({
                        ...settings,
                        roleGroups: settings.roleGroups.map((g) =>
                          g.id === group.id ? { ...g, collapsed: !g.collapsed } : g,
                        ),
                      })
                    }
                  >
                    <ChevronDown size={18} className={group.collapsed ? 'is-closed' : ''} />
                    <div className="sls-role-title">
                      <strong>{group.roles.join(', ')}</strong>
                      <em>This policy overrides the general leave policy for these roles.</em>
                    </div>
                  </button>
                  <div className="sls-card-head-right">
                    <label className="sls-check">
                      <input
                        type="checkbox"
                        checked={group.allowNegative}
                        onChange={(e) =>
                          persist({
                            ...settings,
                            roleGroups: settings.roleGroups.map((g) =>
                              g.id === group.id ? { ...g, allowNegative: e.target.checked } : g,
                            ),
                          })
                        }
                      />
                      <span>Allow Negative Leave Balance</span>
                    </label>
                    <button
                      type="button"
                      className="sa-icon-btn"
                      aria-label="Edit roles"
                      onClick={() => openConfigure(group)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="sa-icon-btn"
                      aria-label="Delete policy"
                      onClick={() =>
                        setPolicyDelete({ kind: 'group', id: group.id, name: group.roles.join(', ') })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className={`sls-card-body ${group.collapsed ? 'is-closed' : 'is-open'}`}>
                  <div className="sls-card-body-inner">
                    <PolicyTable
                      rows={group.rows}
                      adding={draftTarget === group.id && draftMode === 'add'}
                      draft={draft}
                      editingId={draftTarget === group.id ? editingId : null}
                      onDraftChange={setDraft}
                      onStartAdd={() => startAdd(group.id)}
                      onCancelAdd={cancelDraft}
                      onSaveAdd={saveDraft}
                      onStartEdit={(row) => startEdit(group.id, row)}
                      onSaveEdit={saveDraft}
                      onCancelEdit={cancelDraft}
                      onDelete={(id, name) => setPolicyDelete({ kind: 'row', target: group.id, id, name })}
                    />
                  </div>
                </div>
              </motion.section>
            ))}

            <motion.div
              className="sls-configure"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.35, ease }}
            >
              <Sparkles size={18} className="sls-configure-spark" />
              <p>Create a separate leave policy for selected roles</p>
              <button type="button" className="ui-btn ui-btn-outline sls-configure-btn" onClick={() => openConfigure()}>
                Configure
              </button>
            </motion.div>
          </motion.div>
        ) : null}

        {tab === 'holiday' ? (
          <motion.div
            key="holiday"
            className="sls-panel"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="sls-holiday-bar">
              <AppSelect value={holidayYear} onChange={setHolidayYear} options={yearOptions} className="sls-year-dd" />
              <button type="button" className="ui-btn ui-btn-primary" onClick={() => openHolidayModal()}>
                <Plus size={15} /> Add Holiday
              </button>
            </div>

            <div className="sls-table-wrap">
              <table className="ui-table sls-table">
                <thead>
                  <tr>
                    <th>Holidays</th>
                    <th>Date range</th>
                    <th>Number of days</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {holidaysFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="sa-empty">
                        No holidays for {holidayYear}
                      </td>
                    </tr>
                  ) : (
                    holidaysFiltered.map((h, i) => (
                      <motion.tr
                        key={h.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.28, ease }}
                      >
                        <td>
                          <strong>{h.name}</strong>
                        </td>
                        <td>{formatHolidayRange(h.start, h.end)}</td>
                        <td>{holidayDayCount(h.start, h.end)}</td>
                        <td>
                          <div className="sls-row-btns">
                            <button
                              type="button"
                              className="sls-square-btn"
                              aria-label="Edit holiday"
                              onClick={() => openHolidayModal(h)}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="sls-square-btn"
                              aria-label="Delete holiday"
                              onClick={() => setHolidayDelete({ id: h.id, name: h.name })}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : null}

        {tab === 'weekend' ? (
          <motion.div
            key="weekend"
            className="sls-panel"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="sls-weekend-card">
              <div className="sls-weekend-field">
                <label className="ui-label">
                  Configure Weekend Days <Info size={13} />
                </label>
                <AppMultiSelect
                  values={settings.weekend.days}
                  onChange={setWeekendDays}
                  options={weekendOptions}
                  placeholder="Select weekend days"
                  searchPlaceholder="Search days"
                />
              </div>

              <div className="sls-table-wrap">
                <table className="ui-table sls-table sls-weekend-table">
                  <thead>
                    <tr>
                      <th>Selected days</th>
                      <th>1st Week</th>
                      <th>2nd Week</th>
                      <th>3rd Week</th>
                      <th>4th Week</th>
                      <th>5th Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.weekend.days.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="sa-empty">
                          Select weekend days to configure weeks
                        </td>
                      </tr>
                    ) : (
                      settings.weekend.days.map((day, i) => {
                        const weeks = settings.weekend.weeks[day] || [false, false, false, false, false];
                        return (
                          <motion.tr
                            key={day}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.28, ease }}
                          >
                            <td>
                              <strong>{day}</strong>
                            </td>
                            {weeks.map((on, wi) => (
                              <td key={wi}>
                                <button
                                  type="button"
                                  className={`sls-week-check${on ? ' is-on' : ''}`}
                                  aria-label={`${day} week ${wi + 1}`}
                                  onClick={() => toggleWeekendWeek(day, wi)}
                                >
                                  {on ? <Check size={14} /> : null}
                                </button>
                              </td>
                            ))}
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sls-weekend-foot">
                {weekendDirty ? <em className="sls-unsaved">Unsaved changes</em> : <span />}
                <button type="button" className="ui-btn ui-btn-primary" onClick={saveWeekend}>
                  <Save size={15} /> Save
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        elevated
        open={configureOpen}
        title={editGroupId ? 'Edit Roles' : 'Add Role'}
        onClose={() => setConfigureOpen(false)}
        icon={<Sparkles size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setConfigureOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveConfigure}>
              {editGroupId ? 'Save' : 'Add'}
            </button>
          </>
        }
      >
        <motion.div
          className="sls-add-role"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <p className="sls-hint">
            <Info size={15} />
            You can set up a separate leave policy for selected roles
          </p>
          <div className="ui-field">
            <label className="ui-label">Select Roles</label>
            <AppMultiSelect
              values={configureRoles}
              onChange={setConfigureRoles}
              options={roleSelectOptions}
              placeholder="Select Roles"
              searchPlaceholder="Search roles"
            />
          </div>
        </motion.div>
      </Modal>

      <Modal
        elevated
        open={holidayOpen}
        title="Holiday Calendar"
        onClose={() => setHolidayOpen(false)}
        icon={<CalendarDays size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setHolidayOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveHoliday}>
              {holidayEdit ? 'Save' : 'Submit'}
            </button>
          </>
        }
      >
        <div className="sls-holiday-form">
          <div className="ui-field">
            <label className="ui-label">
              <em>*</em> Name
            </label>
            <input
              className="ui-input"
              placeholder="Holiday name"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
            />
          </div>
          <div className="ui-grid-2">
            <div className="ui-field">
              <label className="ui-label">
                <em>*</em> Start Date
              </label>
              <DayDatePicker value={holidayStart} onChange={setHolidayStart} />
            </div>
            <div className="ui-field">
              <label className="ui-label">End Date</label>
              <DayDatePicker value={holidayEnd || holidayStart} onChange={setHolidayEnd} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        elevated
        open={Boolean(holidayDelete)}
        title="Delete holiday"
        onClose={() => setHolidayDelete(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setHolidayDelete(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDeleteHoliday}>
              <Trash2 size={15} /> Delete
            </button>
          </>
        }
      >
        <div className="sls-add-role">
          <p className="sls-hint">
            <Info size={15} />
            Delete <strong>{holidayDelete?.name}</strong>? This cannot be undone.
          </p>
        </div>
      </Modal>

      <Modal
        elevated
        open={Boolean(policyDelete)}
        title={policyDelete?.kind === 'group' ? 'Delete role policy' : 'Delete leave type'}
        onClose={() => setPolicyDelete(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPolicyDelete(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmPolicyDelete}>
              <Trash2 size={15} /> Delete
            </button>
          </>
        }
      >
        <div className="sls-add-role">
          <p className="sls-hint">
            <Info size={15} />
            {policyDelete?.kind === 'group' ? (
              <>
                Delete the leave policy for <strong>{policyDelete.name}</strong>? This cannot be undone.
              </>
            ) : (
              <>
                Delete leave type <strong>{policyDelete?.name}</strong>? This cannot be undone.
              </>
            )}
          </p>
        </div>
      </Modal>
    </motion.div>
  );
}

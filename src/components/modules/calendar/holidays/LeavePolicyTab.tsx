'use client';

import { useState, type ComponentType } from 'react';
import { LazyMotion, MotionConfig, AnimatePresence, domAnimation, m } from 'framer-motion';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  GraduationCap,
  MoreVertical,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import type { LeavePolicyGroup, LeaveTypeRow } from './types';

type Props = {
  policies: LeavePolicyGroup[];
  onChange: (next: LeavePolicyGroup[]) => void;
};

type DraftRow = {
  leaveType: string;
  totalLeave: string;
  monthlyIncrement: string;
  defaultLeave: string;
  halfDayLeave: boolean;
};

const emptyDraft = (): DraftRow => ({
  leaveType: '',
  totalLeave: '0',
  monthlyIncrement: '0.00',
  defaultLeave: '0',
  halfDayLeave: false,
});

const ROLE_ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'All Roles': UsersRound,
  Teacher: GraduationCap,
  Administrator: ShieldCheck,
  Manager: BriefcaseBusiness,
  HR: BadgeCheck,
};

function roleIcon(name: string) {
  return ROLE_ICONS[name] ?? UsersRound;
}

export function LeavePolicyTab({ policies, onChange }: Props) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(policies.map((p) => [p.id, true])),
  );
  const [addingId, setAddingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRow>(emptyDraft);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const toggle = (id: string) => setOpenIds((s) => ({ ...s, [id]: !s[id] }));

  const updatePolicy = (id: string, patch: Partial<LeavePolicyGroup>) => {
    onChange(policies.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeRow = (policyId: string, rowId: string) => {
    onChange(
      policies.map((p) =>
        p.id === policyId ? { ...p, rows: p.rows.filter((r) => r.id !== rowId) } : p,
      ),
    );
    setMenuId(null);
  };

  const startAdd = (policyId: string) => {
    setAddingId(policyId);
    setDraft(emptyDraft());
  };

  const cancelAdd = () => {
    setAddingId(null);
    setDraft(emptyDraft());
  };

  const saveAdd = (policyId: string) => {
    if (!draft.leaveType.trim()) return;
    const row: LeaveTypeRow = {
      id: `lt-${Date.now()}`,
      leaveType: draft.leaveType.trim(),
      totalLeave: Number(draft.totalLeave) || 0,
      monthlyIncrement: Number(draft.monthlyIncrement) || 0,
      defaultLeave: Number(draft.defaultLeave) || 0,
      halfDayLeave: draft.halfDayLeave,
    };
    onChange(policies.map((p) => (p.id === policyId ? { ...p, rows: [...p.rows, row] } : p)));
    setSavedFlash(policyId);
    setTimeout(() => setSavedFlash(null), 900);
    cancelAdd();
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="sh-panel sh-policy-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
        >
          <div className="sh-policy-list">
            {policies.map((policy, idx) => {
              const expanded = openIds[policy.id] !== false;
              const Icon = roleIcon(policy.name);
              return (
                <m.article
                  key={policy.id}
                  className={`sh-policy-card${savedFlash === policy.id ? ' is-saved' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <header className="sh-policy-head">
                    <button
                      type="button"
                      className="sh-policy-toggle"
                      aria-expanded={expanded}
                      onClick={() => toggle(policy.id)}
                    >
                      <m.span
                        className="sh-policy-chevron"
                        animate={{ rotate: expanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} />
                      </m.span>
                      <span className="sh-policy-icon" aria-hidden>
                        <Icon size={16} strokeWidth={1.85} />
                      </span>
                      <span className="sh-policy-title-wrap">
                        <span className="sh-policy-title">{policy.name}</span>
                        {!policy.isGeneral ? (
                          <span className="sh-policy-sub">
                            This policy overrides the general leave policy for these roles.
                          </span>
                        ) : null}
                      </span>
                      <span className="sh-soft-badge">
                        {policy.rows.length} Type{policy.rows.length === 1 ? '' : 's'}
                      </span>
                    </button>

                    <div className="sh-policy-head-actions">
                      <label className="sh-check-label">
                        <span className="sh-check">
                          <input
                            type="checkbox"
                            checked={policy.allowNegativeBalance}
                            onChange={(e) =>
                              updatePolicy(policy.id, { allowNegativeBalance: e.target.checked })
                            }
                            aria-label={`Allow negative leave balance for ${policy.name}`}
                          />
                          <span className="sh-check-ui" aria-hidden>
                            <Check size={12} strokeWidth={2.5} className="sh-check-tick" />
                          </span>
                        </span>
                        Allow Negative Leave Balance
                      </label>
                    </div>
                  </header>

                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <m.div
                        className="sh-policy-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.26 }}
                      >
                        <div className="sh-table-scroll">
                          <table className="sh-table sh-policy-table">
                            <thead>
                              <tr>
                                <th>Leave Type</th>
                                <th>Total Leave</th>
                                <th>Monthly Increment</th>
                                <th>Default Leave</th>
                                <th>Half Day Leave</th>
                                <th className="sh-th-actions">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {policy.rows.map((row, i) => (
                                <m.tr
                                  key={row.id}
                                  className="sh-row"
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                >
                                  <td>{row.leaveType}</td>
                                  <td>
                                    <span className="sh-badge sh-badge-total">{row.totalLeave}</span>
                                  </td>
                                  <td>{row.monthlyIncrement.toFixed(2)}</td>
                                  <td>
                                    <span className="sh-badge sh-badge-default">{row.defaultLeave}</span>
                                  </td>
                                  <td>
                                    <span
                                      className={`sh-yn ${row.halfDayLeave ? 'is-yes' : 'is-no'}`}
                                    >
                                      {row.halfDayLeave ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="sh-menu-wrap">
                                      <m.button
                                        type="button"
                                        className="sh-icon-btn sh-icon-more"
                                        aria-label={`Actions for ${row.leaveType}`}
                                        aria-haspopup="menu"
                                        aria-expanded={menuId === row.id}
                                        onClick={() =>
                                          setMenuId((id) => (id === row.id ? null : row.id))
                                        }
                                        whileHover={{ scale: 1.06, rotate: 90 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <MoreVertical size={15} />
                                      </m.button>
                                      <AnimatePresence>
                                        {menuId === row.id ? (
                                          <m.div
                                            className="sh-menu"
                                            role="menu"
                                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                          >
                                            <button
                                              type="button"
                                              role="menuitem"
                                              onClick={() => removeRow(policy.id, row.id)}
                                            >
                                              <Trash2 size={14} /> Delete
                                            </button>
                                          </m.div>
                                        ) : null}
                                      </AnimatePresence>
                                    </div>
                                  </td>
                                </m.tr>
                              ))}

                              {addingId === policy.id ? (
                                <m.tr
                                  className="sh-add-row"
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  <td>
                                    <input
                                      className="ui-input"
                                      value={draft.leaveType}
                                      onChange={(e) =>
                                        setDraft((d) => ({ ...d, leaveType: e.target.value }))
                                      }
                                      placeholder="Leave type"
                                      aria-label="Leave type"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="ui-input sh-num"
                                      value={draft.totalLeave}
                                      onChange={(e) =>
                                        setDraft((d) => ({ ...d, totalLeave: e.target.value }))
                                      }
                                      aria-label="Total leave"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="ui-input sh-num"
                                      value={draft.monthlyIncrement}
                                      onChange={(e) =>
                                        setDraft((d) => ({
                                          ...d,
                                          monthlyIncrement: e.target.value,
                                        }))
                                      }
                                      aria-label="Monthly increment"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="ui-input sh-num"
                                      value={draft.defaultLeave}
                                      onChange={(e) =>
                                        setDraft((d) => ({ ...d, defaultLeave: e.target.value }))
                                      }
                                      aria-label="Default leave"
                                    />
                                  </td>
                                  <td>
                                    <select
                                      className="ui-input"
                                      value={draft.halfDayLeave ? 'Yes' : 'No'}
                                      onChange={(e) =>
                                        setDraft((d) => ({
                                          ...d,
                                          halfDayLeave: e.target.value === 'Yes',
                                        }))
                                      }
                                      aria-label="Half day leave"
                                    >
                                      <option>No</option>
                                      <option>Yes</option>
                                    </select>
                                  </td>
                                  <td>
                                    <div className="sh-row-actions">
                                      <m.button
                                        type="button"
                                        className="sh-icon-btn sh-icon-edit"
                                        aria-label="Save leave type"
                                        onClick={() => saveAdd(policy.id)}
                                        whileTap={{ scale: 0.92 }}
                                      >
                                        <Check size={14} />
                                      </m.button>
                                      <m.button
                                        type="button"
                                        className="sh-icon-btn sh-icon-del"
                                        aria-label="Cancel"
                                        onClick={cancelAdd}
                                        whileTap={{ scale: 0.92 }}
                                      >
                                        <X size={14} />
                                      </m.button>
                                    </div>
                                  </td>
                                </m.tr>
                              ) : null}
                            </tbody>
                          </table>
                        </div>

                        {addingId !== policy.id ? (
                          <m.button
                            type="button"
                            className="sh-add-outline"
                            onClick={() => startAdd(policy.id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <span className="sh-add-icon" aria-hidden>
                              <Plus size={15} />
                            </span>
                            Add
                          </m.button>
                        ) : null}
                      </m.div>
                    ) : null}
                  </AnimatePresence>
                </m.article>
              );
            })}
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}

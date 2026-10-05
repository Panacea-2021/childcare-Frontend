'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  FileText,
  Heart,
  ListChecks,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, DayDatePicker, ProfileTablePagination } from '@/components/modules/center-management/ui';
import { StaffLeaveSettingsPanel } from './StaffLeaveSettingsPanel';
import {
  STAFF_LEAVE_TYPES,
  addStaffLeaveComment,
  deleteStaffLeave,
  formatAttDate,
  leaveDurationLabel,
  loadStaffLeavePermissions,
  loadStaffLeaves,
  saveStaffLeavePermissions,
  setStaffLeaveStatus,
  staffLeaveStats,
  studentInitials,
  upsertStaffLeave,
  type LeaveRolePerm,
  type StaffLeave,
} from '@/lib/center-management/staffLeavesStore';
import { dateInputValue } from '@/lib/center-management/attendanceStore';
import { STAFF_GROUP_OPTIONS, STAFF_ROOM_OPTIONS, loadStaff } from '@/lib/center-management/staffStore';

const ease = [0.22, 1, 0.36, 1] as const;

type ViewMode = 'list' | 'create' | 'comments' | 'settings';
type StatFilter = 'all' | 'today' | 'week' | 'ok' | 'pending';
type ActionTarget = { id: string; name: string } | null;

function avatarTone(name: string) {
  const tones = ['tone-a', 'tone-b', 'tone-c', 'tone-d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % tones.length;
  return tones[h];
}

type Props = {
  onToast: (t: { type: 'ok' | 'err'; message: string }) => void;
};

export function StaffLeavesPanel({ onToast }: Props) {
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [periodFrom, setPeriodFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [periodTo, setPeriodTo] = useState(`${new Date().getFullYear()}-12-31`);
  const [room, setRoom] = useState('all');
  const [group, setGroup] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [leaveType, setLeaveType] = useState('all');
  const [statFilter, setStatFilter] = useState<StatFilter>('all');
  const [bannerCollapsed, setBannerCollapsed] = useState(true);

  const [permOpen, setPermOpen] = useState(false);
  const leaveTypes = STAFF_LEAVE_TYPES;
  const [perms, setPerms] = useState<LeaveRolePerm[]>([]);
  const [approveTarget, setApproveTarget] = useState<ActionTarget>(null);
  const [denyTarget, setDenyTarget] = useState<ActionTarget>(null);
  const [denyNote, setDenyNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ActionTarget>(null);
  const [editLeave, setEditLeave] = useState<StaffLeave | null>(null);

  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [createRoom, setCreateRoom] = useState('all');
  const [createQuery, setCreateQuery] = useState('');
  const [formType, setFormType] = useState(STAFF_LEAVE_TYPES[0] || 'Sick Leave');
  const [formFrom, setFormFrom] = useState(dateInputValue());
  const [formTo, setFormTo] = useState(dateInputValue());
  const [formReason, setFormReason] = useState('');
  const [formFile, setFormFile] = useState('');

  const [commentLeave, setCommentLeave] = useState<StaffLeave | null>(null);
  const [commentText, setCommentText] = useState('');
  const [staffOnly, setStaffOnly] = useState(false);

  const refresh = () => {
    setLeaves(loadStaffLeaves());
    setPerms(loadStaffLeavePermissions());
    setLoading(false);
  };

  useEffect(() => {
    const t = window.setTimeout(() => refresh(), 320);
    return () => window.clearTimeout(t);
  }, []);

  const staffMembers = useMemo(() => loadStaff().filter((s) => s.status === 'Active'), []);

  const roomOptions = [
    { value: 'all', label: 'All Rooms' },
    ...STAFF_ROOM_OPTIONS.map((r) => ({ value: r, label: r })),
  ];
  const groupOptions = [
    { value: 'all', label: 'All Groups' },
    ...STAFF_GROUP_OPTIONS.map((g) => ({ value: g, label: g })),
  ];
  const staffOptions = [
    { value: 'all', label: 'All Staff' },
    ...staffMembers.map((s) => ({ value: s.id, label: s.name })),
  ];
  const typeOptions = [
    { value: 'all', label: 'All Leaves' },
    ...leaveTypes.map((t) => ({ value: t, label: t })),
  ];
  const leaveTypeFormOptions = leaveTypes.map((t) => ({ value: t, label: t }));

  const scoped = useMemo(() => {
    return leaves.filter((lv) => {
      if (lv.to < periodFrom || lv.from > periodTo) return false;
      if (room !== 'all' && lv.roomId && lv.roomId !== room) return false;
      if (group !== 'all') {
        const member = staffMembers.find((s) => s.id === lv.staffId);
        if (!member?.groups.includes(group)) return false;
      }
      if (staffFilter !== 'all' && lv.staffId !== staffFilter) return false;
      if (leaveType !== 'all' && lv.type !== leaveType) return false;
      return true;
    });
  }, [leaves, periodFrom, periodTo, room, group, staffFilter, leaveType, staffMembers]);

  const stats = useMemo(() => staffLeaveStats(scoped), [scoped]);
  const today = dateInputValue();
  const weekRange = useMemo(() => {
    const d = new Date(`${today}T12:00:00`);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const start = dateInputValue(d);
    const endD = new Date(`${start}T12:00:00`);
    endD.setDate(endD.getDate() + 6);
    return { start, end: dateInputValue(endD) };
  }, [today]);

  const filtered = useMemo(() => {
    const overlaps = (r: StaffLeave, a: string, b: string) => r.from <= b && r.to >= a;
    switch (statFilter) {
      case 'today':
        return scoped.filter((r) => r.status === 'Approved' && overlaps(r, today, today));
      case 'week':
        return scoped.filter((r) => r.status === 'Approved' && overlaps(r, weekRange.start, weekRange.end));
      case 'ok':
        return scoped.filter((r) => r.status === 'Approved');
      case 'pending':
        return scoped.filter((r) => r.status === 'Pending');
      default:
        return scoped;
    }
  }, [scoped, statFilter, today, weekRange]);

  const pending = scoped.filter((l) => l.status === 'Pending');
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(
    (Math.min(page, totalPages) - 1) * pageSize,
    Math.min(page, totalPages) * pageSize,
  );

  const createPool = useMemo(() => {
    const q = createQuery.trim().toLowerCase();
    return staffMembers.filter((s) => {
      if (createRoom !== 'all' && !s.rooms.includes(createRoom)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [staffMembers, createRoom, createQuery]);

  const approve = (id: string, note?: string) => {
    setLeaves(setStaffLeaveStatus(id, 'Approved', note));
    setApproveTarget(null);
    onToast({ type: 'ok', message: 'Leave approved' });
  };

  const deny = (id: string, note?: string) => {
    if (!note?.trim()) {
      onToast({ type: 'err', message: 'Add a comment when denying' });
      return;
    }
    setLeaves(setStaffLeaveStatus(id, 'Denied', note));
    setDenyTarget(null);
    setDenyNote('');
    onToast({ type: 'ok', message: 'Leave denied' });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setLeaves(deleteStaffLeave(deleteTarget.id));
    setDeleteTarget(null);
    onToast({ type: 'ok', message: 'Leave deleted' });
  };

  const saveEdit = () => {
    if (!editLeave) return;
    if (!editLeave.type || !editLeave.from || !editLeave.to || !editLeave.reason.trim()) {
      onToast({ type: 'err', message: 'Fill all edit fields' });
      return;
    }
    setLeaves(upsertStaffLeave(editLeave));
    setEditLeave(null);
    onToast({ type: 'ok', message: 'Leave updated' });
  };

  const savePerms = () => {
    saveStaffLeavePermissions(perms);
    setPermOpen(false);
    onToast({ type: 'ok', message: 'Permissions saved' });
  };

  const saveNewLeaves = () => {
    if (selectedStaff.size === 0) {
      onToast({ type: 'err', message: 'Select at least one staff member' });
      return;
    }
    if (!formType || !formFrom || !formTo || !formReason.trim()) {
      onToast({ type: 'err', message: 'Fill required leave fields' });
      return;
    }
    let next = loadStaffLeaves();
    for (const id of selectedStaff) {
      const s = staffMembers.find((x) => x.id === id);
      if (!s) continue;
      const roomName = s.rooms[0] || STAFF_ROOM_OPTIONS[0] || 'Demo Room';
      const row: StaffLeave = {
        id: `staff-leave-${Date.now()}-${id}`,
        staffId: s.id,
        staffName: s.name,
        roomId: roomName,
        roomName,
        appliedOn: dateInputValue(),
        type: formType,
        from: formFrom,
        to: formTo,
        reason: formReason.trim(),
        status: 'Pending',
        fileName: formFile || undefined,
        comments: [],
      };
      next = upsertStaffLeave(row);
    }
    setLeaves(next);
    setView('list');
    setSelectedStaff(new Set());
    setFormReason('');
    setFormFile('');
    onToast({ type: 'ok', message: 'Leave request saved' });
  };

  const postComment = () => {
    if (!commentLeave || !commentText.trim()) return;
    const next = addStaffLeaveComment(commentLeave.id, {
      author: 'Malika Thimisetty',
      role: 'Staff',
      text: commentText.trim(),
      staffOnly,
    });
    setLeaves(next);
    const updated = next.find((l) => l.id === commentLeave.id) || null;
    setCommentLeave(updated);
    setCommentText('');
    onToast({ type: 'ok', message: 'Comment posted' });
  };

  if (view === 'settings') {
    return <StaffLeaveSettingsPanel onBack={() => setView('list')} onToast={onToast} />;
  }

  if (view === 'create') {
    return (
      <motion.div
        className="sl-create"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <button type="button" className="sl-back" onClick={() => setView('list')}>
          <ArrowLeft size={16} /> Leaves
        </button>
        <div className="sl-create-grid">
          <motion.section
            className="sl-create-panel"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.35, ease }}
          >
            <h3>Select Staff</h3>
            <div className="sl-create-filters">
              <AppSelect value={createRoom} onChange={setCreateRoom} options={roomOptions} />
              <input
                className="ui-input"
                placeholder="Search by name"
                value={createQuery}
                onChange={(e) => setCreateQuery(e.target.value)}
              />
            </div>
            <div className="sl-select-meta">
              <span>{selectedStaff.size} selected</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedStaff.size === createPool.length) setSelectedStaff(new Set());
                  else setSelectedStaff(new Set(createPool.map((s) => s.id)));
                }}
              >
                Select All
              </button>
            </div>
            <ul className="sl-student-list">
              {createPool.map((s, i) => {
                const on = selectedStaff.has(s.id);
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.03 }}
                  >
                    <button
                      type="button"
                      className={`sl-student-item ${on ? 'is-on' : ''}`}
                      onClick={() => {
                        setSelectedStaff((prev) => {
                          const n = new Set(prev);
                          if (n.has(s.id)) n.delete(s.id);
                          else n.add(s.id);
                          return n;
                        });
                      }}
                    >
                      <span className={`sa-avatar ${avatarTone(s.name)}`}>{studentInitials(s.name)}</span>
                      <strong>{s.name}</strong>
                      {on ? <CheckCircle2 size={18} className="sl-check" /> : null}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>

          <motion.section
            className="sl-create-panel"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease }}
          >
            <div className="ui-field">
              <label className="ui-label">
                Leave Type <em>*</em>
              </label>
              <AppSelect value={formType} onChange={setFormType} options={leaveTypeFormOptions} />
            </div>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">
                  From <em>*</em>
                </label>
                <DayDatePicker value={formFrom} onChange={setFormFrom} className="sl-range-picker" />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  To <em>*</em>
                </label>
                <DayDatePicker value={formTo} onChange={setFormTo} className="sl-range-picker" />
              </div>
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Reason for leave <em>*</em>
              </label>
              <textarea
                className="ui-textarea"
                rows={4}
                placeholder="Reason for leave"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
              />
            </div>
            <label className="sl-upload">
              <Upload size={22} />
              <span>Click or drag attachment to this area to upload</span>
              <input
                type="file"
                hidden
                onChange={(e) => setFormFile(e.target.files?.[0]?.name || '')}
              />
              {formFile ? <em>{formFile}</em> : null}
            </label>
            <div className="sl-create-actions">
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setView('list')}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={saveNewLeaves}>
                Save
              </button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    );
  }

  if (view === 'comments' && commentLeave) {
    return (
      <motion.div
        className="sl-comments"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease }}
      >
        <button
          type="button"
          className="sl-back"
          onClick={() => {
            setView('list');
            setCommentLeave(null);
          }}
        >
          <ArrowLeft size={16} /> Go Back / Comments
        </button>

        <div className="sl-comment-feed">
          {commentLeave.comments.length === 0 ? (
            <div className="sl-empty-comments">No Comments Found.</div>
          ) : (
            commentLeave.comments.map((c, i) => (
              <motion.article
                key={c.id}
                className="sl-comment-card"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease }}
              >
                <div className="sl-comment-head">
                  <span className={`sa-avatar ${avatarTone(c.author)}`}>{studentInitials(c.author)}</span>
                  <div>
                    <strong>{c.author}</strong>
                    <em>
                      Just now · {c.role}
                      {c.staffOnly ? ' · Staff only' : ''}
                    </em>
                  </div>
                  <AppMenu
                    align="end"
                    minWidth={140}
                    items={[
                      {
                        id: 'del',
                        label: 'Delete',
                        icon: <Trash2 size={14} />,
                        onSelect: () => onToast({ type: 'ok', message: 'Comment removed' }),
                      },
                    ]}
                    trigger={({ buttonProps }) => (
                      <button type="button" className="sa-icon-btn" aria-label="Comment menu" {...buttonProps}>
                        <MoreVertical size={16} />
                      </button>
                    )}
                  />
                </div>
                <p>{c.text}</p>
                <div className="sl-comment-foot">
                  <button type="button" className="sl-like">
                    <Heart size={14} /> {c.likes}
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </div>

        <div className="sl-composer">
          <textarea
            className="ui-textarea"
            rows={3}
            placeholder="Add a comment (use @ to tag staff)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="sl-composer-bar">
            <div className="sl-composer-left">
              <Paperclip size={16} />
              <label className="sa-check">
                <input type="checkbox" checked={staffOnly} onChange={(e) => setStaffOnly(e.target.checked)} />
                Staff Only
              </label>
            </div>
            <div className="sl-composer-right">
              <button
                type="button"
                className="sl-chip"
                onClick={() => onToast({ type: 'ok', message: 'Translate coming soon' })}
              >
                Translate
              </button>
              <button
                type="button"
                className="sl-chip sl-chip-ai"
                onClick={() => setCommentText((t) => t || 'Hope they feel better soon. Please rest and recover.')}
              >
                <Sparkles size={14} /> AI Suggestion
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={postComment}>
                Post
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="sl-root">
      <div className="sl-toolbar">
        <div />
        <div className="sl-toolbar-actions">
          <button
            type="button"
            className="ui-btn ui-btn-outline sa-ghost-btn"
            onClick={() => {
              setPerms(loadStaffLeavePermissions());
              setPermOpen(true);
            }}
          >
            <ShieldCheck size={15} /> Permissions
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline sa-ghost-btn"
            onClick={() => setView('settings')}
          >
            <Settings2 size={15} /> Settings
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              if (leaveTypes[0]) setFormType(leaveTypes[0]);
              setView('create');
            }}
          >
            <Plus size={15} /> New Leave
          </button>
        </div>
      </div>

      {pending.length > 0 ? (
        <motion.div
          className={`sl-pending-card ${bannerCollapsed ? 'is-collapsed' : ''}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="sl-pending-head">
            <div className="sl-pending-title">
              <span className="sl-pending-ico">
                <Clock3 size={16} />
              </span>
              <div>
                <strong>
                  {pending.length} pending request{pending.length === 1 ? '' : 's'}
                </strong>
                {bannerCollapsed ? (
                  <em>
                    {pending.length <= 2
                      ? pending.map((p) => p.staffName).join(', ')
                      : `${pending[0].staffName} +${pending.length - 1} more`}
                  </em>
                ) : null}
              </div>
            </div>
            <div className="sl-pending-head-actions">
              <button
                type="button"
                className={`ui-btn ui-btn-outline sl-mini-btn sl-toggle-btn ${bannerCollapsed ? '' : 'is-open'}`}
                aria-expanded={!bannerCollapsed}
                onClick={() => setBannerCollapsed((v) => !v)}
              >
                <span className="sl-toggle-chevron" aria-hidden>
                  {bannerCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </span>
                {bannerCollapsed ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>

          <div
            className={`sl-pending-collapse ${bannerCollapsed ? 'is-closed' : 'is-open'}`}
            aria-hidden={bannerCollapsed}
          >
            <div className="sl-pending-collapse-inner">
              <div className="sl-pending-body">
                {pending.map((p) => (
                  <div key={p.id} className="sl-pending-row">
                    <div className="sl-pending-who">
                      <span className={`sa-avatar ${avatarTone(p.staffName)}`}>{studentInitials(p.staffName)}</span>
                      <div>
                        <strong>{p.staffName}</strong>
                        <em>
                          {p.type} · Applied {formatAttDate(p.appliedOn)}
                        </em>
                      </div>
                    </div>
                    <div className="sl-pending-meta">
                      <strong>{formatAttDate(p.from)}</strong>
                      <em>{leaveDurationLabel(p.from, p.to)}</em>
                    </div>
                    <span className="sl-pending-reason">{p.reason}</span>
                    <div className="sl-pending-actions">
                      <button
                        type="button"
                        className="sl-approve"
                        tabIndex={bannerCollapsed ? -1 : 0}
                        onClick={() => setApproveTarget({ id: p.id, name: p.staffName })}
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        className="sl-deny"
                        tabIndex={bannerCollapsed ? -1 : 0}
                        onClick={() => {
                          setDenyNote('');
                          setDenyTarget({ id: p.id, name: p.staffName });
                        }}
                      >
                        <X size={13} /> Deny
                      </button>
                      <button
                        type="button"
                        className="sl-comment-btn"
                        tabIndex={bannerCollapsed ? -1 : 0}
                        onClick={() => {
                          setCommentLeave(p);
                          setView('comments');
                        }}
                      >
                        <MessageCircle size={14} /> {p.comments.length}
                      </button>
                      <AppMenu
                        align="end"
                        minWidth={160}
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit',
                            icon: <Edit3 size={14} />,
                            onSelect: () => setEditLeave({ ...p }),
                          },
                          {
                            id: 'delete',
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            onSelect: () => setDeleteTarget({ id: p.id, name: p.staffName }),
                          },
                        ]}
                        trigger={({ buttonProps }) => (
                          <button
                            type="button"
                            className="sa-icon-btn"
                            aria-label="Leave actions"
                            tabIndex={bannerCollapsed ? -1 : 0}
                            {...buttonProps}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="sl-stats">
        {(
          [
            { id: 'all' as const, label: 'All requests', value: stats.all, tone: 'all', icon: <ListChecks size={18} /> },
            { id: 'today' as const, label: 'Out today', value: stats.outToday, tone: 'today', icon: <CalendarDays size={18} /> },
            { id: 'week' as const, label: 'Out this week', value: stats.outWeek, tone: 'week', icon: <Users size={18} /> },
            { id: 'ok' as const, label: 'Approved', value: stats.approved, tone: 'ok', icon: <CheckCircle2 size={18} /> },
            { id: 'pending' as const, label: 'Pending', value: stats.pending, tone: 'pending', icon: <Clock3 size={18} /> },
          ] as const
        ).map((c, i) => (
          <motion.button
            key={c.tone}
            type="button"
            className={`sl-stat sl-stat-${c.tone}${statFilter === c.id ? ' is-active' : ''}`}
            onClick={() => {
              setStatFilter(c.id);
              setPage(1);
            }}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.32, ease }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <span className="sl-stat-ico">{c.icon}</span>
            <div>
              <strong>{c.value}</strong>
              <em>{c.label}</em>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="sl-filters">
        <div className="sl-period">
          <label className="ui-label">Leave period</label>
          <div className="sl-period-row">
            <DayDatePicker value={periodFrom} onChange={setPeriodFrom} className="sl-range-picker" />
            <span>→</span>
            <DayDatePicker value={periodTo} onChange={setPeriodTo} className="sl-range-picker" />
          </div>
        </div>
        <AppSelect value={room} onChange={setRoom} options={roomOptions} className="sa-filter-dd" />
        <AppSelect value={group} onChange={setGroup} options={groupOptions} className="sa-filter-dd" />
        <AppSelect value={staffFilter} onChange={setStaffFilter} options={staffOptions} className="sa-filter-dd" />
        <AppSelect value={leaveType} onChange={setLeaveType} options={typeOptions} className="sa-filter-dd" />
      </div>

      <div className="sa-table-card">
      <div className="cm-table-wrap sa-table-wrap">
        <table className="ui-table cm-tab-table sa-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Applied</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Files</th>
              <th>Status</th>
              <th>Comments</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="sl-skel-row">
                  <td colSpan={9}>
                    <div className="sl-skel">
                      <span className="sl-skel-avatar" />
                      <span className="sl-skel-line" />
                      <span className="sl-skel-line short" />
                    </div>
                  </td>
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="sa-empty">
                  No leave requests found
                </td>
              </tr>
            ) : (
              pageRows.map((lv, i) => (
                <motion.tr
                  key={lv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.28, ease }}
                >
                  <td>
                    <div className="sl-name-btn">
                      <span className={`sa-avatar ${avatarTone(lv.staffName)}`}>
                        {studentInitials(lv.staffName)}
                      </span>
                      <strong>{lv.staffName}</strong>
                    </div>
                  </td>
                  <td>{formatAttDate(lv.appliedOn)}</td>
                  <td>{lv.type}</td>
                  <td>
                    <div className="sa-cell-stack">
                      <strong>{formatAttDate(lv.from)}</strong>
                      <em>{leaveDurationLabel(lv.from, lv.to)}</em>
                    </div>
                  </td>
                  <td>{lv.reason}</td>
                  <td>
                    {lv.fileName ? (
                      <span className="sl-file">
                        <FileText size={14} /> {lv.fileName}
                      </span>
                    ) : (
                      <span className="sa-dash">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`sa-leave-pill is-${lv.status.toLowerCase()}`}>{lv.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="sl-comment-btn"
                      onClick={() => {
                        setCommentLeave(lv);
                        setView('comments');
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>{lv.comments.length}</span>
                    </button>
                  </td>
                  <td>
                    <AppMenu
                      align="end"
                      minWidth={160}
                      items={[
                        {
                          id: 'edit',
                          label: 'Edit',
                          icon: <Edit3 size={14} />,
                          onSelect: () => setEditLeave({ ...lv }),
                        },
                        {
                          id: 'delete',
                          label: 'Delete',
                          icon: <Trash2 size={14} />,
                          onSelect: () => setDeleteTarget({ id: lv.id, name: lv.staffName }),
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button type="button" className="sa-icon-btn" aria-label="Leave actions" {...buttonProps}>
                          <MoreVertical size={16} />
                        </button>
                      )}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProfileTablePagination
        page={Math.min(page, totalPages)}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      </div>

      <Drawer
        open={permOpen}
        title="Staff leave permissions"
        subtitle="Showing current grants for each role."
        onClose={() => setPermOpen(false)}
        icon={<ShieldCheck size={18} />}
        wide
        bodyClassName="sl-drawer-body"
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPermOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={savePerms}>
              <Save size={15} /> Save
            </button>
          </>
        }
      >
        <motion.div
          className="sl-perm-table-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease }}
        >
          <table className="sl-perm-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>View</th>
                <th>Create</th>
                <th>Edit</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {perms.map((row) => (
                <tr key={row.role}>
                  <td>{row.role}</td>
                  {(['view', 'create', 'edit', 'approve'] as const).map((key) => (
                    <td key={key}>
                      <button
                        type="button"
                        className={`sl-perm-check${row[key] ? ' is-on' : ''}`}
                        aria-label={`${row.role} ${key}`}
                        onClick={() =>
                          setPerms((prev) =>
                            prev.map((p) => (p.role === row.role ? { ...p, [key]: !p[key] } : p)),
                          )
                        }
                      >
                        {row[key] ? <Check size={14} /> : null}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="sl-perm-hint">Changes here apply to all users assigned to the role.</p>
        </motion.div>
      </Drawer>

      <Modal
        elevated
        open={Boolean(approveTarget)}
        title="Approve leave"
        onClose={() => setApproveTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => approveTarget && approve(approveTarget.id)}
            >
              <Check size={15} /> Approve
            </button>
          </>
        }
      >
        <div className="sl-action-modal">
          <motion.div
            className="sl-action-hero is-approve"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <CheckCircle2 size={28} />
          </motion.div>
          <h3>Approve this time-off request?</h3>
          <p>
            Confirm approval for <strong>{approveTarget?.name}</strong>. Staff will see the updated status.
          </p>
        </div>
      </Modal>

      <Modal
        elevated
        open={Boolean(denyTarget)}
        title="Deny leave"
        onClose={() => setDenyTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDenyTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => denyTarget && deny(denyTarget.id, denyNote)}
            >
              <X size={15} /> Deny
            </button>
          </>
        }
      >
        <div className="sl-action-modal">
          <motion.div
            className="sl-action-hero is-deny"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <X size={28} />
          </motion.div>
          <h3>Deny request for {denyTarget?.name}?</h3>
          <div className="ui-field">
            <label className="ui-label">Comment (recommended)</label>
            <textarea
              className="ui-textarea"
              rows={3}
              placeholder="Share why this request is denied"
              value={denyNote}
              onChange={(e) => setDenyNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        elevated
        open={Boolean(deleteTarget)}
        title="Delete leave"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              <Trash2 size={15} /> Delete
            </button>
          </>
        }
      >
        <div className="sl-action-modal">
          <motion.div
            className="sl-action-hero is-delete"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Trash2 size={26} />
          </motion.div>
          <h3>Delete leave for {deleteTarget?.name}?</h3>
          <p>This cannot be undone. The request will be removed from the leave list.</p>
        </div>
      </Modal>

      <Modal
        elevated
        open={Boolean(editLeave)}
        title="Edit leave request"
        onClose={() => setEditLeave(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditLeave(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveEdit}>
              Save
            </button>
          </>
        }
      >
        {editLeave ? (
          <div className="sl-edit-form">
            <div className="ui-field">
              <label className="ui-label">
                Leave Type <em>*</em>
              </label>
              <AppSelect
                value={editLeave.type}
                onChange={(v) => setEditLeave({ ...editLeave, type: v })}
                options={leaveTypeFormOptions}
              />
            </div>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">
                  From <em>*</em>
                </label>
                <DayDatePicker
                  value={editLeave.from}
                  onChange={(v) => setEditLeave({ ...editLeave, from: v })}
                  className="sl-range-picker"
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  To <em>*</em>
                </label>
                <DayDatePicker
                  value={editLeave.to}
                  onChange={(v) => setEditLeave({ ...editLeave, to: v })}
                  className="sl-range-picker"
                />
              </div>
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Reason <em>*</em>
              </label>
              <textarea
                className="ui-textarea"
                rows={3}
                value={editLeave.reason}
                onChange={(e) => setEditLeave({ ...editLeave, reason: e.target.value })}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Attachment</label>
              <label className="sl-upload">
                <Upload size={22} />
                <span>Click or drag attachment to this area to upload</span>
                <span className="sl-upload-optional">Optional</span>
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setEditLeave({
                      ...editLeave,
                      fileName: e.target.files?.[0]?.name || editLeave.fileName,
                    })
                  }
                />
                {editLeave.fileName ? <em>{editLeave.fileName}</em> : null}
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

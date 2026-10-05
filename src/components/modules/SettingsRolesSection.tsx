'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserCog, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SettingsAccessControlSection } from '@/components/modules/SettingsAccessControlSection';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsRolesSection.module.css';

type RoleRow = {
  id: string;
  name: string;
  staff: number;
  includeAttendance: boolean;
  includeRatio: boolean;
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

type RoleTypeFilter = 'all' | 'attendance' | 'ratio';

const SEED: RoleRow[] = [
  { id: 'r-finance', name: 'Finance Admin', staff: 0, includeAttendance: true, includeRatio: true },
  { id: 'r-center', name: 'Center Head', staff: 0, includeAttendance: true, includeRatio: true },
  { id: 'r-principal', name: 'Principal', staff: 1, includeAttendance: true, includeRatio: true },
  { id: 'r-teacher', name: 'Teacher', staff: 1, includeAttendance: true, includeRatio: true },
  { id: 'r-super', name: 'Super Admin', staff: 1, includeAttendance: true, includeRatio: true },
  { id: 'r-admin', name: 'Administrator', staff: 0, includeAttendance: true, includeRatio: true },
  { id: 'r-senior', name: 'Senior Teacher', staff: 0, includeAttendance: true, includeRatio: true },
  { id: 'r-head', name: 'Head Teacher', staff: 0, includeAttendance: true, includeRatio: true },
];

export function SettingsRolesSection() {
  const [roles, setRoles] = useState<RoleRow[]>(SEED);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>('all');
  const [sortAsc, setSortAsc] = useState(true);
  const [menuId, setMenuId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const addWrapRef = useRef<HTMLDivElement | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    includeAttendance: true,
    includeRatio: true,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<RoleRow | null>(null);

  const [permissionsRole, setPermissionsRole] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuId(null);
      if (addWrapRef.current && !addWrapRef.current.contains(target)) setAddOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = roles.filter((r) => !q || r.name.toLowerCase().includes(q));
    if (typeFilter === 'attendance') {
      list = list.filter((r) => r.includeAttendance);
    } else if (typeFilter === 'ratio') {
      list = list.filter((r) => r.includeRatio);
    }
    list = [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [roles, query, sortAsc, typeFilter]);

  const openAdd = () => {
    setAddName('');
    setMenuId(null);
    setAddOpen((v) => !v);
  };

  const saveAdd = () => {
    if (!addName.trim()) {
      setToast({ type: 'err', message: "Role can't be empty" });
      return;
    }
    const name = addName.trim();
    if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Role already exists' });
      return;
    }
    setRoles((list) => [
      {
        id: `r-${Date.now()}`,
        name,
        staff: 0,
        includeAttendance: true,
        includeRatio: true,
      },
      ...list,
    ]);
    setAddOpen(false);
    setAddName('');
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openEdit = (role: RoleRow) => {
    setMenuId(null);
    setEditing(role);
    setEditForm({
      name: role.name,
      includeAttendance: role.includeAttendance,
      includeRatio: role.includeRatio,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!editForm.name.trim()) {
      setToast({ type: 'err', message: "Role can't be empty" });
      return;
    }
    const name = editForm.name.trim();
    if (roles.some((r) => r.id !== editing.id && r.name.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Role already exists' });
      return;
    }
    setRoles((list) =>
      list.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              name,
              includeAttendance: editForm.includeAttendance,
              includeRatio: editForm.includeRatio,
            }
          : r,
      ),
    );
    setEditOpen(false);
    setEditing(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openDelete = (role: RoleRow) => {
    setMenuId(null);
    setDeleting(role);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    if (deleting.staff > 0) {
      setToast({ type: 'err', message: 'Cannot delete a role with assigned staff' });
      setDeleteOpen(false);
      setDeleting(null);
      return;
    }
    setRoles((list) => list.filter((r) => r.id !== deleting.id));
    setDeleteOpen(false);
    setDeleting(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openPermissions = (role: RoleRow) => {
    setMenuId(null);
    setPermissionsRole(role.name);
  };

  if (permissionsRole) {
    return (
      <div className={styles.root}>
        <button type="button" className={styles.backLink} onClick={() => setPermissionsRole(null)}>
          ← Back to Roles
        </button>
        <p className={styles.permHint}>
          Viewing permissions for <strong>{permissionsRole}</strong>. Use Select Role if you need to switch.
        </p>
        <SettingsAccessControlSection />
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Roles"
      description="Create roles, assign staff counts, and manage permissions."
      icon={<UserCog />}
      actions={
        <div className={styles.addWrap} ref={addWrapRef}>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.addBtn}`} onClick={openAdd}>
            <UserPlus size={16} aria-hidden />
            Add Role
          </button>
          {addOpen ? (
            <div className={styles.addPopover} role="dialog" aria-label="Add Role">
              <label className={styles.popoverLabel} htmlFor="add-role-name">
                Role Name
              </label>
              <input
                id="add-role-name"
                className="ui-input"
                placeholder="Input value here..."
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveAdd();
                }}
                autoFocus
              />
              <div className={styles.popoverActions}>
                <button type="button" className="ui-btn ui-btn-primary" onClick={saveAdd}>
                  Save
                </button>
              </div>
            </div>
          ) : null}
        </div>
      }
    >
      <div className={styles.root}>
        <div className="settings-filters">
          <div className="settings-search">
            <Search size={16} aria-hidden />
            <input
              placeholder="Search Role"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Role"
            />
          </div>
          <div className={styles.filterGroup} role="group" aria-label="Filter by role type">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'ratio', label: 'Ratio' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`ui-btn ${typeFilter === opt.id ? 'ui-btn-primary' : 'ui-btn-outline'}`}
                aria-pressed={typeFilter === opt.id}
                onClick={() => setTypeFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <section className={styles.card}>
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => setSortAsc((v) => !v)}
                    >
                      Role
                      <span className={styles.sortIcon} aria-hidden>
                        ↑↓
                      </span>
                    </button>
                  </th>
                  <th>Staff</th>
                  <th>Include in Attendance</th>
                  <th>Include in Ratio</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className={styles.empty}>No roles found</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((role) => (
                    <tr key={role.id}>
                      <td className={styles.roleName}>{role.name}</td>
                      <td>{role.staff}</td>
                      <td>{role.includeAttendance ? 'Yes' : 'No'}</td>
                      <td>{role.includeRatio ? 'Yes' : 'No'}</td>
                      <td className={styles.actionsCell}>
                        <div ref={menuId === role.id ? menuRef : undefined}>
                          <button
                            type="button"
                            className={styles.menuBtn}
                            aria-label={`Actions for ${role.name}`}
                            aria-expanded={menuId === role.id}
                            onClick={() => setMenuId((id) => (id === role.id ? null : role.id))}
                          >
                            ⋮
                          </button>
                          {menuId === role.id ? (
                            <div className={styles.menu} role="menu">
                              <button
                                type="button"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => openEdit(role)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path
                                    d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinejoin="round"
                                  />
                                  <path d="M13 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                                Edit Role
                              </button>
                              <button
                                type="button"
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                role="menuitem"
                                onClick={() => openDelete(role)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path
                                    d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Delete Role
                              </button>
                              <button
                                type="button"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => openPermissions(role)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path
                                    d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                View Permissions
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Modal
          open={editOpen}
          title="Edit Role"
          onClose={() => setEditOpen(false)}
          footer={
            <>
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={saveEdit}>
                Save
              </button>
            </>
          }
        >
          <div className={styles.modalStack}>
            <div className="ui-field">
              <label className="ui-label" htmlFor="edit-role-name">
                Role Name
              </label>
              <input
                id="edit-role-name"
                className="ui-input"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={editForm.includeAttendance}
                onChange={(e) => setEditForm((f) => ({ ...f, includeAttendance: e.target.checked }))}
              />
              Include in Attendance
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={editForm.includeRatio}
                onChange={(e) => setEditForm((f) => ({ ...f, includeRatio: e.target.checked }))}
              />
              Include in Ratio
            </label>
          </div>
        </Modal>

        <Modal
          open={deleteOpen}
          title="Delete Role"
          onClose={() => setDeleteOpen(false)}
          footer={
            <>
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </>
          }
        >
          <p className={styles.deleteText}>
            Are you sure you want to delete <strong>{deleting?.name}</strong>? This action cannot be undone.
          </p>
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  UserRound,
  UserX,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { PageLoader } from '@/components/ui/loading';
import {
  loadStaff,
  saveStaff,
  type StaffMember,
  type StaffStatus,
} from '@/lib/center-management/staffStore';
import { initials } from '@/lib/center-management/studentsStore';
import {
  AppMenu,
  AppSelect,
  AppTooltip,
  StatusBadge,
  StatusCard,
} from './ui';
import { useCenterScope } from '@/components/organization/CenterScopeContext';
import { getCenterName } from '@/lib/organization/centers';
import { filterByCenterScope } from '@/lib/organization/scopeFilter';
import { usePermissions } from '@/components/auth/AuthorizationProvider';
import { authorizeMutation } from '@/lib/access-control/apiAuthorize';
import './students.css';

type SortKey = 'name' | 'status' | 'phone' | 'room';
type Toast = { type: 'ok' | 'err'; message: string } | null;

function avatarTone(name: string) {
  const n = name.charCodeAt(0) % 4;
  return n === 0 ? '' : `tone-${n + 1}`;
}

export function StaffPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const canEdit = can('cm-staff-edit');
  const canDelete = can('cm-staff-delete');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [ready, setReady] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Active');
  const [search, setSearch] = useState('');

  // Sorting & Selection
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Toast
  const [toast, setToast] = useState<Toast>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });

  const { activeScope, isAllCenters } = useCenterScope();

  useEffect(() => {
    setStaffList(loadStaff());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStaff(staffList);
  }, [staffList, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const scopedStaff = useMemo(
    () => filterByCenterScope(staffList, activeScope),
    [staffList, activeScope],
  );

  // Counts for cards
  const counts = useMemo(() => {
    const total = scopedStaff.length;
    const active = scopedStaff.filter((s) => s.status === 'Active').length;
    const inactive = scopedStaff.filter((s) => s.status === 'Inactive').length;
    return { total, active, inactive };
  }, [scopedStaff]);

  // Filtered & Sorted Staff
  const filteredStaff = useMemo(() => {
    return scopedStaff.filter((s) => {
      if (statusFilter !== 'All Statuses' && s.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRole = s.role.toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q);
        const matchCenter = getCenterName(s.centerId ?? '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchPhone && !matchCenter) return false;
      }
      return true;
    });
  }, [scopedStaff, statusFilter, search]);

  const sortedStaff = useMemo(() => {
    const list = [...filteredStaff];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortKey === 'phone') cmp = a.phone.localeCompare(b.phone);
      else if (sortKey === 'room') cmp = (a.rooms[0] || '').localeCompare(b.rooms[0] || '');
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [filteredStaff, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStaff.slice(start, start + pageSize);
  }, [sortedStaff, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const allSelected =
    paginatedStaff.length > 0 && paginatedStaff.every((s) => selected.includes(s.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !paginatedStaff.some((s) => s.id === id)));
      return;
    }
    setSelected((prev) => [
      ...new Set([...prev, ...paginatedStaff.map((s) => s.id)]),
    ]);
  };

  const handleStatusChange = (id: string, newStatus: StaffStatus) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, status: newStatus } : s));
    setStaffList(updated);
    setToast({ type: 'ok', message: `Staff status updated to ${newStatus}` });
  };

  const handleConfirmDelete = () => {
    const authz = authorizeMutation('cm-staff-delete');
    if (!authz.ok) {
      setToast({ type: 'err', message: authz.message });
      setDeleteConfirm({ open: false, ids: [] });
      return;
    }
    const idsToDelete = new Set(deleteConfirm.ids);
    const updated = staffList.filter((s) => !idsToDelete.has(s.id));
    setStaffList(updated);
    setSelected((prev) => prev.filter((id) => !idsToDelete.has(id)));
    setDeleteConfirm({ open: false, ids: [] });
    setToast({
      type: 'ok',
      message: `${idsToDelete.size} staff member${idsToDelete.size === 1 ? '' : 's'} deleted`,
    });
  };

  if (!ready) return <PageLoader context="staff" />;

  return (
    <div className="cm-page cm-page--staff">
      <CenterManagementPageHeader
        title="Staff"
        description="Manage staff members and their information."
        icon={<UserRound />}
        actions={
          canEdit ? (
            <>
              <motion.button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => router.push('/center-management/staff/bulk')}
                whileTap={{ scale: 0.98 }}
              >
                Add Multiple Staff
              </motion.button>
              <motion.button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => router.push('/center-management/staff/add')}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Staff
              </motion.button>
            </>
          ) : null
        }
      />

      {/* Filter Row */}
      <div className="cm-filter-bar">
        <div className="cm-filters-group">
          <div className="cm-filter-item">
            <label>Status</label>
            <AppSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={['All Statuses', 'Active', 'Inactive'].map((s) => ({ value: s, label: s }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <div className="cm-search" style={{ maxWidth: '320px' }}>
            <Search size={16} />
            <input
              placeholder="Search by staff name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Summary Cards (Below Filters) */}
      <div className="cm-cards-grid">
        <StatusCard
          icon={<Users size={18} />}
          tone="indigo"
          label="Total Staff"
          count={counts.total}
          active={statusFilter === 'All Statuses'}
          onClick={() => {
            setStatusFilter('All Statuses');
            setCurrentPage(1);
          }}
        />
        <StatusCard
          icon={<UserRound size={18} />}
          tone="mint"
          label="Active Staff"
          count={counts.active}
          active={statusFilter === 'Active'}
          onClick={() => {
            setStatusFilter(statusFilter === 'Active' ? 'All Statuses' : 'Active');
            setCurrentPage(1);
          }}
        />
        <StatusCard
          icon={<UserX size={18} />}
          tone="blush"
          label="Inactive Staff"
          count={counts.inactive}
          active={statusFilter === 'Inactive'}
          onClick={() => {
            setStatusFilter(statusFilter === 'Inactive' ? 'All Statuses' : 'Inactive');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table Container */}
      <div className="cm-panel">
        <div className="cm-toolbar cm-toolbar--staff">
          <span className="cm-toolbar-hint">
            {selected.length
              ? `${selected.length} selected`
              : 'Select staff to bulk delete'}
          </span>
          <button
            type="button"
            className="cm-icon-btn cm-icon-btn--danger"
            title="Delete selected"
            aria-label="Delete selected staff"
            onClick={() => {
              if (!canDelete) {
                setToast({ type: 'err', message: 'You do not have permission to delete staff' });
                return;
              }
              if (!selected.length) {
                setToast({ type: 'err', message: 'Select staff first' });
                return;
              }
              setDeleteConfirm({ open: true, ids: selected });
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  <input
                    className="cm-check"
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
              <th className="sortable" onClick={() => toggleSort('name')}>
                <AppTooltip content="Click to sort by name" side="bottom">
                  <span className="cm-th-inner">
                    Name
                    <span className="cm-th-sort" style={{ opacity: sortKey === 'name' ? 1 : undefined }}>
                      <ArrowDownUp size={13} />
                    </span>
                  </span>
                </AppTooltip>
              </th>
              {isAllCenters ? <th>Center</th> : null}
              <th>Phone Number</th>
              <th className="sortable" onClick={() => toggleSort('room')}>
                <AppTooltip content="Click to sort by room" side="bottom">
                  <span className="cm-th-inner">
                    Room
                    <span className="cm-th-sort" style={{ opacity: sortKey === 'room' ? 1 : undefined }}>
                      <ArrowDownUp size={13} />
                    </span>
                  </span>
                </AppTooltip>
              </th>
              <th className="sortable" onClick={() => toggleSort('status')}>
                <AppTooltip content="Click to sort by status" side="bottom">
                  <span className="cm-th-inner">
                    Status
                    <span className="cm-th-sort" style={{ opacity: sortKey === 'status' ? 1 : undefined }}>
                      <ArrowDownUp size={13} />
                    </span>
                  </span>
                </AppTooltip>
              </th>
              <th style={{ width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {!sortedStaff.length ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <span className="cm-muted">No staff members match your filters.</span>
                </td>
              </tr>
            ) : (
              paginatedStaff.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <input
                      className="cm-check"
                      type="checkbox"
                      checked={selected.includes(staff.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(staff.id)
                            ? prev.filter((id) => id !== staff.id)
                            : [...prev, staff.id],
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="cm-student-cell">
                      <span className={`cm-avatar ${avatarTone(staff.name)}`}>
                        {initials(staff.name)}
                      </span>
                      <div className="cm-student-meta">
                        <button
                          type="button"
                          onClick={() => router.push(`/center-management/staff/${staff.id}`)}
                        >
                          {staff.name}
                        </button>
                        <span>{staff.role}</span>
                        {staff.lastUpdatedBy ? (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Last updated by: {staff.lastUpdatedBy}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  {isAllCenters ? (
                    <td>
                      <span className="cm-muted">{getCenterName(staff.centerId ?? '')}</span>
                    </td>
                  ) : null}
                  <td>{staff.phone || '—'}</td>
                  <td>{staff.rooms.join(', ') || '—'}</td>
                  <td>
                    <AppMenu
                      align="start"
                      minWidth={160}
                      items={[
                        {
                          id: 'Active',
                          label: 'Active',
                          icon: <span className="cm-status-dot mint" />,
                          onSelect: () => handleStatusChange(staff.id, 'Active'),
                        },
                        {
                          id: 'Inactive',
                          label: 'Inactive',
                          icon: <span className="cm-status-dot blush" />,
                          onSelect: () => handleStatusChange(staff.id, 'Inactive'),
                        },
                      ]}
                      trigger={({ open, buttonProps }) => (
                        <StatusBadge status={staff.status} open={open} {...buttonProps} />
                      )}
                    />
                  </td>
                  <td>
                    <AppMenu
                      align="end"
                      minWidth={160}
                      items={[
                        {
                          id: 'view',
                          label: 'View Profile',
                          icon: <UserRound size={15} />,
                          onSelect: () => router.push(`/center-management/staff/${staff.id}`),
                        },
                        ...(canEdit
                          ? [
                              {
                                id: 'edit',
                                label: 'Edit',
                                icon: <Pencil size={15} />,
                                onSelect: () =>
                                  router.push(`/center-management/staff/${staff.id}/edit`),
                              },
                            ]
                          : []),
                        ...(canDelete
                          ? [
                              {
                                id: 'delete',
                                label: 'Delete',
                                icon: <Trash2 size={15} />,
                                danger: true,
                                onSelect: () => setDeleteConfirm({ open: true, ids: [staff.id] }),
                              },
                            ]
                          : []),
                      ]}
                      trigger={({ buttonProps }) => (
                        <button type="button" className="cm-row-action" {...buttonProps}>
                          ⋮
                        </button>
                      )}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="cm-pagination">
        <span className="cm-page-info">
          Showing {paginatedStaff.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, sortedStaff.length)} of {sortedStaff.length} results
        </span>
        <div className="cm-page-btns">
          <button
            type="button"
            className="cm-page-nav"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <button type="button" className="cm-page-num is-active">
            {currentPage}
          </button>
          <button
            type="button"
            className="cm-page-nav"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
        <div className="cm-page-size">
          <AppSelect
            value={String(pageSize)}
            onChange={(v) => {
              setPageSize(Number(v));
              setCurrentPage(1);
            }}
            options={[
              { value: '10', label: '10 / page' },
              { value: '30', label: '30 / page' },
              { value: '50', label: '50 / page' },
            ]}
            align="end"
          />
        </div>
      </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm.open}
        title="Are you sure ?"
        onClose={() => setDeleteConfirm({ open: false, ids: [] })}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteConfirm({ open: false, ids: [] })}
            >
              No
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={handleConfirmDelete}>
              Yes
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Confirm to delete {deleteConfirm.ids.length} staff member
          {deleteConfirm.ids.length === 1 ? '' : 's'}. This action cannot be undone.
        </p>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`cm-toast ${toast.type}`}
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import type { SortDir, SortKey, StaffInstallationRecord } from './types';
import { InstallationStatusBadge, InvitationStatusBadge } from './StatusBadges';
import { EmptyState } from './EmptyState';

type Props = {
  rows: StaffInstallationRecord[];
  loading?: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onView: (row: StaffInstallationRecord) => void;
  onEditEmail: (row: StaffInstallationRecord) => void;
  onInvite: (row: StaffInstallationRecord, mode: 'send' | 'resend') => void;
  onCopyLink: (row: StaffInstallationRecord) => void;
  onDownloadInvite: (row: StaffInstallationRecord) => void;
  onEmptyInvite: () => void;
};

const COLS: { key: SortKey | null; label: string; width: string }[] = [
  { key: 'staffName', label: 'Staff', width: '200px' },
  { key: 'employeeId', label: 'Employee ID', width: '120px' },
  { key: 'campus', label: 'Campus', width: '140px' },
  { key: 'department', label: 'Department', width: '140px' },
  { key: 'designation', label: 'Designation', width: '140px' },
  { key: 'email', label: 'Email', width: '220px' },
  { key: 'invitationStatus', label: 'Invitation Status', width: '130px' },
  { key: 'installationStatus', label: 'Staff Installation Status', width: '170px' },
  { key: 'installedOn', label: 'Installed On', width: '130px' },
  { key: 'lastInviteSent', label: 'Last Invite Sent', width: '130px' },
];

const MENU_WIDTH = 220;

type MenuState = {
  rowId: string;
  top: number;
  left: number;
};

export function InstallationTable({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onEditEmail,
  onInvite,
  onCopyLink,
  onDownloadInvite,
  onEmptyInvite,
}: Props) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeRow = menu ? rows.find((r) => r.id === menu.rowId) ?? null : null;

  const closeMenu = () => setMenu(null);

  const openMenu = (rowId: string, el: HTMLButtonElement) => {
    const rect = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    );
    const estimatedHeight = 280;
    const openUp = rect.bottom + estimatedHeight > window.innerHeight - 8;
    const top = openUp ? Math.max(8, rect.top - estimatedHeight - 6) : rect.bottom + 6;
    setMenu({ rowId, top, left });
  };

  useEffect(() => {
    if (!menu) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      const trigger = triggerRefs.current[menu.rowId];
      if (trigger?.contains(target)) return;
      closeMenu();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    const onReposition = () => closeMenu();

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [menu]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading) {
    return (
      <div className="pai-table-card" aria-busy="true" aria-label="Loading table">
        <div className="pai-skel pai-skel-table" />
      </div>
    );
  }

  const runAction = (fn: () => void) => {
    closeMenu();
    fn();
  };

  return (
    <div className="pai-table-card sai-table-card">
      <div className="pai-table-scroll sai-table-scroll">
        <table className="ui-table pai-table sai-table">
          <thead>
            <tr>
              {COLS.map((col) => (
                <th key={col.label} style={{ minWidth: col.width, width: col.width }}>
                  {col.key ? (
                    <button
                      type="button"
                      className="pai-th-sort"
                      onClick={() => onSort(col.key as SortKey)}
                      aria-label={`Sort by ${col.label}`}
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        <span aria-hidden>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                      ) : null}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="sai-actions-col" style={{ width: 72, minWidth: 72 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <EmptyState onInvite={onEmptyInvite} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={menu?.rowId === row.id ? 'sai-row-active' : undefined}>
                  <td>
                    <div className="pai-student-cell">
                      <span className="pai-avatar" aria-hidden>
                        {row.avatarInitials}
                      </span>
                      <div className="sai-staff-meta">
                        <strong title={row.staffName}>{row.staffName}</strong>
                        <span className="pai-muted">{row.employeeId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="sai-mono">{row.employeeId}</span>
                  </td>
                  <td>
                    <span className="sai-cell-text" title={row.campus}>
                      {row.campus}
                    </span>
                  </td>
                  <td>
                    <span className="sai-cell-text" title={row.department}>
                      {row.department}
                    </span>
                  </td>
                  <td>
                    <span className="sai-cell-text" title={row.designation}>
                      {row.designation}
                    </span>
                  </td>
                  <td>
                    <a
                      className="sai-email"
                      href={`mailto:${row.email}`}
                      title={row.email}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.email}
                    </a>
                  </td>
                  <td>
                    <InvitationStatusBadge status={row.invitationStatus} />
                  </td>
                  <td>
                    <InstallationStatusBadge status={row.installationStatus} />
                  </td>
                  <td>
                    {row.installedOn ? (
                      <div className="pai-datetime">
                        <strong>{row.installedOn}</strong>
                        <span className="pai-muted">{row.installedTime ?? ''}</span>
                      </div>
                    ) : (
                      <span className="pai-muted">—</span>
                    )}
                  </td>
                  <td>
                    {row.lastInviteSent ? (
                      <div className="pai-datetime">
                        <strong>{row.lastInviteSent}</strong>
                        <span className="pai-muted">{row.lastInviteTime ?? ''}</span>
                      </div>
                    ) : (
                      <span className="pai-muted">—</span>
                    )}
                  </td>
                  <td className="sai-actions-col">
                    <div className="pai-action-wrap">
                      <button
                        type="button"
                        className="pai-icon-btn"
                        aria-label={`Actions for ${row.staffName}`}
                        aria-haspopup="menu"
                        aria-expanded={menu?.rowId === row.id}
                        ref={(el) => {
                          triggerRefs.current[row.id] = el;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const btn = e.currentTarget;
                          if (menu?.rowId === row.id) closeMenu();
                          else openMenu(row.id, btn);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 ? (
        <div className="pai-pagination">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="pai-page-btns">
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {page} / {pageCount}
            </span>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {menu && activeRow ? (
                <motion.div
                  ref={menuRef}
                  className="sai-action-menu"
                  role="menu"
                  aria-label={`Actions for ${activeRow.staffName}`}
                  style={{ top: menu.top, left: menu.left, width: MENU_WIDTH }}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onView(activeRow))}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onEditEmail(activeRow))}
                  >
                    <Pencil size={14} /> Edit Staff Email
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onInvite(activeRow, 'send'))}
                  >
                    <Mail size={14} /> Send Invite
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onInvite(activeRow, 'resend'))}
                  >
                    <RefreshCw size={14} /> Resend Invite
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onDownloadInvite(activeRow))}
                  >
                    <Download size={14} /> Download Invitation
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(() => onCopyLink(activeRow))}
                  >
                    <ClipboardCopy size={14} /> Copy Invitation Link
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

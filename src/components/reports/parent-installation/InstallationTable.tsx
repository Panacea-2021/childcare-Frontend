'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
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
import type { InstallationRecord, SortDir, SortKey } from './types';
import { InstallationStatusBadge, InvitationStatusBadge } from './StatusBadges';
import { ParentCell } from './ParentCell';
import { EmptyState } from './EmptyState';

type Props = {
  rows: InstallationRecord[];
  loading?: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onView: (row: InstallationRecord) => void;
  onEditEmail: (row: InstallationRecord) => void;
  onInvite: (row: InstallationRecord, mode: 'send' | 'resend') => void;
  onCopyLink: (row: InstallationRecord) => void;
  onDownloadInvite: (row: InstallationRecord) => void;
  onEmptyInvite: () => void;
};

const COLS: { key: SortKey | null; label: string; width: number }[] = [
  { key: 'studentName', label: 'Student', width: 200 },
  { key: 'admissionNumber', label: 'Admission Number', width: 140 },
  { key: 'campus', label: 'Campus', width: 140 },
  { key: 'program', label: 'Program', width: 120 },
  { key: null, label: 'Mother', width: 180 },
  { key: null, label: 'Father', width: 180 },
  { key: 'invitationStatus', label: 'Invitation Status', width: 130 },
  { key: 'installationStatus', label: 'Parent Installation Status', width: 170 },
  { key: 'installedOn', label: 'Installed On', width: 140 },
  { key: 'lastInviteSent', label: 'Last Invite Sent', width: 140 },
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
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [widths, setWidths] = useState<number[]>(COLS.map((c) => c.width));
  const resizing = useRef<{ index: number; startX: number; startW: number } | null>(null);
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
      if (triggerRefs.current[menu.rowId]?.contains(target)) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const onReposition = () => closeMenu();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [menu]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const { index, startX, startW } = resizing.current;
      const next = Math.max(100, startW + (e.clientX - startX));
      setWidths((prev) => prev.map((w, i) => (i === index ? next : w)));
    };
    const onUp = () => {
      resizing.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading) {
    return (
      <div className="pai-table-card" aria-busy="true" aria-label="Loading table">
        <div className="pai-skel pai-skel-table animate-pulse" />
      </div>
    );
  }

  const runAction = (fn: () => void) => {
    closeMenu();
    fn();
  };

  return (
    <div className="pai-table-card" id="pai-table-anchor">
      <div className="pai-table-scroll">
        <table className="ui-table pai-table">
          <thead>
            <tr>
              {COLS.map((col, i) => (
                <th key={col.label} style={{ width: widths[i], position: 'relative' }}>
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
                  <span
                    className="pai-col-resize"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${col.label} column`}
                    onMouseDown={(e) => {
                      resizing.current = { index: i, startX: e.clientX, startW: widths[i] };
                    }}
                  />
                </th>
              ))}
              <th style={{ width: 72 }}>Actions</th>
            </tr>
          </thead>
          <tbody key={`page-${page}`}>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState onInvite={onEmptyInvite} />
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <m.tr
                    key={row.id}
                    className={menu?.rowId === row.id ? 'pai-row-active' : undefined}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { delay: index * 0.04, duration: 0.28, ease: 'easeOut' }
                    }
                    whileHover={
                      reduce
                        ? undefined
                        : {
                            y: -2,
                            transition: { duration: 0.15 },
                          }
                    }
                  >
                    <td>
                      <div className="pai-student-cell">
                        <span className="pai-avatar" aria-hidden>
                          {row.avatarInitials}
                        </span>
                        <div>
                          <strong>{row.studentName}</strong>
                          <span className="pai-muted">{row.studentStatus}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.admissionNumber}</td>
                    <td>{row.campus}</td>
                    <td>{row.program}</td>
                    <td>
                      <ParentCell parent={row.mother} />
                    </td>
                    <td>
                      <ParentCell parent={row.father} />
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
                        '—'
                      )}
                    </td>
                    <td>
                      {row.lastInviteSent ? (
                        <div className="pai-datetime">
                          <strong>{row.lastInviteSent}</strong>
                          <span className="pai-muted">{row.lastInviteTime ?? ''}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="pai-action-wrap">
                        <button
                          type="button"
                          className="pai-icon-btn"
                          aria-label={`Actions for ${row.studentName}`}
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
                  </m.tr>
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
                <m.div
                  ref={menuRef}
                  className="pai-action-menu pai-action-menu-portal"
                  role="menu"
                  style={{ top: menu.top, left: menu.left, width: MENU_WIDTH }}
                  initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {(
                    [
                      {
                        label: 'View',
                        icon: <Eye size={14} />,
                        action: () => onView(activeRow),
                      },
                      {
                        label: 'Edit Parent Email',
                        icon: <Pencil size={14} />,
                        action: () => onEditEmail(activeRow),
                      },
                      {
                        label: 'Send Invite',
                        icon: <Mail size={14} />,
                        action: () => onInvite(activeRow, 'send'),
                      },
                      {
                        label: 'Resend Invite',
                        icon: <RefreshCw size={14} />,
                        action: () => onInvite(activeRow, 'resend'),
                      },
                      {
                        label: 'Download Invitation',
                        icon: <Download size={14} />,
                        action: () => onDownloadInvite(activeRow),
                      },
                      {
                        label: 'Copy Invitation Link',
                        icon: <ClipboardCopy size={14} />,
                        action: () => onCopyLink(activeRow),
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className="transition duration-150"
                      onClick={() => runAction(item.action)}
                    >
                      <span className="pai-menu-ico">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </m.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import {
  ProfileTablePagination,
  useClientPagination,
} from '@/components/modules/center-management/ui';
import type { ChecklistItemDef, RoomDailyReport } from '@/types/dailyReport';
import { ChecklistCell } from './ChecklistCell';
import { StatusBadge } from './StatusBadge';
import { ActionMenu, type RowAction } from './ActionMenu';
import { getEntry, roomHasColumn, unionChecklistColumns } from './utils';

type Props = {
  reports: RoomDailyReport[];
  checklist: ChecklistItemDef[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleItem: (reportId: string, itemId: string) => void;
  onRowAction: (report: RoomDailyReport, action: RowAction) => void;
};

export function DailyReportsTable({
  reports,
  checklist,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll: _onToggleSelectAll,
  onToggleItem,
  onRowAction,
}: Props) {
  const columns = unionChecklistColumns(checklist, reports);
  const [menu, setMenu] = useState<{ id: string; el: HTMLElement } | null>(null);

  const reportsKey = useMemo(() => reports.map((r) => r.id).join(','), [reports]);
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    pageItems,
  } = useClientPagination(reports, 10, reportsKey);

  const pageAllSelected =
    pageItems.length > 0 && pageItems.every((r) => selectedIds.has(r.id));

  const handleTogglePageSelectAll = () => {
    if (pageAllSelected) {
      pageItems.forEach((r) => {
        if (selectedIds.has(r.id)) onToggleSelect(r.id);
      });
      return;
    }
    pageItems.forEach((r) => {
      if (!selectedIds.has(r.id)) onToggleSelect(r.id);
    });
  };

  return (
    <motion.div
      className="dr-table-wrap"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dr-table-scroll">
        <table className="dr-table">
          <thead>
            <tr>
              <th className="dr-sticky-left" style={{ width: 48 }}>
                <input
                  type="checkbox"
                  checked={pageAllSelected}
                  onChange={handleTogglePageSelectAll}
                  aria-label="Select all rooms on this page"
                />
              </th>
              <th className="dr-sticky-left-2">Room</th>
              {columns.map((col) => (
                <th key={col.id} className="dr-check-col">
                  {col.name}
                </th>
              ))}
              <th>Completion %</th>
              <th>Status</th>
              <th className="dr-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((report, index) => {
              const selected = selectedIds.has(report.id);
              const menuOpen = menu?.id === report.id;
              return (
                <motion.tr
                  key={report.id}
                  className={selected ? 'is-selected' : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.32) }}
                >
                  <td className="dr-sticky-left">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelect(report.id)}
                      aria-label={`Select ${report.room}`}
                    />
                  </td>
                  <td className="dr-sticky-left-2">
                    <div className="dr-student-cell">
                      <span className="dr-avatar dr-room-avatar" aria-hidden>
                        {report.room
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      <div>
                        <div className="dr-student-name">{report.room}</div>
                        <div className="dr-student-meta">
                          {report.presentCount}/{report.studentCount} present
                        </div>
                      </div>
                    </div>
                  </td>
                  {columns.map((col) => {
                    const belongs = roomHasColumn(report, col.id, checklist);
                    if (!belongs) {
                      return (
                        <td key={col.id}>
                          <span className="dr-na">—</span>
                        </td>
                      );
                    }
                    const entry = getEntry(report, col.id);
                    return (
                      <td key={col.id} className="dr-check-cell">
                        <ChecklistCell
                          label={col.name}
                          completed={Boolean(entry?.completed)}
                          isIncident={col.key === 'incident'}
                          onToggle={() => onToggleItem(report.id, col.id)}
                        />
                      </td>
                    );
                  })}
                  <td>
                    <div className="dr-completion">
                      <div className="dr-completion-bar">
                        <motion.div
                          className="dr-completion-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${report.completionPercent}%` }}
                          transition={{ duration: 0.7, delay: 0.15 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <span className="dr-completion-text">{report.completionPercent}%</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="dr-actions-col">
                    <div className="dr-actions">
                      <button
                        type="button"
                        className={`dr-row-action${menuOpen ? ' is-open' : ''}`}
                        aria-label={`Actions for ${report.room}`}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenu((prev) =>
                            prev?.id === report.id
                              ? null
                              : { id: report.id, el: e.currentTarget },
                          );
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProfileTablePagination
        className="dr-table-pagination"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20, 30]}
      />

      <ActionMenu
        open={Boolean(menu)}
        anchorEl={menu?.el ?? null}
        onClose={() => setMenu(null)}
        onAction={(action) => {
          const report = pageItems.find((r) => r.id === menu?.id) ?? reports.find((r) => r.id === menu?.id);
          if (report) onRowAction(report, action);
        }}
      />
    </motion.div>
  );
}

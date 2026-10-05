'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  Receipt,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { loadLabels } from '@/lib/center-management/labelsStore';
import {
  deleteFeePlans,
  formatPlanDate,
  formatPlanPeriod,
  FREQUENCY_OPTIONS,
  loadFeePlans,
  upsertFeePlan,
  type FeePlan,
  type PlanFrequency,
  type PlanStatus,
} from '@/lib/billing-accounting/feePlansStore';

type SortKey = 'name' | 'status' | 'period' | 'nextInvoice' | 'students';
type SortDir = 'asc' | 'desc';

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  onToast: (msg: string) => void;
};

export function FeePlanPlansPanel({ onToast }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PlanStatus>('All');
  const [freqFilter, setFreqFilter] = useState<'All' | PlanFrequency>('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const labels = useMemo(
    () => loadLabels().filter((l) => l.feature === 'Fee Plan' || l.status === 'Active'),
    [],
  );

  const refresh = () => setRows(loadFeePlans());

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      refresh();
      setLoading(false);
    }, 240);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (freqFilter !== 'All' && r.frequency !== freqFilter) return false;
      if (labelFilter !== 'All' && !r.labelIds.includes(labelFilter)) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.programName} ${r.frequency} ${r.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, statusFilter, freqFilter, labelFilter]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir;
      if (sortKey === 'period') return a.periodStart.localeCompare(b.periodStart) * dir;
      if (sortKey === 'nextInvoice')
        return (a.nextInvoiceDate || '').localeCompare(b.nextInvoiceDate || '') * dir;
      return (a.students.length - b.students.length) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected],
  );
  const canBulkPause = selectedRows.some((r) => r.status === 'Active' || r.status === 'Draft');
  const canBulkResume = selectedRows.some((r) => r.status === 'Paused');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortTip = (key: SortKey) =>
    sortKey === key
      ? sortDir === 'asc'
        ? 'Click to sort descending'
        : 'Click to sort ascending'
      : 'Click to sort ascending';

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const r of pageRows) next.delete(r.id);
      } else {
        for (const r of pageRows) next.add(r.id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const confirmDelete = () => {
    if (!deleteIds?.length) return;
    deleteFeePlans(deleteIds);
    setDeleteIds(null);
    clearSelection();
    refresh();
    onToast(deleteIds.length > 1 ? 'Fee plans deleted' : 'Fee plan deleted');
  };

  const bulkSetStatus = (nextStatus: Extract<PlanStatus, 'Active' | 'Paused'>) => {
    const targets = selectedRows.filter((r) =>
      nextStatus === 'Paused'
        ? r.status === 'Active' || r.status === 'Draft'
        : r.status === 'Paused',
    );
    if (!targets.length) {
      onToast(
        nextStatus === 'Paused'
          ? 'No selected plans can be paused'
          : 'No selected plans can be resumed',
      );
      return;
    }
    for (const row of targets) upsertFeePlan({ ...row, status: nextStatus });
    refresh();
    clearSelection();
    onToast(
      nextStatus === 'Paused'
        ? `${targets.length} plan${targets.length === 1 ? '' : 's'} paused`
        : `${targets.length} plan${targets.length === 1 ? '' : 's'} resumed`,
    );
  };

  const labelName = (id: string) => labels.find((l) => l.id === id)?.name || id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease }}
    >
      <motion.div
        className="fp-toolbar"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease, delay: 0.04 }}
      >
        <div className="fp-field">
          <span className="fp-field-label">Search</span>
          <div className="fp-search">
            <Search size={16} aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search fee plan"
              aria-label="Search fee plans"
            />
          </div>
        </div>

        <div className="fp-field">
          <span className="fp-field-label">Plan Status</span>
          <AppSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as 'All' | PlanStatus);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Active', label: 'Active' },
              { value: 'Paused', label: 'Paused' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Draft', label: 'Draft' },
            ]}
          />
        </div>

        <div className="fp-field">
          <span className="fp-field-label">Plan Frequency</span>
          <AppSelect
            value={freqFilter}
            onChange={(v) => {
              setFreqFilter(v as 'All' | PlanFrequency);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All' },
              ...FREQUENCY_OPTIONS.map((f) => ({ value: f, label: f })),
            ]}
          />
        </div>

        <div className="fp-field">
          <span className="fp-field-label">Labels</span>
          <AppSelect
            value={labelFilter}
            onChange={(v) => {
              setLabelFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'All', label: 'All' },
              ...labels.map((l) => ({ value: l.id, label: l.name })),
            ]}
          />
        </div>

        <div className="fp-toolbar-actions">
          {selected.size > 0 ? (
            <>
              <span className="fp-selected">{selected.size} selected</span>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                disabled={!canBulkPause}
                onClick={() => bulkSetStatus('Paused')}
              >
                <Pause size={15} />
                Pause
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                disabled={!canBulkResume}
                onClick={() => bulkSetStatus('Active')}
              >
                <Play size={15} />
                Resume
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => setDeleteIds([...selected])}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </>
          ) : null}
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/billing-accounting/fee-plan/create')}
          >
            <Plus size={15} />
            Fee Plan
          </motion.button>
        </div>
      </motion.div>

      <div className="fp-panel">
        {loading ? (
          <>
            <div className="bi-skeleton" style={{ margin: 16 }} />
            <div className="bi-skeleton" style={{ margin: '0 16px 16px' }} />
          </>
        ) : pageRows.length === 0 ? (
          <div className="fp-empty">
            <div className="fp-empty-art" aria-hidden>
              <Receipt size={28} />
            </div>
            <h3>No Fee Plans</h3>
            <p>Create a fee plan to schedule recurring invoices for your programs.</p>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{ marginTop: 10 }}
              onClick={() => router.push('/billing-accounting/fee-plan/create')}
            >
              <Plus size={15} />
              Fee Plan
            </button>
          </div>
        ) : (
          <div className="fp-table-wrap fp-plans-wrap">
            <table className="ui-table fp-table fp-plans-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="fp-check"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all fee plans on this page"
                    />
                  </th>
                  {(
                    [
                      ['name', 'Plan Name'],
                      ['status', 'Status'],
                      ['period', 'Plan Period'],
                      ['nextInvoice', 'Next Invoice'],
                      ['students', 'No Of Students'],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key}>
                      <AppTooltip content={sortTip(key)} side="bottom">
                        <button
                          type="button"
                          className={`fp-sort${sortKey === key ? ' is-on' : ''}`}
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          <span aria-hidden>
                            {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                          </span>
                        </button>
                      </AppTooltip>
                    </th>
                  ))}
                  <th>Labels</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {pageRows.map((row, idx) => {
                    const isOn = selected.has(row.id);
                    return (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        delay: Math.min(idx * 0.03, 0.24),
                        duration: 0.28,
                        ease,
                      }}
                      className={`fp-plan-row${isOn ? ' is-selected' : ''}`}
                      onClick={() => router.push(`/billing-accounting/fee-plan/${row.id}`)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="fp-check"
                          checked={isOn}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td>
                        <strong className="fp-plan-name">{row.name}</strong>
                      </td>
                      <td>
                        <span className={`fp-status is-${row.status.toLowerCase()}`}>
                          <i aria-hidden />
                          {row.status}
                        </span>
                      </td>
                      <td>{formatPlanPeriod(row.periodStart, row.periodEnd)}</td>
                      <td>
                        {row.nextInvoiceDate
                          ? formatPlanDate(row.nextInvoiceDate)
                          : 'No upcoming invoices'}
                      </td>
                      <td>
                        <span className="fp-plans">{row.students.length}</span>
                      </td>
                      <td>
                        {row.labelIds.length ? (
                          <div className="fp-label-list">
                            {row.labelIds.slice(0, 2).map((id) => (
                              <span key={id} className="fp-chip">
                                {labelName(id)}
                              </span>
                            ))}
                            {row.labelIds.length > 2 ? (
                              <span className="fp-chip">+{row.labelIds.length - 2}</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="fp-muted">—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <AppMenu
                          align="end"
                          minWidth={190}
                          items={[
                            {
                              id: 'edit',
                              label: 'Edit Plan',
                              icon: <Pencil size={15} />,
                              onSelect: () =>
                                router.push(
                                  `/billing-accounting/fee-plan/create?edit=${row.id}`,
                                ),
                            },
                            {
                              id: 'assign',
                              label: 'Assign Students',
                              icon: <UserPlus size={15} />,
                              onSelect: () =>
                                router.push(
                                  `/billing-accounting/fee-plan/${row.id}?assign=1`,
                                ),
                            },
                            {
                              id: 'delete',
                              label: 'Delete Plan',
                              icon: <Trash2 size={15} />,
                              danger: true,
                              onSelect: () => setDeleteIds([row.id]),
                            },
                            {
                              id: 'pause',
                              label: row.status === 'Paused' ? 'Resume Plan' : 'Pause Plan',
                              icon:
                                row.status === 'Paused' ? (
                                  <Play size={15} />
                                ) : (
                                  <Pause size={15} />
                                ),
                              onSelect: () => {
                                const nextStatus: PlanStatus =
                                  row.status === 'Paused' ? 'Active' : 'Paused';
                                upsertFeePlan({ ...row, status: nextStatus });
                                refresh();
                                onToast(
                                  nextStatus === 'Paused'
                                    ? `"${row.name}" paused`
                                    : `"${row.name}" resumed`,
                                );
                              },
                            },
                          ]}
                          trigger={({ buttonProps }) => (
                            <button
                              type="button"
                              className="bill-icon-btn"
                              aria-label={`Actions for ${row.name}`}
                              {...buttonProps}
                            >
                              <MoreVertical size={16} />
                            </button>
                          )}
                        />
                      </td>
                    </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        <div className="fp-footer cm-pagination">
          <span className="cm-page-info">
            Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length} results
          </span>
          <div className="cm-page-btns">
            <button
              type="button"
              className="cm-page-nav"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cm-page-num${p === safePage ? ' is-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              className="cm-page-nav"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <div className="cm-page-size">
            <AppSelect
              value={String(pageSize)}
              onChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
              options={[
                { label: '5 / page', value: '5' },
                { label: '10 / page', value: '10' },
                { label: '30 / page', value: '30' },
              ]}
              align="end"
            />
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(deleteIds?.length)}
        title={deleteIds && deleteIds.length > 1 ? 'Delete Fee Plans' : 'Delete Fee Plan'}
        onClose={() => setDeleteIds(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteIds(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {deleteIds && deleteIds.length > 1
            ? `Delete ${deleteIds.length} selected fee plans? Assigned students will be unlinked. This cannot be undone.`
            : 'Delete this fee plan? Assigned students will be unlinked. This cannot be undone.'}
        </p>
      </Modal>
    </motion.div>
  );
}

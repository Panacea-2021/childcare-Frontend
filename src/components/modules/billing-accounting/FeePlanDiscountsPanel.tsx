'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreVertical, Pencil, Percent, Plus, Search, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { CreateDiscountModal } from './CreateDiscountModal';
import {
  deleteDiscounts,
  formatDiscountValue,
  formatDisplayDate,
  loadDiscounts,
  type DiscountDef,
} from '@/lib/billing-accounting/invoiceStore';

type SortKey = 'name' | 'type' | 'value' | 'redemptions' | 'validUntil';
type SortDir = 'asc' | 'desc';
type KindFilter = 'All' | 'standard' | 'conditional';

const KIND_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'conditional', label: 'Conditional' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function validUntilLabel(d: DiscountDef) {
  if (d.kind !== 'conditional') return '—';
  if (d.conditionalMode === 'date' && d.valueOfX) return formatDisplayDate(d.valueOfX);
  if (d.conditionalMode === 'applications' && d.valueOfX) return `${d.valueOfX} uses`;
  return '—';
}

function validUntilSortKey(d: DiscountDef) {
  if (d.kind !== 'conditional') return 0;
  if (d.conditionalMode === 'date' && d.valueOfX) {
    return new Date(d.valueOfX).getTime() || 0;
  }
  if (d.conditionalMode === 'applications') return Number(d.valueOfX) || 0;
  return 0;
}

type Props = {
  onToast: (msg: string) => void;
};

export function FeePlanDiscountsPanel({ onToast }: Props) {
  const [rows, setRows] = useState<DiscountDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<DiscountDef | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const refresh = () => setRows(loadDiscounts());

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
      if (kindFilter !== 'All' && r.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.itemCode ?? ''} ${r.kind} ${r.mode ?? ''} ${formatDiscountValue(r)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, kindFilter]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'type') return a.unit.localeCompare(b.unit) * dir;
      if (sortKey === 'value') return (a.value - b.value) * dir;
      if (sortKey === 'redemptions') return ((a.redemptions ?? 0) - (b.redemptions ?? 0)) * dir;
      return (validUntilSortKey(a) - validUntilSortKey(b)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

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

  const confirmDelete = () => {
    if (!deleteIds?.length) return;
    deleteDiscounts(deleteIds);
    setDeleteIds(null);
    setSelected(new Set());
    refresh();
    onToast(deleteIds.length > 1 ? 'Discounts deleted' : 'Discount deleted');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease }}
    >
      <div className="fp-toolbar">
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
              placeholder="Search by name"
              aria-label="Search discounts"
            />
            {search ? (
              <button
                type="button"
                className="fp-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div className="fp-field fp-cat">
          <span className="fp-field-label">Discount Type</span>
          <AppSelect
            value={kindFilter}
            onChange={(v) => {
              setKindFilter(v as KindFilter);
              setPage(1);
            }}
            options={KIND_OPTIONS}
          />
        </div>

        <div className="fp-toolbar-actions">
          {selected.size > 0 ? (
            <>
              <span className="fp-selected">{selected.size} selected</span>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => setDeleteIds([...selected])}
              >
                <Trash2 size={15} />
                Bulk Delete
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => {
              setEditRow(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            Add discount
          </button>
        </div>
      </div>

      <div className="fp-panel">
        {loading ? (
          <>
            <div className="bi-skeleton" style={{ margin: 16 }} />
            <div className="bi-skeleton" style={{ margin: '0 16px 16px' }} />
            <div className="bi-skeleton" style={{ margin: '0 16px 16px' }} />
          </>
        ) : pageRows.length === 0 ? (
          <div className="fp-empty">
            <div className="fp-empty-art" aria-hidden>
              <Percent size={28} />
            </div>
            <h3>No Data</h3>
            <p>Create a discount to apply percentage or flat offers on invoices and fee plans.</p>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{ marginTop: 10 }}
              onClick={() => {
                setEditRow(null);
                setModalOpen(true);
              }}
            >
              <Plus size={15} />
              Add discount
            </button>
          </div>
        ) : (
          <div className="fp-table-wrap">
            <table className="ui-table fp-table fp-disc-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="fp-check"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all discounts on this page"
                    />
                  </th>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'name' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('name')}
                      >
                        Name
                        <span aria-hidden>
                          {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'type' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('type')}
                      >
                        Type
                        <span aria-hidden>
                          {sortKey === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'value' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('value')}
                      >
                        Value
                        <span aria-hidden>
                          {sortKey === 'value' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'redemptions' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('redemptions')}
                      >
                        Redemptions
                        <span aria-hidden>
                          {sortKey === 'redemptions' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>
                    <AppTooltip content="Click to sort" side="bottom">
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'validUntil' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('validUntil')}
                      >
                        Valid Until
                        <span aria-hidden>
                          {sortKey === 'validUntil' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th>Discount Mode</th>
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{
                        delay: Math.min(idx * 0.03, 0.24),
                        duration: 0.28,
                        ease,
                      }}
                      className={isOn ? 'is-selected' : undefined}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="fp-check"
                          checked={isOn}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td>
                        <div className="fp-item">
                          <strong>{row.name}</strong>
                          <em>Code : {row.itemCode}</em>
                        </div>
                      </td>
                      <td>
                        <span className={`fp-chip${row.unit === 'amount' ? ' is-once' : ''}`}>
                          {row.unit === 'percent' ? '%' : '#'}
                        </span>
                      </td>
                      <td>
                        <span className="fp-price">{formatDiscountValue(row)}</span>
                      </td>
                      <td>
                        <span className="fp-plans">{row.redemptions ?? 0}</span>
                      </td>
                      <td>
                        <span className="fp-disc-valid">{validUntilLabel(row)}</span>
                      </td>
                      <td>
                        <span className="fp-chip">{row.mode === 'dynamic' ? 'Dynamic' : 'Fixed'}</span>
                        <em className="fp-disc-kind">
                          {row.kind === 'conditional' ? 'Conditional' : 'Standard'}
                        </em>
                      </td>
                      <td>
                        <AppMenu
                          align="end"
                          minWidth={160}
                          items={[
                            {
                              id: 'edit',
                              label: 'Edit',
                              icon: <Pencil size={15} />,
                              onSelect: () => {
                                setEditRow(row);
                                setModalOpen(true);
                              },
                            },
                            {
                              id: 'delete',
                              label: 'Delete',
                              icon: <Trash2 size={15} />,
                              danger: true,
                              onSelect: () => setDeleteIds([row.id]),
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

      <CreateDiscountModal
        open={modalOpen}
        edit={editRow}
        onClose={() => {
          setModalOpen(false);
          setEditRow(null);
        }}
        onCreated={() => {
          refresh();
          onToast(editRow ? 'Discount updated' : 'Discount created');
        }}
      />

      <Modal
        open={Boolean(deleteIds?.length)}
        title={deleteIds && deleteIds.length > 1 ? 'Delete Discounts' : 'Delete Discount'}
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
            ? `Delete ${deleteIds.length} selected discounts? This cannot be undone.`
            : 'Delete this discount? This cannot be undone.'}
        </p>
      </Modal>
    </motion.div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreVertical, Pencil, Percent, Plus, Search, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { TaxRateModal } from './TaxRateModal';
import {
  deleteTaxRates,
  formatTaxRate,
  loadTaxRates,
  type TaxRate,
} from '@/lib/billing-accounting/taxRatesStore';

type SortKey = 'name' | 'rate';
type SortDir = 'asc' | 'desc';

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  onToast: (msg: string) => void;
};

export function FeePlanTaxRatesPanel({ onToast }: Props) {
  const [rows, setRows] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<TaxRate | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const refresh = () => setRows(loadTaxRates());

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
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.name} ${r.itemCode} ${r.rate}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'rate') return (a.rate - b.rate) * dir;
      return a.name.localeCompare(b.name) * dir;
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

  const sortTooltip =
    sortDir === 'asc' ? 'Click to sort descending' : 'Click to sort ascending';

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
    deleteTaxRates(deleteIds);
    setDeleteIds(null);
    setSelected(new Set());
    refresh();
    onToast(deleteIds.length > 1 ? 'Tax rates deleted' : 'Tax rate deleted');
  };

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
              placeholder="Search by name"
              aria-label="Search tax rates"
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
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditRow(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            Add tax rate
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
              <Percent size={28} />
            </div>
            <h3>No Data</h3>
            <p>Add a tax rate to apply GST and other percentages on fee items and invoices.</p>
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
              Add tax rate
            </button>
          </div>
        ) : (
          <div className="fp-table-wrap fp-tax-wrap">
            <table className="ui-table fp-table fp-tax-table">
              <thead>
                <tr>
                  <th className="fp-tax-check-col">
                    <input
                      type="checkbox"
                      className="fp-check"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all tax rates on this page"
                    />
                  </th>
                  <th>
                    <AppTooltip
                      content={sortKey === 'name' ? sortTooltip : 'Click to sort ascending'}
                      side="bottom"
                    >
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
                    <AppTooltip
                      content={sortKey === 'rate' ? sortTooltip : 'Click to sort ascending'}
                      side="bottom"
                    >
                      <button
                        type="button"
                        className={`fp-sort${sortKey === 'rate' ? ' is-on' : ''}`}
                        onClick={() => toggleSort('rate')}
                      >
                        Tax Rate
                        <span aria-hidden>
                          {sortKey === 'rate' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                        </span>
                      </button>
                    </AppTooltip>
                  </th>
                  <th className="fp-tax-actions-col" aria-label="Actions">
                    Actions
                  </th>
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
                      className={isOn ? 'is-selected' : undefined}
                    >
                      <td className="fp-tax-check-col">
                        <input
                          type="checkbox"
                          className="fp-check"
                          checked={isOn}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td>
                        <div className="fp-item fp-tax-item">
                          <strong>{row.name}</strong>
                          <em>Item Code : {row.itemCode}</em>
                        </div>
                      </td>
                      <td>
                        <span className="fp-tax-pill">{formatTaxRate(row.rate)}</span>
                      </td>
                      <td className="fp-tax-actions-col">
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

      <TaxRateModal
        open={modalOpen}
        edit={editRow}
        onClose={() => {
          setModalOpen(false);
          setEditRow(null);
        }}
        onSaved={() => {
          refresh();
          onToast(editRow ? 'Tax rate updated' : 'Tax rate created');
        }}
      />

      <Modal
        open={Boolean(deleteIds?.length)}
        title={deleteIds && deleteIds.length > 1 ? 'Delete Tax Rates' : 'Delete Tax Rate'}
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
            ? `Delete ${deleteIds.length} selected tax rates? This cannot be undone.`
            : 'Delete this tax rate? This cannot be undone.'}
        </p>
      </Modal>
    </motion.div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Layers,
  MoreVertical,
  Package,
  Pencil,
  Percent,
  Plus,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react';
import { BillingAccountingPageHeader } from './BillingAccountingPageHeader';
import { TableSkeleton } from '@/components/ui/loading';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, AppTooltip } from '@/components/modules/center-management/ui';
import { FeeComponentModal } from './FeeComponentModal';
import { FeePlanDiscountsPanel } from './FeePlanDiscountsPanel';
import { FeePlanPlansPanel } from './FeePlanPlansPanel';
import { FeePlanTaxRatesPanel } from './FeePlanTaxRatesPanel';
import {
  deleteFeeComponents,
  formatFeePrice,
  loadFeeComponents,
  type FeeComponent,
  type FeeComponentCategory,
} from '@/lib/billing-accounting/feeComponentsStore';
import { loadFeePlans } from '@/lib/billing-accounting/feePlansStore';
import { loadDiscounts } from '@/lib/billing-accounting/invoiceStore';
import { loadTaxRates } from '@/lib/billing-accounting/taxRatesStore';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/center-management/billing.css';
/* billing-invoices.css loaded from billing-accounting/layout.tsx */
import './fee-plan.css';

type TabId = 'plans' | 'components' | 'discount' | 'tax';
type SortKey = 'name' | 'category' | 'unitPrice' | 'plansUsed';
type SortDir = 'asc' | 'desc';
type CategoryFilter = 'All' | FeeComponentCategory;

const TABS: { id: TabId; label: string }[] = [
  { id: 'plans', label: 'Fee Plan' },
  { id: 'components', label: 'Fee Components' },
  { id: 'discount', label: 'Discount' },
  { id: 'tax', label: 'Tax Rate' },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'One Time', label: 'One Time' },
  { value: 'Recurring', label: 'Recurring' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function FeePlanPage() {
  const [tab, setTab] = useState<TabId>('plans');
  const [rows, setRows] = useState<FeeComponent[]>([]);
  const [planCount, setPlanCount] = useState(0);
  const [discountCount, setDiscountCount] = useState(0);
  const [taxCount, setTaxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<FeeComponent | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = () => {
    setRows(loadFeeComponents());
    setPlanCount(loadFeePlans().length);
    setDiscountCount(loadDiscounts().length);
    setTaxCount(loadTaxRates().length);
  };

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => {
      refresh();
      setLoading(false);
    }, 280);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== 'All' && r.category !== category) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.itemCode} ${r.description ?? ''} ${r.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, category]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'category') return a.category.localeCompare(b.category) * dir;
      if (sortKey === 'unitPrice') return (a.unitPrice - b.unitPrice) * dir;
      return (a.plansUsed - b.plansUsed) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageIds = pageRows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

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
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const confirmDelete = () => {
    if (!deleteIds?.length) return;
    deleteFeeComponents(deleteIds);
    setSelected((prev) => {
      const next = new Set(prev);
      deleteIds.forEach((id) => next.delete(id));
      return next;
    });
    setDeleteIds(null);
    refresh();
    setToast(deleteIds.length > 1 ? 'Fee components deleted' : 'Fee component deleted');
  };

  const toastNode =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {toast ? (
              <motion.div
                className="fp-toast"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22, ease }}
                role="status"
              >
                <span className="fp-toast-ico" aria-hidden>
                  <CheckCircle2 size={18} />
                </span>
                {toast}
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div className="bi-root fp-root">
      {toastNode}

      <BillingAccountingPageHeader
        title="Fee Plan"
        description="Build reusable fee components, plans, discounts, and tax rates for invoicing."
        icon={<Layers size={20} />}
      />

      <div className="fp-overview" aria-label="Fee plan overview">
        <article className="fp-overview-card is-lavender">
          <span className="fp-overview-shine" aria-hidden />
          <div className="fp-overview-icon" aria-hidden>
            <Receipt size={20} />
          </div>
          <div className="fp-overview-meta">
            <span className="fp-overview-label">Fee Plans</span>
            <strong className="fp-overview-value">{planCount}</strong>
          </div>
        </article>
        <article className="fp-overview-card is-mint">
          <span className="fp-overview-shine" aria-hidden />
          <div className="fp-overview-icon" aria-hidden>
            <Package size={20} />
          </div>
          <div className="fp-overview-meta">
            <span className="fp-overview-label">Components</span>
            <strong className="fp-overview-value">{rows.length}</strong>
          </div>
        </article>
        <article className="fp-overview-card is-blush">
          <span className="fp-overview-shine" aria-hidden />
          <div className="fp-overview-icon" aria-hidden>
            <Percent size={20} />
          </div>
          <div className="fp-overview-meta">
            <span className="fp-overview-label">Discounts</span>
            <strong className="fp-overview-value">{discountCount}</strong>
          </div>
        </article>
        <article className="fp-overview-card is-amber">
          <span className="fp-overview-shine" aria-hidden />
          <div className="fp-overview-icon" aria-hidden>
            <Layers size={20} />
          </div>
          <div className="fp-overview-meta">
            <span className="fp-overview-label">Tax Rates</span>
            <strong className="fp-overview-value">{taxCount}</strong>
          </div>
        </article>
      </div>

      <motion.div
        className="fp-shell"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease }}
      >
        <div className="fp-tabs-wrap">
          <div className="fp-tabs" role="tablist" aria-label="Fee plan sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`fp-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {tab === t.id ? (
                  <motion.span
                    className="fp-tab-ink"
                    layoutId="fp-tab-ink"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'components' ? (
            <motion.div
              key="components"
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
                      aria-label="Search fee components"
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
                  <span className="fp-field-label">Category</span>
                  <AppSelect
                    value={category}
                    onChange={(v) => {
                      setCategory(v as CategoryFilter);
                      setPage(1);
                    }}
                    options={CATEGORY_FILTER_OPTIONS}
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
                    Add Fee Component
                  </button>
                </div>
              </div>

              <div className="fp-panel">
                {loading ? (
                  <TableSkeleton rows={6} />
                ) : pageRows.length === 0 ? (
                  <div className="fp-empty">
                    <div className="fp-empty-art" aria-hidden>
                      <Package size={28} />
                    </div>
                    <h3>No fee components found</h3>
                    <p>Try another search, clear the category filter, or add a new component.</p>
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
                      Add Fee Component
                    </button>
                  </div>
                ) : (
                  <div className="fp-table-wrap">
                    <table className="ui-table fp-table">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}>
                            <input
                              type="checkbox"
                              className="fp-check"
                              checked={allPageSelected}
                              onChange={toggleAllPage}
                              aria-label="Select all on page"
                            />
                          </th>
                          <th>
                            <AppTooltip content="Click to sort" side="bottom">
                              <button
                                type="button"
                                className={`fp-sort${sortKey === 'name' ? ' is-on' : ''}`}
                                onClick={() => toggleSort('name')}
                              >
                                Item Name
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
                                className={`fp-sort${sortKey === 'category' ? ' is-on' : ''}`}
                                onClick={() => toggleSort('category')}
                              >
                                Category
                                <span aria-hidden>
                                  {sortKey === 'category' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                                </span>
                              </button>
                            </AppTooltip>
                          </th>
                          <th>
                            <AppTooltip content="Click to sort" side="bottom">
                              <button
                                type="button"
                                className={`fp-sort${sortKey === 'unitPrice' ? ' is-on' : ''}`}
                                onClick={() => toggleSort('unitPrice')}
                              >
                                Unit Price
                                <span aria-hidden>
                                  {sortKey === 'unitPrice' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                                </span>
                              </button>
                            </AppTooltip>
                          </th>
                          <th>Refundable</th>
                          <th>
                            <AppTooltip content="Click to sort" side="bottom">
                              <button
                                type="button"
                                className={`fp-sort${sortKey === 'plansUsed' ? ' is-on' : ''}`}
                                onClick={() => toggleSort('plansUsed')}
                              >
                                Total Plans Used
                                <span aria-hidden>
                                  {sortKey === 'plansUsed' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                                </span>
                              </button>
                            </AppTooltip>
                          </th>
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
                                className={isOn ? 'is-selected' : undefined}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{
                                  delay: Math.min(idx * 0.03, 0.24),
                                  duration: 0.28,
                                  ease,
                                }}
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
                                    <em>Item Code : {row.itemCode}</em>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className={`fp-chip${row.category === 'One Time' ? ' is-once' : ''}`}
                                  >
                                    {row.category}
                                  </span>
                                </td>
                                <td>
                                  <span className="fp-price">{formatFeePrice(row.unitPrice)}</span>
                                </td>
                                <td>
                                  <span className={row.refundable ? 'fp-yes' : 'fp-no'}>
                                    {row.refundable ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td>
                                  <span className="fp-plans">{row.plansUsed}</span>
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
            </motion.div>
          ) : tab === 'discount' ? (
            <FeePlanDiscountsPanel key="discount" onToast={setToast} />
          ) : tab === 'tax' ? (
            <FeePlanTaxRatesPanel key="tax" onToast={setToast} />
          ) : (
            <FeePlanPlansPanel key="plans" onToast={setToast} />
          )}
        </AnimatePresence>
      </motion.div>

      <FeeComponentModal
        open={modalOpen}
        edit={editRow}
        onClose={() => {
          setModalOpen(false);
          setEditRow(null);
        }}
        onSaved={() => {
          refresh();
          setToast(editRow ? 'Fee component updated' : 'Fee component created');
        }}
      />

      <Modal
        open={Boolean(deleteIds?.length)}
        title="Delete Fee Component"
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
            ? `Delete ${deleteIds.length} selected fee components? This cannot be undone.`
            : 'Delete this fee component? This cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Info,
  MoreVertical,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { Drawer } from '@/components/ui/Drawer';
import { AppSelect, TableActionMenu } from './ui';
import {
  LABEL_FEATURES,
  createLabelId,
  loadLabels,
  saveLabels,
  type LabelFeature,
  type LabelItem,
  type LabelStatus,
} from '@/lib/center-management/labelsStore';
import './students.css';
import './labels.css';

const CHIP_PREVIEW = 4;

function StatusDropdownCell({
  status,
  onChange,
  align = 'left',
}: {
  status: LabelStatus;
  onChange: (next: LabelStatus) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`cm-status-pill ${status === 'Active' ? 'mint' : 'blush'}`}
        style={{
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
        }}
      >
        <span>{status}</span>
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              ...(align === 'right' ? { right: 0 } : { left: 0 }),
              minWidth: '130px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid var(--border, #e2e8f0)',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.18)',
              zIndex: 100,
              padding: '6px',
              textAlign: 'left',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('Active');
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: status === 'Active' ? '#f0fdf4' : 'transparent',
                color: '#15803d',
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              Active
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('Inactive');
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: status === 'Inactive' ? '#fef2f2' : 'transparent',
                color: '#b91c1c',
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              Inactive
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type FeatureRow = {
  feature: LabelFeature;
  labels: LabelItem[];
  activeCount: number;
  inactiveCount: number;
};

export function LabelsPage() {
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [ready, setReady] = useState(false);

  const [featureFilter, setFeatureFilter] = useState('All features');
  const [search, setSearch] = useState('');
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFeaturesConfirm, setDeleteFeaturesConfirm] = useState<{
    open: boolean;
    features: LabelFeature[];
  }>({ open: false, features: [] });
  const [manageFeature, setManageFeature] = useState<LabelFeature | null>(null);
  const [selected, setSelected] = useState<LabelFeature[]>([]);

  const [addFeature, setAddFeature] = useState<LabelFeature>('Activity');
  const [draftName, setDraftName] = useState('');
  const [draftNames, setDraftNames] = useState<string[]>([]);
  const [addStatus, setAddStatus] = useState<LabelStatus>('Active');

  const [targetLabel, setTargetLabel] = useState<LabelItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editFeature, setEditFeature] = useState<LabelFeature>('Activity');
  const [editStatus, setEditStatus] = useState<LabelStatus>('Active');

  const [manageDraft, setManageDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  useEffect(() => {
    setLabels(loadLabels());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLabels(labels);
  }, [labels, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const featureRows = useMemo<FeatureRow[]>(() => {
    const q = search.trim().toLowerCase();
    return LABEL_FEATURES.map((feature) => {
      const featureLabels = labels
        .filter((l) => l.feature === feature)
        .filter((l) => !q || l.name.toLowerCase().includes(q) || feature.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        feature,
        labels: featureLabels,
        activeCount: featureLabels.filter((l) => l.status === 'Active').length,
        inactiveCount: featureLabels.filter((l) => l.status === 'Inactive').length,
      };
    }).filter((row) => {
      if (featureFilter !== 'All features' && row.feature !== featureFilter) return false;
      if (q) {
        const featureMatch = row.feature.toLowerCase().includes(q);
        return featureMatch || row.labels.length > 0;
      }
      return true;
    });
  }, [labels, featureFilter, search]);

  const totalPages = Math.max(1, Math.ceil(featureRows.length / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return featureRows.slice(start, start + pageSize);
  }, [featureRows, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [featureFilter, search, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const manageLabels = useMemo(() => {
    if (!manageFeature) return [];
    return labels
      .filter((l) => l.feature === manageFeature)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [labels, manageFeature]);

  const resetAddForm = () => {
    setAddFeature('Activity');
    setDraftName('');
    setDraftNames([]);
    setAddStatus('Active');
  };

  const openAdd = () => {
    resetAddForm();
    if (manageFeature) setAddFeature(manageFeature);
    setAddOpen(true);
  };

  const queueDraftName = () => {
    const name = draftName.trim();
    if (!name) return;
    if (draftNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      setToast({ type: 'err', message: 'Label already queued' });
      return;
    }
    setDraftNames((prev) => [...prev, name]);
    setDraftName('');
  };

  const handleCreateLabels = async () => {
    const names = draftNames.length
      ? draftNames
      : draftName.trim()
        ? [draftName.trim()]
        : [];
    if (!names.length) {
      setToast({ type: 'err', message: 'Add at least one label name' });
      return;
    }

    const duplicates = names.filter((name) =>
      labels.some(
        (l) =>
          l.feature === addFeature && l.name.toLowerCase() === name.toLowerCase(),
      ),
    );
    if (duplicates.length) {
      setToast({ type: 'err', message: `"${duplicates[0]}" already exists in ${addFeature}` });
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const created: LabelItem[] = names.map((name) => ({
      id: createLabelId(),
      name,
      feature: addFeature,
      status: addStatus,
      createdAt: now,
    }));
    setLabels((prev) => [...created, ...prev]);
    setIsSubmitting(false);
    setAddOpen(false);
    resetAddForm();
    setToast({
      type: 'ok',
      message:
        created.length === 1
          ? `Label "${created[0].name}" added`
          : `${created.length} labels added to ${addFeature}`,
    });
  };

  const openEdit = (label: LabelItem) => {
    setTargetLabel(label);
    setEditName(label.name);
    setEditFeature(label.feature);
    setEditStatus(label.status);
    setEditOpen(true);
  };

  const handleEditLabel = async () => {
    if (!targetLabel) return;
    const name = editName.trim();
    if (!name) {
      setToast({ type: 'err', message: 'Label name is required' });
      return;
    }
    const clash = labels.some(
      (l) =>
        l.id !== targetLabel.id &&
        l.feature === editFeature &&
        l.name.toLowerCase() === name.toLowerCase(),
    );
    if (clash) {
      setToast({ type: 'err', message: 'A label with this name already exists' });
      return;
    }

    setIsSubmitting(true);
    setLabels((prev) =>
      prev.map((l) =>
        l.id === targetLabel.id
          ? { ...l, name, feature: editFeature, status: editStatus }
          : l,
      ),
    );
    setIsSubmitting(false);
    setEditOpen(false);
    setTargetLabel(null);
    setToast({ type: 'ok', message: 'Label updated' });
  };

  const openDelete = (label: LabelItem) => {
    setTargetLabel(label);
    setDeleteOpen(true);
  };

  const handleDeleteLabel = async () => {
    if (!targetLabel) return;
    setIsSubmitting(true);
    setLabels((prev) => prev.filter((l) => l.id !== targetLabel.id));
    setIsSubmitting(false);
    setDeleteOpen(false);
    setToast({ type: 'ok', message: `Label "${targetLabel.name}" deleted` });
    setTargetLabel(null);
  };

  const allSelected =
    paginatedRows.length > 0 && paginatedRows.every((row) => selected.includes(row.feature));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((f) => !paginatedRows.some((row) => row.feature === f)),
      );
      return;
    }
    setSelected((prev) => [
      ...new Set([...prev, ...paginatedRows.map((row) => row.feature)]),
    ]);
  };

  const openDeleteFeature = (feature: LabelFeature) => {
    const count = labels.filter((l) => l.feature === feature).length;
    if (!count) {
      setToast({ type: 'err', message: `No labels to delete in ${feature}` });
      return;
    }
    setDeleteFeaturesConfirm({ open: true, features: [feature] });
  };

  const handleDeleteFeatures = async () => {
    const features = deleteFeaturesConfirm.features;
    if (!features.length) return;
    const featureSet = new Set(features);
    const count = labels.filter((l) => featureSet.has(l.feature)).length;
    if (!count) {
      setToast({ type: 'err', message: 'No labels to delete' });
      setDeleteFeaturesConfirm({ open: false, features: [] });
      return;
    }
    setIsSubmitting(true);
    setLabels((prev) => prev.filter((l) => !featureSet.has(l.feature)));
    if (manageFeature && featureSet.has(manageFeature)) setManageFeature(null);
    setSelected((prev) => prev.filter((f) => !featureSet.has(f)));
    setIsSubmitting(false);
    setDeleteFeaturesConfirm({ open: false, features: [] });
    setToast({
      type: 'ok',
      message:
        features.length === 1
          ? count === 1
            ? `1 label deleted from ${features[0]}`
            : `${count} labels deleted from ${features[0]}`
          : `${count} label${count === 1 ? '' : 's'} deleted from ${features.length} features`,
    });
  };

  const handleToggleStatus = (label: LabelItem, next: LabelStatus) => {
    if (label.status === next) return;
    setLabels((prev) =>
      prev.map((l) => (l.id === label.id ? { ...l, status: next } : l)),
    );
    setToast({ type: 'ok', message: `"${label.name}" marked as ${next}` });
  };

  const addManageDraft = () => {
    if (!manageFeature) return;
    const name = manageDraft.trim();
    if (!name) return;
    const exists = labels.some(
      (l) =>
        l.feature === manageFeature && l.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setToast({ type: 'err', message: 'Label already exists' });
      return;
    }
    const item: LabelItem = {
      id: createLabelId(),
      name,
      feature: manageFeature,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    setLabels((prev) => [item, ...prev]);
    setManageDraft('');
    setToast({ type: 'ok', message: `Label "${name}" added` });
  };

  const renderLabelChips = (row: FeatureRow) => {
    if (!row.labels.length) {
      return <span className="lbl-empty-labels">No labels yet</span>;
    }
    const expanded = expandedFeatures[row.feature];
    const visible = expanded ? row.labels : row.labels.slice(0, CHIP_PREVIEW);
    const hidden = row.labels.length - CHIP_PREVIEW;

    return (
      <div className="lbl-chips">
        <AnimatePresence mode="popLayout">
          {visible.map((label, idx) => (
            <motion.span
              key={label.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18, delay: idx * 0.03 }}
              className={`lbl-chip${label.status === 'Inactive' ? ' is-inactive' : ''}`}
              title={label.status === 'Inactive' ? `${label.name} (Inactive)` : label.name}
            >
              {label.name}
            </motion.span>
          ))}
        </AnimatePresence>
        {!expanded && hidden > 0 ? (
          <button
            type="button"
            className="lbl-chip-more"
            onClick={() =>
              setExpandedFeatures((prev) => ({ ...prev, [row.feature]: true }))
            }
          >
            +{hidden} more
          </button>
        ) : null}
        {expanded && row.labels.length > CHIP_PREVIEW ? (
          <button
            type="button"
            className="lbl-chip-more"
            onClick={() =>
              setExpandedFeatures((prev) => ({ ...prev, [row.feature]: false }))
            }
          >
            Show less
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="cm-page cm-page--labels">
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {toast ? (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={`lbl-toast ${toast.type}`}
                  role="status"
                >
                  <span className="lbl-toast-icon" aria-hidden>
                    {toast.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  </span>
                  <span className="lbl-toast-msg">{toast.message}</span>
                  <button
                    type="button"
                    className="lbl-toast-close"
                    aria-label="Dismiss"
                    onClick={() => setToast(null)}
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <CenterManagementPageHeader
        title="Labels"
        description="Create and manage labels for better organization."
        icon={<Tags />}
        actions={
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            className="ui-btn ui-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} /> Add
          </motion.button>
        }
      />

      <div className="lbl-banner">
        <span className="lbl-banner-icon" aria-hidden>
          <Info size={15} />
        </span>
        <p style={{ margin: 0 }}>
          Create and manage labels for all features in one place. Labels help you filter and
          organize items within each feature.
        </p>
      </div>

      <div className="lbl-toolbar">
        <div className="lbl-toolbar-left">
          <div style={{ width: 200 }}>
            <AppSelect
              value={featureFilter}
              onChange={setFeatureFilter}
              options={[
                { label: 'All features', value: 'All features' },
                ...LABEL_FEATURES.map((f) => ({ label: f, value: f })),
              ]}
            />
          </div>
          <div className="cm-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search labels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="cm-panel lbl-panel">
        <div className="cm-toolbar cm-toolbar--labels">
          <span className="cm-toolbar-hint">
            {selected.length
              ? `${selected.length} selected`
              : 'Select features to bulk delete labels'}
          </span>
          <button
            type="button"
            className="cm-icon-btn cm-icon-btn--danger"
            title="Delete selected"
            aria-label="Delete labels for selected features"
            onClick={() => {
              if (!selected.length) {
                setToast({ type: 'err', message: 'Select features first' });
                return;
              }
              const withLabels = selected.filter((f) =>
                labels.some((l) => l.feature === f),
              );
              if (!withLabels.length) {
                setToast({ type: 'err', message: 'No labels to delete in selected features' });
                return;
              }
              setDeleteFeaturesConfirm({ open: true, features: withLabels });
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="cm-table-wrap lbl-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  <input
                    className="cm-check"
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all features on this page"
                  />
                </th>
                <th style={{ width: '22%' }}>Feature</th>
                <th>Labels</th>
                <th style={{ width: '18%' }}>Status</th>
                <th style={{ width: '90px', textAlign: 'right', paddingRight: 24 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length ? (
                paginatedRows.map((row, idx) => {
                  const isChecked = selected.includes(row.feature);
                  return (
                  <motion.tr
                    key={row.feature}
                    className="lbl-row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.035, duration: 0.28 }}
                  >
                    <td>
                      <input
                        className="cm-check"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelected((prev) =>
                            isChecked
                              ? prev.filter((f) => f !== row.feature)
                              : [...prev, row.feature],
                          );
                        }}
                        aria-label={`Select ${row.feature}`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cm-link lbl-feature-name"
                        onClick={() => {
                          setManageFeature(row.feature);
                          setManageDraft('');
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {row.feature}
                      </button>
                      <div className="lbl-feature-count">
                        {row.labels.length
                          ? `${row.labels.length} Label${row.labels.length === 1 ? '' : 's'}`
                          : '0 Labels'}
                      </div>
                    </td>
                    <td>{renderLabelChips(row)}</td>
                    <td>
                      {row.labels.length === 0 ? (
                        <span className="lbl-empty-labels">—</span>
                      ) : (
                        <div className="lbl-status-mix">
                          {row.activeCount > 0 ? (
                            <span className="cm-status-pill mint" style={{ padding: '4px 10px' }}>
                              <span className="lbl-status-dot ok" />
                              {row.activeCount} Active
                            </span>
                          ) : null}
                          {row.inactiveCount > 0 ? (
                            <span className="cm-status-pill blush" style={{ padding: '4px 10px' }}>
                              <span className="lbl-status-dot off" />
                              {row.inactiveCount} Inactive
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 14 }}>
                      <TableActionMenu
                        onDelete={() => openDeleteFeature(row.feature)}
                        extra={[
                          {
                            id: 'manage',
                            label: 'Manage labels',
                            icon: <Tags size={15} />,
                            onSelect: () => {
                              setManageFeature(row.feature);
                              setManageDraft('');
                            },
                          },
                        ]}
                      />
                    </td>
                  </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                    No features or labels match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {featureRows.length > 0 ? (
          <div className="cm-pagination">
            <span className="cm-page-info">
              Showing{' '}
              {Math.min(featureRows.length, (currentPage - 1) * pageSize + 1)} to{' '}
              {Math.min(featureRows.length, currentPage * pageSize)} of {featureRows.length}{' '}
              results
            </span>
            <div className="cm-page-btns">
              <button
                type="button"
                className="cm-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`cm-page-num${page === currentPage ? ' is-active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="cm-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  setCurrentPage(1);
                }}
                options={[
                  { label: '10 / page', value: '10' },
                  { label: '30 / page', value: '30' },
                  { label: '50 / page', value: '50' },
                ]}
                align="end"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Label Modal */}
      <Modal
        open={addOpen}
        title="Add Label"
        onClose={() => {
          if (!isSubmitting) setAddOpen(false);
        }}
        icon={<Tags size={18} />}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setAddOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={handleCreateLabels}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </>
        }
      >
        <div className="ui-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
          <div className="ui-field">
            <label className="ui-label">Feature</label>
            <AppSelect
              value={addFeature}
              onChange={(v) => setAddFeature(v as LabelFeature)}
              options={LABEL_FEATURES.map((f) => ({ label: f, value: f }))}
            />
          </div>

          <div className="ui-field">
            <label className="ui-label">Label</label>
            <div className="lbl-draft-row">
              <input
                className="ui-input"
                placeholder="Add label name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    queueDraftName();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="lbl-plus-btn"
                onClick={queueDraftName}
                disabled={!draftName.trim()}
                aria-label="Queue label"
              >
                <Plus size={18} />
              </button>
            </div>
            <AnimatePresence>
              {draftNames.length ? (
                <motion.div
                  className="lbl-draft-chips"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {draftNames.map((name) => (
                    <motion.span
                      key={name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="lbl-draft-chip"
                    >
                      {name}
                      <button
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() =>
                          setDraftNames((prev) => prev.filter((n) => n !== name))
                        }
                      >
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="ui-field">
            <label className="ui-label">Status</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['Active', 'Inactive'] as LabelStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`cm-status-pill ${s === 'Active' ? 'mint' : 'blush'}`}
                  onClick={() => setAddStatus(s)}
                  style={{
                    border:
                      addStatus === s
                        ? `1.5px solid ${s === 'Active' ? '#22c55e' : '#ef4444'}`
                        : '1.5px solid transparent',
                    cursor: 'pointer',
                    opacity: addStatus === s ? 1 : 0.55,
                    padding: '6px 14px',
                    transition: 'opacity 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Label Modal — elevated so it stacks above Manage drawer */}
      <Modal
        open={editOpen}
        title="Edit Label"
        elevated
        onClose={() => {
          if (!isSubmitting) setEditOpen(false);
        }}
        icon={<Tags size={18} />}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={handleEditLabel}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="ui-field">
            <label className="ui-label">Feature</label>
            <AppSelect
              value={editFeature}
              onChange={(v) => setEditFeature(v as LabelFeature)}
              options={LABEL_FEATURES.map((f) => ({ label: f, value: f }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Label name</label>
            <input
              className="ui-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Status</label>
            <StatusDropdownCell status={editStatus} onChange={setEditStatus} />
          </div>
        </div>
      </Modal>

      {/* Delete confirm — elevated above Manage drawer */}
      <Modal
        open={deleteOpen}
        title="Delete Label"
        elevated
        onClose={() => {
          if (!isSubmitting) setDeleteOpen(false);
        }}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={handleDeleteLabel}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
          Are you sure you want to delete the label <strong>{targetLabel?.name}</strong>
          {targetLabel ? ` from ${targetLabel.feature}` : ''}?
        </p>
      </Modal>

      {/* Delete all labels for feature(s) */}
      <Modal
        open={deleteFeaturesConfirm.open}
        title={deleteFeaturesConfirm.features.length > 1 ? 'Delete Labels' : 'Delete Labels'}
        elevated
        onClose={() => {
          if (!isSubmitting) setDeleteFeaturesConfirm({ open: false, features: [] });
        }}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteFeaturesConfirm({ open: false, features: [] })}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={handleDeleteFeatures}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {deleteFeaturesConfirm.features.length > 1 ? (
            <>
              Delete all labels under <strong>{deleteFeaturesConfirm.features.length} selected features</strong>? This cannot be undone.
            </>
          ) : (
            <>
              Delete all labels under <strong>{deleteFeaturesConfirm.features[0]}</strong>? This cannot be undone.
            </>
          )}
        </p>
      </Modal>

      {/* Manage feature drawer */}
      <Drawer
        open={Boolean(manageFeature)}
        title="Manage labels"
        onClose={() => {
          if (editOpen || deleteOpen) return;
          setManageFeature(null);
        }}
        icon={<Tags size={18} />}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setManageFeature(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                setManageFeature(null);
                setToast({ type: 'ok', message: 'Changes saved' });
              }}
            >
              Save changes
            </button>
          </>
        }
      >
        {manageFeature ? (
          <div>
            <div className="lbl-manage-meta">
              <div>
                <h3>{manageFeature}</h3>
                <p>
                  {manageLabels.length} Label{manageLabels.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className="lbl-count-badge">{manageLabels.length}</span>
            </div>

            <label className="lbl-section-label">Add new label</label>
            <div className="lbl-draft-row">
              <input
                className="ui-input"
                placeholder="Type label name..."
                value={manageDraft}
                onChange={(e) => setManageDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addManageDraft();
                  }
                }}
              />
              <button
                type="button"
                className="lbl-plus-btn"
                onClick={addManageDraft}
                disabled={!manageDraft.trim()}
                aria-label="Add label"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="lbl-existing-head">
              <span>Existing labels</span>
              <span className="lbl-count-badge">{manageLabels.length}</span>
            </div>

            {manageLabels.length ? (
              <div className="lbl-item-list">
                <AnimatePresence mode="popLayout">
                  {manageLabels.map((label, idx) => (
                    <motion.div
                      key={label.id}
                      layout
                      className="lbl-item"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12, height: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.22 }}
                    >
                      <span
                        className={`lbl-item-name${label.status === 'Inactive' ? ' is-inactive' : ''}`}
                      >
                        {label.name}
                      </span>
                      <div className="lbl-item-actions">
                        <StatusDropdownCell
                          status={label.status}
                          onChange={(next) => handleToggleStatus(label, next)}
                          align="right"
                        />
                        <TableActionMenu
                          onEdit={() => openEdit(label)}
                          onDelete={() => openDelete(label)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="lbl-empty-state">
                <MoreVertical size={22} style={{ opacity: 0.35 }} />
                <p>No labels yet. Add your first label above.</p>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

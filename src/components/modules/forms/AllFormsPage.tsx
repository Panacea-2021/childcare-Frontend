'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  CopyPlus,
  Eye,
  FileDown,
  FileStack,
  FileText,
  Link2,
  MoreVertical,
  Pencil,
  Plus,
  QrCode,
  Radio,
  ScrollText,
  Search,
  Share2,
  Trash2,
  Unlink,
  Users,
  XCircle,
} from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { CreateFormModal } from './CreateFormModal';
import { EditFormModal } from './EditFormModal';
import { ViewFormModal } from './ViewFormModal';
import { ShareWithStudentsModal } from './ShareWithStudentsModal';
import { FormsPortalMenu } from './FormsPortalMenu';
import { copyFormShareLink, downloadFormQr } from './formShareUtils';
import { FORM_CATEGORIES, FORM_TYPE_FILTERS } from './mockData';
import { createBlankAnalytics, loadForms, saveForms, upsertForm } from './formsStore';
import type {
  Audience,
  FormCategory,
  FormItem,
  FormStatus,
  FormTemplate,
  FormType,
  StartingPoint,
  StatusFilter,
} from './types';
import '../center-management/students.css';
import '@/components/app/dashboard.css';
import './forms.css';

type MenuKind = 'share' | 'more' | null;

type MenuState = {
  id: string;
  kind: MenuKind;
  anchor: HTMLElement | null;
};

function AnalyticsCell({ item }: { item: FormItem }) {
  const { submitted, rejected, changesRequested, pendingReview } = item.analytics;
  return (
    <div className="forms-analytics" aria-label="Form analytics">
      <span className="forms-metric is-ok" title="Approved">
        <CheckCircle2 size={15} aria-hidden />
        {submitted}
      </span>
      <span className="forms-metric is-bad" title="Rejected">
        <XCircle size={15} aria-hidden />
        {rejected}
      </span>
      <span className="forms-metric is-doc" title="Changes requested">
        <FileText size={15} aria-hidden />
        {changesRequested}
      </span>
      <span className="forms-metric is-time" title="Pending review">
        <Clock3 size={15} aria-hidden />
        {pendingReview}
      </span>
    </div>
  );
}

function todayLabel() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function AllFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [category, setCategory] = useState<'All Categories' | FormCategory>('All Categories');
  const [formType, setFormType] = useState<'All Forms' | FormType>('All Forms');
  const [sortAsc, setSortAsc] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewForm, setViewForm] = useState<FormItem | null>(null);
  const [editForm, setEditForm] = useState<FormItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState>({ id: '', kind: null, anchor: null });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [shareFormTarget, setShareFormTarget] = useState<FormItem | null>(null);

  useEffect(() => {
    setForms(loadForms());
  }, []);

  const persist = (next: FormItem[]) => {
    setForms(next);
    saveForms(next);
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const closeMenu = () => setMenu({ id: '', kind: null, anchor: null });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = forms.filter((f) => {
      if (status !== 'All' && f.status !== status) return false;
      if (category !== 'All Categories' && f.category !== category) return false;
      if (formType !== 'All Forms' && f.type !== formType) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
    return list;
  }, [forms, search, status, category, formType, sortAsc]);

  const liveCount = forms.filter((f) => f.status === 'Live').length;
  const draftCount = forms.filter((f) => f.status === 'Draft').length;

  const toggleMenu = (id: string, kind: Exclude<MenuKind, null>, anchor: HTMLElement) => {
    setMenu((prev) =>
      prev.id === id && prev.kind === kind
        ? { id: '', kind: null, anchor: null }
        : { id, kind, anchor },
    );
  };

  const menuItem = menu.id ? rows.find((row) => row.id === menu.id) ?? null : null;

  const cloneForm = (item: FormItem) => {
    persist([
      {
        ...item,
        id: `frm-${Date.now()}`,
        name: `${item.name} (Copy)`,
        status: 'Draft',
        date: todayLabel(),
        analytics: createBlankAnalytics(),
      },
      ...forms,
    ]);
    flash('Form cloned as draft');
  };

  const deleteForm = (id: string) => {
    persist(forms.filter((f) => f.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    flash('Form deleted');
  };

  const allVisibleSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));
  const someVisibleSelected = rows.some((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visible = new Set(rows.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !visible.has(id)));
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => next.add(r.id));
      return [...next];
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const confirmBulkDelete = () => {
    if (!selectedIds.length) return;
    const count = selectedIds.length;
    persist(forms.filter((f) => !selectedIds.includes(f.id)));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    flash(`${count} form${count === 1 ? '' : 's'} deleted`);
  };

  const togglePublish = (item: FormItem) => {
    persist(
      forms.map((f) =>
        f.id === item.id
          ? { ...f, status: (f.status === 'Live' ? 'Draft' : 'Live') as FormStatus }
          : f,
      ),
    );
    flash(item.status === 'Live' ? 'Form unpublished' : 'Form published');
  };

  const handleCreate = (payload: {
    audience: Audience;
    startingPoint: StartingPoint;
    template: FormTemplate | null;
  }) => {
    const name =
      payload.template?.title ??
      (payload.startingPoint === 'ai'
        ? 'AI Generated Form'
        : payload.startingPoint === 'pdf'
          ? 'Fillable PDF Form'
          : 'New Form');
    setCreateOpen(false);
    const qs = new URLSearchParams({
      title: name,
      audience: payload.audience,
      start: payload.startingPoint ?? (payload.template ? 'template' : 'scratch'),
    });
    if (payload.template) qs.set('template', payload.template.id);
    router.push(`/forms/builder?${qs.toString()}`);
  };

  const handleSaveEdit = (next: FormItem) => {
    const list = upsertForm(next);
    setForms(list);
    setEditForm(null);
    flash('Form updated');
  };

  return (
    <div className="cm-page cm-page--forms forms-page">
      <CenterManagementPageHeader
        title="Forms"
        description="Create, publish, and manage reusable forms for students, staff, and enquiries."
        icon={<FileText size={22} strokeWidth={2.1} />}
        actions={
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setCreateOpen(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} aria-hidden />
            Create Form
          </motion.button>
        }
      />

      <div className="dash-stats forms-dash-stats" role="list" aria-label="Forms summary">
        <div className="dash-statsInner forms-dash-stats-inner">
          <motion.article
            className="dash-kpiCard dash-kpi-purple"
            role="listitem"
            style={{ '--dash-stagger': '0ms' } as CSSProperties}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="dash-kpiLeft">
              <span className="dash-kpiIcon" aria-hidden>
                <FileStack size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Total forms</span>
                <span className="dash-kpiHint">All form records</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{forms.length}</strong>
            </div>
          </motion.article>

          <motion.article
            className="dash-kpiCard dash-kpi-green"
            role="listitem"
            style={{ '--dash-stagger': '70ms' } as CSSProperties}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="dash-kpiLeft">
              <span className="dash-kpiIcon" aria-hidden>
                <Radio size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Live</span>
                <span className="dash-kpiHint">Published &amp; active</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{liveCount}</strong>
            </div>
          </motion.article>

          <motion.article
            className="dash-kpiCard dash-kpi-pink"
            role="listitem"
            style={{ '--dash-stagger': '140ms' } as CSSProperties}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="dash-kpiLeft">
              <span className="dash-kpiIcon" aria-hidden>
                <FileText size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Draft</span>
                <span className="dash-kpiHint">Not published yet</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{draftCount}</strong>
            </div>
          </motion.article>
        </div>
      </div>

      <section className="cm-filters forms-filters-bar" aria-label="Filters">
        <label className="forms-search">
          <span aria-hidden>
            <Search size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category"
            aria-label="Search by name or category"
          />
        </label>

        <div className="forms-seg" role="tablist" aria-label="Status filter">
          {(['All', 'Live', 'Draft'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={status === s}
              className={status === s ? 'is-active' : undefined}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="forms-filters">
          <div className="forms-filter-select">
            <SearchableSelect
              value={category}
              onChange={(v) => setCategory(v as typeof category)}
              options={FORM_CATEGORIES}
              placeholder="All Categories"
              searchPlaceholder="Search category…"
              searchable
              ariaLabel="Filter by category"
            />
          </div>
          <div className="forms-filter-select">
            <SearchableSelect
              value={formType}
              onChange={(v) => setFormType(v as typeof formType)}
              options={FORM_TYPE_FILTERS}
              placeholder="All Forms"
              searchable={false}
              ariaLabel="Filter by form type"
            />
          </div>
        </div>
      </section>

      <section className="ui-table-wrap forms-table-panel">
        {selectedIds.length > 0 ? (
          <div className="forms-bulk-bar">
            <p className="forms-bulk-meta">
              <strong>{selectedIds.length}</strong> selected
            </p>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 size={15} aria-hidden />
              Bulk Delete
            </button>
          </div>
        ) : null}
        {rows.length === 0 ? (
          <div className="forms-empty">
            <strong>No forms found</strong>
            Try adjusting search or filters, or create a new form.
          </div>
        ) : (
          <div className="forms-table-scroll">
            <table className="ui-table forms-table">
              <thead>
                <tr>
                  <th className="forms-th-check" scope="col">
                    <input
                      type="checkbox"
                      className="cm-check"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                      }}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible forms"
                    />
                  </th>
                  <th
                    className="sortable"
                    onClick={() => setSortAsc((v) => !v)}
                    aria-sort={sortAsc ? 'ascending' : 'descending'}
                  >
                    <span className="forms-th-sort">
                      Form Name
                      <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden>
                        <path d="M5 1 9 6H1L5 1Z" fill="currentColor" opacity="0.45" />
                        <path d="M5 13 1 8h8L5 13Z" fill="currentColor" opacity="0.45" />
                      </svg>
                    </span>
                  </th>
                  <th>Analytics</th>
                  <th>Form Type</th>
                  <th>Category</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => {
                  const shareOpen = menu.id === item.id && menu.kind === 'share';
                  const moreOpen = menu.id === item.id && menu.kind === 'more';
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <motion.tr
                      key={item.id}
                      className={
                        shareOpen || moreOpen
                          ? 'is-active-row is-menu-open'
                          : isChecked
                            ? 'is-active-row'
                            : undefined
                      }
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.28 }}
                    >
                      <td className="forms-td-check">
                        <input
                          type="checkbox"
                          className="cm-check"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(item.id)}
                          aria-label={`Select ${item.name}`}
                        />
                      </td>
                      <td>
                        <div className="forms-name-cell">
                          <div className="forms-name-top">
                            <button
                              type="button"
                              className="forms-name forms-name-link"
                              onClick={() => setViewForm(item)}
                            >
                              {item.name}
                            </button>
                            <span
                              className={`forms-badge ${item.status === 'Live' ? 'forms-badge-live' : 'forms-badge-draft'}`}
                            >
                              {item.status === 'Live' ? 'LIVE' : 'DRAFT'}
                            </span>
                          </div>
                          <div className="forms-meta">
                            <span className="forms-meta-item">{item.date}</span>
                            {item.durationMin != null ? (
                              <span className="forms-meta-item">
                                <Clock3 size={12} aria-hidden />
                                {item.durationMin} min
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <AnalyticsCell item={item} />
                      </td>
                      <td>
                        <span className="forms-type-pill">{item.type}</span>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <div className="forms-actions">
                          <button
                            type="button"
                            className="forms-icon-btn"
                            aria-label={`View ${item.name}`}
                            title="View"
                            onClick={() => setViewForm(item)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="forms-icon-btn"
                            aria-label={`Edit ${item.name}`}
                            title="Edit"
                            onClick={() => setEditForm(item)}
                          >
                            <Pencil size={16} />
                          </button>

                          <div className="forms-menu-wrap">
                            <button
                              type="button"
                              className={`forms-icon-btn ${shareOpen ? 'is-on' : ''}`}
                              aria-label={`Share ${item.name}`}
                              aria-expanded={shareOpen}
                              title="Share"
                              onClick={(event) => toggleMenu(item.id, 'share', event.currentTarget)}
                            >
                              <Share2 size={16} />
                            </button>
                          </div>

                          <div className="forms-menu-wrap">
                            <button
                              type="button"
                              className={`forms-icon-btn ${moreOpen ? 'is-on' : ''}`}
                              aria-label={`More actions for ${item.name}`}
                              aria-expanded={moreOpen}
                              title="More"
                              onClick={(event) => toggleMenu(item.id, 'more', event.currentTarget)}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CreateFormModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      <ShareWithStudentsModal
        open={Boolean(shareFormTarget)}
        form={shareFormTarget}
        onClose={() => setShareFormTarget(null)}
        onShared={(count) => {
          const target = shareFormTarget;
          if (target && count > 0) {
            const list = upsertForm({
              ...target,
              sharedWith: (target.sharedWith ?? 0) + count,
            });
            setForms(list);
          }
          flash(
            count
              ? `Form shared with ${count} student${count === 1 ? '' : 's'}`
              : 'No students selected',
          );
        }}
      />

      <ViewFormModal
        open={Boolean(viewForm)}
        form={viewForm}
        onClose={() => setViewForm(null)}
        onEdit={(form) => {
          setViewForm(null);
          setEditForm(form);
        }}
        onOpenSubmissions={(form) => {
          setViewForm(null);
          router.push(`/forms/${form.id}`);
        }}
      />

      <EditFormModal
        open={Boolean(editForm)}
        form={editForm}
        onClose={() => setEditForm(null)}
        onSave={handleSaveEdit}
        onOpenBuilder={(form) => {
          setEditForm(null);
          router.push(
            `/forms/builder?id=${form.id}&title=${encodeURIComponent(form.name)}&audience=${form.type}`,
          );
        }}
      />

      <Modal
        open={bulkDeleteOpen}
        title="Bulk Delete Forms"
        onClose={() => setBulkDeleteOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmBulkDelete}>
              Delete {selectedIds.length} form{selectedIds.length === 1 ? '' : 's'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Confirm to delete <strong>{selectedIds.length}</strong> selected form
          {selectedIds.length === 1 ? '' : 's'}. This action cannot be undone.
        </p>
      </Modal>

      {menuItem && menu.kind === 'share' ? (
        <FormsPortalMenu open anchor={menu.anchor} onClose={closeMenu}>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setShareFormTarget(menuItem);
            }}
          >
            <Users size={15} />
            Share With Students
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              flash('Prefill & share opened');
            }}
          >
            <ClipboardCopy size={15} />
            Prefill &amp; Share
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              void copyFormShareLink(menuItem.id)
                .then(() => flash('Shareable link copied'))
                .catch(() => flash('Could not copy link'));
            }}
          >
            <Link2 size={15} />
            Copy Shareable Link
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              void downloadFormQr(menuItem)
                .then(() => flash('QR code downloaded'))
                .catch(() => flash('Could not download QR code'));
            }}
          >
            <QrCode size={15} />
            Download QR Code
          </button>
        </FormsPortalMenu>
      ) : null}

      {menuItem && menu.kind === 'more' ? (
        <FormsPortalMenu open anchor={menu.anchor} onClose={closeMenu} className="forms-menu-more">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              togglePublish(menuItem);
              closeMenu();
            }}
          >
            <Unlink size={15} />
            {menuItem.status === 'Live' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              window.open(
                `/forms/blank/${encodeURIComponent(menuItem.id)}`,
                '_blank',
                'noopener,noreferrer',
              );
            }}
          >
            <FileDown size={15} />
            Download Blank Form
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              cloneForm(menuItem);
              closeMenu();
            }}
          >
            <CopyPlus size={15} />
            Clone
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              deleteForm(menuItem.id);
              closeMenu();
            }}
          >
            <Trash2 size={15} />
            Delete
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              flash(`Opening logs for “${menuItem.name}”`);
            }}
          >
            <ScrollText size={15} />
            Logs
          </button>
        </FormsPortalMenu>
      ) : null}

      {toast ? (
        <div className="forms-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

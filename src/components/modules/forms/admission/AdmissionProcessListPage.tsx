'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Download,
  Eye,
  FilePenLine,
  GitBranchPlus,
  MoreVertical,
  Pencil,
  Plus,
  Radio,
  Search,
  Share2,
  Trash2,
  Users,
  Workflow,
} from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { CreateProcessModal, type ProcessFormPayload } from './CreateProcessModal';
import { ShareAdmissionProcessModal } from './ShareAdmissionProcessModal';
import { ViewProcessModal } from './ViewProcessModal';
import { deleteProcess, loadProcesses, upsertProcess } from './admissionStore';
import { downloadAdmissionBlankPdf } from './downloadAdmissionBlankPdf';
import type { AdmissionProcess, ProcessStatus } from './types';
import '../../center-management/students.css';
import '@/components/app/dashboard.css';
import './admission.css';

function formatDue(iso: string) {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function SortIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden>
      <path d="M5 1 9 6H1L5 1Z" fill="currentColor" opacity="0.45" />
      <path d="M5 13 1 8h8L5 13Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function AdmissionProcessListPage() {
  const router = useRouter();
  const [list, setList] = useState<AdmissionProcess[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProcessStatus>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdmissionProcess | null>(null);
  const [viewTarget, setViewTarget] = useState<AdmissionProcess | null>(null);
  const [shareTarget, setShareTarget] = useState<AdmissionProcess | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'status' | 'due' | 'students'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setList(loadProcesses());
  }, []);

  useEffect(() => {
    if (!menuId) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuId]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
      return;
    }
    setSortKey(key);
    setSortAsc(true);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = list.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'due':
          cmp = (a.dueDate || '').localeCompare(b.dueDate || '');
          break;
        case 'students':
          cmp = a.totalStudents - b.totalStudents;
          break;
        default:
          cmp = a.name.localeCompare(b.name);
      }
      return sortAsc ? cmp : -cmp;
    });
    return filtered;
  }, [list, search, statusFilter, sortAsc, sortKey]);

  const liveCount = list.filter((p) => p.status === 'Live').length;
  const draftCount = list.filter((p) => p.status === 'Draft').length;
  const studentTotal = list.reduce((sum, p) => sum + p.totalStudents, 0);

  const onCreate = (payload: ProcessFormPayload) => {
    const item: AdmissionProcess = {
      id: `ap-${Date.now()}`,
      name: payload.name,
      status: payload.status,
      dueDate: payload.dueDate ? formatDue(payload.dueDate) : undefined,
      totalStudents: 0,
      steps: [],
      students: [],
    };
    const next = upsertProcess(item);
    setList(next);
    setCreateOpen(false);
    flash('Successfully saved.');
    router.push(`/forms/admission-process/${item.id}`);
  };

  const onUpdate = (payload: ProcessFormPayload) => {
    if (!editTarget) return;
    const item: AdmissionProcess = {
      ...editTarget,
      name: payload.name,
      status: payload.status,
      dueDate: payload.dueDate ? formatDue(payload.dueDate) : undefined,
    };
    const next = upsertProcess(item);
    setList(next);
    setEditTarget(null);
    flash('Process updated.');
  };

  const onDelete = (id: string) => {
    const next = deleteProcess(id);
    setList(next);
    setMenuId(null);
    flash('Process deleted');
  };

  const onDownloadBlank = async (process: AdmissionProcess) => {
    if (downloadingId) return;
    setMenuId(null);
    setDownloadingId(process.id);
    try {
      await downloadAdmissionBlankPdf(process);
      flash('Blank admission packet downloaded');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not generate blank form packet';
      flash(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const openEdit = (process: AdmissionProcess) => {
    setMenuId(null);
    setViewTarget(null);
    setEditTarget(process);
  };

  return (
    <div className="cm-page cm-page--admission ap-page">
      <CenterManagementPageHeader
        title="Admission Process"
        description="Design multi-step admission journeys and track students through every stage."
        icon={<GitBranchPlus size={22} strokeWidth={2.1} />}
        actions={
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setCreateOpen(true)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            New Process
          </motion.button>
        }
      />

      <div className="dash-stats ap-dash-stats" role="list" aria-label="Admission summary">
        <div className="dash-statsInner">
          <motion.article
            className="dash-kpiCard dash-kpi-purple"
            role="listitem"
            style={{ '--dash-stagger': '0ms' } as CSSProperties}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="dash-kpiLeft">
              <span className="dash-kpiIcon" aria-hidden>
                <Workflow size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Processes</span>
                <span className="dash-kpiHint">All admission tracks</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{list.length}</strong>
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
                <span className="dash-kpiHint">Actively collecting</span>
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
                <FilePenLine size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Draft</span>
                <span className="dash-kpiHint">Still being set up</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{draftCount}</strong>
            </div>
          </motion.article>

          <motion.article
            className="dash-kpiCard dash-kpi-coral"
            role="listitem"
            style={{ '--dash-stagger': '210ms' } as CSSProperties}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="dash-kpiLeft">
              <span className="dash-kpiIcon" aria-hidden>
                <Users size={20} strokeWidth={2.1} />
              </span>
              <div className="dash-kpiCopy">
                <span className="dash-kpiLabel">Students in pipeline</span>
                <span className="dash-kpiHint">Across all processes</span>
              </div>
            </div>
            <div className="dash-kpiRight">
              <strong>{studentTotal}</strong>
            </div>
          </motion.article>
        </div>
      </div>

      <section className="cm-filters ap-filters-bar" aria-label="Filters">
        <label className="ap-search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processes"
            aria-label="Search processes"
          />
        </label>
        <div className="ap-seg" role="tablist" aria-label="Status filter">
          {(['All', 'Live', 'Draft'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={statusFilter === s}
              className={statusFilter === s ? 'is-active' : undefined}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="ui-table-wrap ap-table-panel">
        {rows.length === 0 ? (
          <div className="ap-empty-block">
            <strong>No processes found</strong>
            <span>Create your first admission process to get started.</span>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              New Process
            </button>
          </div>
        ) : (
          <div className="ap-table-scroll">
            <table className="ui-table ap-table">
              <thead>
                <tr>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('name')}
                    aria-sort={sortKey === 'name' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="ap-th-sort">
                      Process Name
                      <SortIcon />
                    </span>
                  </th>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('status')}
                    aria-sort={sortKey === 'status' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="ap-th-sort">
                      Status
                      <SortIcon />
                    </span>
                  </th>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('due')}
                    aria-sort={sortKey === 'due' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="ap-th-sort">
                      Due Date
                      <SortIcon />
                    </span>
                  </th>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('students')}
                    aria-sort={sortKey === 'students' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  >
                    <span className="ap-th-sort">
                      Total Students
                      <SortIcon />
                    </span>
                  </th>
                  <th>Steps</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p, index) => {
                  const menuOpen = menuId === p.id;
                  return (
                    <motion.tr
                      key={p.id}
                      className={menuOpen ? 'is-active-row' : undefined}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.28 }}
                    >
                      <td>
                        <button
                          type="button"
                          className="ap-name-link"
                          onClick={() => setViewTarget(p)}
                        >
                          {p.name}
                        </button>
                      </td>
                      <td>
                        <span className={`ap-status ${p.status === 'Live' ? 'live' : 'draft'}`}>
                          <i />
                          {p.status === 'Live' ? 'LIVE' : 'DRAFT'}
                        </span>
                      </td>
                      <td>{p.dueDate || '—'}</td>
                      <td>
                        <span className="ap-students-count">{p.totalStudents}</span>
                      </td>
                      <td>
                        <span className="ap-steps-pill">{p.steps.length} steps</span>
                      </td>
                      <td>
                        <div className="ap-row-actions" ref={menuOpen ? menuRef : undefined}>
                          <button
                            type="button"
                            className="ap-icon-btn"
                            aria-label={`View ${p.name}`}
                            title="View"
                            onClick={() => setViewTarget(p)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="ap-icon-btn"
                            aria-label={`Edit ${p.name}`}
                            title="Edit"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil size={16} />
                          </button>
                          <div className="ap-row-menu">
                            <button
                              type="button"
                              className={`ap-icon-btn${menuOpen ? ' is-on' : ''}`}
                              aria-label="More"
                              aria-expanded={menuOpen}
                              onClick={() => setMenuId((id) => (id === p.id ? null : p.id))}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {menuOpen ? (
                              <div className="ap-menu" role="menu">
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuId(null);
                                    setShareTarget(p);
                                  }}
                                >
                                  <Share2 size={14} />
                                  Share
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuId(null);
                                    router.push(`/forms/admission-process/${p.id}`);
                                  }}
                                >
                                  <Eye size={14} />
                                  Open Workflow
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={downloadingId === p.id}
                                  onClick={() => void onDownloadBlank(p)}
                                >
                                  <Download size={14} />
                                  {downloadingId === p.id ? 'Downloading…' : 'Download Blank Form'}
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="danger"
                                  onClick={() => onDelete(p.id)}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            ) : null}
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

        {rows.length > 0 ? (
          <div className="ap-pager">
            <span>
              Showing 1-{rows.length} of {rows.length} Results
            </span>
            <div className="ap-pages">
              <button type="button" disabled aria-label="Previous page">
                ‹
              </button>
              <button type="button" className="is-active" aria-current="page">
                1
              </button>
              <button type="button" disabled aria-label="Next page">
                ›
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <CreateProcessModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={onCreate} />

      <CreateProcessModal
        open={Boolean(editTarget)}
        initial={
          editTarget
            ? {
                name: editTarget.name,
                dueDate: editTarget.dueDate,
                status: editTarget.status,
              }
            : null
        }
        onClose={() => setEditTarget(null)}
        onSave={onUpdate}
      />

      <ViewProcessModal
        open={Boolean(viewTarget)}
        process={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={openEdit}
        onOpen={(process) => {
          setViewTarget(null);
          router.push(`/forms/admission-process/${process.id}`);
        }}
      />

      <ShareAdmissionProcessModal
        open={Boolean(shareTarget)}
        process={shareTarget}
        onClose={() => setShareTarget(null)}
        onShared={(count) => {
          flash(`Admission shared with ${count} famil${count === 1 ? 'y' : 'ies'}`);
          setShareTarget(null);
        }}
      />

      {toast ? (
        <div className="ap-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

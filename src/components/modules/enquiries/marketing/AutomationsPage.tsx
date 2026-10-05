'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  LayoutTemplate,
  PauseCircle,
  PlayCircle,
  Plus,
  FileEdit,
  RefreshCw,
  Workflow,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useCountUp } from '@/components/app/dashboard/useCountUp';
import { EnquiriesPageHeader } from '../EnquiriesPageHeader';
import '@/components/ui/module.css';
import './automations.css';
import { CreateAutomationModal } from './CreateAutomationModal';
import { ViewAutomationModal } from './ViewAutomationModal';
import { AutomationRowMenu } from './AutomationRowMenu';
import {
  STATUS_BADGE_CLASS,
  TRIGGER_LABELS,
  type AutomationStatus,
  type MarketingAutomation,
  type TriggerType,
} from './types';
import { actionSummary, formatRelativeDate } from './mockData';
import {
  createAutomationId,
  loadAutomations,
  saveAutomations,
} from '@/lib/enquiries/marketingAutomationsStore';

type SortKey = 'name' | 'updated' | 'runs';

const EASE = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

export function AutomationsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<MarketingAutomation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AutomationStatus>('All');
  const [triggerFilter, setTriggerFilter] = useState<'All' | TriggerType>('All');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<MarketingAutomation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingAutomation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setItems(loadAutomations());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    refresh();
    await new Promise((r) => setTimeout(r, 420));
    setRefreshing(false);
  };

  const persist = (next: MarketingAutomation[]) => {
    setItems(next);
    saveAutomations(next);
  };

  const stats = useMemo(() => {
    const active = items.filter((i) => i.status === 'Active').length;
    const drafts = items.filter((i) => i.status === 'Draft').length;
    const paused = items.filter((i) => i.status === 'Paused').length;
    const totalRuns = items.reduce((sum, i) => sum + i.runs, 0);
    return { active, drafts, paused, totalRuns };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (triggerFilter !== 'All' && item.trigger.type !== triggerFilter) return false;
      if (!q) return true;
      const trigger = item.trigger.type ? TRIGGER_LABELS[item.trigger.type] : '';
      return (
        item.name.toLowerCase().includes(q) ||
        trigger.toLowerCase().includes(q) ||
        item.createdBy.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'runs') return b.runs - a.runs;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return list;
  }, [items, search, statusFilter, triggerFilter, sortKey]);

  const duplicate = (item: MarketingAutomation) => {
    const now = new Date().toISOString();
    const copy: MarketingAutomation = {
      ...structuredClone(item),
      id: createAutomationId(),
      name: `${item.name} (Copy)`,
      status: 'Draft',
      runs: 0,
      createdBy: 'You',
      createdAt: now,
      updatedAt: now,
    };
    persist([copy, ...items]);
  };

  const setStatus = (item: MarketingAutomation, status: AutomationStatus) => {
    const now = new Date().toISOString();
    persist(items.map((a) => (a.id === item.id ? { ...a, status, updatedAt: now } : a)));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(items.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="mod-page ma-page">
      <div className="ma-ambient" aria-hidden>
        <span className="ma-blob b1" />
        <span className="ma-blob b2" />
        <span className="ma-blob b3" />
        <span className="ma-mesh" />
      </div>

      <div className="ma-page-inner">
        <AutomationsHeader
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onTemplates={() => router.push('/enquiries/marketing/templates')}
          onCreate={() => setCreateOpen(true)}
        />

        <motion.div
          className="ma-kpi-row"
          role="list"
          aria-label="Automation statistics"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
        >
          <KpiCard
            tone="green"
            icon={<PlayCircle size={20} />}
            label="Active Automations"
            hint="Running now"
            value={stats.active}
            animate={!reduceMotion}
          />
          <KpiCard
            tone="purple"
            icon={<FileEdit size={20} />}
            label="Drafts"
            hint="In progress"
            value={stats.drafts}
            animate={!reduceMotion}
          />
          <KpiCard
            tone="pink"
            icon={<PauseCircle size={20} />}
            label="Paused"
            hint="On hold"
            value={stats.paused}
            animate={!reduceMotion}
          />
          <KpiCard
            tone="coral"
            icon={<Workflow size={20} />}
            label="Total Runs"
            hint="All time"
            value={stats.totalRuns}
            animate={!reduceMotion}
          />
        </motion.div>

        <motion.section
          className="ma-panel"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
        >
          <motion.h2
            className="ma-panel-title"
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          >
            All Automations
          </motion.h2>

          <motion.div
            className="ma-toolbar"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
          >
            <div className="ma-search ui-field" style={{ margin: 0 }}>
              <label className="ui-label" htmlFor="ma-search">
                Search Automations
              </label>
              <input
                id="ma-search"
                className="ui-input"
                placeholder="Search by name, trigger, or creator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ma-filters">
              <div className="ui-field" style={{ margin: 0 }}>
                <label className="ui-label" htmlFor="ma-status-filter">
                  Status
                </label>
                <select
                  id="ma-status-filter"
                  className="ui-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
              <div className="ui-field" style={{ margin: 0 }}>
                <label className="ui-label" htmlFor="ma-trigger-filter">
                  Trigger
                </label>
                <select
                  id="ma-trigger-filter"
                  className="ui-select"
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value as typeof triggerFilter)}
                >
                  <option value="All">All</option>
                  <option value="stage_change">Stage Change</option>
                  <option value="tour_booked">Tour Booked</option>
                  <option value="form_submission">Form Submission</option>
                </select>
              </div>
              <div className="ui-field" style={{ margin: 0 }}>
                <label className="ui-label" htmlFor="ma-sort">
                  Sort
                </label>
                <select
                  id="ma-sort"
                  className="ui-select"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                >
                  <option value="updated">Last Updated</option>
                  <option value="name">Name</option>
                  <option value="runs">Runs</option>
                </select>
              </div>
            </div>
          </motion.div>

          <div className="ma-table-wrap ui-table-wrap">
            <table className="ui-table ma-table">
              <thead>
                <tr>
                  <th>Automation Name</th>
                  <th>Trigger</th>
                  <th>Actions</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Runs</th>
                  <th>Created By</th>
                  <th style={{ width: 56 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <motion.tr
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={8}>
                        <div className="ma-empty">No automations match your search or filters.</div>
                      </td>
                    </motion.tr>
                  ) : (
                    filtered.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        className="ma-table-row"
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{
                          duration: 0.32,
                          delay: Math.min(index * 0.035, 0.28),
                          ease: EASE,
                        }}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : { backgroundColor: 'rgba(93, 95, 239, 0.04)' }
                        }
                      >
                        <td>
                          <div className="ma-name-cell">
                            <button
                              type="button"
                              className="ma-name-btn"
                              onClick={() => setViewTarget(item)}
                            >
                              {item.name}
                            </button>
                            {item.description ? (
                              <span className="ma-name-desc">{item.description}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>{item.trigger.type ? TRIGGER_LABELS[item.trigger.type] : '—'}</td>
                        <td>{actionSummary(item.actions)}</td>
                        <td>
                          <span className={STATUS_BADGE_CLASS[item.status]}>{item.status}</span>
                        </td>
                        <td>{formatRelativeDate(item.updatedAt)}</td>
                        <td>{item.runs.toLocaleString()}</td>
                        <td>{item.createdBy}</td>
                        <td>
                          <AutomationRowMenu
                            status={item.status}
                            onAction={(action) => {
                              if (action === 'view') setViewTarget(item);
                              if (action === 'edit') {
                                router.push(`/enquiries/marketing/builder?id=${item.id}`);
                              }
                              if (action === 'duplicate') duplicate(item);
                              if (action === 'enable') setStatus(item, 'Active');
                              if (action === 'pause') setStatus(item, 'Paused');
                              if (action === 'delete') setDeleteTarget(item);
                            }}
                          />
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>

      <CreateAutomationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onScratch={() => {
          setCreateOpen(false);
          router.push('/enquiries/marketing/builder');
        }}
        onTemplate={() => {
          setCreateOpen(false);
          router.push('/enquiries/marketing/templates?pick=1');
        }}
      />

      <ViewAutomationModal
        open={Boolean(viewTarget)}
        automation={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={() => {
          if (!viewTarget) return;
          router.push(`/enquiries/marketing/builder?id=${viewTarget.id}`);
        }}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Automation"
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>? This
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function AutomationsHeader({
  refreshing,
  onRefresh,
  onTemplates,
  onCreate,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  onTemplates: () => void;
  onCreate: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <EnquiriesPageHeader
      title="Automations"
      description="Create automated workflows to engage enquiries, follow up with prospects, and streamline your marketing operations."
      icon={<Workflow size={22} strokeWidth={2.1} />}
      actions={
        <>
          <motion.button
            type="button"
            className="ma-btn ma-btn-outline"
            onClick={onRefresh}
            disabled={refreshing}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <span className="ma-btn-glow" aria-hidden />
            {refreshing ? (
              <Loader2 size={16} className="ma-spin" aria-hidden />
            ) : (
              <RefreshCw size={16} aria-hidden />
            )}
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </motion.button>
          <motion.button
            type="button"
            className="ma-btn ma-btn-outline"
            onClick={onTemplates}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <span className="ma-btn-glow" aria-hidden />
            <LayoutTemplate size={16} aria-hidden />
            Manage Templates
          </motion.button>
          <motion.button
            type="button"
            className="ma-btn ma-btn-primary"
            onClick={onCreate}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <span className="ma-btn-shine" aria-hidden />
            <Plus size={16} aria-hidden />
            Create Automation
          </motion.button>
        </>
      }
    />
  );
}

function KpiCard({
  tone,
  icon,
  label,
  hint,
  value,
  animate,
}: {
  tone: 'green' | 'purple' | 'pink' | 'coral';
  icon: ReactNode;
  label: string;
  hint: string;
  value: number;
  animate: boolean;
}) {
  const reduce = useReducedMotion();
  const display = useCountUp(value, 900, animate);

  return (
    <motion.article
      className={`ma-kpi ma-kpi-${tone}`}
      role="listitem"
      variants={reduce ? undefined : staggerItem}
      whileHover={reduce ? undefined : { y: -4, scale: 1.015 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className="ma-kpi-left">
        <span className="ma-kpi-icon" aria-hidden>
          {icon}
        </span>
        <div className="ma-kpi-copy">
          <span className="ma-kpi-label">{label}</span>
          <span className="ma-kpi-hint">{hint}</span>
        </div>
      </div>
      <div className="ma-kpi-right">
        <strong>{display.toLocaleString()}</strong>
      </div>
    </motion.article>
  );
}

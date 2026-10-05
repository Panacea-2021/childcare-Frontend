'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RefreshCw, Search } from 'lucide-react';
import { PremiumDateField } from '@/components/modules/calendar/PremiumDateField';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { AnnouncementHeader } from './AnnouncementHeader';
import { DeleteDialog } from './DeleteDialog';
import { EmptyState } from './EmptyState';
import { FloatingDecor } from './FloatingDecor';
import { LoadingSkeleton } from './LoadingSkeleton';
import { SummaryCards } from './SummaryCards';
import { ToastStack } from './ToastStack';
import { ViewDrawer } from './ViewDrawer';
import { emptyFormValues, seedAnnouncements } from './mockData';
import type { Announcement, AnnouncementFormValues, ToastItem } from './types';
import {
  announcementToForm,
  computeStats,
  filterAnnouncements,
  resolveStatus,
} from './utils';
import './staff-announcement.css';
import '@/components/modules/calendar/calendar.css';
import '@/components/modules/calendar/school/school-calendar.css';
import '@/components/ui/module.css';

export function StaffAnnouncementPage() {
  const [items, setItems] = useState<Announcement[]>(seedAnnouncements);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'preview'>('create');
  const [formInitial, setFormInitial] = useState<AnnouncementFormValues>(emptyFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 750);
    return () => window.clearTimeout(t);
  }, []);

  const pushToast = (type: ToastItem['type'], title: string, message: string) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3200);
  };

  const stats = useMemo(() => computeStats(items), [items]);
  const visible = useMemo(
    () => filterAnnouncements(items, search, filterDate),
    [items, search, filterDate],
  );

  const viewItem = items.find((a) => a.id === viewId) ?? null;
  const deleteItem = items.find((a) => a.id === deleteId) ?? null;

  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormInitial({
      ...emptyFormValues,
      date: new Date().toISOString().slice(0, 10),
      time: '09:00',
    });
    setFormOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setFormMode('edit');
    setEditingId(a.id);
    setFormInitial(announcementToForm(a));
    setFormOpen(true);
    setViewOpen(false);
  };

  const openView = (a: Announcement) => {
    setViewId(a.id);
    setViewOpen(true);
  };

  const handlePreview = (values: AnnouncementFormValues) => {
    setFormInitial(values);
    setFormMode('preview');
  };

  const handleBackFromPreview = (values: AnnouncementFormValues) => {
    setFormInitial(values);
    setFormMode(editingId ? 'edit' : 'create');
  };

  const persist = (values: AnnouncementFormValues) => {
    setSubmitting(true);
    window.setTimeout(() => {
      const status = resolveStatus(values.date, values.time);
      if (editingId) {
        setItems((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? {
                  ...a,
                  title: values.title.trim(),
                  note: values.note.trim(),
                  date: values.date,
                  time: values.time,
                  mode: values.mode,
                  staffIds: values.mode === 'staff' ? values.staffIds : [],
                  roomId: values.mode === 'room' ? values.roomId : null,
                  methods: values.methods,
                  attachments: values.attachments.map(({ progress: _p, ...rest }) => rest),
                  referenceLink: values.referenceLink.trim(),
                  status,
                }
              : a,
          ),
        );
        pushToast('success', 'Updated', 'Announcement changes saved.');
      } else {
        const next: Announcement = {
          id: `ann-${Date.now()}`,
          title: values.title.trim(),
          note: values.note.trim(),
          date: values.date,
          time: values.time,
          mode: values.mode,
          staffIds: values.mode === 'staff' ? values.staffIds : [],
          roomId: values.mode === 'room' ? values.roomId : null,
          methods: values.methods,
          attachments: values.attachments.map(({ progress: _p, ...rest }) => rest),
          referenceLink: values.referenceLink.trim(),
          createdBy: 'You',
          status,
          createdAt: new Date().toISOString(),
        };
        setItems((prev) => [next, ...prev]);
        setSuccessOpen(true);
        window.setTimeout(() => setSuccessOpen(false), 1600);
        pushToast('success', 'Posted', 'Announcement added to history.');
      }
      setSubmitting(false);
      setFormOpen(false);
      setEditingId(null);
      setFormMode('create');
    }, 700);
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 500);
    pushToast('info', 'Refreshed', 'Announcement list updated.');
  };

  return (
    <div className="mod-page cal-page sa-page">
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
      </div>
      <FloatingDecor />

      <div className="cal-page-inner sa-page-inner">
        <AnnouncementHeader onPost={openCreate} />
        <SummaryCards stats={stats} />

        <motion.section
          className="sa-history"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
        >
          <div className="sa-history-head">
            <div className="sa-history-title">
              <h2>Announcement History</h2>
              <p>Search, filter and manage every staff announcement.</p>
            </div>
            <div className="sa-toolbar">
              <div className="sa-date-wrap">
                <PremiumDateField
                  value={filterDate}
                  onChange={setFilterDate}
                  placeholder="Filter by date"
                  clearable
                />
              </div>
              <div className="sa-search">
                <Search size={16} color="var(--text-secondary)" aria-hidden />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, note, room, staff…"
                  aria-label="Search announcements"
                />
              </div>
              <button type="button" className="cal-btn-export sa-refresh-btn" onClick={refresh}>
                <span className="cal-btn-export-glow" aria-hidden />
                <RefreshCw size={15} aria-hidden />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : visible.length === 0 ? (
            items.length === 0 ? (
              <EmptyState onCreate={openCreate} />
            ) : (
              <div className="sa-empty">
                <h3>No matching announcements</h3>
                <p>Try adjusting your search or date filter.</p>
                {filterDate ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    style={{ marginTop: 12 }}
                    onClick={() => setFilterDate('')}
                  >
                    Clear date filter
                  </button>
                ) : null}
              </div>
            )
          ) : (
            <div className="sa-cards">
              <AnimatePresence mode="popLayout">
                {visible.map((a, i) => (
                  <AnnouncementCard
                    key={a.id}
                    announcement={a}
                    index={i}
                    onView={() => openView(a)}
                    onEdit={() => openEdit(a)}
                    onDelete={() => {
                      setDeleteId(a.id);
                      setDeleteOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>

      <AnnouncementFormModal
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        submitting={submitting}
        onClose={() => {
          setFormOpen(false);
          setFormMode('create');
        }}
        onSubmit={persist}
        onPreview={handlePreview}
        onBackFromPreview={handleBackFromPreview}
      />

      <ViewDrawer
        open={viewOpen}
        announcement={viewItem}
        onClose={() => setViewOpen(false)}
        onEdit={() => {
          if (viewItem) openEdit(viewItem);
        }}
      />

      <DeleteDialog
        open={deleteOpen}
        announcement={deleteItem}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          setItems((prev) => prev.filter((a) => a.id !== deleteId));
          pushToast('success', 'Deleted', 'Announcement removed from history.');
        }}
      />

      <AnimatePresence>
        {successOpen ? (
          <motion.div
            className="sa-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="sa-success-card"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <motion.span
                className="sa-success-ico"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 16 }}
              >
                <Check size={34} strokeWidth={2.5} />
              </motion.span>
              <h3>Announcement Posted!</h3>
              <p>Your update is now live in announcement history.</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  Plus,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import type {
  AppointmentFilters,
  AppointmentRecord,
  AppointmentTask,
  AppointmentViewMode,
} from '@/lib/appointments/types';
import {
  DEFAULT_APPOINTMENT_FILTERS,
  VIEW_STORAGE_KEY,
} from '@/lib/appointments/types';
import {
  addTask,
  filterAppointments,
  loadAppointments,
  loadTasks,
  refreshAppointmentsStore,
  resetAppointmentsToSeed,
  saveAppointments,
  upsertAppointment,
} from '@/lib/appointments/appointmentsStore';
import type { TaskFormValues } from '@/lib/appointments/schema';
import { AppointmentToolbar } from './AppointmentToolbar';
import { ViewSwitcher } from './ViewSwitcher';
import { AppointmentCalendar } from './AppointmentCalendar';
import {
  AppointmentList,
  DEFAULT_APPT_COLS,
  type ApptColKey,
} from './AppointmentList';
import { TaskModal } from './TaskModal';
import { CommandPalette } from './CommandPalette';
import {
  CreateAppointmentModal,
  type AppointmentFormPrefill,
} from './CreateAppointmentModal';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { btnMotion, pageMotion } from './animations';
import { startOfWeek } from '@/components/modules/calendar/mockData';
import '@/components/ui/module.css';
import '@/components/modules/enquiries/enquiries.css';
import './appointments.css';

export const AppointmentsPage = memo(function AppointmentsPage() {
  const searchParams = useSearchParams();

  const enquiryContext = useMemo(() => {
    const enquiryId = searchParams.get('enquiryId')?.trim() || '';
    const student = (searchParams.get('student') || searchParams.get('child') || '').trim();
    const parent = (searchParams.get('parent') || '').trim();
    const phone = (searchParams.get('phone') || '').trim();
    const email = (searchParams.get('email') || '').trim();
    const gender = (searchParams.get('gender') || '').trim();
    const faculty = (searchParams.get('faculty') || '').trim();
    if (!enquiryId && !student) return null;
    return { enquiryId, student, parent, phone, email, gender, faculty };
  }, [searchParams]);

  const formPrefill = useMemo<AppointmentFormPrefill | null>(() => {
    if (!enquiryContext) return null;
    return {
      childName: enquiryContext.student,
      parentName: enquiryContext.parent,
      phone: enquiryContext.phone,
      email: enquiryContext.email,
      gender: enquiryContext.gender,
      facultyName: enquiryContext.faculty,
    };
  }, [enquiryContext]);

  const [items, setItems] = useState<AppointmentRecord[]>([]);
  const [tasks, setTasks] = useState<AppointmentTask[]>([]);
  const [filters, setFilters] = useState<AppointmentFilters>({
    ...DEFAULT_APPOINTMENT_FILTERS,
  });
  const [viewMode, setViewMode] = useState<AppointmentViewMode>('calendar');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentRecord | null>(null);
  const [viewing, setViewing] = useState<AppointmentRecord | null>(null);
  const [taskFor, setTaskFor] = useState<AppointmentRecord | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Record<ApptColKey, boolean>>(DEFAULT_APPT_COLS);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string; undo?: () => void } | null>(
    null,
  );
  const [ctx, setCtx] = useState<{ x: number; y: number; item: AppointmentRecord } | null>(null);

  useEffect(() => {
    const store = refreshAppointmentsStore();
    setItems(store.appointments);
    setTasks(store.tasks);
    const saved = localStorage.getItem(VIEW_STORAGE_KEY) as AppointmentViewMode | null;
    if (saved === 'calendar' || saved === 'list') setViewMode(saved);
    const qView = searchParams.get('view');
    if (qView === 'calendar' || qView === 'list') setViewMode(qView);
    const t = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setCreateOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const filtered = useMemo(() => filterAppointments(items, filters), [items, filters]);

  const openAppointment = useCallback((item: AppointmentRecord) => {
    setViewing(item);
  }, []);

  const openEdit = useCallback((item: AppointmentRecord) => {
    setViewing(null);
    setEditing(item);
    setCreateOpen(true);
  }, []);

  const onFilterChange = useCallback((patch: Partial<AppointmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const onClear = useCallback(() => {
    setFilters({ ...DEFAULT_APPOINTMENT_FILTERS });
  }, []);

  const refresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    setLoading(true);
    window.setTimeout(() => {
      const store = resetAppointmentsToSeed();
      setItems(store.appointments);
      setTasks(store.tasks);
      setSelectedIds(new Set());
      setFilters({ ...DEFAULT_APPOINTMENT_FILTERS });
      setWeekStart(startOfWeek(new Date()));
      setLoading(false);
      setRefreshing(false);
      setToast({ type: 'ok', message: 'Appointments refreshed' });
    }, 420);
  }, [refreshing]);

  const printView = useCallback(() => {
    window.print();
  }, []);

  const onAppointmentSaved = useCallback((record: AppointmentRecord) => {
    setItems(loadAppointments());
    setEditing(null);
    setToast({
      type: 'ok',
      message: `Appointment saved for ${record.studentName}`,
    });
  }, []);

  const exportCsv = useCallback(() => {
    const headers = [
      'Student',
      'Parent',
      'Faculty',
      'Calendar',
      'Date',
      'Start',
      'End',
      'Type',
      'Status',
    ];
    const rows = filtered.map((a) => [
      a.studentName,
      a.parentName,
      a.facultyName,
      a.calendarName,
      a.date,
      a.startTime,
      a.endTime,
      a.appointmentType,
      a.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'ok', message: 'Exported current view' });
  }, [filtered]);

  const onSaveTask = useCallback(
    (values: TaskFormValues) => {
      if (!taskFor) return;
      const task: AppointmentTask = {
        id: `t-${Date.now()}`,
        appointmentId: taskFor.id,
        title: values.title?.trim() || `${values.taskType} · ${taskFor.studentName}`,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate,
        taskType: values.taskType,
        labels: values.labels ?? [],
        description: values.description ?? '',
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'Open',
      };
      const { tasks: nextTasks, appointments } = addTask(task);
      setTasks(nextTasks);
      setItems(appointments);
      setToast({ type: 'ok', message: 'Task saved' });
    },
    [taskFor],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }, []);

  const bulkCancel = useCallback(() => {
    const snapshot = items;
    const next = items.map((a) =>
      selectedIds.has(a.id) ? { ...a, status: 'Cancelled' as const } : a,
    );
    setItems(next);
    saveAppointments(next);
    setSelectedIds(new Set());
    setToast({
      type: 'ok',
      message: `Cancelled ${selectedIds.size} appointment(s)`,
      undo: () => {
        setItems(snapshot);
        saveAppointments(snapshot);
      },
    });
  }, [items, selectedIds]);

  return (
    <motion.div className="appt-page mod-page" {...pageMotion}>
      <PageHeader
        title={enquiryContext?.student ? `Tour · ${enquiryContext.student}` : 'Tour'}
        description={
          enquiryContext
            ? `Bookings and schedules for this enquiry${enquiryContext.parent ? ` · ${enquiryContext.parent}` : ''}`
            : 'Manage bookings, schedules and follow-ups'
        }
        crumbs={
          enquiryContext
            ? ['Panacea', 'Enquiries', 'Tour', enquiryContext.student]
            : ['Panacea', 'Enquiries', 'Tour']
        }
        actions={
          <div className="appt-header-actions">
            <Link href="/enquiries" className="ui-btn ui-btn-outline">
              Back to Enquiries
            </Link>
            <motion.button type="button" className="ui-btn ui-btn-outline" onClick={exportCsv} {...btnMotion}>
              <Download size={15} />
              Export
            </motion.button>
            <motion.button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={printView}
              {...btnMotion}
            >
              <Printer size={15} />
              Print
            </motion.button>
            <motion.button
              type="button"
              className={`ui-btn ui-btn-outline${refreshing ? ' is-loading' : ''}`}
              onClick={refresh}
              disabled={refreshing}
              {...btnMotion}
            >
              <RefreshCw size={15} className={refreshing ? 'appt-task-spin' : undefined} />
              Refresh
            </motion.button>
            <motion.button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                setEditing(null);
                setCreateOpen(true);
              }}
              {...btnMotion}
            >
              <Plus size={16} />
              New Appointment
            </motion.button>
          </div>
        }
      />

      <div className="appt-panel appt-print-area">
        <AppointmentToolbar
          filters={filters}
          onChange={onFilterChange}
          onClear={onClear}
          showColumns={viewMode === 'list'}
          visibleCols={visibleCols}
          onColsChange={setVisibleCols}
        />
        <ViewSwitcher
          mode={viewMode}
          onChange={setViewMode}
          total={items.length}
          filtered={filtered.length}
        />

        {selectedIds.size ? (
          <div className="appt-bulk-bar appt-no-print">
            <span>{selectedIds.size} selected</span>
            <button type="button" className="ui-btn ui-btn-outline" onClick={bulkCancel}>
              Cancel selected
            </button>
            <button
              type="button"
              className="appt-ghost-btn"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </button>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <AppointmentCalendar
                weekStart={weekStart}
                onWeekChange={setWeekStart}
                items={filtered}
                onOpen={openAppointment}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <AppointmentList
                items={filtered}
                loading={loading}
                selectedIds={selectedIds}
                visibleCols={visibleCols}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
                onView={openAppointment}
                onEdit={openEdit}
                onTask={setTaskFor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AppointmentDetailsModal
        open={!!viewing}
        appointment={viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onTask={(item) => {
          setViewing(null);
          setTaskFor(item);
        }}
      />

      <CreateAppointmentModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        onSaved={onAppointmentSaved}
        prefill={editing ? null : formPrefill}
        editing={editing}
      />

      <TaskModal
        open={!!taskFor}
        appointment={taskFor}
        onClose={() => setTaskFor(null)}
        onSave={onSaveTask}
      />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <button
        type="button"
        className="appt-fab appt-no-print"
        aria-label="New appointment"
        onClick={() => {
          setEditing(null);
          setCreateOpen(true);
        }}
      >
        <Plus size={24} />
      </button>

      {ctx ? (
        <div className="appt-context" style={{ left: ctx.x, top: ctx.y }}>
          <button
            type="button"
            onClick={() => {
              openAppointment(ctx.item);
              setCtx(null);
            }}
          >
            Open appointment
          </button>
          <button
            type="button"
            onClick={() => {
              setTaskFor(ctx.item);
              setCtx(null);
            }}
          >
            Create task
          </button>
          <button
            type="button"
            onClick={() => {
              const dup = {
                ...ctx.item,
                id: `a-${Date.now()}`,
                status: 'Scheduled' as const,
                createdAt: new Date().toISOString().slice(0, 10),
              };
              setItems(upsertAppointment(dup));
              setToast({ type: 'ok', message: 'Appointment duplicated' });
              setCtx(null);
            }}
          >
            Duplicate
          </button>
        </div>
      ) : null}

      {toast ? (
        <div className={`appt-toast ${toast.type}`} role="status">
          <span>{toast.message}</span>
          {toast.undo ? (
            <button type="button" className="appt-ghost-btn" onClick={toast.undo}>
              Undo
            </button>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
});

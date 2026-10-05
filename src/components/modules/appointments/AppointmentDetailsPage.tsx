'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import type { AppointmentRecord, AppointmentTask } from '@/lib/appointments/types';
import { TOUR_BASE } from '@/lib/appointments/types';
import {
  loadAppointments,
  loadTasks,
  addTask,
} from '@/lib/appointments/appointmentsStore';
import type { TaskFormValues } from '@/lib/appointments/schema';
import { TaskModal } from './TaskModal';
import { btnMotion, pageMotion } from './animations';
import '@/components/ui/module.css';
import './appointments.css';

function statusClass(status: string) {
  return `appt-badge appt-badge-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export const AppointmentDetailsPage = memo(function AppointmentDetailsPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const id = params?.appointmentId;

  const [item, setItem] = useState<AppointmentRecord | null>(null);
  const [tasks, setTasks] = useState<AppointmentTask[]>([]);
  const [taskOpen, setTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = loadAppointments();
    const found = all.find((a) => a.id === id) ?? null;
    setItem(found);
    setTasks(loadTasks().filter((t) => t.appointmentId === id));
    setLoading(false);
  }, [id]);

  const timeline = useMemo(() => {
    if (!item) return [];
    return [
      { id: 'c1', text: `Appointment created on ${item.createdAt}` },
      { id: 'c2', text: `Scheduled for ${item.date} at ${item.startTime}` },
      { id: 'c3', text: `Assigned to ${item.facultyName}` },
      { id: 'c4', text: `Current status: ${item.status}` },
      ...tasks.map((t) => ({
        id: t.id,
        text: `Task “${t.title}” · due ${t.dueDate} · ${t.status}`,
      })),
    ];
  }, [item, tasks]);

  const onSaveTask = (values: TaskFormValues) => {
    if (!item) return;
    const task: AppointmentTask = {
      id: `t-${Date.now()}`,
      appointmentId: item.id,
      title: values.title?.trim() || `${values.taskType} · ${item.studentName}`,
      assignedTo: values.assignedTo,
      dueDate: values.dueDate,
      taskType: values.taskType,
      labels: values.labels ?? [],
      description: values.description ?? '',
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Open',
    };
    const { tasks: nextTasks } = addTask(task);
    setTasks(nextTasks.filter((t) => t.appointmentId === item.id));
  };

  if (loading) {
    return (
      <div className="appt-page mod-page">
        <div className="appt-skeleton" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="appt-skel-line" />
          ))}
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="appt-page mod-page">
        <PageHeader title="Appointment not found" crumbs={['Panacea', 'Enquiries', 'Tour']} />
        <div className="appt-empty">
          <h3>No appointment with this ID</h3>
          <p>It may have been removed from the local preview store.</p>
          <Link href={TOUR_BASE} className="ui-btn ui-btn-primary">
            Back to Tour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="appt-page mod-page appt-details-page" {...pageMotion}>
      <PageHeader
        title={item.studentName}
        description={`${item.date} · ${item.startTime} – ${item.endTime}`}
        crumbs={['Panacea', 'Enquiries', 'Tour', 'Details']}
        actions={
          <div className="appt-header-actions">
            <motion.button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push(TOUR_BASE)}
              {...btnMotion}
            >
              <ArrowLeft size={15} />
              Back
            </motion.button>
            <motion.button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setTaskOpen(true)}
              {...btnMotion}
            >
              <ClipboardPlus size={15} />
              Create Task
            </motion.button>
          </div>
        }
      />

      <div className="appt-details-grid">
        <section className="appt-details-card">
          <h3>Appointment Summary</h3>
          <dl className="appt-details-dl">
            <div>
              <dt>Calendar</dt>
              <dd>{item.calendarName}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{item.date}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {item.startTime} – {item.endTime}
              </dd>
            </div>
            <div>
              <dt>Faculty</dt>
              <dd>{item.facultyName}</dd>
            </div>
            <div>
              <dt>Student</dt>
              <dd>{item.studentName}</dd>
            </div>
            <div>
              <dt>Parent</dt>
              <dd>{item.parentName}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{item.parentPhone || '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{item.parentEmail || '—'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={statusClass(item.status)}>{item.status}</span>
              </dd>
            </div>
            <div className="is-full">
              <dt>Notes</dt>
              <dd>{item.notes || 'No notes added.'}</dd>
            </div>
          </dl>
        </section>

        <section className="appt-details-card">
          <h3>Timeline</h3>
          <ul className="appt-timeline">
            {timeline.map((row) => (
              <li key={row.id}>
                <i />
                <span>{row.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="appt-details-card">
          <h3>Recent Activity</h3>
          <ul className="appt-timeline">
            <li>
              <i />
              <span>
                Booking type: {item.appointmentType} · Priority {item.priority}
              </span>
            </li>
            <li>
              <i />
              <span>
                Audience: {item.audience === 'enquiry' ? 'New inquiry' : 'Existing student'}
              </span>
            </li>
            {item.relationship ? (
              <li>
                <i />
                <span>Relationship: {item.relationship}</span>
              </li>
            ) : null}
          </ul>
        </section>

        <section className="appt-details-card">
          <div className="appt-details-card-head">
            <h3>Task List</h3>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setTaskOpen(true)}>
              + Add Task
            </button>
          </div>
          {tasks.length ? (
            <ul className="appt-task-list">
              {tasks.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong>
                  <span>
                    {t.assignedTo} · due {t.dueDate} · {t.taskType} · {t.status}
                  </span>
                  {t.description ? <p>{t.description}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="appt-muted">No tasks yet.</p>
          )}
        </section>
      </div>

      <TaskModal
        open={taskOpen}
        appointment={item}
        onClose={() => setTaskOpen(false)}
        onSave={onSaveTask}
      />
    </motion.div>
  );
});

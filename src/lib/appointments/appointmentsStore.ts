import type { AppointmentFilters, AppointmentRecord, AppointmentTask } from './types';
import { DEFAULT_APPOINTMENT_FILTERS, STORE_KEY } from './types';
import { SEED_APPOINTMENTS, SEED_TASKS } from './mockData';

type StoreShape = {
  appointments: AppointmentRecord[];
  tasks: AppointmentTask[];
};

function readStore(): StoreShape {
  if (typeof window === 'undefined') {
    return { appointments: SEED_APPOINTMENTS, tasks: SEED_TASKS };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { appointments: SEED_APPOINTMENTS, tasks: SEED_TASKS };
    const parsed = JSON.parse(raw) as StoreShape;
    return {
      appointments: parsed.appointments?.length ? parsed.appointments : SEED_APPOINTMENTS,
      tasks: parsed.tasks ?? SEED_TASKS,
    };
  } catch {
    return { appointments: SEED_APPOINTMENTS, tasks: SEED_TASKS };
  }
}

function writeStore(next: StoreShape) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
}

export function loadAppointments(): AppointmentRecord[] {
  return readStore().appointments;
}

export function loadTasks(): AppointmentTask[] {
  return readStore().tasks;
}

export function saveAppointments(appointments: AppointmentRecord[]) {
  const cur = readStore();
  writeStore({ ...cur, appointments });
}

export function saveTasks(tasks: AppointmentTask[]) {
  const cur = readStore();
  writeStore({ ...cur, tasks });
}

export function upsertAppointment(record: AppointmentRecord) {
  const list = loadAppointments();
  const idx = list.findIndex((a) => a.id === record.id);
  const next =
    idx >= 0 ? list.map((a) => (a.id === record.id ? record : a)) : [record, ...list];
  saveAppointments(next);
  return next;
}

/** Reloads store; if empty/corrupt, restores seed mock data. */
export function refreshAppointmentsStore(): StoreShape {
  const cur = readStore();
  if (!cur.appointments.length) {
    const seeded = { appointments: SEED_APPOINTMENTS, tasks: SEED_TASKS };
    writeStore(seeded);
    return seeded;
  }
  return cur;
}

/** Force-reset to seed (used when Refresh should show demo data again). */
export function resetAppointmentsToSeed(): StoreShape {
  const seeded = { appointments: [...SEED_APPOINTMENTS], tasks: [...SEED_TASKS] };
  writeStore(seeded);
  return seeded;
}

export function addTask(task: AppointmentTask) {
  const tasks = [task, ...loadTasks()];
  saveTasks(tasks);
  const appointments = loadAppointments().map((a) =>
    a.id === task.appointmentId ? { ...a, taskCount: a.taskCount + 1 } : a,
  );
  saveAppointments(appointments);
  return { tasks, appointments };
}

export function filterAppointments(
  items: AppointmentRecord[],
  filters: AppointmentFilters = DEFAULT_APPOINTMENT_FILTERS,
): AppointmentRecord[] {
  const q = filters.searchAppointment.trim().toLowerCase();

  return items.filter((item) => {
    if (q) {
      const blob =
        `${item.studentName} ${item.parentName} ${item.facultyName} ${item.appointmentType} ${item.calendarName} ${item.notes ?? ''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filters.calendarId !== 'All' && item.calendarId !== filters.calendarId) return false;
    if (filters.status !== 'All' && item.status !== filters.status) return false;
    if (filters.staff !== 'All' && item.facultyName !== filters.staff) return false;
    if (filters.fromDate && item.date < filters.fromDate) return false;
    return true;
  });
}

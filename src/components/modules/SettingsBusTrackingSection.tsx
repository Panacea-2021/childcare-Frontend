'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bus } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import { Drawer } from '@/components/ui/Drawer';
import { rooms, students as seedStudents, staff } from '@/lib/moduleData';
import '@/components/ui/module.css';
import styles from './SettingsBusTrackingSection.module.css';

type RouteType = 'Pickup' | 'Drop-off' | 'Both';
type RouteStatus = 'Running' | 'Not running';

type StudentStop = {
  studentId: string;
  location: string;
  pickupTime: string;
};

type BusRoute = {
  id: string;
  name: string;
  type: RouteType;
  status: RouteStatus;
  students: StudentStop[];
  location: string;
  vehicle: string;
  vehicleNumber: string;
  driver: string;
  helper: string;
};

type RouteForm = {
  name: string;
  type: string;
  students: StudentStop[];
  location: string;
  vehicle: string;
  vehicleNumber: string;
  driver: string;
  helper: string;
};

type FormErrors = Partial<Record<keyof RouteForm | 'students', string>>;

const STORAGE_KEY = 'panacea.settings.busTracking.routes.v2';
const ROUTE_TYPES: RouteType[] = ['Pickup', 'Drop-off', 'Both'];
const PAGE_SIZES = [10, 20, 30, 50];

const SEED_ROUTES: BusRoute[] = [
  {
    id: 'bus-morning-east',
    name: 'Morning East Loop',
    type: 'Pickup',
    status: 'Running',
    students: [
      { studentId: 'bx-abhi', location: 'Park Avenue Gate', pickupTime: '07:45' },
      { studentId: 'bx-alex', location: 'Lakeview Residency', pickupTime: '08:00' },
      { studentId: 'bx-priya', location: 'Green Park Stop', pickupTime: '08:15' },
    ],
    location: 'East Campus Gate',
    vehicle: 'Mini Bus',
    vehicleNumber: 'KA-01-AB-2244',
    driver: 'Darshan',
    helper: 'Simran Jain',
  },
  {
    id: 'bus-afternoon-west',
    name: 'Afternoon West Drop',
    type: 'Drop-off',
    status: 'Running',
    students: [
      { studentId: 'bx-darshan', location: 'Hillside Apartments', pickupTime: '15:30' },
      { studentId: 'bx-nara', location: 'City Mall Junction', pickupTime: '15:50' },
    ],
    location: 'West Drop Point',
    vehicle: 'Van',
    vehicleNumber: 'KA-05-CD-1188',
    driver: 'Malika Thimisetty',
    helper: 'None',
  },
  {
    id: 'bus-full-day',
    name: 'Full Day North Circuit',
    type: 'Both',
    status: 'Not running',
    students: [
      { studentId: 'bx-new', location: 'North Metro Station', pickupTime: '08:10' },
    ],
    location: 'North Hub',
    vehicle: 'Coach',
    vehicleNumber: 'KA-03-EF-9090',
    driver: 'Darshan',
    helper: 'Malika Thimisetty',
  },
];

const EXTRA_STUDENTS = [
  { id: 'bx-abhi', name: 'Abhi', room: 'Sunshine Room' },
  { id: 'bx-alex', name: 'Alex Demo Student', room: 'Rainbow Room' },
  { id: 'bx-darshan', name: 'Darshan', room: 'Star Room' },
  { id: 'bx-nara', name: 'Narasimha', room: 'Star Room' },
  { id: 'bx-new', name: 'New Student', room: 'Nest Room' },
  { id: 'bx-priya', name: 'priya jain', room: 'Nest Room' },
];

const DRIVERS = ['Malika Thimisetty', 'Darshan', 'Simran Jain', ...staff.map((s) => s.name)];
const HELPERS = ['None', ...DRIVERS];

const EMPTY_FORM: RouteForm = {
  name: '',
  type: '',
  students: [],
  location: '',
  vehicle: '',
  vehicleNumber: '',
  driver: '',
  helper: '',
};

function allStudents() {
  return [
    ...EXTRA_STUDENTS,
    ...seedStudents.map((s) => ({ id: s.id, name: s.name, room: s.room })),
  ];
}

function classroomNames() {
  return ['All Classroom', ...rooms.map((r) => r.name)];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function defaultPickupTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatTimeDisplay(value: string) {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')} : ${String(m).padStart(2, '0')} ${ampm}`;
}

function loadRoutes(): BusRoute[] {
  if (typeof window === 'undefined') return SEED_ROUTES;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ROUTES));
      return SEED_ROUTES;
    }
    const parsed = JSON.parse(raw) as BusRoute[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ROUTES));
      return SEED_ROUTES;
    }
    return parsed;
  } catch {
    return SEED_ROUTES;
  }
}

function saveRoutes(list: BusRoute[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function SettingsBusTrackingSection() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftStudents, setDraftStudents] = useState<string[]>([]);
  const [classroom, setClassroom] = useState('All Classroom');
  const [studentQuery, setStudentQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRoutes(loadRoutes());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!menuOpenId) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpenId]);

  const persist = (next: BusRoute[]) => {
    setRoutes(next);
    saveRoutes(next);
  };

  const sortedRoutes = useMemo(() => {
    const list = [...routes];
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [routes, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRoutes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRoutes = sortedRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = sortedRoutes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sortedRoutes.length);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    return allStudents().filter((s) => {
      const roomOk = classroom === 'All Classroom' || s.room === classroom;
      const nameOk = !q || s.name.toLowerCase().includes(q);
      return roomOk && nameOk;
    });
  }, [classroom, studentQuery]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setView('form');
    setMenuOpenId(null);
  };

  const openEdit = (route: BusRoute) => {
    setEditingId(route.id);
    setForm({
      name: route.name,
      type: route.type,
      students: route.students.map((s) => ({ ...s })),
      location: route.location,
      vehicle: route.vehicle,
      vehicleNumber: route.vehicleNumber,
      driver: route.driver,
      helper: route.helper,
    });
    setErrors({});
    setView('form');
    setMenuOpenId(null);
  };

  const deleteRoute = (id: string) => {
    persist(routes.filter((r) => r.id !== id));
    setMenuOpenId(null);
    setToast('Route deleted');
  };

  const backToList = () => {
    setView('list');
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setDrawerOpen(false);
  };

  const validate = (data: RouteForm): FormErrors => {
    const next: FormErrors = {};
    if (!data.name.trim()) next.name = 'Route name is required';
    if (!data.type) next.type = 'Type is required';
    if (!data.location.trim()) next.location = 'Location is required';
    if (!data.vehicle.trim()) next.vehicle = 'Vehicle is required';
    if (!data.vehicleNumber.trim()) next.vehicleNumber = 'Vehicle number is required';
    if (!data.driver) next.driver = 'Driver is required';
    if (!data.helper) next.helper = 'Helper is required';
    return next;
  };

  const saveRoute = () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (editingId) {
      persist(
        routes.map((r) =>
          r.id === editingId
            ? {
                ...r,
                name: form.name.trim(),
                type: form.type as RouteType,
                students: form.students.map((s) => ({ ...s })),
                location: form.location.trim(),
                vehicle: form.vehicle.trim(),
                vehicleNumber: form.vehicleNumber.trim(),
                driver: form.driver,
                helper: form.helper,
              }
            : r,
        ),
      );
      setToast('Route updated successfully');
    } else {
      const route: BusRoute = {
        id: `route-${Date.now()}`,
        name: form.name.trim(),
        type: form.type as RouteType,
        status: 'Not running',
        students: form.students.map((s) => ({ ...s })),
        location: form.location.trim(),
        vehicle: form.vehicle.trim(),
        vehicleNumber: form.vehicleNumber.trim(),
        driver: form.driver,
        helper: form.helper,
      };
      persist([route, ...routes]);
      setToast('Route added successfully');
    }
    backToList();
  };

  const openStudentDrawer = () => {
    setDraftStudents(form.students.map((s) => s.studentId));
    setClassroom('All Classroom');
    setStudentQuery('');
    setDrawerOpen(true);
  };

  const toggleDraftStudent = (id: string) => {
    setDraftStudents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyStudents = () => {
    setForm((f) => {
      const prevMap = new Map(f.students.map((s) => [s.studentId, s]));
      const nextStops: StudentStop[] = draftStudents.map((id) => {
        const existing = prevMap.get(id);
        return (
          existing ?? {
            studentId: id,
            location: '',
            pickupTime: defaultPickupTime(),
          }
        );
      });
      return { ...f, students: nextStops };
    });
    setDrawerOpen(false);
  };

  const removeStudent = (id: string) => {
    setForm((f) => ({ ...f, students: f.students.filter((s) => s.studentId !== id) }));
  };

  const updateStop = (id: string, patch: Partial<StudentStop>) => {
    setForm((f) => ({
      ...f,
      students: f.students.map((s) => (s.studentId === id ? { ...s, ...patch } : s)),
    }));
  };

  const toastEl = toast ? (
    <div className={styles.toast} role="status">
      <span className={styles.toastOk} aria-hidden>
        ✓
      </span>
      {toast}
    </div>
  ) : null;

  const studentDrawer = (
    <Drawer
      open={drawerOpen}
      title="Select Student"
      plainHeader
      meta={`${draftStudents.length} selected`}
      onClose={() => setDrawerOpen(false)}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDrawerOpen(false)}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={applyStudents}>
            Done
          </button>
        </>
      }
    >
      <p className={styles.drawerSub}>Select Students</p>
      <div className={styles.drawerField}>
        <select
          className="ui-select"
          value={classroom}
          onChange={(e) => setClassroom(e.target.value)}
          aria-label="Classroom filter"
        >
          {classroomNames().map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className={`${styles.drawerField} ${styles.searchWrap}`}>
        <input
          className="ui-input"
          placeholder="Search by name"
          value={studentQuery}
          onChange={(e) => setStudentQuery(e.target.value)}
          aria-label="Search students"
        />
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <p className={styles.selectedCount}>{draftStudents.length} selected</p>
      <ul className={styles.studentList}>
        {filteredStudents.length === 0 ? (
          <li className={styles.noStudents}>No students found</li>
        ) : (
          filteredStudents.map((s) => {
            const on = draftStudents.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`${styles.studentItem} ${on ? styles.studentItemOn : ''}`}
                  onClick={() => toggleDraftStudent(s.id)}
                >
                  <span className={styles.avatar} aria-hidden>
                    {initials(s.name)}
                  </span>
                  <span>{s.name}</span>
                  <span className={`${styles.checkDot} ${on ? styles.checkDotOn : ''}`} aria-hidden>
                    {on ? (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.5"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </Drawer>
  );

  if (view === 'form') {
    return (
      <div className={styles.root}>
        <div className={styles.head}>
          <button type="button" className={styles.crumb} onClick={backToList}>
            <span aria-hidden>←</span>
            Bus Tracking <span className={styles.crumbMuted}>/ {editingId ? 'Edit Route' : 'Add Route'}</span>
          </button>
        </div>

        <form
          className={styles.formCard}
          onSubmit={(e) => {
            e.preventDefault();
            saveRoute();
          }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-name">
              <span className={styles.req}>*</span> Enter Route Name
            </label>
            <input
              id="route-name"
              className="ui-input"
              placeholder="Enter Route Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {errors.name ? <p className={styles.error}>{errors.name}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-type">
              <span className={styles.req}>*</span> Enter Type
            </label>
            <select
              id="route-type"
              className="ui-select"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">Enter Type</option>
              {ROUTE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type ? <p className={styles.error}>{errors.type}</p> : null}
          </div>

          <div className={styles.studentsBlock}>
            <div className={styles.studentsHead}>
              {form.students.length > 0 ? (
                <div className={styles.stopHeadRow}>
                  <span>Student Name</span>
                  <span>Location</span>
                  <span>{form.type === 'Drop-off' ? 'Drop Off Time' : 'Pick Up Time'}</span>
                  <span className={styles.stopHeadAction} aria-hidden />
                </div>
              ) : (
                'Students'
              )}
            </div>
            <div className={styles.studentsBody}>
              {form.students.length > 0 ? (
                <div className={styles.stopList}>
                  {form.students.map((stop) => {
                    const name = allStudents().find((s) => s.id === stop.studentId)?.name ?? stop.studentId;
                    return (
                      <div key={stop.studentId} className={styles.stopRow}>
                        <div className={styles.stopIdentity}>
                          <span className={styles.stopAvatar} aria-hidden>
                            {initials(name)}
                          </span>
                          <span>
                            <span className={styles.stopName}>{name}</span>
                            <span className={styles.stopRole}>Student</span>
                          </span>
                        </div>
                        <input
                          className={`ui-input ${styles.stopInput}`}
                          placeholder="Location"
                          value={stop.location}
                          onChange={(e) => updateStop(stop.studentId, { location: e.target.value })}
                          aria-label={`${name} location`}
                        />
                        <div className={styles.timeWrap}>
                          <input
                            type="time"
                            className={`ui-input ${styles.stopInput}`}
                            value={stop.pickupTime}
                            onChange={(e) => updateStop(stop.studentId, { pickupTime: e.target.value })}
                            aria-label={`${name} time`}
                          />
                          <span className={styles.timeHint} title={formatTimeDisplay(stop.pickupTime)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.stopRemove}
                          aria-label={`Remove ${name}`}
                          onClick={() => removeStudent(stop.studentId)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <button type="button" className={styles.selectStudentBtn} onClick={openStudentDrawer}>
                <span className={styles.plusCircle} aria-hidden>
                  +
                </span>
                Select Student
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-location">
              <span className={styles.req}>*</span> Location
            </label>
            <input
              id="route-location"
              className="ui-input"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            {errors.location ? <p className={styles.error}>{errors.location}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-vehicle">
              <span className={styles.req}>*</span> Vehicle
            </label>
            <input
              id="route-vehicle"
              className="ui-input"
              placeholder="Mini, Sedan, Tempo, Bus, etc."
              value={form.vehicle}
              onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
            />
            {errors.vehicle ? <p className={styles.error}>{errors.vehicle}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-vehicle-number">
              <span className={styles.req}>*</span> Vehicle Number
            </label>
            <input
              id="route-vehicle-number"
              className="ui-input"
              placeholder="Vehicle Registration Number"
              value={form.vehicleNumber}
              onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
            />
            {errors.vehicleNumber ? <p className={styles.error}>{errors.vehicleNumber}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-driver">
              <span className={styles.req}>*</span> Driver
            </label>
            <select
              id="route-driver"
              className="ui-select"
              value={form.driver}
              onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
            >
              <option value="">Driver</option>
              {DRIVERS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.driver ? <p className={styles.error}>{errors.driver}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="route-helper">
              <span className={styles.req}>*</span> Helper
            </label>
            <select
              id="route-helper"
              className="ui-select"
              value={form.helper}
              onChange={(e) => setForm((f) => ({ ...f, helper: e.target.value }))}
            >
              <option value="">Helper</option>
              {HELPERS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {errors.helper ? <p className={styles.error}>{errors.helper}</p> : null}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={`ui-btn ui-btn-outline ${styles.formBtn}`} onClick={backToList}>
              Cancel
            </button>
            <button type="submit" className={`ui-btn ui-btn-primary ${styles.formBtn}`}>
              Save
            </button>
          </div>
        </form>

        {studentDrawer}
        {toastEl}
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Bus Tracking"
      description="Manage bus routes, stops, and assigned students."
      icon={<Bus />}
      actions={
        <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
          Add Route
        </button>
      }
    >
    <div className={styles.root}>
      <div className={styles.tableCard}>
        <table className={`ui-table ${styles.table}`}>
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className={styles.sortBtn}
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                >
                  Route Name
                  <span className={styles.sortIcon} aria-hidden>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                </button>
              </th>
              <th className={styles.center}>Route Type</th>
              <th className={styles.center}>Status</th>
              <th className={styles.actionsCol} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pageRoutes.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  No Data
                </td>
              </tr>
            ) : (
              pageRoutes.map((route) => (
                <tr key={route.id} className={styles.dataRow}>
                  <td>
                    <button type="button" className={styles.rowBtn} onClick={() => openEdit(route)}>
                      {route.name}
                    </button>
                  </td>
                  <td className={styles.center}>{route.type}</td>
                  <td className={styles.center}>
                    <span
                      className={`${styles.statusPill} ${
                        route.status === 'Running' ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {route.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.menuWrap} ref={menuOpenId === route.id ? menuRef : undefined}>
                      <button
                        type="button"
                        className={styles.menuBtn}
                        aria-label={`Actions for ${route.name}`}
                        aria-expanded={menuOpenId === route.id}
                        onClick={() => setMenuOpenId((id) => (id === route.id ? null : route.id))}
                      >
                        ⋮
                      </button>
                      {menuOpenId === route.id ? (
                        <div className={styles.menuPop} role="menu">
                          <button
                            type="button"
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => openEdit(route)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            role="menuitem"
                            onClick={() => deleteRoute(route.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.pager}>
          <span className={styles.pagerText}>
            Showing {rangeStart}-{rangeEnd} of {sortedRoutes.length} results.
          </span>
          <div className={styles.pagerControls}>
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className={styles.pagerPage}>{currentPage}</span>
            <button
              type="button"
              className={styles.pagerBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
            <select
              className={styles.pageSize}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {toastEl}
    </div>
    </SettingsSectionShell>
  );
}

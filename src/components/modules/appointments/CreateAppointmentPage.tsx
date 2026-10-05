'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  CALENDAR_OPTIONS,
  FACULTY,
  STUDENTS,
  TIME_SLOTS,
  addMinutes,
  initialsOf,
} from '@/lib/appointments/mockData';
import type {
  AppointmentAudience,
  AppointmentRecord,
  CreateAppointmentDraft,
  RepeatRule,
} from '@/lib/appointments/types';
import { DRAFT_STORAGE_KEY, TOUR_BASE } from '@/lib/appointments/types';
import { upsertAppointment } from '@/lib/appointments/appointmentsStore';
import { btnMotion, pageMotion, staggerContainer, staggerItem } from './animations';
import '@/components/ui/module.css';
import './appointments.css';

const EMPTY_DRAFT: CreateAppointmentDraft = {
  step: 0,
  calendarId: '',
  date: '',
  startTime: '',
  endTime: '',
  repeat: 'never',
  audience: 'enquiry',
  parentName: '',
  countryCode: '+91',
  phone: '',
  email: '',
  childName: '',
  gender: '',
  preferredCourse: '',
  campus: '',
  facultyName: '',
  notes: '',
  studentId: '',
  relationship: '',
};

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const CreateAppointmentPage = memo(function CreateAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<CreateAppointmentDraft>(EMPTY_DRAFT);
  const [calendarQuery, setCalendarQuery] = useState('');
  const [facultyQuery, setFacultyQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [booking, setBooking] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  useEffect(() => {
    const child = searchParams.get('child') || searchParams.get('student');
    const parent = searchParams.get('parent');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const gender = searchParams.get('gender');
    const faculty = searchParams.get('faculty');
    const audience = searchParams.get('audience');
    if (!child && !parent && !phone) {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const parsed = { ...EMPTY_DRAFT, ...JSON.parse(raw) } as CreateAppointmentDraft;
          setDraft(parsed);
          setRepeatEnabled(parsed.repeat !== 'never');
        }
      } catch {
        /* ignore */
      }
      return;
    }
    setDraft((prev) => ({
      ...prev,
      audience: audience === 'student' ? 'student' : 'enquiry',
      childName: child || prev.childName,
      parentName: parent || prev.parentName,
      phone: phone || prev.phone,
      email: email || prev.email,
      gender: gender || prev.gender,
      facultyName: faculty && faculty !== 'Unassigned' ? faculty : prev.facultyName,
    }));
    setDirty(true);
  }, [searchParams]);

  useEffect(() => {
    if (!dirty || successId) return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft, dirty, successId]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty && !successId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, successId]);

  const patch = useCallback((next: Partial<CreateAppointmentDraft>) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, ...next }));
    setErrors([]);
  }, []);

  const calendar = CALENDAR_OPTIONS.find((c) => c.id === draft.calendarId);
  const selectedStudent = STUDENTS.find((s) => s.id === draft.studentId);
  const unavailable = useMemo(() => new Set(['10:00', '14:00', '16:30']), []);

  const calendars = useMemo(() => {
    const q = calendarQuery.trim().toLowerCase();
    if (!q) return CALENDAR_OPTIONS;
    return CALENDAR_OPTIONS.filter((c) =>
      `${c.name} ${c.owner}`.toLowerCase().includes(q),
    );
  }, [calendarQuery]);

  const facultyList = useMemo(() => {
    const q = facultyQuery.trim().toLowerCase();
    if (!q) return FACULTY;
    return FACULTY.filter((f) =>
      `${f.name} ${f.department}`.toLowerCase().includes(q),
    );
  }, [facultyQuery]);

  const studentMatches = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return STUDENTS.slice(0, 5);
    return STUDENTS.filter((s) =>
      `${s.studentName} ${s.parentName} ${s.phone}`.toLowerCase().includes(q),
    );
  }, [studentQuery]);

  const validate = (): string[] => {
    const e: string[] = [];
    if (!draft.calendarId) e.push('Select a calendar.');
    if (!draft.date) e.push('Pick a date.');
    if (!draft.startTime) e.push('Select a time slot.');
    if (draft.audience === 'enquiry') {
      if (!draft.parentName.trim()) e.push('Parent name is required.');
      if (!draft.phone.trim()) e.push('Phone number is required.');
      if (!draft.childName.trim()) e.push('Child name is required.');
      if (!draft.gender) e.push('Gender is required.');
    } else if (!draft.studentId) {
      e.push('Select an existing student.');
    }
    if (!draft.facultyName) e.push('Assign faculty.');
    return e;
  };

  const book = async () => {
    const e = validate();
    if (e.length) {
      setErrors(e);
      return;
    }
    setBooking(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = `a-${Date.now()}`;
    const record: AppointmentRecord = {
      id,
      studentName:
        draft.audience === 'student'
          ? selectedStudent?.studentName ?? draft.childName
          : draft.childName,
      parentName:
        draft.audience === 'student'
          ? selectedStudent?.parentName ?? draft.parentName
          : draft.parentName,
      parentPhone: draft.phone || selectedStudent?.phone,
      parentEmail: draft.email || selectedStudent?.email,
      facultyName: draft.facultyName,
      calendarId: draft.calendarId,
      calendarName: calendar?.name ?? 'Calendar',
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime || addMinutes(draft.startTime, calendar?.bookingDurationMin ?? 30),
      appointmentType: calendar?.meetingType ?? 'Appointment',
      status: 'Scheduled',
      priority: 'medium',
      audience: draft.audience,
      notes: draft.notes,
      gender: draft.gender || selectedStudent?.gender,
      course: draft.preferredCourse || selectedStudent?.course,
      campus: draft.campus || selectedStudent?.campus,
      batch: selectedStudent?.batch,
      relationship: (draft.relationship as AppointmentRecord['relationship']) || undefined,
      repeat: draft.repeat,
      taskCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    upsertAppointment(record);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDirty(false);
    setBooking(false);
    setSuccessId(id);
  };

  if (successId) {
    return (
      <motion.div className="appt-create mod-page" {...pageMotion}>
        <div className="appt-success">
          <motion.div
            className="appt-success-icon"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
            <CheckCircle2 size={40} />
          </motion.div>
          <h2 className="appt-success-title">Appointment booked</h2>
          <p className="appt-success-sub">
            {draft.childName || selectedStudent?.studentName} · {draft.date} at {draft.startTime}
          </p>
          <div className="appt-success-actions">
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => router.push(`${TOUR_BASE}/${successId}`)}
            >
              View Appointment
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setSuccessId(null);
                setDraft(EMPTY_DRAFT);
              }}
            >
              Create Another
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push(`${TOUR_BASE}?view=calendar`)}
            >
              Go to Calendar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="appt-create mod-page" {...pageMotion}>
      <PageHeader
        title="New Appointment"
        description="Book a visit across calendar, schedule, guest and faculty"
        crumbs={['Panacea', 'Enquiries', 'Tour', 'New']}
      />

      {errors.length ? (
        <div className="appt-inline-alert" role="alert">
          {errors[0]}
        </div>
      ) : null}

      <motion.div
        className="appt-create-stack"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* CARD 1 — Calendar */}
        <motion.section className="appt-create-card" variants={staggerItem}>
          <h3>1. Select Calendar</h3>
          <p>Search and choose a booking calendar.</p>
          <label className="appt-search-field appt-create-search">
            <Search size={15} aria-hidden />
            <input
              value={calendarQuery}
              onChange={(e) => setCalendarQuery(e.target.value)}
              placeholder="Search calendars…"
              aria-label="Search calendars"
            />
          </label>
          <div className="appt-option-list">
            {calendars.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`appt-cal-option${draft.calendarId === c.id ? ' is-selected' : ''}`}
                onClick={() => patch({ calendarId: c.id })}
              >
                <span className="appt-cal-swatch" style={{ background: c.color }} />
                <span className="appt-option-body">
                  <strong>{c.name}</strong>
                  <span>
                    {c.owner} · {c.workingHours} · Cap {c.capacity}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {calendar ? (
            <div className="appt-info-card">
              <div>
                <span>Working hours</span>
                <strong>{calendar.workingHours}</strong>
              </div>
              <div>
                <span>Booking duration</span>
                <strong>{calendar.bookingDurationMin} min</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>{calendar.owner}</strong>
              </div>
              <div>
                <span>Timezone</span>
                <strong>{calendar.timezone}</strong>
              </div>
              <div>
                <span>Availability</span>
                <strong>{calendar.available ? 'Open' : 'Unavailable'}</strong>
              </div>
              <div className="is-wide">
                <span>Booking link</span>
                <strong className="appt-link-text">{calendar.bookingLink}</strong>
              </div>
            </div>
          ) : null}
        </motion.section>

        {/* CARD 2 — Date & Time */}
        <motion.section className="appt-create-card" variants={staggerItem}>
          <h3>2. Date & Time</h3>
          <p>Pick a day and an available slot.</p>
          <div className="appt-quick-dates">
            {[
              { label: 'Today', value: isoOffset(0) },
              { label: 'Tomorrow', value: isoOffset(1) },
              { label: 'Next Week', value: isoOffset(7) },
            ].map((b) => (
              <motion.button
                key={b.label}
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => patch({ date: b.value })}
                {...btnMotion}
              >
                {b.label}
              </motion.button>
            ))}
          </div>
          <div className="ui-field appt-date-field">
            <label className="ui-label">Date</label>
            <input
              type="date"
              className="ui-input"
              value={draft.date}
              onChange={(e) => patch({ date: e.target.value, startTime: '', endTime: '' })}
            />
          </div>
          <div className="appt-slot-groups">
            {(Object.keys(TIME_SLOTS) as Array<keyof typeof TIME_SLOTS>).map((group) => (
              <div key={group} className="appt-slot-group">
                <h5>{group}</h5>
                <div className="appt-slots">
                  {TIME_SLOTS[group].map((slot) => {
                    const disabled = unavailable.has(slot);
                    return (
                      <motion.button
                        key={slot}
                        type="button"
                        className={`appt-slot${draft.startTime === slot ? ' is-selected' : ''}`}
                        disabled={disabled}
                        onClick={() =>
                          patch({
                            startTime: slot,
                            endTime: addMinutes(slot, calendar?.bookingDurationMin ?? 30),
                          })
                        }
                        whileTap={disabled ? undefined : { scale: 0.96 }}
                      >
                        {slot}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="appt-repeat-block">
            <span className="ui-label">Repeat</span>
            <div className="appt-repeat-radios" role="radiogroup" aria-label="Repeat">
              <label className="appt-radio">
                <input
                  type="radio"
                  name="repeat-mode"
                  checked={!repeatEnabled}
                  onChange={() => {
                    setRepeatEnabled(false);
                    patch({ repeat: 'never' });
                  }}
                />
                Don&apos;t Repeat
              </label>
              <label className="appt-radio">
                <input
                  type="radio"
                  name="repeat-mode"
                  checked={repeatEnabled}
                  onChange={() => {
                    setRepeatEnabled(true);
                    if (draft.repeat === 'never') patch({ repeat: 'weekly' });
                  }}
                />
                Repeat
              </label>
            </div>
            <AnimatePresence>
              {repeatEnabled ? (
                <motion.div
                  className="appt-repeat-options"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {(['daily', 'weekly', 'monthly', 'custom'] as RepeatRule[]).map((rule) => (
                    <button
                      key={rule}
                      type="button"
                      className={`appt-chip${draft.repeat === rule ? ' is-selected' : ''}`}
                      onClick={() => patch({ repeat: rule })}
                    >
                      {rule.charAt(0).toUpperCase() + rule.slice(1)}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* CARD 3 — Who */}
        <motion.section className="appt-create-card" variants={staggerItem}>
          <h3>3. Who is this for?</h3>
          <p>New inquiry or an existing student.</p>
          <div className="appt-audience-toggle" role="tablist">
            {(['enquiry', 'student'] as AppointmentAudience[]).map((aud) => (
              <button
                key={aud}
                type="button"
                className={`appt-view-btn${draft.audience === aud ? ' is-active' : ''}`}
                onClick={() => patch({ audience: aud })}
              >
                {draft.audience === aud ? (
                  <motion.span className="appt-view-btn-bg" layoutId="aud-pill" />
                ) : null}
                <span className="appt-view-btn-label">
                  {aud === 'enquiry' ? 'New Inquiry' : 'Existing Student'}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {draft.audience === 'enquiry' ? (
              <motion.div
                key="enquiry"
                className="ui-grid-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <div className="ui-field">
                  <label className="ui-label">Parent / Client Name *</label>
                  <input
                    className="ui-input"
                    value={draft.parentName}
                    onChange={(e) => patch({ parentName: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Phone Number *</label>
                  <div className="appt-phone-row">
                    <select
                      className="ui-select appt-country-code"
                      value={draft.countryCode}
                      onChange={(e) => patch({ countryCode: e.target.value })}
                      aria-label="Country code"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      className="ui-input"
                      value={draft.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ui-field">
                  <label className="ui-label">Email (Optional)</label>
                  <input
                    className="ui-input"
                    value={draft.email}
                    onChange={(e) => patch({ email: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Child Name *</label>
                  <input
                    className="ui-input"
                    value={draft.childName}
                    onChange={(e) => patch({ childName: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Child Gender *</label>
                  <select
                    className="ui-select"
                    value={draft.gender}
                    onChange={(e) => patch({ gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>
                <div className="ui-field appt-span-2">
                  <label className="ui-label">Notes (Optional)</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    value={draft.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    placeholder="Anything the host should know…"
                  />
                </div>
                <p className="appt-hint appt-span-2">Assign faculty in section 4 below.</p>
              </motion.div>
            ) : (
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <label className="appt-search-field appt-create-search">
                  <Search size={15} aria-hidden />
                  <input
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Search student…"
                    aria-label="Search student"
                  />
                </label>
                <div className="appt-option-list">
                  {studentMatches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`appt-cal-option${draft.studentId === s.id ? ' is-selected' : ''}`}
                      onClick={() =>
                        patch({
                          studentId: s.id,
                          childName: s.studentName,
                          parentName: s.parentName,
                          phone: s.phone,
                          email: s.email,
                          gender: s.gender,
                          preferredCourse: s.course,
                          campus: s.campus,
                        })
                      }
                    >
                      <span className="appt-avatar">{initialsOf(s.studentName)}</span>
                      <span className="appt-option-body">
                        <strong>{s.studentName}</strong>
                        <span>
                          {s.parentName} · {s.course} · {s.campus}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {selectedStudent ? (
                  <div className="appt-info-card">
                    <div>
                      <span>Student</span>
                      <strong>{selectedStudent.studentName}</strong>
                    </div>
                    <div>
                      <span>Parent</span>
                      <strong>{selectedStudent.parentName}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{selectedStudent.phone}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{selectedStudent.email}</strong>
                    </div>
                    <div>
                      <span>Gender</span>
                      <strong>{selectedStudent.gender}</strong>
                    </div>
                    <div>
                      <span>Course</span>
                      <strong>{selectedStudent.course}</strong>
                    </div>
                    <div>
                      <span>Batch</span>
                      <strong>{selectedStudent.batch}</strong>
                    </div>
                    <div>
                      <span>Campus</span>
                      <strong>{selectedStudent.campus}</strong>
                    </div>
                  </div>
                ) : null}
                <div className="ui-field appt-who-extra">
                  <label className="ui-label">Relationship (optional)</label>
                  <select
                    className="ui-select"
                    value={draft.relationship}
                    onChange={(e) => patch({ relationship: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <p className="appt-hint">Assign faculty in section 4 below.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* CARD 4 — Faculty cards */}
        <motion.section className="appt-create-card" variants={staggerItem}>
          <h3>4. Assign Faculty</h3>
          <p>Search faculty cards and pick a host.</p>
          <label className="appt-search-field appt-create-search">
            <Search size={15} aria-hidden />
            <input
              value={facultyQuery}
              onChange={(e) => setFacultyQuery(e.target.value)}
              placeholder="Search faculty…"
              aria-label="Search faculty"
            />
          </label>
          <div className="appt-faculty-grid">
            {facultyList.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`appt-faculty-card${draft.facultyName === f.name ? ' is-selected' : ''}${
                  !f.available ? ' is-busy' : ''
                }`}
                onClick={() => patch({ facultyName: f.name })}
              >
                <div className="appt-faculty-head">
                  <span className="appt-avatar">{f.initials}</span>
                  <div>
                    <strong>{f.name}</strong>
                    <div className="appt-faculty-dept">{f.department}</div>
                  </div>
                </div>
                <div className="appt-faculty-meta">
                  {f.available ? 'Available' : 'Busy'} · {f.todayAppointments} today · workload{' '}
                  {f.workload}%
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* CARD 5 — Review */}
        <motion.section className="appt-create-card" variants={staggerItem}>
          <h3>5. Review</h3>
          <p>Confirm details before booking.</p>
          <div className="appt-review-grid">
            {[
              ['Calendar', calendar?.name ?? '—'],
              ['Date', draft.date || '—'],
              ['Time', draft.startTime ? `${draft.startTime} – ${draft.endTime}` : '—'],
              ['Faculty', draft.facultyName || '—'],
              ['Parent', draft.parentName || selectedStudent?.parentName || '—'],
              ['Student', draft.childName || selectedStudent?.studentName || '—'],
            ].map(([label, value]) => (
              <div key={label} className="appt-review-item">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      <div className="appt-sticky-footer">
        <button
          type="button"
          className="ui-btn ui-btn-outline"
          onClick={() => router.push(TOUR_BASE)}
        >
          Cancel
        </button>
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={book}
          disabled={booking}
          {...btnMotion}
        >
          {booking ? 'Booking…' : 'Book Appointment'}
        </motion.button>
      </div>
    </motion.div>
  );
});

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  loadStudents,
  roomName,
} from '@/lib/center-management/studentsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import { PremiumTimeField } from '@/components/modules/calendar/PremiumTimeField';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import {
  ProfileTablePagination,
  useClientPagination,
} from '@/components/modules/center-management/ui/ProfileTablePagination';
import {
  setProgramStaff,
  setProgramStudents,
  type ProgramAssignedStaff,
  type ProgramAssignedStudent,
} from '@/lib/programAssignmentsStore';
import type { ProgramRecord } from '@/lib/programsStore';
import '@/components/ui/module.css';
import '@/components/modules/calendar/calendar.css';
import '@/components/modules/view-profile/field-picker.css';
import styles from './ProgramPage.module.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const DAY_FULL: Record<(typeof WEEK_DAYS)[number], string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export type CreatedProgram = ProgramRecord & { status: 'Active' };

type Props = {
  onBack: () => void;
  onCreated: (program: CreatedProgram) => void;
};

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDisplayTime(hhmm: string): string {
  if (!hhmm) return '';
  const ampm = hhmm.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    const h = Number(ampm[1]) % 12 || 12;
    return `${String(h).padStart(2, '0')}:${ampm[2]} ${ampm[3].toUpperCase()}`;
  }
  const [hhRaw, mm] = hhmm.split(':').map(Number);
  if (Number.isNaN(hhRaw) || Number.isNaN(mm)) return hhmm;
  const suffix = hhRaw >= 12 ? 'PM' : 'AM';
  const h12 = ((hhRaw + 11) % 12) + 1;
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${suffix}`;
}

function durationBetween(start: string, end: string): string {
  if (!start || !end || start.includes('--') || end.includes('--')) return '—';
  const toMin = (t: string) => {
    const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + Number(m[2]);
  };
  const a = toMin(start);
  const b = toMin(end);
  if (a == null || b == null || b < a) return '—';
  const mins = b - a;
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${h} hour${h === 1 ? '' : 's'}`;
  return `${h}h ${rem}m`;
}

const emptyForm = {
  name: '',
  startDate: '',
  endDate: '',
  days: [] as string[],
  startTime: '',
  endTime: '',
  rooms: [] as string[],
  label: '',
  maxStudents: '',
  maxStaff: '',
  allowExtraStudents: false,
  allowExtraStaff: false,
  extraStudents: '',
  extraStaff: '',
  minAgeYrs: '0',
  minAgeMonths: '0',
  maxAgeYrs: '0',
  maxAgeMonths: '0',
  assignStartDate: '',
  assignEndDate: '',
  assignDays: [] as string[],
  studentSearch: '',
  studentRoom: 'All',
  studentGroup: 'All',
  staffSearch: '',
  staffRoom: 'All',
  staffGroup: 'All',
  studentIds: [] as string[],
  staffIds: [] as string[],
};

export function ProgramAddWizard({ onBack, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [assignDaysOpen, setAssignDaysOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [capacityNote, setCapacityNote] = useState('');

  const { roomNames: roomOptions, groups: centerGroups, labels: centerLabels } = useCenterCatalog();
  const labelOptions = useMemo(
    () => [
      { value: '', label: 'Select label' },
      ...centerLabels.map((l) => ({ value: l.name, label: l.name })),
    ],
    [centerLabels],
  );

  const groupNameById = useMemo(() => {
    const map = new Map(centerGroups.map((g) => [g.id, g.name]));
    return (id: string) => map.get(id) ?? '';
  }, [centerGroups]);

  const [allStudents, setAllStudents] = useState<
    Array<{ id: string; name: string; room: string; groupIds: string[]; age: string }>
  >([]);
  const [allStaff, setAllStaff] = useState<
    Array<{ id: string; name: string; status: 'Active' | 'Inactive'; rooms: string[]; groups: string[] }>
  >([]);

  useEffect(() => {
    setAllStudents(
      loadStudents().map((s) => ({
        id: s.id,
        name: s.name,
        room: s.roomIds.map(roomName).filter(Boolean).join(', ') || 'Unassigned',
        groupIds: s.groupIds,
        age: s.ageLabel,
      })),
    );
    setAllStaff(
      loadStaff()
        .filter((s) => s.status !== 'Inactive')
        .map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          rooms: s.rooms,
          groups: s.groups,
        })),
    );
  }, []);

  const studentCapacity =
    (Number(form.maxStudents) || 0) + (form.allowExtraStudents ? Number(form.extraStudents) || 0 : 0);
  const staffCapacity =
    (Number(form.maxStaff) || 0) + (form.allowExtraStaff ? Number(form.extraStaff) || 0 : 0);

  const canStep1 =
    form.name.trim() &&
    form.startDate &&
    form.days.length > 0 &&
    form.startTime &&
    form.endTime &&
    form.rooms.length > 0 &&
    form.maxStudents !== '' &&
    form.maxStaff !== '';

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(form.studentSearch.trim().toLowerCase());
      const matchesRoom =
        form.studentRoom === 'All' ||
        s.room.split(',').map((r) => r.trim()).includes(form.studentRoom);
      const matchesGroup =
        form.studentGroup === 'All' ||
        s.groupIds.includes(form.studentGroup) ||
        s.groupIds.some((gid) => groupNameById(gid) === form.studentGroup);
      return matchesName && matchesRoom && matchesGroup;
    });
  }, [allStudents, form.studentSearch, form.studentRoom, form.studentGroup, groupNameById]);

  const filteredStaff = useMemo(() => {
    return allStaff.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(form.staffSearch.trim().toLowerCase());
      const matchesRoom = form.staffRoom === 'All' || s.rooms.includes(form.staffRoom);
      const matchesGroup = form.staffGroup === 'All' || s.groups.includes(form.staffGroup);
      return matchesName && matchesRoom && matchesGroup;
    });
  }, [allStaff, form.staffSearch, form.staffRoom, form.staffGroup]);

  const studentFilterKey = `${form.studentSearch}|${form.studentRoom}|${form.studentGroup}`;
  const staffFilterKey = `${form.staffSearch}|${form.staffRoom}|${form.staffGroup}`;

  const studentRoomOptions = useMemo(() => ['All', ...roomOptions], [roomOptions]);

  const studentPager = useClientPagination(filteredStudents, 10, studentFilterKey);
  const staffPager = useClientPagination(filteredStaff, 10, staffFilterKey);

  const roomFilterOptions = useMemo(
    () => [
      { value: 'All', label: 'All rooms' },
      ...studentRoomOptions
        .filter((r) => r !== 'All')
        .map((r) => ({ value: r, label: r })),
    ],
    [studentRoomOptions],
  );

  const groupFilterOptions = useMemo(
    () => [
      { value: 'All', label: 'All groups' },
      ...centerGroups.map((g) => ({ value: g.name, label: g.name })),
    ],
    [centerGroups],
  );

  const staffRoomFilterOptions = useMemo(
    () => [
      { value: 'All', label: 'All rooms' },
      ...roomOptions.map((r) => ({ value: r, label: r })),
    ],
    [roomOptions],
  );

  const staffGroupFilterOptions = useMemo(
    () => [
      { value: 'All', label: 'All groups' },
      ...centerGroups.map((g) => ({ value: g.name, label: g.name })),
    ],
    [centerGroups],
  );

  const toggleDay = (day: string, key: 'days' | 'assignDays' = 'days') => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(day) ? f[key].filter((d) => d !== day) : [...f[key], day],
    }));
  };

  const toggleRoom = (room: string) => {
    setForm((f) => ({
      ...f,
      rooms: f.rooms.includes(room) ? f.rooms.filter((r) => r !== room) : [...f.rooms, room],
    }));
  };

  const pickIdsWithinCapacity = (
    current: string[],
    candidateIds: string[],
    capacity: number,
  ) => {
    if (capacity <= 0) return [...new Set([...current, ...candidateIds])];
    const merged = [...current];
    for (const id of candidateIds) {
      if (merged.includes(id)) continue;
      if (merged.length >= capacity) break;
      merged.push(id);
    }
    return merged;
  };

  const toggleId = (key: 'studentIds' | 'staffIds', id: string) => {
    setForm((f) => {
      if (f[key].includes(id)) {
        setCapacityNote('');
        return { ...f, [key]: f[key].filter((x) => x !== id) };
      }
      const cap = key === 'studentIds' ? studentCapacity : staffCapacity;
      if (cap > 0 && f[key].length >= cap) {
        setCapacityNote(
          key === 'studentIds'
            ? `You can select up to ${cap} student(s) for this program.`
            : `You can select up to ${cap} staff member(s) for this program.`,
        );
        return f;
      }
      setCapacityNote('');
      return { ...f, [key]: [...f[key], id] };
    });
  };

  const goNextFrom1 = () => {
    if (!canStep1) return;
    setForm((f) => ({
      ...f,
      assignStartDate: f.assignStartDate || f.startDate,
      assignEndDate: f.assignEndDate || f.endDate,
      assignDays: f.assignDays.length ? f.assignDays : [...f.days],
    }));
    setStep(2);
  };

  const createProgram = () => {
    if (!canStep1) return;
    setCreating(true);
    window.setTimeout(() => {
      const startTime = formatDisplayTime(form.startTime);
      const endTime = formatDisplayTime(form.endTime);
      const days = [...form.days].sort(
        (a, b) =>
          WEEK_DAYS.indexOf(a as (typeof WEEK_DAYS)[number]) -
          WEEK_DAYS.indexOf(b as (typeof WEEK_DAYS)[number]),
      );
      const assignStart = formatDisplayDate(form.assignStartDate || form.startDate);
      const assignEnd = formatDisplayDate(form.assignEndDate || form.endDate);
      const assignDays = (form.assignDays.length ? form.assignDays : days).slice();
      const id = `p${Date.now()}`;
      const name = form.name.trim();
      const record: CreatedProgram = {
        id,
        name,
        startDate: formatDisplayDate(form.startDate),
        endDate: formatDisplayDate(form.endDate),
        startTime,
        endTime,
        durationLabel: durationBetween(startTime, endTime),
        days,
        room: form.rooms[0] || roomOptions[0] || '',
        rooms: [...form.rooms],
        feePlanCount: 0,
        status: 'Active',
        occupancy: form.studentIds.length,
        labels: form.label ? [form.label] : [],
        maxStudents: Number(form.maxStudents) || 0,
        maxStaff: Number(form.maxStaff) || 0,
        allowExtraStudents: form.allowExtraStudents,
        allowExtraStaff: form.allowExtraStaff,
        extraStudents: form.allowExtraStudents ? Number(form.extraStudents) || 0 : 0,
        extraStaff: form.allowExtraStaff ? Number(form.extraStaff) || 0 : 0,
        minAgeYears: Number(form.minAgeYrs) || 0,
        minAgeMonths: Number(form.minAgeMonths) || 0,
        maxAgeYears: Number(form.maxAgeYrs) || 0,
        maxAgeMonths: Number(form.maxAgeMonths) || 0,
      };

      const students: ProgramAssignedStudent[] = form.studentIds.map((sid) => {
        const s = allStudents.find((row) => row.id === sid);
        return {
          id: sid,
          studentId: sid,
          name: s?.name ?? sid,
          age: s?.age ?? '',
          studentStatus: 'Active',
          status: 'Active',
          startDate: assignStart,
          endDate: assignEnd || '01/01/2031',
          days: [...assignDays],
        };
      });
      const staffRows: ProgramAssignedStaff[] = form.staffIds.map((sid) => {
        const s = allStaff.find((row) => row.id === sid);
        return {
          id: sid,
          name: s?.name ?? sid,
          status: s?.status === 'Active' ? 'Active' : 'Inactive',
          startDate: assignStart,
          endDate: assignEnd,
          days: [...assignDays],
          rooms: s?.rooms.join(', ') || form.rooms.join(', ') || record.room,
        };
      });
      setProgramStudents(id, name, students, { labels: form.label ? [form.label] : [] });
      setProgramStaff(id, name, staffRows);

      setCreating(false);
      onCreated(record);
    }, 700);
  };

  const steps = [
    { id: 1, label: 'Create New Program' },
    { id: 2, label: 'Assign Students' },
    { id: 3, label: 'Assign Staff' },
  ];

  return (
    <div className={`mod-page ${styles.page}`}>
      <div className={styles.ambient} aria-hidden />

      <div className={styles.wizardCrumb}>
        <button type="button" className={styles.crumbBack} onClick={onBack}>
          ← Program
        </button>
        <span className={styles.crumbSep}>|</span>
        <span>Add Program</span>
      </div>

      <div className={styles.stepper} role="list" aria-label="Add program steps">
        {steps.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className={styles.stepperItemWrap} role="listitem">
              {i > 0 ? <div className={`${styles.stepperLine} ${step >= s.id ? styles.stepperLineOn : ''}`} /> : null}
              <button
                type="button"
                className={`${styles.stepperCard} ${active ? styles.stepperCardActive : ''} ${done ? styles.stepperCardDone : ''}`}
                onClick={() => {
                  if (s.id === 1 || (s.id > 1 && canStep1 && s.id <= step + 1)) setStep(s.id);
                }}
              >
                <span className={styles.stepperNum} aria-hidden>
                  {done ? '✓' : s.id}
                </span>
                <span>{s.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.wizardBar}>
        <span>Steps {step} of 3</span>
        <div className={styles.wizardActions}>
          {step > 1 ? (
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setStep((s) => s - 1)}>
              &lt;&lt; Previous
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={step === 1 && !canStep1}
              onClick={() => (step === 1 ? goNextFrom1() : setStep(3))}
            >
              Next &gt;&gt;
            </button>
          ) : (
            <button type="button" className="ui-btn ui-btn-primary" disabled={creating} onClick={createProgram}>
              {creating ? 'Creating…' : 'Create program'}
            </button>
          )}
        </div>
      </div>

      {creating ? (
        <div className={styles.loader} aria-live="polite">
          <span /><span /><span /><span />
        </div>
      ) : null}

      <div className={styles.panel}>
        <div className={styles.wizardBody}>
          {step === 1 && (
            <div className={styles.wizardForm}>
              <div className="ui-field">
                <label className="ui-label">
                  Program Name <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  placeholder="Enter program name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label">
                    Start Date <span className="req">*</span>
                  </label>
                  <FieldDatePicker
                    value={form.startDate}
                    onChange={(startDate) => setForm({ ...form, startDate })}
                    ariaLabel="Start date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">End Date</label>
                  <FieldDatePicker
                    value={form.endDate}
                    onChange={(endDate) => setForm({ ...form, endDate })}
                    ariaLabel="End date"
                  />
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">
                  Select the days of a week <span className="req">*</span>
                </label>
                <div className={styles.dayToggles}>
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.dayToggle} ${form.days.includes(day) ? styles.dayToggleActive : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="add-start-time">
                    Start Time <span className="req">*</span>
                  </label>
                  <PremiumTimeField
                    id="add-start-time"
                    className={styles.programTimeField}
                    value={form.startTime}
                    onChange={(startTime) => setForm({ ...form, startTime })}
                    placeholder="hh:mm AM"
                    formatValue={formatDisplayTime}
                    icon={<span />}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="add-end-time">
                    End Time <span className="req">*</span>
                  </label>
                  <PremiumTimeField
                    id="add-end-time"
                    className={styles.programTimeField}
                    value={form.endTime}
                    onChange={(endTime) => setForm({ ...form, endTime })}
                    placeholder="hh:mm AM"
                    formatValue={formatDisplayTime}
                    icon={<span />}
                  />
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">
                  Rooms <span className="req">*</span>
                </label>
                <div className={styles.multiWrap}>
                  <button
                    type="button"
                    className={`ui-input ${styles.multiTrigger}${roomsOpen ? ` ${styles.multiTriggerOpen}` : ''}`}
                    onClick={() => {
                      setLabelsOpen(false);
                      setRoomsOpen((o) => !o);
                    }}
                  >
                    {form.rooms.length ? `${form.rooms.length} room(s) selected` : 'Select rooms'}
                    <span aria-hidden>▾</span>
                  </button>
                  {form.rooms.length > 0 ? (
                    <div className={styles.chips}>
                      {form.rooms.map((r) => (
                        <span key={r} className={styles.chip}>
                          {r}
                          <button type="button" aria-label={`Remove ${r}`} onClick={() => toggleRoom(r)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {roomsOpen ? (
                    <div className={styles.multiMenu} role="listbox" aria-label="Rooms">
                      {roomOptions.map((r) => (
                        <label key={r} className={styles.multiOption}>
                          <input
                            type="checkbox"
                            checked={form.rooms.includes(r)}
                            onChange={() => toggleRoom(r)}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">Labels</label>
                <div className={styles.multiWrap}>
                  <button
                    type="button"
                    className={`ui-input ${styles.multiTrigger}${labelsOpen ? ` ${styles.multiTriggerOpen}` : ''}`}
                    aria-haspopup="listbox"
                    aria-expanded={labelsOpen}
                    onClick={() => {
                      setRoomsOpen(false);
                      setLabelsOpen((o) => !o);
                    }}
                  >
                    <span className={form.label ? undefined : styles.multiPlaceholder}>
                      {form.label || 'Select label'}
                    </span>
                    <span aria-hidden>▾</span>
                  </button>
                  {labelsOpen ? (
                    <div className={styles.multiMenu} role="listbox" aria-label="Labels">
                      {labelOptions.map((opt) => {
                        const selected = form.label === opt.value;
                        return (
                          <button
                            key={opt.value || 'none'}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`${styles.selectOption}${selected ? ` ${styles.selectOptionActive}` : ''}`}
                            onClick={() => {
                              setForm({ ...form, label: opt.value });
                              setLabelsOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {selected ? <span className={styles.selectCheck} aria-hidden>✓</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label">
                    Max Capacity For Students <span className="req">*</span>
                  </label>
                  <input
                    className="ui-input"
                    type="number"
                    min={0}
                    placeholder="Enter max capacity"
                    value={form.maxStudents}
                    onChange={(e) => setForm({ ...form, maxStudents: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">
                    Max Capacity For Staff <span className="req">*</span>
                  </label>
                  <input
                    className="ui-input"
                    type="number"
                    min={0}
                    placeholder="Enter max capacity"
                    value={form.maxStaff}
                    onChange={(e) => setForm({ ...form, maxStaff: e.target.value })}
                  />
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">Allow Admissions Above The Maximum Capacity</label>
                <div className={styles.checkRow}>
                  <label className={styles.checkOption}>
                    <input
                      type="checkbox"
                      checked={form.allowExtraStudents}
                      onChange={(e) => setForm({ ...form, allowExtraStudents: e.target.checked })}
                    />
                    Student
                  </label>
                  <label className={styles.checkOption}>
                    <input
                      type="checkbox"
                      checked={form.allowExtraStaff}
                      onChange={(e) => setForm({ ...form, allowExtraStaff: e.target.checked })}
                    />
                    Staff
                  </label>
                </div>
              </div>

              {(form.allowExtraStudents || form.allowExtraStaff) && (
                <div className="ui-grid-2">
                  {form.allowExtraStudents ? (
                    <div className="ui-field">
                      <label className="ui-label">Number Of Extra Admission Allowed For Student</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        placeholder="Enter max capacity"
                        value={form.extraStudents}
                        onChange={(e) => setForm({ ...form, extraStudents: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div />
                  )}
                  {form.allowExtraStaff ? (
                    <div className="ui-field">
                      <label className="ui-label">Number Of Extra Admission Allowed For Staff</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        placeholder="Enter max capacity"
                        value={form.extraStaff}
                        onChange={(e) => setForm({ ...form, extraStaff: e.target.value })}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label">Min Age</label>
                  <div className={styles.ageRow}>
                    <div className={styles.ageField}>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        value={form.minAgeYrs}
                        onChange={(e) => setForm({ ...form, minAgeYrs: e.target.value })}
                      />
                      <span>Years</span>
                    </div>
                    <div className={styles.ageField}>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        max={11}
                        value={form.minAgeMonths}
                        onChange={(e) => setForm({ ...form, minAgeMonths: e.target.value })}
                      />
                      <span>Months</span>
                    </div>
                  </div>
                </div>
                <div className="ui-field">
                  <label className="ui-label">Max Age</label>
                  <div className={styles.ageRow}>
                    <div className={styles.ageField}>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        value={form.maxAgeYrs}
                        onChange={(e) => setForm({ ...form, maxAgeYrs: e.target.value })}
                      />
                      <span>Years</span>
                    </div>
                    <div className={styles.ageField}>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        max={11}
                        value={form.maxAgeMonths}
                        onChange={(e) => setForm({ ...form, maxAgeMonths: e.target.value })}
                      />
                      <span>Months</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.assignPanel}>
              <div className={styles.assignSchedule}>
                <div className="ui-field">
                  <label className="ui-label">Start Date</label>
                  <FieldDatePicker
                    value={form.assignStartDate}
                    onChange={(assignStartDate) => setForm({ ...form, assignStartDate })}
                    ariaLabel="Assignment start date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">End Date</label>
                  <FieldDatePicker
                    value={form.assignEndDate}
                    onChange={(assignEndDate) => setForm({ ...form, assignEndDate })}
                    ariaLabel="Assignment end date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Days Of Week</label>
                  <div className={styles.multiWrap}>
                    <button
                      type="button"
                      className={`ui-input ${styles.multiTrigger}`}
                      onClick={() => setAssignDaysOpen((o) => !o)}
                    >
                      {form.assignDays.length ? `${form.assignDays.length} day(s)` : 'Select Days'}
                      <span aria-hidden>▾</span>
                    </button>
                    {form.assignDays.length > 0 ? (
                      <div className={styles.chips}>
                        {form.assignDays.map((d) => (
                          <span key={d} className={styles.chip}>
                            {DAY_FULL[d as (typeof WEEK_DAYS)[number]] || d}
                            <button type="button" onClick={() => toggleDay(d, 'assignDays')}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {assignDaysOpen ? (
                      <div className={styles.multiMenu}>
                        {WEEK_DAYS.map((d) => (
                          <label key={d} className={styles.multiOption}>
                            <input
                              type="checkbox"
                              checked={form.assignDays.includes(d)}
                              onChange={() => toggleDay(d, 'assignDays')}
                            />
                            {DAY_FULL[d]}
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={styles.assignFilters}>
                <div className={styles.filterField}>
                  <label>Search Name</label>
                  <div className="ui-search">
                    <span>⌕</span>
                    <input
                      placeholder="Search By Student Name"
                      value={form.studentSearch}
                      onChange={(e) => setForm({ ...form, studentSearch: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.filterField}>
                  <label>Room</label>
                  <div className={styles.assignFilterDd}>
                    <SearchableSelect
                      value={form.studentRoom}
                      onChange={(studentRoom) => setForm({ ...form, studentRoom })}
                      options={roomFilterOptions}
                      searchable
                      searchPlaceholder="Search rooms…"
                      placeholder="All rooms"
                      ariaLabel="Filter by room"
                    />
                  </div>
                </div>
                <div className={styles.filterField}>
                  <label>Groups</label>
                  <div className={styles.assignFilterDd}>
                    <SearchableSelect
                      value={form.studentGroup}
                      onChange={(studentGroup) => setForm({ ...form, studentGroup })}
                      options={groupFilterOptions}
                      searchable
                      searchPlaceholder="Search groups…"
                      placeholder="All groups"
                      ariaLabel="Filter by group"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.assignMeta}>
                <span>
                  {form.studentIds.length} student(s) selected
                  {studentCapacity > 0 ? ` · ${Math.max(0, studentCapacity - form.studentIds.length)} remaining` : ''}
                </span>
                <span>Maximum capacity for students : {studentCapacity || 0}</span>
              </div>
              {capacityNote && step === 2 ? (
                <p className={styles.assignError}>{capacityNote}</p>
              ) : null}

              <div className={styles.assignTableCard}>
                <div className={styles.tableScroll}>
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>
                          <input
                            type="checkbox"
                            aria-label="Select all students on this page"
                            checked={
                              studentPager.pageItems.length > 0 &&
                              studentPager.pageItems.every((s) => form.studentIds.includes(s.id))
                            }
                            onChange={(e) => {
                              const ids = studentPager.pageItems.map((s) => s.id);
                              setForm((f) => {
                                if (!e.target.checked) {
                                  setCapacityNote('');
                                  return {
                                    ...f,
                                    studentIds: f.studentIds.filter((id) => !ids.includes(id)),
                                  };
                                }
                                const next = pickIdsWithinCapacity(f.studentIds, ids, studentCapacity);
                                if (studentCapacity > 0 && next.length >= studentCapacity) {
                                  setCapacityNote(
                                    `You can select up to ${studentCapacity} student(s) for this program.`,
                                  );
                                } else {
                                  setCapacityNote('');
                                }
                                return { ...f, studentIds: next };
                              });
                            }}
                          />
                        </th>
                        <th>Name</th>
                        <th>Rooms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPager.pageItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className={styles.assignEmptyCell}>
                            No students match your filters.
                          </td>
                        </tr>
                      ) : (
                        studentPager.pageItems.map((s) => {
                          const atCap =
                            studentCapacity > 0 &&
                            form.studentIds.length >= studentCapacity &&
                            !form.studentIds.includes(s.id);
                          return (
                            <tr
                              key={s.id}
                              className={
                                form.studentIds.includes(s.id) ? styles.rowSelected : undefined
                              }
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={form.studentIds.includes(s.id)}
                                  disabled={atCap}
                                  onChange={() => toggleId('studentIds', s.id)}
                                  aria-label={`Select ${s.name}`}
                                />
                              </td>
                              <td>
                                <div className={styles.personCell}>
                                  <span className={styles.avatar} aria-hidden>
                                    {s.name.charAt(0)}
                                  </span>
                                  <strong>{s.name}</strong>
                                </div>
                              </td>
                              <td>{s.room}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {studentPager.total > 0 ? (
                  <ProfileTablePagination
                    page={studentPager.page}
                    pageSize={studentPager.pageSize}
                    total={studentPager.total}
                    totalPages={studentPager.totalPages}
                    onPageChange={studentPager.setPage}
                    onPageSizeChange={studentPager.setPageSize}
                    className={styles.assignPagination}
                  />
                ) : null}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.assignPanel}>
              <div className={styles.assignSchedule}>
                <div className="ui-field">
                  <label className="ui-label">
                    Start Date <span className="req">*</span>
                  </label>
                  <FieldDatePicker
                    value={form.assignStartDate}
                    onChange={(assignStartDate) => setForm({ ...form, assignStartDate })}
                    ariaLabel="Student assignment start date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">End Date</label>
                  <FieldDatePicker
                    value={form.assignEndDate}
                    onChange={(assignEndDate) => setForm({ ...form, assignEndDate })}
                    ariaLabel="Student assignment end date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">
                    Days Of Week <span className="req">*</span>
                  </label>
                  <div className={styles.dayToggles}>
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`${styles.dayToggle} ${form.assignDays.includes(day) ? styles.dayToggleActive : ''}`}
                        onClick={() => toggleDay(day, 'assignDays')}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.assignFilters}>
                <div className={styles.filterField}>
                  <label>Search Name</label>
                  <div className="ui-search">
                    <span>⌕</span>
                    <input
                      placeholder="Search by staff name"
                      value={form.staffSearch}
                      onChange={(e) => setForm({ ...form, staffSearch: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.filterField}>
                  <label>Room</label>
                  <div className={styles.assignFilterDd}>
                    <SearchableSelect
                      value={form.staffRoom}
                      onChange={(staffRoom) => setForm({ ...form, staffRoom })}
                      options={staffRoomFilterOptions}
                      searchable
                      searchPlaceholder="Search rooms…"
                      placeholder="All rooms"
                      ariaLabel="Filter staff by room"
                    />
                  </div>
                </div>
                <div className={styles.filterField}>
                  <label>Groups</label>
                  <div className={styles.assignFilterDd}>
                    <SearchableSelect
                      value={form.staffGroup}
                      onChange={(staffGroup) => setForm({ ...form, staffGroup })}
                      options={staffGroupFilterOptions}
                      searchable
                      searchPlaceholder="Search groups…"
                      placeholder="All groups"
                      ariaLabel="Filter staff by group"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.assignMeta}>
                <span>
                  {form.staffIds.length} Staff selected
                  {staffCapacity > 0 ? ` · ${Math.max(0, staffCapacity - form.staffIds.length)} remaining` : ''}
                </span>
                <span>Maximum capacity for staff : {staffCapacity || 0}</span>
              </div>
              {capacityNote && step === 3 ? (
                <p className={styles.assignError}>{capacityNote}</p>
              ) : null}

              <div className={styles.assignTableCard}>
                <div className={styles.tableScroll}>
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>
                          <input
                            type="checkbox"
                            aria-label="Select all staff on this page"
                            checked={
                              staffPager.pageItems.length > 0 &&
                              staffPager.pageItems.every((s) => form.staffIds.includes(s.id))
                            }
                            onChange={(e) => {
                              const ids = staffPager.pageItems.map((s) => s.id);
                              setForm((f) => {
                                if (!e.target.checked) {
                                  setCapacityNote('');
                                  return {
                                    ...f,
                                    staffIds: f.staffIds.filter((id) => !ids.includes(id)),
                                  };
                                }
                                const next = pickIdsWithinCapacity(f.staffIds, ids, staffCapacity);
                                if (staffCapacity > 0 && next.length >= staffCapacity) {
                                  setCapacityNote(
                                    `You can select up to ${staffCapacity} staff member(s) for this program.`,
                                  );
                                } else {
                                  setCapacityNote('');
                                }
                                return { ...f, staffIds: next };
                              });
                            }}
                          />
                        </th>
                        <th>Name</th>
                        <th>Rooms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffPager.pageItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className={styles.assignEmptyCell}>
                            No staff match your filters.
                          </td>
                        </tr>
                      ) : (
                        staffPager.pageItems.map((s) => {
                          const atCap =
                            staffCapacity > 0 &&
                            form.staffIds.length >= staffCapacity &&
                            !form.staffIds.includes(s.id);
                          return (
                            <tr
                              key={s.id}
                              className={
                                form.staffIds.includes(s.id) ? styles.rowSelected : undefined
                              }
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={form.staffIds.includes(s.id)}
                                  disabled={atCap}
                                  onChange={() => toggleId('staffIds', s.id)}
                                  aria-label={`Select ${s.name}`}
                                />
                              </td>
                              <td>
                                <div className={styles.personCell}>
                                  <span className={styles.avatar} aria-hidden>
                                    {s.name.charAt(0)}
                                  </span>
                                  <strong>{s.name}</strong>
                                </div>
                              </td>
                              <td>{s.rooms.join(', ') || 'Unassigned'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {staffPager.total > 0 ? (
                  <ProfileTablePagination
                    page={staffPager.page}
                    pageSize={staffPager.pageSize}
                    total={staffPager.total}
                    totalPages={staffPager.totalPages}
                    onPageChange={staffPager.setPage}
                    onPageSizeChange={staffPager.setPageSize}
                    className={styles.assignPagination}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

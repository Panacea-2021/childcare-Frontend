'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlignLeft,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileText,
  Minus,
  Plus,
  Settings2,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { FieldTimePicker } from '@/components/modules/view-profile/FieldTimePicker';
import { InfoTip } from './InfoTip';
import { CalendarPreview } from './CalendarPreview';
import {
  CUSTOM_FIELD_TYPES,
  DAY_KEYS,
  ENQUIRY_STATUSES,
  LABEL_OPTIONS,
  STAFF_OPTIONS,
  type CustomField,
  type CustomFieldType,
  type DayKey,
  type EditorSection,
  type FieldVisibility,
  type TourCalendarConfig,
} from './calendarTypes';

type Props = {
  initial: TourCalendarConfig;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSave: (calendar: TourCalendarConfig) => void;
};

const SECTIONS: { id: EditorSection; label: string; icon: ReactNode }[] = [
  { id: 'basics', label: 'Basics', icon: <AlignLeft size={16} /> },
  { id: 'availability', label: 'Availability', icon: <CalendarDays size={16} /> },
  { id: 'staff', label: 'Staff', icon: <Users size={16} /> },
  { id: 'booking-rules', label: 'Booking rules', icon: <Clock3 size={16} /> },
  { id: 'booking-fields', label: 'Booking form fields', icon: <FileText size={16} /> },
  { id: 'advanced', label: 'Advanced settings', icon: <SlidersHorizontal size={16} /> },
];

const STANDARD_FIELD_META: { key: keyof TourCalendarConfig['standardFields']; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'childName', label: "Child's Name" },
  { key: 'childGender', label: "Child's Gender" },
];

function StaffChips({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const available = STAFF_OPTIONS.filter((s) => !value.includes(s));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="tm-chipSelect" ref={rootRef}>
      <button
        type="button"
        className={`tm-chipBox${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="tm-chipBoxInner">
          {value.length === 0 ? <span className="tm-chipPlaceholder">Select staff</span> : null}
          {value.map((s) => (
            <span key={s} className="tm-chip">
              {s}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${s}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((x) => x !== s));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(value.filter((x) => x !== s));
                  }
                }}
              >
                <X size={12} />
              </span>
            </span>
          ))}
        </span>
        <ChevronDown size={16} className="tm-chipChevron" aria-hidden />
      </button>
      {open ? (
        <div className="tm-menu tm-chipMenu">
          {available.length === 0 ? (
            <p className="tm-menuEmpty">All staff selected</p>
          ) : (
            available.map((s) => (
              <button
                key={s}
                type="button"
                className="tm-menuItem"
                onClick={() => {
                  onChange([...value, s]);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function EditorSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="tm-editorSelect" ref={rootRef}>
      <button
        type="button"
        className={`tm-editorSelectBtn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{value}</span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {open ? (
        <div className="tm-menu tm-editorSelectMenu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              className={`tm-menuItem${opt === value ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CalendarEditor({ initial, mode, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<TourCalendarConfig>(initial);
  const [section, setSection] = useState<EditorSection>('basics');
  const scrollingRef = useRef(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState<{
    type: CustomFieldType | '';
    name: string;
    mandatory: boolean;
  }>({ type: '', name: '', mandatory: false });
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const typeSelectRef = useRef<HTMLDivElement>(null);

  const filteredTypes = useMemo(() => {
    const q = typeQuery.trim().toLowerCase();
    return CUSTOM_FIELD_TYPES.filter((t) => !q || t.toLowerCase().includes(q));
  }, [typeQuery]);

  useEffect(() => {
    if (!typeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!typeSelectRef.current?.contains(e.target as Node)) setTypeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTypeOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [typeOpen]);

  useEffect(() => {
    if (!customOpen) {
      setTypeOpen(false);
      setTypeQuery('');
    }
  }, [customOpen]);

  const scrollToSection = (id: EditorSection) => {
    const el = document.getElementById(`tm-section-${id}`);
    if (!el) return;
    scrollingRef.current = true;
    setSection(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 450);
  };

  useEffect(() => {
    const nodes = SECTIONS.map((s) =>
      document.getElementById(`tm-section-${s.id}`),
    ).filter(Boolean) as HTMLElement[];

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target?.id) return;
        const id = top.target.id.replace('tm-section-', '') as EditorSection;
        setSection((prev) => (prev === id ? prev : id));
      },
      { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: '-12% 0px -55% 0px' },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const patch = (partial: Partial<TourCalendarConfig>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const toggleLabel = (label: string) => {
    setDraft((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const setDayEnabled = (day: DayKey, enabled: boolean) => {
    setDraft((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          enabled,
          slots: enabled
            ? prev.availability[day].slots.length
              ? prev.availability[day].slots
              : [{ start: '09:00', end: '17:00' }]
            : [],
        },
      },
    }));
  };

  const updateSlot = (day: DayKey, index: number, key: 'start' | 'end', value: string) => {
    setDraft((prev) => {
      const slots = prev.availability[day].slots.map((s, i) =>
        i === index ? { ...s, [key]: value } : s,
      );
      return {
        ...prev,
        availability: { ...prev.availability, [day]: { ...prev.availability[day], slots } },
      };
    });
  };

  const addSlot = (day: DayKey) => {
    setDraft((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: [...prev.availability[day].slots, { start: '09:00', end: '17:00' }],
        },
      },
    }));
  };

  const removeSlot = (day: DayKey, index: number) => {
    setDraft((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: prev.availability[day].slots.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const setFieldVis = (key: keyof TourCalendarConfig['standardFields'], value: FieldVisibility) => {
    setDraft((prev) => ({
      ...prev,
      standardFields: { ...prev.standardFields, [key]: value },
    }));
  };

  const setCustomVis = (id: string, value: FieldVisibility) => {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === id ? { ...f, visibility: value } : f,
      ),
    }));
  };

  const removeCustom = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== id),
    }));
  };

  const saveCustom = () => {
    if (!customDraft.type || !customDraft.name.trim()) return;
    const field: CustomField = {
      id: `cf-${Date.now()}`,
      type: customDraft.type,
      name: customDraft.name.trim(),
      visibility: customDraft.mandatory ? 'required' : 'optional',
    };
    setDraft((prev) => ({ ...prev, customFields: [...prev.customFields, field] }));
    setCustomOpen(false);
    setCustomDraft({ type: '', name: '', mandatory: false });
    setTypeQuery('');
  };

  const canSave = draft.name.trim().length > 0 && draft.startDate && draft.endDate;

  if (showPreview) {
    return (
      <CalendarPreview
        calendar={{ ...draft, name: draft.name.trim() || 'Untitled calendar' }}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="tm-editor">
      <div className="tm-editorTop">
        <button type="button" className="tm-backBtn" onClick={onCancel} aria-label="Back to calendars">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="tm-editorTitle">{mode === 'create' ? 'Create Calendar' : 'Edit Calendar'}</h2>
          <p className="tm-editorSub">Configure booking settings across six sections, then save.</p>
        </div>
      </div>

      <div className="tm-editorLayout">
        <nav className="tm-editorNav" aria-label="Calendar sections">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tm-editorNavItem${section === item.id ? ' is-active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="tm-editorNavIcon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="tm-editorPanel">
          <section id="tm-section-basics" className="tm-sectionCard" aria-label="Basics">
              <h3 className="tm-sectionHeading">
                <AlignLeft size={16} />
                Basics
              </h3>
              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="tm-cal-name">
                    Calendar name <span className="req">*</span>
                  </label>
                  <input
                    id="tm-cal-name"
                    className="ui-input"
                    value={draft.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="e.g. Test"
                  />
                </div>
                <div className="ui-field">
                  <span className="ui-label">Labels</span>
                  <div className="tm-labelRow">
                    {LABEL_OPTIONS.map((label) => {
                      const on = draft.labels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`tm-labelChip${on ? ' is-on' : ''}`}
                          onClick={() => toggleLabel(label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="ui-field">
                  <span className="ui-label">
                    Start date <span className="req">*</span>
                  </span>
                  <FieldDatePicker
                    value={draft.startDate}
                    onChange={(v) => patch({ startDate: v })}
                    ariaLabel="Start date"
                  />
                </div>
                <div className="ui-field">
                  <span className="ui-label">
                    End date <span className="req">*</span>
                  </span>
                  <FieldDatePicker
                    value={draft.endDate}
                    onChange={(v) => patch({ endDate: v })}
                    ariaLabel="End date"
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="tm-max-cap">
                    Max capacity per slot
                  </label>
                  <input
                    id="tm-max-cap"
                    className="ui-input"
                    type="number"
                    min={1}
                    value={draft.maxCapacity}
                    onChange={(e) =>
                      patch({ maxCapacity: Math.max(1, Number(e.target.value) || 1) })
                    }
                  />
                </div>
              </div>
            </section>

          <section id="tm-section-availability" className="tm-sectionCard" aria-label="Availability">
              <h3 className="tm-sectionHeading">
                <CalendarDays size={16} />
                Availability
              </h3>
              <div className="ui-field" style={{ maxWidth: 220 }}>
                <label className="ui-label" htmlFor="tm-duration">
                  Total duration (minutes)
                </label>
                <input
                  id="tm-duration"
                  className="ui-input"
                  type="number"
                  min={5}
                  step={5}
                  value={draft.totalDurationMin}
                  onChange={(e) =>
                    patch({ totalDurationMin: Math.max(5, Number(e.target.value) || 30) })
                  }
                />
              </div>
              <p className="tm-hint">
                Weekends follow center working days from Settings. Toggle days and set open hours
                below.
              </p>
              <div className="tm-availList">
                {DAY_KEYS.map((day) => {
                  const row = draft.availability[day];
                  return (
                    <div key={day} className="tm-availRow">
                      <label className="tm-switch">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => setDayEnabled(day, e.target.checked)}
                        />
                        <span />
                      </label>
                      <strong className="tm-availDay">{day}</strong>
                      {!row.enabled ? (
                        <span className="tm-unavailable">Unavailable</span>
                      ) : (
                        <div className="tm-availSlots">
                          {row.slots.map((slot, idx) => (
                            <div key={`${day}-${idx}`} className="tm-availSlotLine">
                              <FieldTimePicker
                                value={slot.start}
                                onChange={(v) => updateSlot(day, idx, 'start', v)}
                                ariaLabel={`${day} start`}
                              />
                              <span>–</span>
                              <FieldTimePicker
                                value={slot.end}
                                onChange={(v) => updateSlot(day, idx, 'end', v)}
                                ariaLabel={`${day} end`}
                              />
                              {idx === 0 ? (
                                <button
                                  type="button"
                                  className="tm-circleBtn"
                                  aria-label="Add time range"
                                  onClick={() => addSlot(day)}
                                >
                                  <Plus size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="tm-circleBtn"
                                  aria-label="Remove time range"
                                  onClick={() => removeSlot(day, idx)}
                                >
                                  <Minus size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          <section id="tm-section-staff" className="tm-sectionCard" aria-label="Staff">
              <h3 className="tm-sectionHeading">
                <Users size={16} />
                Staff
              </h3>
              <div className="ui-field">
                <span className="ui-label">
                  Assign appointments to <span className="req">*</span>{' '}
                  <InfoTip text="Staff members who can host or be assigned to tour appointments on this calendar." />
                </span>
                <StaffChips
                  value={draft.assignedStaff}
                  onChange={(assignedStaff) => patch({ assignedStaff })}
                />
              </div>

              <div className="tm-notifyBox">
                <div className="tm-notifyHead">
                  <span>
                    <Settings2 size={14} /> Send staff notifications for
                  </span>
                  <div className="tm-notifyChannels">
                    <label className="tm-check">
                      <input
                        type="checkbox"
                        checked={draft.notifyEmail}
                        onChange={(e) => patch({ notifyEmail: e.target.checked })}
                      />
                      Email
                    </label>
                    <label className="tm-check">
                      <input
                        type="checkbox"
                        checked={draft.notifyInApp}
                        onChange={(e) => patch({ notifyInApp: e.target.checked })}
                      />
                      In-App
                    </label>
                  </div>
                </div>
                <div className="ui-field">
                  <span className="ui-label">New appointment bookings</span>
                  <StaffChips
                    value={draft.notifyNewBookings}
                    onChange={(notifyNewBookings) => patch({ notifyNewBookings })}
                  />
                </div>
                <div className="ui-field">
                  <span className="ui-label">Calendar edits</span>
                  <StaffChips
                    value={draft.notifyCalendarEdits}
                    onChange={(notifyCalendarEdits) => patch({ notifyCalendarEdits })}
                  />
                </div>
              </div>

              <label className="tm-checkRow">
                <input
                  type="checkbox"
                  checked={draft.autoAssignStaff}
                  onChange={(e) => patch({ autoAssignStaff: e.target.checked })}
                />
                Auto-assign staff to the appointment
                <InfoTip text="Enable automatic distribution of appointments among staff members in an even manner. If this feature is turned off, appointments will be allocated to all the tagged staff members." />
              </label>

              <label className="tm-checkRow">
                <input
                  type="checkbox"
                  checked={draft.createEnquiryOnBook}
                  onChange={(e) => patch({ createEnquiryOnBook: e.target.checked })}
                />
                Create an enquiry every time a tour is booked
                <InfoTip text="Using this checkbox, the system will automatically create a new enquiry for every booked appointment." />
              </label>

              {draft.createEnquiryOnBook ? (
                <div className="ui-field" style={{ maxWidth: 280 }}>
                  <span className="ui-label">
                    Default enquiry status <span className="req">*</span>
                  </span>
                  <EditorSelect
                    value={draft.defaultEnquiryStatus}
                    options={ENQUIRY_STATUSES}
                    onChange={(defaultEnquiryStatus) => patch({ defaultEnquiryStatus })}
                    ariaLabel="Default enquiry status"
                  />
                </div>
              ) : null}
            </section>

          <section id="tm-section-booking-rules" className="tm-sectionCard" aria-label="Booking rules">
              <h3 className="tm-sectionHeading">
                <Clock3 size={16} />
                Booking rules
              </h3>

              <div className="tm-ruleRow">
                <label className="tm-check">
                  <input
                    type="checkbox"
                    checked={draft.advanceBookingEnabled}
                    onChange={(e) => patch({ advanceBookingEnabled: e.target.checked })}
                  />
                  Advance booking limit
                </label>
                <InfoTip text="How far ahead visitors can book, for example, 30 days keeps the calendar open only for the coming 30 days. Recurring appointments aren't affected." />
                <input
                  className="ui-input tm-numInput"
                  type="number"
                  min={1}
                  value={draft.advanceBookingDays}
                  disabled={!draft.advanceBookingEnabled}
                  onChange={(e) =>
                    patch({ advanceBookingDays: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
                <span>days</span>
              </div>

              <div className="tm-ruleRow">
                <label className="tm-check">
                  <input
                    type="checkbox"
                    checked={draft.minNoticeEnabled}
                    onChange={(e) => patch({ minNoticeEnabled: e.target.checked })}
                  />
                  Minimum booking notice
                </label>
                <InfoTip text="The minimum time allowed between a booking and the appointment start, so visitors can't book at the last minute. For example, 2 hours hides any slot starting within the next 2 hours." />
                <input
                  className="ui-input tm-numInput"
                  type="number"
                  min={1}
                  value={draft.minNoticeHours}
                  disabled={!draft.minNoticeEnabled}
                  onChange={(e) =>
                    patch({ minNoticeHours: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
                <span>hour{draft.minNoticeHours === 1 ? '' : 's'}</span>
              </div>

              <div className="tm-reminders">
                <div className="tm-remindersHead">
                  <span className="ui-label">
                    Reminder schedule{' '}
                    <InfoTip text="Reminder emails are sent to parents this long before their appointment. Add up to 3." />
                  </span>
                </div>
                {draft.reminders.map((r, idx) => (
                  <div key={r.id} className="tm-reminderRow">
                    <input
                      className="ui-input tm-numInput"
                      type="number"
                      min={1}
                      value={r.amount}
                      onChange={(e) => {
                        const amount = Math.max(1, Number(e.target.value) || 1);
                        setDraft((prev) => ({
                          ...prev,
                          reminders: prev.reminders.map((x, i) =>
                            i === idx ? { ...x, amount } : x,
                          ),
                        }));
                      }}
                    />
                    <div className="tm-reminderUnit">
                      <EditorSelect
                        value={r.unit}
                        options={['days', 'hours']}
                        onChange={(unit) => {
                          setDraft((prev) => ({
                            ...prev,
                            reminders: prev.reminders.map((x, i) =>
                              i === idx ? { ...x, unit: unit as 'days' | 'hours' } : x,
                            ),
                          }));
                        }}
                        ariaLabel="Reminder unit"
                      />
                    </div>
                    <span className="tm-reminderLabel">before appointment</span>
                    <button
                      type="button"
                      className="tm-circleBtn"
                      aria-label="Remove reminder"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          reminders: prev.reminders.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                {draft.reminders.length < 3 ? (
                  <button
                    type="button"
                    className="tm-textLink"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        reminders: [
                          ...prev.reminders,
                          { id: `r${Date.now()}`, amount: 1, unit: 'hours' },
                        ],
                      }))
                    }
                  >
                    + Add reminder
                  </button>
                ) : null}
              </div>

              <label className="tm-checkRow">
                <input
                  type="checkbox"
                  checked={draft.allowOnStaffHolidays}
                  onChange={(e) => patch({ allowOnStaffHolidays: e.target.checked })}
                />
                Allow appointments on staff holidays
              </label>
            </section>

          <section id="tm-section-booking-fields" className="tm-sectionCard" aria-label="Booking form fields">
              <div className="tm-sectionHeadRow">
                <h3 className="tm-sectionHeading">
                  <FileText size={16} />
                  Booking form fields
                </h3>
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => {
                    setCustomDraft({ type: '', name: '', mandatory: false });
                    setTypeQuery('');
                    setCustomOpen(true);
                  }}
                >
                  <Plus size={15} />
                  Add field
                </button>
              </div>
              <p className="tm-hint">
                Choose which fields to collect on the tour form and whether each is required.
                Custom fields appear under the standard list.
              </p>
              <div className="tm-fieldRules">
                {STANDARD_FIELD_META.map((f) => (
                  <div key={f.key} className="tm-fieldRuleRow">
                    <span>{f.label}</span>
                    <div className="tm-seg">
                      {(['required', 'optional', 'hide'] as FieldVisibility[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`tm-segBtn${draft.standardFields[f.key] === opt ? ' is-active' : ''}`}
                          onClick={() => setFieldVis(f.key, opt)}
                        >
                          {opt[0].toUpperCase() + opt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {draft.customFields.map((f) => (
                  <div key={f.id} className="tm-fieldRuleRow tm-fieldRuleRowCustom">
                    <span className="tm-fieldRuleLabel">
                      {f.name}
                      <em>{f.type}</em>
                    </span>
                    <div className="tm-fieldRuleActions">
                      <div className="tm-seg">
                        {(['required', 'optional', 'hide'] as FieldVisibility[]).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`tm-segBtn${f.visibility === opt ? ' is-active' : ''}`}
                            onClick={() => setCustomVis(f.id, opt)}
                          >
                            {opt[0].toUpperCase() + opt.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="tm-fieldRemove"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => removeCustom(f.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          <section id="tm-section-advanced" className="tm-sectionCard" aria-label="Advanced settings">
              <h3 className="tm-sectionHeading">
                <SlidersHorizontal size={16} />
                Advanced settings
              </h3>

              <div className="tm-advBlock">
                <h4>Form header</h4>
                <p className="tm-hint">
                  Set a custom title and hide elements shown at the top of the tour form.
                </p>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="tm-form-title">
                    Form title
                  </label>
                  <input
                    id="tm-form-title"
                    className="ui-input"
                    value={draft.formTitle}
                    onChange={(e) => patch({ formTitle: e.target.value })}
                    placeholder="Shown to parents instead of the calendar name"
                  />
                </div>
                <div className="tm-checkGrid">
                  {(
                    [
                      ['hideSchoolLogo', 'Hide school logo'],
                      ['hideSchoolName', 'Hide school name'],
                      ['hideTitle', 'Hide title/calendar name'],
                      ['hideDuration', 'Hide duration'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="tm-check">
                      <input
                        type="checkbox"
                        checked={draft[key]}
                        onChange={(e) => patch({ [key]: e.target.checked })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="tm-advBlock">
                <h4>Form appearance</h4>
                <p className="tm-hint">Fonts and colors shown to parents on the booking form.</p>
                <div className="ui-grid-2">
                  <div className="ui-field">
                    <span className="ui-label">Font family</span>
                    <EditorSelect
                      ariaLabel="Font family"
                      value={draft.fontFamily}
                      options={['System default', 'Poppins', 'Inter']}
                      onChange={(next) => patch({ fontFamily: next })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="tm-base">
                      Base size
                    </label>
                    <input
                      id="tm-base"
                      className="ui-input"
                      type="number"
                      min={12}
                      max={22}
                      value={draft.baseSize}
                      onChange={(e) =>
                        patch({ baseSize: Math.min(22, Math.max(12, Number(e.target.value) || 15)) })
                      }
                    />
                  </div>
                  <div className="ui-field">
                    <span className="ui-label">Weight</span>
                    <EditorSelect
                      ariaLabel="Font weight"
                      value={draft.fontWeight}
                      options={['Regular (400)', 'Medium (500)', 'Semibold (600)']}
                      onChange={(next) => patch({ fontWeight: next })}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="tm-text-color">
                      Text color
                    </label>
                    <div className="tm-colorField">
                      <input
                        type="color"
                        value={draft.textColor}
                        onChange={(e) => patch({ textColor: e.target.value })}
                        aria-label="Text color"
                      />
                      <input
                        id="tm-text-color"
                        className="ui-input"
                        value={draft.textColor}
                        onChange={(e) => patch({ textColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="tm-accent-color">
                      Accent color
                    </label>
                    <div className="tm-colorField">
                      <input
                        type="color"
                        value={draft.accentColor}
                        onChange={(e) => patch({ accentColor: e.target.value })}
                        aria-label="Accent color"
                      />
                      <input
                        id="tm-accent-color"
                        className="ui-input"
                        value={draft.accentColor}
                        onChange={(e) => patch({ accentColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="tm-btn-text">
                      Button text
                    </label>
                    <div className="tm-colorField">
                      <input
                        type="color"
                        value={draft.buttonTextColor}
                        onChange={(e) => patch({ buttonTextColor: e.target.value })}
                        aria-label="Button text color"
                      />
                      <input
                        id="tm-btn-text"
                        className="ui-input"
                        value={draft.buttonTextColor}
                        onChange={(e) => patch({ buttonTextColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="tm-card-bg">
                      Card background
                    </label>
                    <div className="tm-colorField">
                      <input
                        type="color"
                        value={draft.cardBackground}
                        onChange={(e) => patch({ cardBackground: e.target.value })}
                        aria-label="Card background"
                      />
                      <input
                        id="tm-card-bg"
                        className="ui-input"
                        value={draft.cardBackground}
                        onChange={(e) => patch({ cardBackground: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

          <div className="tm-editorFooter">
            <button type="button" className="ui-btn ui-btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setShowPreview(true)}>
              Preview
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!canSave}
              onClick={() => onSave({ ...draft, name: draft.name.trim() })}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={customOpen}
        title="Add custom field"
        onClose={() => setCustomOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveCustom}>
              Submit
            </button>
          </>
        }
      >
        <div className="tm-customFieldForm">
          <div className="ui-field">
            <span className="ui-label">
              Type <span className="req">*</span>
            </span>
            <div className="tm-typeSelect" ref={typeSelectRef}>
              <button
                type="button"
                className={`tm-typeTrigger${typeOpen ? ' is-open' : ''}${
                  customDraft.type ? '' : ' is-placeholder'
                }`}
                onClick={() => setTypeOpen((v) => !v)}
                aria-expanded={typeOpen}
                aria-haspopup="listbox"
              >
                <span>{customDraft.type || 'Select Type'}</span>
                <ChevronDown size={16} aria-hidden />
              </button>
              {typeOpen ? (
                <div className="tm-typeMenu" role="listbox">
                  <input
                    className="ui-input"
                    placeholder="Search type…"
                    value={typeQuery}
                    onChange={(e) => setTypeQuery(e.target.value)}
                  />
                  {filteredTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="option"
                      aria-selected={customDraft.type === t}
                      className={`tm-menuItem${customDraft.type === t ? ' is-selected' : ''}`}
                      onClick={() => {
                        setCustomDraft((d) => ({ ...d, type: t }));
                        setTypeOpen(false);
                        setTypeQuery('');
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="tm-cf-name">
              Field name <span className="req">*</span>
            </label>
            <input
              id="tm-cf-name"
              className="ui-input"
              value={customDraft.name}
              onChange={(e) => setCustomDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Field Name"
            />
          </div>
          <label className="tm-checkRow">
            <input
              type="checkbox"
              checked={customDraft.mandatory}
              onChange={(e) => setCustomDraft((d) => ({ ...d, mandatory: e.target.checked }))}
            />
            Mandatory
          </label>
        </div>
      </Modal>
    </div>
  );
}

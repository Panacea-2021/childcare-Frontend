'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Code2,
  Copy,
  Eye,
  Link2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { CalendarEditor } from './CalendarEditor';
import { CalendarPreview } from './CalendarPreview';
import {
  createEmptyCalendar,
  enabledDays,
  formatDisplayDate,
  formatTimeLabel,
} from './calendarDefaults';
import { DAY_COLORS, LABEL_OPTIONS, type CalendarsMode, type TourCalendarConfig } from './calendarTypes';

type Props = {
  calendars: TourCalendarConfig[];
  onChange: (next: TourCalendarConfig[]) => void;
  appointmentCounts?: Record<string, number>;
};

type StatusFilter = 'all' | 'active' | 'inactive';

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="tm-selectWrap" ref={ref}>
      <button
        type="button"
        className={`tm-selectBtn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <ChevronDown size={14} />
      </button>
      {open ? (
        <div className="tm-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`tm-menuItem${opt.value === value ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CalendarsView({ calendars, onChange, appointmentCounts = {} }: Props) {
  const [mode, setMode] = useState<CalendarsMode>('list');
  const [editing, setEditing] = useState<TourCalendarConfig | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(calendars[0]?.id ?? null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!menuId) return;
    const onDoc = (e: MouseEvent) => {
      const root = document.querySelector(`[data-cal-menu="${menuId}"]`);
      if (root && !root.contains(e.target as Node)) setMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return calendars.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (labelFilter !== 'all' && !c.labels.includes(labelFilter)) return false;
      if (statusFilter === 'active' && !c.active) return false;
      if (statusFilter === 'inactive' && c.active) return false;
      if (rangeStart && c.endDate && c.endDate < rangeStart) return false;
      if (rangeEnd && c.startDate && c.startDate > rangeEnd) return false;
      return true;
    });
  }, [calendars, search, labelFilter, statusFilter, rangeStart, rangeEnd]);

  const previewCalendar = calendars.find((c) => c.id === previewId) ?? null;

  const startCreate = () => {
    setEditing(createEmptyCalendar());
    setMode('create');
  };

  const startEdit = (cal: TourCalendarConfig) => {
    setMenuId(null);
    setEditing({ ...cal, availability: structuredClone(cal.availability) });
    setMode('edit');
  };

  const saveCalendar = (cal: TourCalendarConfig) => {
    if (mode === 'create') {
      onChange([cal, ...calendars]);
      setExpandedId(cal.id);
    } else {
      onChange(calendars.map((c) => (c.id === cal.id ? cal : c)));
    }
    setMode('list');
    setEditing(null);
  };

  const removeCalendar = (id: string) => {
    setMenuId(null);
    onChange(calendars.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleActive = (id: string, active: boolean) => {
    onChange(calendars.map((c) => (c.id === id ? { ...c, active } : c)));
  };

  const copyLink = async (cal: TourCalendarConfig) => {
    const url = `${window.location.origin}/tour-management?preview=${cal.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
    setMenuId(null);
  };

  if (mode === 'create' || mode === 'edit') {
    if (!editing) return null;
    return (
      <CalendarEditor
        initial={editing}
        mode={mode}
        onCancel={() => {
          setMode('list');
          setEditing(null);
        }}
        onSave={saveCalendar}
      />
    );
  }

  if (mode === 'preview' && previewCalendar) {
    return (
      <CalendarPreview
        calendar={previewCalendar}
        onBack={() => {
          setMode('list');
          setPreviewId(null);
        }}
      />
    );
  }

  return (
    <div className="tm-manageStack" aria-label="Manage calendars">
      <section className="tm-shell tm-manage">
        <div className="tm-shellHead">
          <h2 className="tm-shellTitle">Manage Calendars</h2>
          <div className="tm-shellActions">
            <button type="button" className="ui-btn ui-btn-primary" onClick={startCreate}>
              <Plus size={16} aria-hidden />
              Create Calendar
            </button>
          </div>
        </div>

        <div className="tm-filters tm-calFilters">
          <div className="tm-search">
            <Search size={15} aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by calendar name"
              aria-label="Search calendars"
            />
          </div>

          <div className="tm-rangeFilters">
            <FieldDatePicker
              value={rangeStart}
              onChange={setRangeStart}
              ariaLabel="Range start"
              placeholder="Start date"
            />
            <span>–</span>
            <FieldDatePicker
              value={rangeEnd}
              onChange={setRangeEnd}
              ariaLabel="Range end"
              placeholder="End date"
            />
          </div>

          <FilterSelect
            value={labelFilter}
            onChange={setLabelFilter}
            options={[
              { value: 'all', label: 'All labels' },
              ...LABEL_OPTIONS.map((l) => ({ value: l, label: l })),
            ]}
          />

          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </section>

      <section className="tm-calListPanel">
      {filtered.length === 0 ? (
        <div className="tm-calEmpty">
          <div className="tm-calEmptyIcon" aria-hidden>
            <CalendarDays size={42} />
          </div>
          <p className="tm-calEmptyTitle">You have no calendars created</p>
          <p className="tm-calEmptySub">
            Click on create calendar to manage parent appointments effortlessly
          </p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={startCreate}>
            <Plus size={16} />
            Create Calendar
          </button>
        </div>
      ) : (
        <div className="tm-calCards">
          {filtered.map((cal) => {
            const open = expandedId === cal.id;
            const days = enabledDays(cal);
            const count = appointmentCounts[cal.id] ?? 0;
            return (
              <article key={cal.id} className={`tm-calManageCard${open ? ' is-open' : ''}`}>
                <header className="tm-calManageHead">
                  <button
                    type="button"
                    className="tm-calManageToggle"
                    onClick={() => setExpandedId(open ? null : cal.id)}
                    aria-expanded={open}
                  >
                    <span className="tm-calManageIcon" aria-hidden>
                      <CalendarDays size={20} />
                    </span>
                    <div className="tm-calManageTitleBlock">
                      <div className="tm-calManageTitleRow">
                        <h3>{cal.name}</h3>
                        {cal.labels[0] ? (
                          <span className="tm-calManageBadge">{cal.labels[0]}</span>
                        ) : null}
                      </div>
                      <p>
                        <CalendarDays size={13} />
                        {formatDisplayDate(cal.startDate)} – {formatDisplayDate(cal.endDate)}
                      </p>
                      {cal.labels.length > 1 ? (
                        <div className="tm-calManageLabels">
                          {cal.labels.slice(1).map((label) => (
                            <span key={label} className="tm-softPill">
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </button>

                  <div className="tm-calManageActions">
                    <label className="tm-activeSwitch">
                      <span>{cal.active ? 'Active' : 'Inactive'}</span>
                      <input
                        type="checkbox"
                        checked={cal.active}
                        onChange={(e) => toggleActive(cal.id, e.target.checked)}
                      />
                      <span className="tm-activeTrack" />
                    </label>

                    <button
                      type="button"
                      className="ui-btn ui-btn-outline tm-copyBtn"
                      onClick={() => void copyLink(cal)}
                    >
                      <Link2 size={14} />
                      {copied ? 'Copied' : 'Copy Link'}
                    </button>

                    <div className="tm-selectWrap" data-cal-menu={cal.id}>
                      <button
                        type="button"
                        className="tm-iconBtn"
                        aria-label="Calendar actions"
                        onClick={() => setMenuId(menuId === cal.id ? null : cal.id)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {menuId === cal.id ? (
                        <div className="tm-menu" style={{ right: 0, left: 'auto' }}>
                          <button
                            type="button"
                            className="tm-menuItem"
                            onClick={() => startEdit(cal)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="tm-menuItem"
                            onClick={() => {
                              setMenuId(null);
                              setPreviewId(cal.id);
                              setMode('preview');
                            }}
                          >
                            <Eye size={14} /> Preview Form
                          </button>
                          <button
                            type="button"
                            className="tm-menuItem"
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                `<iframe src="${window.location.origin}/tour-management?preview=${cal.id}" width="100%" height="640"></iframe>`,
                              );
                              setMenuId(null);
                            }}
                          >
                            <Code2 size={14} /> Copy iframe
                          </button>
                          <button
                            type="button"
                            className="tm-menuItem"
                            onClick={() => void copyLink(cal)}
                          >
                            <Copy size={14} /> Copy Link
                          </button>
                          <button
                            type="button"
                            className="tm-menuItem is-danger"
                            onClick={() => removeCalendar(cal.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className={`tm-calManageExpand${open ? ' is-open' : ''}`}
                      onClick={() => setExpandedId(open ? null : cal.id)}
                      aria-expanded={open}
                      aria-label={open ? 'Collapse calendar' : 'Expand calendar'}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </header>

                {open ? (
                  <div className="tm-calManageBody">
                    <div className="tm-summaryBlock">
                      <p className="tm-summaryLabel">Availability</p>
                      <div className="tm-dayCards">
                        {days.length === 0 ? (
                          <p className="tm-hint">No working days configured.</p>
                        ) : (
                          days.map((day) => {
                            const slot = cal.availability[day].slots[0];
                            return (
                              <div key={day} className="tm-dayCard">
                                <strong style={{ color: DAY_COLORS[day] }}>{day}</strong>
                                <span>
                                  {slot
                                    ? `${formatTimeLabel(slot.start)} – ${formatTimeLabel(slot.end)}`
                                    : '—'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="tm-summaryBlock">
                      <p className="tm-summaryLabel">Booking rules</p>
                      <div className="tm-rulesGrid">
                        <div className="tm-ruleTile">
                          <span>Slot duration</span>
                          <strong>{cal.totalDurationMin} min</strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Max capacity per slot</span>
                          <strong>{cal.maxCapacity}</strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Active Appointments</span>
                          <strong className="tm-linkish">{count}</strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Automatically create enquiry</span>
                          <strong>{cal.createEnquiryOnBook ? 'Yes' : 'No'}</strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Advance booking limit</span>
                          <strong>
                            {cal.advanceBookingEnabled
                              ? `${cal.advanceBookingDays} days`
                              : 'Off'}
                          </strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Minimum booking notice</span>
                          <strong>
                            {cal.minNoticeEnabled ? `${cal.minNoticeHours} hour` : 'Off'}
                          </strong>
                        </div>
                        <div className="tm-ruleTile">
                          <span>Allow on holiday</span>
                          <strong>{cal.allowOnStaffHolidays ? 'Yes' : 'No'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="tm-summaryBlock">
                      <p className="tm-summaryLabel">Staff</p>
                      <div className="tm-staffSummary">
                        <div className="tm-staffTile">
                          <span>Staff for appointment</span>
                          <div className="tm-pillRow">
                            {cal.assignedStaff.length === 0 ? (
                              <span className="tm-hint">None assigned</span>
                            ) : (
                              cal.assignedStaff.map((s) => (
                                <span key={s} className="tm-softPill">
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="tm-staffTile">
                          <span>Staff to notify</span>
                          <div className="tm-pillRow">
                            {[...new Set([...cal.notifyNewBookings, ...cal.notifyCalendarEdits])]
                              .length === 0 ? (
                              <span className="tm-hint">None</span>
                            ) : (
                              [...new Set([...cal.notifyNewBookings, ...cal.notifyCalendarEdits])].map(
                                (s) => (
                                  <span key={s} className="tm-softPill">
                                    {s}
                                  </span>
                                ),
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
      </section>
    </div>
  );
}

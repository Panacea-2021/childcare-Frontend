'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import type { FieldVisibility, TourCalendarConfig } from './calendarTypes';
import { DAY_KEYS } from './calendarTypes';
import { formatTimeLabel } from './calendarDefaults';

type Props = {
  calendar: TourCalendarConfig;
  schoolName?: string;
  onBack: () => void;
};

const STANDARD_FIELDS: { key: keyof TourCalendarConfig['standardFields']; label: string; type: string }[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone Number', type: 'tel' },
  { key: 'childName', label: "Child's Name", type: 'text' },
  { key: 'childGender', label: "Child's Gender", type: 'text' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayKey(d: Date) {
  const map: Record<number, (typeof DAY_KEYS)[number]> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };
  return map[d.getDay()];
}

function buildSlots(cal: TourCalendarConfig, iso: string) {
  const d = new Date(iso);
  const day = cal.availability[dayKey(d)];
  if (!day?.enabled) return [];

  const duration = Math.max(5, cal.totalDurationMin || 30);
  const out: string[] = [];
  day.slots.forEach((slot) => {
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    let cur = (sh || 0) * 60 + (sm || 0);
    const end = (eh || 0) * 60 + (em || 0);
    while (cur + duration <= end) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      out.push(`${pad(h)}:${pad(m)}`);
      cur += duration;
    }
  });
  return out;
}

function isVisible(v: FieldVisibility | undefined) {
  return v === 'required' || v === 'optional';
}

export function CalendarPreview({ calendar, schoolName = 'Hams Kids Home | Daycare', onBack }: Props) {
  const start = useMemo(() => {
    const d = calendar.startDate ? new Date(calendar.startDate) : new Date(2026, 7, 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [calendar.startDate]);

  const [view, setView] = useState(start);
  const [selected, setSelected] = useState(calendar.startDate || toISO(new Date(2026, 7, 17)));
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      return day;
    });
  }, [view]);

  const slots = buildSlots(calendar, selected);
  const selectedLabel = useMemo(() => {
    const d = new Date(selected);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [selected]);

  const title = calendar.formTitle.trim() || calendar.name || 'Tour calendar';
  const accent = calendar.accentColor || '#5D5FEF';
  const text = calendar.textColor || '#1A1A1A';
  const cardBg = calendar.cardBackground || '#ffffff';
  const btnText = calendar.buttonTextColor || '#ffffff';

  const visibleStandards = STANDARD_FIELDS.filter((f) => isVisible(calendar.standardFields[f.key]));
  const visibleCustom = (calendar.customFields || []).filter((f) => {
    const vis =
      f.visibility ??
      ((f as { mandatory?: boolean }).mandatory ? 'required' : 'optional');
    return isVisible(vis);
  });

  return (
    <div className="tm-previewPage">
      <div className="tm-previewTop">
        <button type="button" className="tm-backBtn" onClick={onBack} aria-label="Back">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="tm-previewPageTitle">Preview Form</h2>
          <p className="tm-previewPageSub">Parent booking view — draft settings only, not saved yet.</p>
        </div>
      </div>

      <div className="tm-previewShell">
        <div
          className="tm-previewCard"
          style={{
            background: cardBg,
            color: text,
            fontFamily:
              calendar.fontFamily === 'System default' || calendar.fontFamily === 'Poppins'
                ? 'var(--font-body)'
                : calendar.fontFamily,
            fontSize: `${calendar.baseSize || 15}px`,
          }}
        >
          <header className="tm-previewBrand">
            {!calendar.hideSchoolLogo ? (
              <div className="tm-previewLogo" aria-hidden style={{ background: accent }} />
            ) : null}
            {!calendar.hideSchoolName ? <p className="tm-previewSchool">{schoolName}</p> : null}
            {!calendar.hideTitle ? <h3 className="tm-previewCalName">{title}</h3> : null}
            {!calendar.hideDuration ? (
              <p className="tm-previewDuration">
                <Clock3 size={14} />
                Duration: {calendar.totalDurationMin} min
              </p>
            ) : null}
          </header>

          <section className="tm-previewBooking" aria-label="Select date and time">
            <div className="tm-previewCalPane">
              <div className="tm-previewPaneHead">
                <h4 className="tm-previewSlotTitle">Select a date</h4>
                <p className="tm-previewTz">Timezone: IST</p>
              </div>

              <div className="tm-previewMonthNav">
                <button
                  type="button"
                  className="tm-navBtn"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <strong>
                  {view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </strong>
                <button
                  type="button"
                  className="tm-navBtn"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="tm-previewDow">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="tm-previewGrid">
                {cells.map((day) => {
                  const iso = toISO(day);
                  const outside = day.getMonth() !== view.getMonth();
                  const inRange =
                    (!calendar.startDate || iso >= calendar.startDate) &&
                    (!calendar.endDate || iso <= calendar.endDate);
                  const available = inRange && calendar.availability[dayKey(day)].enabled;
                  const isSelected = iso === selected;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!available || outside}
                      className={`tm-previewDay${outside ? ' is-outside' : ''}${isSelected ? ' is-selected' : ''}${available && !outside ? ' is-available' : ''}`}
                      style={
                        isSelected
                          ? { background: accent, borderColor: accent, color: btnText }
                          : available && !outside
                            ? { borderColor: accent, color: accent }
                            : undefined
                      }
                      onClick={() => {
                        setSelected(iso);
                        setPickedSlot(null);
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tm-previewSlots">
              <div className="tm-previewPaneHead">
                <h4 className="tm-previewSlotDay">{selectedLabel}</h4>
                <p className="tm-previewTz">Available times</p>
              </div>
              <div className="tm-slotList">
                {slots.length === 0 ? (
                  <p className="tm-previewEmpty">No slots available for this day.</p>
                ) : (
                  slots.map((t) => {
                    const on = pickedSlot === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`tm-slotBtn${on ? ' is-selected' : ''}`}
                        style={
                          on
                            ? { background: accent, borderColor: accent, color: btnText }
                            : { borderColor: accent, color: text }
                        }
                        onClick={() => setPickedSlot(t)}
                      >
                        {formatTimeLabel(t)}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {(visibleStandards.length > 0 || visibleCustom.length > 0) && (
            <section className="tm-previewFormFields" aria-label="Booking details">
              <h4 className="tm-previewFormTitle">Your details</h4>
              <div className="tm-previewFieldGrid">
                {visibleStandards.map((f) => (
                  <div key={f.key} className="ui-field">
                    <label className="ui-label" htmlFor={`tm-prev-${f.key}`}>
                      {f.label}
                      {calendar.standardFields[f.key] === 'required' ? (
                        <span className="req"> *</span>
                      ) : null}
                    </label>
                    <input
                      id={`tm-prev-${f.key}`}
                      className="ui-input"
                      type={f.type}
                      placeholder={f.label}
                      readOnly
                    />
                  </div>
                ))}
                {visibleCustom.map((f) => {
                  const vis =
                    f.visibility ??
                    ((f as { mandatory?: boolean }).mandatory ? 'required' : 'optional');
                  return (
                    <div key={f.id} className="ui-field">
                      <label className="ui-label" htmlFor={`tm-prev-${f.id}`}>
                        {f.name}
                        {vis === 'required' ? <span className="req"> *</span> : null}
                      </label>
                      {f.type === 'Yes/No Checkbox' ? (
                        <label className="tm-checkRow">
                          <input id={`tm-prev-${f.id}`} type="checkbox" disabled />
                          Yes
                        </label>
                      ) : (
                        <input
                          id={`tm-prev-${f.id}`}
                          className="ui-input"
                          type={f.type === 'Number' ? 'number' : f.type === 'Date' ? 'date' : 'text'}
                          placeholder={f.name}
                          readOnly
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="tm-previewCta">
            <button
              type="button"
              className="ui-btn ui-btn-primary tm-previewBookBtn"
              style={{ background: accent, borderColor: accent, color: btnText }}
            >
              Book appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import { getAllTimezones } from '@/lib/timezones';
import styles from './SettingsSchoolDetailsSection.module.css';

type SchoolData = {
  displayName: string;
  timezone: string;
  logoUrl: string | null;
  country: string;
  bankDetails: string;
  email: string;
  contactNumber: string;
  capacity: string;
  workingDays: string[];
  sessionStart: string;
  sessionEnd: string;
  timingStart: string;
  timingEnd: string;
  facebook: string;
  instagram: string;
  website: string;
  address: string;
  googleMap: string;
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

const ALL_TIMEZONES_SEED = getAllTimezones();

const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Singapore',
  'Australia',
  'Canada',
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SEED: SchoolData = {
  displayName: 'Hams Kids Home | Daycare',
  timezone: 'Asia/Kolkata',
  logoUrl: null,
  country: '',
  bankDetails: '',
  email: '',
  contactNumber: '',
  capacity: '',
  workingDays: [],
  sessionStart: '2026-01-01',
  sessionEnd: '2027-01-01',
  timingStart: '',
  timingEnd: '',
  facebook: '',
  instagram: '',
  website: '',
  address: '',
  googleMap: '',
};

function formatDisplayDate(iso: string) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatSessionRange(start: string, end: string) {
  const a = formatDisplayDate(start);
  const b = formatDisplayDate(end);
  if (!a && !b) return '';
  return `${a} - ${b}`;
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DefaultLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 40 40" aria-hidden>
      <path d="M20 4 L34 14 L28 32 L12 32 L6 14 Z" fill="none" stroke="#5B8DEF" strokeWidth="2.2" />
      <path d="M20 10 L28 16 L20 28 L12 16 Z" fill="none" stroke="#1F2937" strokeWidth="1.8" />
    </svg>
  );
}

export function SettingsSchoolDetailsSection() {
  const [data, setData] = useState<SchoolData>(SEED);
  const [infoOpen, setInfoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [infoForm, setInfoForm] = useState({ displayName: '', timezone: '' });
  const [tzOpen, setTzOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');
  const [tzMenuBox, setTzMenuBox] = useState({ top: 0, left: 0, width: 280 });
  const [allTimezones, setAllTimezones] = useState<string[]>(ALL_TIMEZONES_SEED);
  const tzSearchRef = useRef<HTMLInputElement | null>(null);
  const [detailsForm, setDetailsForm] = useState<Omit<SchoolData, 'displayName' | 'timezone' | 'logoUrl'>>({
    country: '',
    bankDetails: '',
    email: '',
    contactNumber: '',
    capacity: '',
    workingDays: [],
    sessionStart: '',
    sessionEnd: '',
    timingStart: '',
    timingEnd: '',
    facebook: '',
    instagram: '',
    website: '',
    address: '',
    googleMap: '',
  });
  const [daysOpen, setDaysOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const daysRef = useRef<HTMLDivElement | null>(null);
  const tzTriggerRef = useRef<HTMLButtonElement | null>(null);
  const tzMenuRef = useRef<HTMLDivElement | null>(null);

  const timezoneOptions = useMemo(() => {
    const list = [...allTimezones];
    if (infoForm.timezone && !list.includes(infoForm.timezone)) {
      list.unshift(infoForm.timezone);
    }
    const q = tzQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((tz) => tz.toLowerCase().includes(q));
  }, [allTimezones, infoForm.timezone, tzQuery]);

  useEffect(() => {
    setAllTimezones(getAllTimezones());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!tzOpen || !tzTriggerRef.current) return;
    const place = () => {
      const r = tzTriggerRef.current!.getBoundingClientRect();
      const menuH = 280;
      const spaceBelow = window.innerHeight - r.bottom - 12;
      const openUp = spaceBelow < menuH && r.top > spaceBelow;
      setTzMenuBox({
        top: openUp ? Math.max(8, r.top - menuH - 4) : r.bottom + 4,
        left: r.left,
        width: Math.max(r.width, 260),
      });
    };
    place();
    window.addEventListener('resize', place);
    // Capture scroll from modal body so menu stays aligned
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [tzOpen]);

  // Force wheel scroll on the portaled list (modal overflow can't steal it).
  useEffect(() => {
    if (!tzOpen || !tzMenuRef.current) return;
    const el = tzMenuRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [tzOpen, timezoneOptions.length]);

  useEffect(() => {
    if (!tzOpen) return;
    const t = window.setTimeout(() => tzSearchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [tzOpen]);

  useEffect(() => {
    if (!tzOpen || !tzMenuRef.current) return;
    const selected = tzMenuRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [tzOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (daysRef.current && !daysRef.current.contains(e.target as Node)) setDaysOpen(false);
      const t = e.target as Node;
      if (
        tzOpen &&
        tzTriggerRef.current &&
        !tzTriggerRef.current.contains(t) &&
        tzMenuRef.current &&
        !tzMenuRef.current.contains(t)
      ) {
        setTzOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [tzOpen]);

  const openInfo = () => {
    setInfoForm({ displayName: data.displayName, timezone: data.timezone });
    setTzQuery('');
    setTzOpen(false);
    setInfoOpen(true);
  };

  const saveInfo = () => {
    if (!infoForm.displayName.trim()) {
      setToast({ type: 'err', message: 'School name is required' });
      return;
    }
    setData((d) => ({
      ...d,
      displayName: infoForm.displayName.trim(),
      timezone: infoForm.timezone,
    }));
    setInfoOpen(false);
    setTzOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openDetails = () => {
    setDetailsForm({
      country: data.country,
      bankDetails: data.bankDetails,
      email: data.email,
      contactNumber: data.contactNumber,
      capacity: data.capacity,
      workingDays: [...data.workingDays],
      sessionStart: data.sessionStart,
      sessionEnd: data.sessionEnd,
      timingStart: data.timingStart,
      timingEnd: data.timingEnd,
      facebook: data.facebook,
      instagram: data.instagram,
      website: data.website,
      address: data.address,
      googleMap: data.googleMap,
    });
    setDaysOpen(false);
    setDetailsOpen(true);
  };

  const saveDetails = () => {
    setData((d) => ({ ...d, ...detailsForm }));
    setDetailsOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const onLogoPick = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'err', message: 'Please upload an image file' });
      return;
    }
    const url = URL.createObjectURL(file);
    setData((d) => {
      if (d.logoUrl) URL.revokeObjectURL(d.logoUrl);
      return { ...d, logoUrl: url };
    });
    setToast({ type: 'ok', message: 'Saved' });
  };

  const toggleDay = (day: string) => {
    setDetailsForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  const workingDaysLabel = data.workingDays.length ? data.workingDays.join(', ') : '';
  const timingsLabel =
    data.timingStart || data.timingEnd
      ? `${data.timingStart || '—'} – ${data.timingEnd || '—'}`
      : '';

  return (
    <SettingsSectionShell
      title="School Details"
      description="Manage center profile, address, contact, and branding."
      icon={<Building2 />}
    >
    <div className={styles.root}>
      <section className={styles.card}>
        <button
          type="button"
          className={styles.logoBtn}
          onClick={() => logoInputRef.current?.click()}
        >
          <span className={styles.logoPreview}>
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="School logo" className={styles.logoImg} />
            ) : (
              <DefaultLogo />
            )}
          </span>
          <span className={styles.logoHint}>Click to upload school logo</span>
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenFile}
          onChange={(e) => onLogoPick(e.target.files?.[0] ?? null)}
        />

        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>School Info</h2>
          <button type="button" className={styles.editBtn} aria-label="Edit school info" onClick={openInfo}>
            <PencilIcon />
          </button>
        </div>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>School Display Name :</span>
          <span className={styles.fieldValue}>{data.displayName}</span>
        </div>

        <h3 className={styles.subTitle}>Timezone</h3>
        <div className={styles.fieldValueSolo}>{data.timezone}</div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>School Address</h2>
          <button
            type="button"
            className={styles.editBtn}
            aria-label="Edit school address and details"
            onClick={openDetails}
          >
            <PencilIcon />
          </button>
        </div>
        {data.address ? <p className={styles.addressText}>{data.address}</p> : null}

        <h3 className={styles.subTitle}>Country</h3>
        <div className={styles.fieldValueSolo}>{data.country || ''}</div>

        <h2 className={styles.sectionTitle}>Bank Account Details</h2>
        {data.bankDetails ? <p className={styles.addressText}>{data.bankDetails}</p> : null}

        <h2 className={styles.sectionTitle}>Contact Details</h2>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>Email :</span>
          <span className={styles.fieldValue}>{data.email}</span>
        </div>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>Contact Number :</span>
          <span className={styles.fieldValue}>{data.contactNumber}</span>
        </div>

        <h2 className={styles.sectionTitle}>School Details</h2>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>School Capacity :</span>
          <span className={styles.fieldValue}>{data.capacity}</span>
        </div>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>Working Days :</span>
          <span className={styles.fieldValue}>{workingDaysLabel}</span>
        </div>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>Session Year :</span>
          <span className={styles.fieldValue}>
            {formatSessionRange(data.sessionStart, data.sessionEnd)}
          </span>
        </div>
        <div className={styles.fieldLine}>
          <span className={styles.fieldLabel}>School Timings :</span>
          <span className={styles.fieldValue}>{timingsLabel}</span>
        </div>

        <h2 className={styles.sectionTitle}>School Social Channels</h2>
        <div className={styles.socialRow}>
          <a
            className={`${styles.socialIcon} ${styles.socialFb} ${!data.facebook ? styles.socialMuted : ''}`}
            href={data.facebook || undefined}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            onClick={(e) => {
              if (!data.facebook) e.preventDefault();
            }}
          >
            f
          </a>
          <a
            className={`${styles.socialIcon} ${styles.socialWeb} ${!data.website ? styles.socialMuted : ''}`}
            href={data.website || undefined}
            target="_blank"
            rel="noreferrer"
            aria-label="Website"
            onClick={(e) => {
              if (!data.website) e.preventDefault();
            }}
          >
            🌐
          </a>
          <a
            className={`${styles.socialIcon} ${styles.socialIg} ${!data.instagram ? styles.socialMuted : ''}`}
            href={data.instagram || undefined}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            onClick={(e) => {
              if (!data.instagram) e.preventDefault();
            }}
          >
            ✦
          </a>
        </div>
      </section>

      <Modal
        open={infoOpen}
        title="User Info"
        onClose={() => {
          setTzOpen(false);
          setInfoOpen(false);
        }}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setTzOpen(false);
                setInfoOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveInfo}>
              Submit
            </button>
          </>
        }
      >
        <div className={styles.modalStack}>
          <div className="ui-field">
            <label className="ui-label" htmlFor="school-name">
              School Name
            </label>
            <input
              id="school-name"
              className="ui-input"
              value={infoForm.displayName}
              onChange={(e) => setInfoForm((f) => ({ ...f, displayName: e.target.value }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label" id="school-tz-label">
              Timezone
            </label>
            <button
              type="button"
              id="school-tz"
              ref={tzTriggerRef}
              className={styles.tzTrigger}
              aria-labelledby="school-tz-label"
              aria-haspopup="listbox"
              aria-expanded={tzOpen}
              onClick={() => {
                setTzQuery('');
                setTzOpen((v) => !v);
              }}
            >
              <span>{infoForm.timezone || 'Select timezone'}</span>
              <span className={styles.tzSearchIcon} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {tzOpen &&
              typeof document !== 'undefined' &&
              createPortal(
                <div
                  className={styles.tzMenuPortal}
                  style={{
                    top: tzMenuBox.top,
                    left: tzMenuBox.left,
                    width: tzMenuBox.width,
                  }}
                >
                  <div className={styles.tzSearchWrap}>
                    <input
                      ref={tzSearchRef}
                      className={`ui-input ${styles.tzSearchInput}`}
                      type="search"
                      placeholder="Search timezone…"
                      value={tzQuery}
                      aria-label="Search timezone"
                      onChange={(e) => setTzQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setTzOpen(false);
                      }}
                    />
                  </div>
                  <div ref={tzMenuRef} className={styles.tzMenuList} role="listbox" aria-labelledby="school-tz-label">
                    {timezoneOptions.length === 0 ? (
                      <div className={styles.tzEmpty}>No matching timezone</div>
                    ) : (
                      timezoneOptions.map((tz) => {
                        const selected = tz === infoForm.timezone;
                        return (
                          <button
                            key={tz}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`${styles.tzOption} ${selected ? styles.tzOptionActive : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setInfoForm((f) => ({ ...f, timezone: tz }));
                              setTzQuery('');
                              setTzOpen(false);
                            }}
                          >
                            {tz}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </div>
      </Modal>

      <Modal
        open={detailsOpen}
        title="School Details"
        wide
        onClose={() => setDetailsOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDetailsOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveDetails}>
              Submit
            </button>
          </>
        }
      >
        <div className={styles.detailsForm}>
          <div className="ui-field">
            <label className={`ui-label ${styles.tealLabel}`} htmlFor="bank-details">
              Bank Account Details
            </label>
            <textarea
              id="bank-details"
              className="ui-textarea"
              rows={3}
              placeholder="Bank account..."
              value={detailsForm.bankDetails}
              onChange={(e) => setDetailsForm((f) => ({ ...f, bankDetails: e.target.value }))}
            />
          </div>

          <div className={styles.grid2}>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="contact-number">
                Contact Number
              </label>
              <input
                id="contact-number"
                className="ui-input"
                placeholder="Contact ..."
                value={detailsForm.contactNumber}
                onChange={(e) => setDetailsForm((f) => ({ ...f, contactNumber: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="school-email">
                Email
              </label>
              <input
                id="school-email"
                className="ui-input"
                type="email"
                placeholder="Email..."
                value={detailsForm.email}
                onChange={(e) => setDetailsForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="capacity">
                School Capacity
              </label>
              <input
                id="capacity"
                className="ui-input"
                placeholder="School Capacity"
                value={detailsForm.capacity}
                onChange={(e) => setDetailsForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="country">
                Country
              </label>
              <select
                id="country"
                className="ui-select"
                value={detailsForm.country}
                onChange={(e) => setDetailsForm((f) => ({ ...f, country: e.target.value }))}
              >
                <option value="">Please select a country.</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="ui-field">
              <div className={`ui-label ${styles.tealLabel}`}>Working Days</div>
              <div className={styles.multiSelect} ref={daysRef}>
                <button
                  type="button"
                  className={styles.multiTrigger}
                  aria-expanded={daysOpen}
                  onClick={() => setDaysOpen((v) => !v)}
                >
                  {detailsForm.workingDays.length === 0 ? (
                    <span className={styles.placeholder}>Select Days</span>
                  ) : (
                    detailsForm.workingDays.join(', ')
                  )}
                </button>
                {daysOpen ? (
                  <div className={styles.multiMenu} role="listbox">
                    {WEEK_DAYS.map((day) => {
                      const on = detailsForm.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          role="option"
                          aria-selected={on}
                          className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                          {on ? ' ✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="ui-field">
              <div className={`ui-label ${styles.tealLabel}`}>School Timings</div>
              <div className={styles.timingRow}>
                <input
                  className="ui-input"
                  type="time"
                  value={detailsForm.timingStart}
                  onChange={(e) => setDetailsForm((f) => ({ ...f, timingStart: e.target.value }))}
                  aria-label="School start time"
                />
                <input
                  className="ui-input"
                  type="time"
                  value={detailsForm.timingEnd}
                  onChange={(e) => setDetailsForm((f) => ({ ...f, timingEnd: e.target.value }))}
                  aria-label="School end time"
                />
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="facebook">
                Facebook Page Link
              </label>
              <input
                id="facebook"
                className="ui-input"
                placeholder="Full url including https://"
                value={detailsForm.facebook}
                onChange={(e) => setDetailsForm((f) => ({ ...f, facebook: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="instagram">
                Instagram Link
              </label>
              <input
                id="instagram"
                className="ui-input"
                placeholder="Full url including https://"
                value={detailsForm.instagram}
                onChange={(e) => setDetailsForm((f) => ({ ...f, instagram: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.gridHalf}>
            <div className="ui-field">
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="website">
                Website Link
              </label>
              <input
                id="website"
                className="ui-input"
                placeholder="Full url including https://"
                value={detailsForm.website}
                onChange={(e) => setDetailsForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.gridHalf}>
            <div className="ui-field">
              <div className={`ui-label ${styles.tealLabel}`}>Session Year</div>
              <div className={styles.timingRow}>
                <input
                  className="ui-input"
                  type="date"
                  value={detailsForm.sessionStart}
                  onChange={(e) => setDetailsForm((f) => ({ ...f, sessionStart: e.target.value }))}
                  aria-label="Session start date"
                />
                <input
                  className="ui-input"
                  type="date"
                  value={detailsForm.sessionEnd}
                  onChange={(e) => setDetailsForm((f) => ({ ...f, sessionEnd: e.target.value }))}
                  aria-label="Session end date"
                />
              </div>
            </div>
          </div>

          <div className="ui-field">
            <label className={`ui-label ${styles.tealLabel}`} htmlFor="address">
              School Address
            </label>
            <textarea
              id="address"
              className="ui-textarea"
              rows={3}
              placeholder="School address..."
              value={detailsForm.address}
              onChange={(e) => setDetailsForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>

          <div className="ui-field">
            <div className={styles.mapLabelRow}>
              <label className={`ui-label ${styles.tealLabel}`} htmlFor="gmap">
                Google Map link
              </label>
              <button
                type="button"
                className={styles.mapLink}
                onClick={() =>
                  window.open(
                    detailsForm.googleMap || 'https://maps.google.com',
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                Select on map
              </button>
            </div>
            <input
              id="gmap"
              className="ui-input"
              placeholder="Full url including https://"
              value={detailsForm.googleMap}
              onChange={(e) => setDetailsForm((f) => ({ ...f, googleMap: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '×'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}

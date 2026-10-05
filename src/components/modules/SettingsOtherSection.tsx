'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsOtherSection.module.css';

type ToastState = { type: 'ok' | 'err'; message: string } | null;

type ToggleKey =
  | 'genderNeutral'
  | 'disableBus'
  | 'disableCctv'
  | 'disableLiveStreamAbsent'
  | 'disableLeaves'
  | 'disableConcern'
  | 'disableNotes'
  | 'disableMessaging'
  | 'disableParentPickup'
  | 'disableParentProfile'
  | 'disableCalendarComments'
  | 'disableBirthdayEmail'
  | 'disablePrivateMessaging'
  | 'disableCcBirthday'
  | 'hebrewCalendar'
  | 'showTeacherName'
  | 'showLastName'
  | 'restrictParentComments'
  | 'allowPaymentForms';

const TOGGLE_DEFS: { key: ToggleKey; label: string; nested?: boolean }[] = [
  { key: 'genderNeutral', label: 'Use Gender-Neutral Labels' },
  { key: 'disableBus', label: 'Disable bus tracking' },
  { key: 'disableCctv', label: 'Disable CCTV' },
  {
    key: 'disableLiveStreamAbsent',
    label: 'Disable live streaming when the child is absent from the school',
  },
  { key: 'disableLeaves', label: 'Disable Leaves' },
  { key: 'disableConcern', label: 'Disable Concern' },
  { key: 'disableNotes', label: 'Disable Notes' },
  { key: 'disableMessaging', label: 'Disable messaging' },
  { key: 'disableParentPickup', label: 'Disable parent to update the authorized pickup' },
  { key: 'disableParentProfile', label: 'Disable parent to update the profile details' },
  { key: 'disableCalendarComments', label: 'Disable comments on calendar events' },
  { key: 'disableBirthdayEmail', label: 'Disable birthday email' },
  { key: 'disablePrivateMessaging', label: 'Disable private messaging' },
  { key: 'disableCcBirthday', label: 'Disable CC admin email for birthdays' },
  { key: 'hebrewCalendar', label: 'Enable Hebrew calendar format' },
  { key: 'showTeacherName', label: 'Show teacher name to parents in school messaging' },
  { key: 'showLastName', label: 'Show last name', nested: true },
  {
    key: 'restrictParentComments',
    label: "Restrict parents from viewing other parents' comments",
  },
  { key: 'allowPaymentForms', label: 'Allow payment in forms' },
];

const DEFAULT_TOGGLES: Record<ToggleKey, boolean> = {
  genderNeutral: false,
  disableBus: false,
  disableCctv: false,
  disableLiveStreamAbsent: true,
  disableLeaves: false,
  disableConcern: false,
  disableNotes: false,
  disableMessaging: false,
  disableParentPickup: false,
  disableParentProfile: false,
  disableCalendarComments: false,
  disableBirthdayEmail: false,
  disablePrivateMessaging: false,
  disableCcBirthday: false,
  hebrewCalendar: false,
  showTeacherName: true,
  showLastName: false,
  restrictParentComments: true,
  allowPaymentForms: false,
};

const DATE_FORMATS = [
  '31/07/2026',
  '07/31/2026',
  '31/07/26',
  'July 31, 2026',
  '31 Jul 2026',
  '31 July 2026',
];

const SCHOOL_LANGUAGES = [
  'English',
  'Hindi',
  'Arabic',
  'French',
  'Spanish',
  'German',
  'Mandarin',
  'Tamil',
  'Malayalam',
];

const ROLE_OPTIONS = [
  'Finance Admin',
  'Administrator',
  'Principal',
  'Super Admin',
  'Center Head',
  'Teacher',
  'Senior Teacher',
  'Head Teacher',
];

function CircleCheck({
  id,
  label,
  checked,
  nested,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  nested?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className={`${styles.checkRow} ${nested ? styles.checkNested : ''}`} htmlFor={id}>
      <input
        id={id}
        className={styles.checkInput}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.circle} ${checked ? styles.circleOn : ''}`} aria-hidden>
        {checked ? (
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
      <span className={styles.checkLabel}>{label}</span>
    </label>
  );
}

function MultiSelect({
  label,
  placeholder,
  values,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  options: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (name: string) => {
    onChange(values.includes(name) ? values.filter((v) => v !== name) : [...values, name]);
  };

  return (
    <div className={styles.field} ref={ref}>
      <label className={styles.fieldLabel}>{label}</label>
      <button
        type="button"
        className={styles.multiTrigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {values.length === 0 ? (
          <span className={styles.placeholder}>{placeholder}</span>
        ) : (
          <span className={styles.chipWrap}>
            {values.map((v) => (
              <span key={v} className={styles.chip}>
                {v}
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.chipRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(v);
                    }
                  }}
                >
                  ×
                </span>
              </span>
            ))}
          </span>
        )}
        <span className={styles.chevron} aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className={styles.multiMenu} role="listbox">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.multiOption} ${values.includes(opt) ? styles.multiOptionOn : ''}`}
              onClick={() => toggle(opt)}
            >
              {opt}
              {values.includes(opt) ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
          <div className={styles.multiSearch}>
            <input
              className="ui-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${label}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className={styles.field} ref={ref}>
      <label className={styles.fieldLabel}>{label}</label>
      <button
        type="button"
        className={styles.selectTrigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={value ? undefined : styles.placeholder}>{value || placeholder}</span>
        <span className={styles.chevron} aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className={styles.multiMenu} role="listbox">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.multiOption} ${value === opt ? styles.multiOptionOn : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
                setQuery('');
              }}
            >
              {opt}
            </button>
          ))}
          <div className={styles.multiSearch}>
            <input
              className="ui-input"
              placeholder={`Search ${placeholder.toLowerCase()}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${label}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SettingsOtherSection() {
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [admissionPrefix, setAdmissionPrefix] = useState('');
  const [admissionCounter, setAdmissionCounter] = useState('2');
  const [employeePrefix, setEmployeePrefix] = useState('EMP-');
  const [relationshipTypes, setRelationshipTypes] = useState('');
  const [pickupRelationships, setPickupRelationships] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [schoolLanguage, setSchoolLanguage] = useState('');
  const [escalationRoles, setEscalationRoles] = useState<string[]>([]);
  const [visibilityRoles, setVisibilityRoles] = useState<string[]>([]);
  const [noteTypes, setNoteTypes] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const setToggle = (key: ToggleKey, next: boolean) => {
    setToggles((prev) => {
      const updated = { ...prev, [key]: next };
      if (key === 'showTeacherName' && !next) updated.showLastName = false;
      return updated;
    });
  };

  const save = () => {
    setToast({ type: 'ok', message: 'Settings saved' });
  };

  return (
    <SettingsSectionShell
      title="Other Settings"
      description="Admission counters, prefixes, and miscellaneous center preferences."
      icon={<Settings2 />}
    >
    <div className={styles.root}>
      <section className={styles.card}>
        <div className={styles.toggleList}>
          {TOGGLE_DEFS.map((item) => {
            if (item.key === 'showLastName' && !toggles.showTeacherName) return null;
            return (
              <CircleCheck
                key={item.key}
                id={`other-${item.key}`}
                label={item.label}
                nested={item.nested}
                checked={toggles[item.key]}
                onChange={(next) => setToggle(item.key, next)}
              />
            );
          })}
        </div>

        <div className={styles.formStack}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-admission-prefix">
              Admission Number Prefix
            </label>
            <input
              id="other-admission-prefix"
              className="ui-input"
              value={admissionPrefix}
              onChange={(e) => setAdmissionPrefix(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-admission-counter">
              Admission Number Counter
            </label>
            <input
              id="other-admission-counter"
              className="ui-input"
              value={admissionCounter}
              onChange={(e) => setAdmissionCounter(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-employee-prefix">
              Employee Code Prefix
            </label>
            <input
              id="other-employee-prefix"
              className="ui-input"
              value={employeePrefix}
              onChange={(e) => setEmployeePrefix(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-relationship-types">
              Relationship types
            </label>
            <input
              id="other-relationship-types"
              className="ui-input"
              value={relationshipTypes}
              onChange={(e) => setRelationshipTypes(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-pickup-relationships">
              Authorized Pickup &amp; Emergency Contact Relationship Types
            </label>
            <input
              id="other-pickup-relationships"
              className="ui-input"
              placeholder="Mother, Father, Parent, Guardian, ..."
              value={pickupRelationships}
              onChange={(e) => setPickupRelationships(e.target.value)}
            />
          </div>

          <SearchSelect
            label="Date format"
            placeholder="Date format"
            value={dateFormat}
            options={DATE_FORMATS}
            onChange={setDateFormat}
          />

          <SearchSelect
            label="School Language"
            placeholder="School language"
            value={schoolLanguage}
            options={SCHOOL_LANGUAGES}
            onChange={setSchoolLanguage}
          />

          <MultiSelect
            label="Concern Escalation Roles"
            placeholder="Comma separated Staff, Principal..."
            values={escalationRoles}
            options={ROLE_OPTIONS}
            onChange={setEscalationRoles}
          />

          <MultiSelect
            label="Concern Visibility Roles"
            placeholder="Comma separated Staff, Principal..."
            values={visibilityRoles}
            options={ROLE_OPTIONS}
            onChange={setVisibilityRoles}
          />

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="other-note-types">
              Note Types
            </label>
            <input
              id="other-note-types"
              className="ui-input"
              placeholder="Comma separated Food, Medicine"
              value={noteTypes}
              onChange={(e) => setNoteTypes(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.saveRow}>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.saveBtn}`} onClick={save}>
            SAVE
          </button>
        </div>
      </section>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '!'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import '@/components/ui/module.css';
import styles from './SettingsAttendanceSection.module.css';

type TempUnit = 'celsius' | 'fahrenheit';

type PlatformSettings = {
  leaveTypes: string[];
  tempUnit: TempUnit;
  lateThreshold: string;
  kioskPasswordEnabled: boolean;
  kioskCode: [string, string, string, string];
  allowPinManage: boolean;
  disableKioskTime: boolean;
  geoEnabled: boolean;
  latitude: string;
  longitude: string;
  locationThreshold: string;
};

type AccessControl = {
  disableStudentParentNotify: boolean;
  autoSendDailyReport: boolean;
  studentSignature: boolean;
  studentCheckInTemp: boolean;
  studentCheckOutTemp: boolean;
  programBasedAttendance: boolean;
  autoStudentCheckout: boolean;
  disableStaffLateMark: boolean;
  staffSignature: boolean;
  autoStaffCheckout: boolean;
  disablePhoto: boolean;
  disableRoomChange: boolean;
  displayAllRooms: boolean;
  overrideAttendanceTime: boolean;
  bluetoothThermometer: boolean;
  autoUpdateAbsent: boolean;
  hideTemperature: boolean;
};

type FormSettings = {
  studentCheckInForm: boolean;
  studentCheckOutForm: boolean;
  staffCheckInForm: boolean;
  staffCheckOutForm: boolean;
  formRooms: string[];
};

function roomNames() {
  return loadActiveCenterRooms().map((room) => room.name);
}

const DEFAULT_PLATFORM: PlatformSettings = {
  leaveTypes: ['Fever', 'Sick Leave', 'Cougf', 'cold'],
  tempUnit: 'celsius',
  lateThreshold: '9',
  kioskPasswordEnabled: true,
  kioskCode: ['0', '0', '0', '0'],
  allowPinManage: true,
  disableKioskTime: true,
  geoEnabled: true,
  latitude: '12.986843',
  longitude: '77.666988',
  locationThreshold: '0',
};

const DEFAULT_ACCESS: AccessControl = {
  disableStudentParentNotify: true,
  autoSendDailyReport: true,
  studentSignature: false,
  studentCheckInTemp: true,
  studentCheckOutTemp: false,
  programBasedAttendance: false,
  autoStudentCheckout: false,
  disableStaffLateMark: true,
  staffSignature: true,
  autoStaffCheckout: false,
  disablePhoto: true,
  disableRoomChange: true,
  displayAllRooms: true,
  overrideAttendanceTime: false,
  bluetoothThermometer: false,
  autoUpdateAbsent: false,
  hideTemperature: false,
};

const DEFAULT_FORM: FormSettings = {
  studentCheckInForm: true,
  studentCheckOutForm: true,
  staffCheckInForm: false,
  staffCheckOutForm: false,
  formRooms: [],
};

function clonePlatform(s: PlatformSettings): PlatformSettings {
  return { ...s, leaveTypes: [...s.leaveTypes], kioskCode: [...s.kioskCode] as PlatformSettings['kioskCode'] };
}

function cloneAccess(s: AccessControl): AccessControl {
  return { ...s };
}

function cloneForm(s: FormSettings): FormSettings {
  return { ...s, formRooms: [...s.formRooms] };
}

function Toggle({
  on,
  onChange,
  label,
  id,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <button
        id={id}
        type="button"
        className={`${styles.switch} ${on ? styles.switchOn : ''}`}
        aria-pressed={on}
        aria-label={label}
        onClick={() => onChange(!on)}
      />
      <label className={styles.toggleText} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

export function SettingsAttendanceSection() {
  const [platform, setPlatform] = useState<PlatformSettings>(() => clonePlatform(DEFAULT_PLATFORM));
  const [baselinePlatform, setBaselinePlatform] = useState<PlatformSettings>(() => clonePlatform(DEFAULT_PLATFORM));
  const [access, setAccess] = useState<AccessControl>(() => cloneAccess(DEFAULT_ACCESS));
  const [baselineAccess, setBaselineAccess] = useState<AccessControl>(() => cloneAccess(DEFAULT_ACCESS));
  const [form, setForm] = useState<FormSettings>(() => cloneForm(DEFAULT_FORM));
  const [baselineForm, setBaselineForm] = useState<FormSettings>(() => cloneForm(DEFAULT_FORM));

  const [leaveDraft, setLeaveDraft] = useState('');
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomQuery, setRoomQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);
  const roomWrapRef = useRef<HTMLDivElement | null>(null);

  const dirty = useMemo(() => {
    return (
      JSON.stringify(platform) !== JSON.stringify(baselinePlatform) ||
      JSON.stringify(access) !== JSON.stringify(baselineAccess) ||
      JSON.stringify(form) !== JSON.stringify(baselineForm)
    );
  }, [platform, baselinePlatform, access, baselineAccess, form, baselineForm]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!roomOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!roomWrapRef.current?.contains(e.target as Node)) setRoomOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [roomOpen]);

  const addLeaveType = () => {
    const value = leaveDraft.trim();
    if (!value) return;
    if (platform.leaveTypes.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setLeaveDraft('');
      return;
    }
    setPlatform((p) => ({ ...p, leaveTypes: [...p.leaveTypes, value] }));
    setLeaveDraft('');
  };

  const removeLeaveType = (tag: string) => {
    setPlatform((p) => ({ ...p, leaveTypes: p.leaveTypes.filter((t) => t !== tag) }));
  };

  const setPinDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setPlatform((p) => {
      const next = [...p.kioskCode] as PlatformSettings['kioskCode'];
      next[index] = digit;
      return { ...p, kioskCode: next };
    });
    if (digit && index < 3) pinRefs.current[index + 1]?.focus();
  };

  const onPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !platform.kioskCode[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const setLocation = () => {
    setPlatform((p) => ({
      ...p,
      latitude: '12.986843',
      longitude: '77.666988',
      geoEnabled: true,
    }));
    setToast('Location set from current position');
  };

  const toggleRoom = (room: string) => {
    setForm((f) => {
      const has = f.formRooms.includes(room);
      return {
        ...f,
        formRooms: has ? f.formRooms.filter((r) => r !== room) : [...f.formRooms, room],
      };
    });
  };

  const filteredRooms = useMemo(() => {
    const q = roomQuery.trim().toLowerCase();
    const rooms = roomNames();
    if (!q) return rooms;
    return rooms.filter((r) => r.toLowerCase().includes(q));
  }, [roomQuery]);

  const onCancel = () => {
    if (!dirty) return;
    setPlatform(clonePlatform(baselinePlatform));
    setAccess(cloneAccess(baselineAccess));
    setForm(cloneForm(baselineForm));
    setLeaveDraft('');
    setRoomQuery('');
  };

  const onSave = () => {
    if (!dirty) return;
    setBaselinePlatform(clonePlatform(platform));
    setBaselineAccess(cloneAccess(access));
    setBaselineForm(cloneForm(form));
    setToast('Attendance settings saved');
  };

  return (
    <SettingsSectionShell
      title="Attendance"
      description="Configure attendance preferences, leave types, and room access."
      icon={<CalendarCheck />}
    >
    <div className={styles.root}>
      <div className={styles.cardsRow}>
        {/* General Settings */}
        <section className={styles.card} aria-labelledby="att-general-title">
          <h2 id="att-general-title" className={styles.cardTitle}>
            General Settings
          </h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="leave-type-input">
              Student Leave Type
            </label>
            <div className={styles.addRow}>
              <input
                id="leave-type-input"
                className="ui-input"
                placeholder="Add Value"
                value={leaveDraft}
                onChange={(e) => setLeaveDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLeaveType();
                  }
                }}
              />
              <button type="button" className="ui-btn ui-btn-primary" onClick={addLeaveType}>
                Add
              </button>
            </div>
            {platform.leaveTypes.length > 0 ? (
              <div className={styles.tagList}>
                {platform.leaveTypes.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeLeaveType(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="temp-unit">
              Default Temperature Unit
            </label>
            <select
              id="temp-unit"
              className="ui-select"
              value={platform.tempUnit}
              onChange={(e) =>
                setPlatform((p) => ({ ...p, tempUnit: e.target.value as TempUnit }))
              }
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="late-threshold">
              Late Threshold (in minutes)
            </label>
            <input
              id="late-threshold"
              className="ui-input"
              type="number"
              min={0}
              value={platform.lateThreshold}
              onChange={(e) => setPlatform((p) => ({ ...p, lateThreshold: e.target.value }))}
            />
          </div>
        </section>

        {/* Kiosk Mode */}
        <section className={styles.card} aria-labelledby="att-kiosk-title">
          <h2 id="att-kiosk-title" className={styles.cardTitle}>
            Kiosk Mode
          </h2>

          <div className={styles.toggleBlock}>
            <Toggle
              id="kiosk-password"
              label="Enable Kiosk Password"
              on={platform.kioskPasswordEnabled}
              onChange={(next) => setPlatform((p) => ({ ...p, kioskPasswordEnabled: next }))}
            />
            {platform.kioskPasswordEnabled ? (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Kiosk Code</span>
                <div className={styles.pinRow}>
                  {platform.kioskCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        pinRefs.current[i] = el;
                      }}
                      className={`ui-input ${styles.pinBox}`}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`Kiosk code digit ${i + 1}`}
                      value={digit}
                      onChange={(e) => setPinDigit(i, e.target.value)}
                      onKeyDown={(e) => onPinKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Toggle
            id="kiosk-pin-manage"
            label="Allow Parents, Authorized picks up, & Staff to manage individual Kiosk PINs"
            on={platform.allowPinManage}
            onChange={(next) => setPlatform((p) => ({ ...p, allowPinManage: next }))}
          />

          <Toggle
            id="kiosk-disable-time"
            label="Disable time in kiosk"
            on={platform.disableKioskTime}
            onChange={(next) => setPlatform((p) => ({ ...p, disableKioskTime: next }))}
          />
        </section>

        {/* Geo Fencing */}
        <section className={styles.card} aria-labelledby="att-geo-title">
          <div className={styles.cardTitleRow}>
            <h2 id="att-geo-title" className={styles.cardTitle}>
              Enable Geo Fencing
            </h2>
            <button
              type="button"
              className={`${styles.switch} ${platform.geoEnabled ? styles.switchOn : ''}`}
              aria-pressed={platform.geoEnabled}
              aria-label="Enable Geo Fencing"
              onClick={() => setPlatform((p) => ({ ...p, geoEnabled: !p.geoEnabled }))}
            />
          </div>

          <div className={platform.geoEnabled ? undefined : styles.geoDisabled}>
            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label className={styles.fieldLabel} htmlFor="geo-lat">
                  Latitude
                </label>
                <button type="button" className={styles.linkBtn} onClick={setLocation}>
                  Set location
                </button>
              </div>
              <input
                id="geo-lat"
                className="ui-input"
                value={platform.latitude}
                onChange={(e) => setPlatform((p) => ({ ...p, latitude: e.target.value }))}
                disabled={!platform.geoEnabled}
              />
            </div>

            <div className={styles.field} style={{ marginTop: 16 }}>
              <label className={styles.fieldLabel} htmlFor="geo-lng">
                Longitude
              </label>
              <input
                id="geo-lng"
                className="ui-input"
                value={platform.longitude}
                onChange={(e) => setPlatform((p) => ({ ...p, longitude: e.target.value }))}
                disabled={!platform.geoEnabled}
              />
            </div>

            <div className={styles.field} style={{ marginTop: 16 }}>
              <label className={styles.fieldLabel} htmlFor="geo-threshold">
                Location Threshold (in meters)
              </label>
              <input
                id="geo-threshold"
                className="ui-input"
                type="number"
                min={0}
                value={platform.locationThreshold}
                onChange={(e) => setPlatform((p) => ({ ...p, locationThreshold: e.target.value }))}
                disabled={!platform.geoEnabled}
              />
            </div>
          </div>
        </section>
      </div>

      <h2 className={styles.sectionTitle}>Attendance Access Control</h2>
      <div className={styles.accessGrid}>
        <div className={styles.accessCol}>
          <h3 className={styles.accessColHead}>Student</h3>
          <div className={styles.accessItems}>
            <Toggle
              id="ac-disable-parent-notify"
              label="Disable Student attendance notification for parents"
              on={access.disableStudentParentNotify}
              onChange={(n) => setAccess((a) => ({ ...a, disableStudentParentNotify: n }))}
            />
            <Toggle
              id="ac-auto-report"
              label="Auto-send daily activity report post student check-out"
              on={access.autoSendDailyReport}
              onChange={(n) => setAccess((a) => ({ ...a, autoSendDailyReport: n }))}
            />
            <Toggle
              id="ac-student-sig"
              label="Enable attendance signature for Student"
              on={access.studentSignature}
              onChange={(n) => setAccess((a) => ({ ...a, studentSignature: n }))}
            />
            <Toggle
              id="ac-checkin-temp"
              label="Make Student Check-in temperature mandatory"
              on={access.studentCheckInTemp}
              onChange={(n) => setAccess((a) => ({ ...a, studentCheckInTemp: n }))}
            />
            <Toggle
              id="ac-checkout-temp"
              label="Make Student Check-out temperature mandatory"
              on={access.studentCheckOutTemp}
              onChange={(n) => setAccess((a) => ({ ...a, studentCheckOutTemp: n }))}
            />
            <Toggle
              id="ac-program-based"
              label="Enable Program Based Attendance"
              on={access.programBasedAttendance}
              onChange={(n) => setAccess((a) => ({ ...a, programBasedAttendance: n }))}
            />
            <Toggle
              id="ac-auto-student-out"
              label="Enable automatic student check-out"
              on={access.autoStudentCheckout}
              onChange={(n) => setAccess((a) => ({ ...a, autoStudentCheckout: n }))}
            />
          </div>
        </div>

        <div className={styles.accessCol}>
          <h3 className={styles.accessColHead}>Staff</h3>
          <div className={styles.accessItems}>
            <Toggle
              id="ac-staff-late"
              label="Disable automatic late-marking for staff"
              on={access.disableStaffLateMark}
              onChange={(n) => setAccess((a) => ({ ...a, disableStaffLateMark: n }))}
            />
            <Toggle
              id="ac-staff-sig"
              label="Enable attendance signature for staff"
              on={access.staffSignature}
              onChange={(n) => setAccess((a) => ({ ...a, staffSignature: n }))}
            />
            <Toggle
              id="ac-auto-staff-out"
              label="Enable automatic staff check-out"
              on={access.autoStaffCheckout}
              onChange={(n) => setAccess((a) => ({ ...a, autoStaffCheckout: n }))}
            />
          </div>
        </div>

        <div className={styles.accessCol}>
          <h3 className={styles.accessColHead}>Enable/Disable Access</h3>
          <div className={styles.accessItems}>
            <Toggle
              id="ac-disable-photo"
              label="Disable Photo for attendance"
              on={access.disablePhoto}
              onChange={(n) => setAccess((a) => ({ ...a, disablePhoto: n }))}
            />
            <Toggle
              id="ac-disable-room"
              label="Disable room change"
              on={access.disableRoomChange}
              onChange={(n) => setAccess((a) => ({ ...a, disableRoomChange: n }))}
            />
            <Toggle
              id="ac-display-rooms"
              label="Display all rooms during room movement"
              on={access.displayAllRooms}
              onChange={(n) => setAccess((a) => ({ ...a, displayAllRooms: n }))}
            />
            <Toggle
              id="ac-override-time"
              label="Override selected attendance time with current time"
              on={access.overrideAttendanceTime}
              onChange={(n) => setAccess((a) => ({ ...a, overrideAttendanceTime: n }))}
            />
            <Toggle
              id="ac-bluetooth"
              label="Allow bluetooth thermometer"
              on={access.bluetoothThermometer}
              onChange={(n) => setAccess((a) => ({ ...a, bluetoothThermometer: n }))}
            />
            <Toggle
              id="ac-auto-absent"
              label="Enable automatic update to absent for staff and students who are marked pending or absent"
              on={access.autoUpdateAbsent}
              onChange={(n) => setAccess((a) => ({ ...a, autoUpdateAbsent: n }))}
            />
            <Toggle
              id="ac-hide-temp"
              label="Hide temperature field while taking attendance"
              on={access.hideTemperature}
              onChange={(n) => setAccess((a) => ({ ...a, hideTemperature: n }))}
            />
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Check-in / Check-out Form</h2>
      <section className={styles.formSection}>
        <div className={styles.formGrid}>
          <div>
            <h3 className={styles.formColHead}>Student</h3>
            <div className={styles.formColBody}>
              <Toggle
                id="form-student-in"
                label="Make Student Check-in form mandatory"
                on={form.studentCheckInForm}
                onChange={(n) => setForm((f) => ({ ...f, studentCheckInForm: n }))}
              />
              <Toggle
                id="form-student-out"
                label="Make Student Check-out form mandatory"
                on={form.studentCheckOutForm}
                onChange={(n) => setForm((f) => ({ ...f, studentCheckOutForm: n }))}
              />
            </div>
          </div>
          <div>
            <h3 className={styles.formColHead}>Staff</h3>
            <div className={styles.formColBody}>
              <Toggle
                id="form-staff-in"
                label="Make Staff Check-in form mandatory"
                on={form.staffCheckInForm}
                onChange={(n) => setForm((f) => ({ ...f, staffCheckInForm: n }))}
              />
              <Toggle
                id="form-staff-out"
                label="Make Staff Check-out form mandatory"
                on={form.staffCheckOutForm}
                onChange={(n) => setForm((f) => ({ ...f, staffCheckOutForm: n }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.roomsBlock}>
          <label className={styles.fieldLabel} id="rooms-label">
            Enable form for room(s)
          </label>
          <p className={styles.roomsHelp}>
            Students in selected room(s) will see the check-in/checkout form. Leave empty to enable it for
            all rooms.
          </p>
          <div className={styles.multiSelect} ref={roomWrapRef}>
            <button
              type="button"
              className={styles.multiTrigger}
              aria-labelledby="rooms-label"
              aria-expanded={roomOpen}
              onClick={() => setRoomOpen((v) => !v)}
            >
              {form.formRooms.length === 0 ? (
                <span style={{ color: 'var(--att-muted)', fontSize: '0.875rem' }}>Select rooms</span>
              ) : (
                form.formRooms.map((room) => (
                  <span key={room} className={styles.tag}>
                    {room}
                    <span
                      role="button"
                      tabIndex={0}
                      className={styles.tagRemove}
                      aria-label={`Remove ${room}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRoom(room);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRoom(room);
                        }
                      }}
                    >
                      ×
                    </span>
                  </span>
                ))
              )}
            </button>
            <svg
              className={styles.multiChevron}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden
            >
              <path
                d="M3 5.5 7 9.5 11 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            {roomOpen ? (
              <div className={styles.multiMenu} role="listbox">
                <input
                  className="ui-input"
                  style={{ marginBottom: 6 }}
                  placeholder="Search rooms"
                  value={roomQuery}
                  onChange={(e) => setRoomQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredRooms.length === 0 ? (
                  <div className={styles.multiEmpty}>No rooms found</div>
                ) : (
                  filteredRooms.map((room) => {
                    const on = form.formRooms.includes(room);
                    return (
                      <button
                        key={room}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                        onClick={() => toggleRoom(room)}
                      >
                        {room}
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.footer}>
        {dirty ? <span className={styles.unsaved}>Unsaved changes</span> : null}
        <div className={styles.footerActions}>
          <button
            type="button"
            className={`ui-btn ui-btn-outline ${styles.footerBtn}`}
            onClick={onCancel}
            disabled={!dirty}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`ui-btn ui-btn-primary ${styles.footerBtn}`}
            onClick={onSave}
            disabled={!dirty}
          >
            Save
          </button>
        </div>
      </div>

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}

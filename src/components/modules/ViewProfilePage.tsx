'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGroup, motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Cake,
  KeyRound,
  Pencil,
  Send,
  UserRound,
  VenusAndMars,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { getSession } from '@/lib/auth';
import { rooms } from '@/lib/moduleData';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { FieldTimePicker } from '@/components/modules/view-profile/FieldTimePicker';
import { PersonalFilesPanel } from '@/components/modules/view-profile/PersonalFilesPanel';
import { AttendancePanel } from '@/components/modules/view-profile/AttendancePanel';
import { LeavePanel } from '@/components/modules/view-profile/LeavePanel';
import { StaffFormsPanel } from '@/components/modules/view-profile/StaffFormsPanel';
import { NotesPanel } from '@/components/modules/view-profile/NotesPanel';
import '@/components/ui/module.css';
import './view-profile.css';

type StaffProfile = {
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
  gender: string;
  dateOfBirth: string;
  employeeCode: string;
  kioskCode: string;
  email: string;
  contact: string;
  address: string;
  joiningDate: string;
  room: string[];
  groups: string[];
  shiftStart: string;
  shiftEnd: string;
  avatarUrl: string;
};

const ROOM_OPTIONS = rooms.map((r) => r.name);

const GROUP_OPTIONS = [
  'Infant Care',
  'Toddlers',
  'Pre-K',
  'After School',
  'Administration',
  'Support Staff',
];

const ROLE_OPTIONS = [
  'Super Admin',
  'Administrator',
  'Principal',
  'Lead Teacher',
  'Teacher',
  'Assistant',
  'Admin',
];

const TABS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'personal-files', label: 'Personal Files' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'forms', label: 'Forms' },
  { id: 'notes', label: 'Notes' },
];

type FieldKind = 'text' | 'date' | 'time' | 'select-room' | 'select-group' | 'select-role';

const PROFILE_FIELDS: { key: keyof StaffProfile; label: string; kind: FieldKind }[] = [
  { key: 'name', label: 'Name', kind: 'text' },
  { key: 'role', label: 'Role', kind: 'select-role' },
  { key: 'gender', label: 'Gender', kind: 'text' },
  { key: 'dateOfBirth', label: 'Date of Birth', kind: 'date' },
  { key: 'employeeCode', label: 'Employee Code', kind: 'text' },
  { key: 'kioskCode', label: 'Kiosk Code', kind: 'text' },
  { key: 'email', label: 'Email', kind: 'text' },
  { key: 'contact', label: 'Contact', kind: 'text' },
  { key: 'address', label: 'Address', kind: 'text' },
  { key: 'joiningDate', label: 'Joining Date', kind: 'date' },
  { key: 'room', label: 'Room', kind: 'select-room' },
  { key: 'groups', label: 'Groups', kind: 'select-group' },
  { key: 'shiftStart', label: 'Shift Start Time', kind: 'time' },
  { key: 'shiftEnd', label: 'Shift End Time', kind: 'time' },
];

const DEFAULT_PROFILE: StaffProfile = {
  name: 'Darshan',
  role: 'Super Admin',
  status: 'Active',
  gender: 'Male',
  dateOfBirth: '',
  employeeCode: 'EMP-2',
  kioskCode: '8343',
  email: 'admin@panacea.care',
  contact: '+91 63006 62566',
  address: 'MANCHADAVALASA',
  joiningDate: '29-07-2026',
  room: ['Sunshine Room'],
  groups: ['Administration'],
  shiftStart: '09:00',
  shiftEnd: '17:00',
  avatarUrl: '',
};

/** Normalize common date inputs to DD-MM-YYYY */
function toDisplayDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return `${iso[3]}-${iso[2]}-${iso[1]}`;
  }
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}-${slash[3]}`;
  }
  const dash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) {
    return `${dash[1].padStart(2, '0')}-${dash[2].padStart(2, '0')}-${dash[3]}`;
  }
  return trimmed;
}

/** Convert DD-MM-YYYY to YYYY-MM-DD for native date inputs */
function toInputDate(value: string) {
  const display = toDisplayDate(value);
  const match = display.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function ViewProfilePage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState<StaffProfile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<StaffProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session?.identifier) return;
    setProfile((prev) => {
      const next = { ...prev };
      if (session.method === 'phone') {
        next.contact = session.identifier;
      } else {
        next.email = session.identifier;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!editing) setDraft(profile);
  }, [profile, editing]);

  const initials = useMemo(() => {
    const parts = profile.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'P';
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }, [profile.name]);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/dashboard');
  };

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
    setSaved(false);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const saveChanges = () => {
    const next = {
      ...draft,
      dateOfBirth: toDisplayDate(draft.dateOfBirth),
      joiningDate: toDisplayDate(draft.joiningDate),
    };
    setProfile(next);
    setDraft(next);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const updateDraft = <K extends keyof StaffProfile>(key: K, value: StaffProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const resetKioskPin = () => {
    const next = String(Math.floor(1000 + Math.random() * 9000));
    setProfile((p) => ({ ...p, kioskCode: next }));
  };

  const sendInvite = () => {
    setInviteSent(true);
  };

  const openPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const onPhotoSelected = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url) return;
      setProfile((p) => ({ ...p, avatarUrl: url }));
      setDraft((d) => ({ ...d, avatarUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const display = editing ? draft : profile;
  const dobDisplay = display.dateOfBirth.trim()
    ? toDisplayDate(display.dateOfBirth)
    : 'Birth date not found';

  const renderFieldControl = (field: (typeof PROFILE_FIELDS)[number]) => {
    const id = `vp-${field.key}`;

    if (field.kind === 'select-room') {
      return (
        <MultiSelectDropdown
          id={id}
          label="Room"
          options={ROOM_OPTIONS}
          value={display.room}
          onChange={(next) => updateDraft('room', next)}
          placeholder="Select rooms"
          disabled={!editing}
        />
      );
    }

    if (field.kind === 'select-group') {
      return (
        <MultiSelectDropdown
          id={id}
          label="Groups"
          options={GROUP_OPTIONS}
          value={display.groups}
          onChange={(next) => updateDraft('groups', next)}
          placeholder="Select groups"
          disabled={!editing}
        />
      );
    }

    if (field.kind === 'select-role') {
      return (
        <MultiSelectDropdown
          id={id}
          label="Role"
          options={ROLE_OPTIONS}
          value={display.role ? [display.role] : []}
          onChange={(next) => updateDraft('role', next[0] ?? '')}
          placeholder="Select role"
          disabled={!editing}
          multiple={false}
        />
      );
    }

    const value = display[field.key] as string;

    if (!editing) {
      const shown =
        field.kind === 'date'
          ? toDisplayDate(value) || (field.key === 'dateOfBirth' ? 'Birth date not found' : '—')
          : value || '—';
      return <input id={id} className="ui-input" value={shown} disabled readOnly />;
    }

    if (field.kind === 'date') {
      return (
        <FieldDatePicker
          value={toInputDate(value)}
          onChange={(next) => updateDraft(field.key, toDisplayDate(next))}
          ariaLabel={field.label}
          placeholder="dd-mm-yyyy"
        />
      );
    }

    if (field.kind === 'time') {
      return (
        <FieldTimePicker
          id={id}
          value={value}
          onChange={(next) => updateDraft(field.key, next)}
          ariaLabel={field.label}
        />
      );
    }

    return (
      <input
        id={id}
        className="ui-input"
        value={value}
        onChange={(e) => updateDraft(field.key, e.target.value)}
      />
    );
  };

  const statusClass =
    profile.status.toLowerCase() === 'active' ? 'vp-status is-active' : 'vp-status is-inactive';

  return (
    <div className="mod-page vp-page">
      <div className="vp-titleRow">
        <button type="button" className="vp-backBtn" onClick={goBack} aria-label="Go back">
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 className="vp-pageTitle">View Profile</h1>
      </div>

      <div className="vp-tabsRow">
        <LayoutGroup id="vp-profile-tabs">
          <div className="vp-tabs" role="tablist" aria-label="Profile sections">
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`vp-tab${active ? ' is-active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {active ? (
                    <motion.span
                      className="vp-tabPill"
                      layoutId="vp-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                    />
                  ) : null}
                  <span className="vp-tabLabel">{item.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {tab === 'profile' ? (
          <button
            type="button"
            className="ui-btn ui-btn-primary vp-inviteBtn"
            onClick={() => {
              setInviteSent(false);
              setInviteOpen(true);
            }}
          >
            <Send size={16} strokeWidth={2.2} aria-hidden />
            Send Invite
          </button>
        ) : null}
      </div>

      {tab === 'profile' ? (
        <>
          <section className="vp-card vp-summaryCard">
            <div className="vp-heroRow">
              <div className="vp-avatarWrap">
                <div
                  className={`vp-avatar ${profile.avatarUrl ? 'has-photo' : ''}`}
                  aria-label={`${profile.name} profile photo`}
                  style={
                    profile.avatarUrl
                      ? { backgroundImage: `url(${profile.avatarUrl})` }
                      : undefined
                  }
                >
                  {profile.avatarUrl ? null : initials}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="vp-photoInput"
                  onChange={(e) => {
                    onPhotoSelected(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="vp-avatarBtn"
                  aria-label="Upload profile photo"
                  title="Upload profile photo"
                  onClick={openPhotoPicker}
                >
                  <Pencil size={13} strokeWidth={2.2} />
                </button>
              </div>

              <div className="vp-heroIdentity">
                <h2 className="vp-heroName">{profile.name || 'Staff member'}</h2>
                <p className="vp-heroRole">{profile.role || '—'}</p>
                <span className={statusClass}>{profile.status}</span>
              </div>

              <div className="vp-infoStrip">
                <article className="mod-stat">
                  <div className="mod-statIcon lavender" aria-hidden>
                    <VenusAndMars size={20} />
                  </div>
                  <div>
                    <p>Gender</p>
                    <strong>{profile.gender || '—'}</strong>
                  </div>
                </article>

                <article className="mod-stat">
                  <div className="mod-statIcon beige" aria-hidden>
                    <Cake size={20} />
                  </div>
                  <div>
                    <p>Date Of Birth</p>
                    <strong className="vp-statValueSm">{dobDisplay}</strong>
                  </div>
                </article>

                <article className="mod-stat">
                  <div className="mod-statIcon mint" aria-hidden>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p>Employee Code</p>
                    <strong>{profile.employeeCode || '—'}</strong>
                  </div>
                </article>

                <article className="mod-stat">
                  <div className="mod-statIcon blush" aria-hidden>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <p>Kiosk Code</p>
                    <strong>{profile.kioskCode || '—'}</strong>
                    <button type="button" className="vp-linkBtn" onClick={resetKioskPin}>
                      Reset Kiosk PIN
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="vp-detailsCard">
            <form
              className="vp-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (editing) saveChanges();
              }}
            >
              <div className="vp-detailsHead">
                <div className="vp-detailsTitle">
                  <span className="ui-modal-icon" aria-hidden>
                    <UserRound size={18} />
                  </span>
                  <h2>Staff details</h2>
                </div>
                {!editing ? (
                  <button type="button" className="ui-btn ui-btn-primary" onClick={startEdit}>
                    <Pencil size={15} strokeWidth={2.2} aria-hidden />
                    Edit
                  </button>
                ) : null}
              </div>

              <div className="vp-detailsBody">
                <div className="ui-grid-2">
                  {PROFILE_FIELDS.map((field) => (
                    <div className="ui-field" key={field.key}>
                      <label className="ui-label" htmlFor={`vp-${field.key}`}>
                        {field.label}
                      </label>
                      {renderFieldControl(field)}
                    </div>
                  ))}
                </div>
              </div>

              {editing || saved ? (
                <div className="vp-detailsFooter">
                  {editing ? (
                    <>
                      <button type="button" className="ui-btn ui-btn-outline" onClick={cancelEdit}>
                        Cancel
                      </button>
                      <button type="submit" className="ui-btn ui-btn-primary">
                        Save
                      </button>
                    </>
                  ) : null}
                  {saved ? <span className="vp-saved">Profile updated</span> : null}
                </div>
              ) : null}
            </form>
          </section>
        </>
      ) : tab === 'personal-files' ? (
        <PersonalFilesPanel ownerName={profile.name} storageKey={profile.employeeCode || profile.name} />
      ) : tab === 'attendance' ? (
        <AttendancePanel />
      ) : tab === 'leave' ? (
        <LeavePanel ownerName={profile.name} storageKey={profile.employeeCode || profile.name} />
      ) : tab === 'forms' ? (
        <StaffFormsPanel ownerName={profile.name} storageKey={profile.employeeCode || profile.name} />
      ) : tab === 'notes' ? (
        <NotesPanel ownerName={profile.name} storageKey={profile.employeeCode || profile.name} />
      ) : (
        <section className="mod-panel vp-placeholder">
          <EmptyState
            title={`${TABS.find((t) => t.id === tab)?.label ?? 'Section'} coming soon`}
            description="This section will show related staff records once connected to staff creation data."
          />
        </section>
      )}

      <Modal
        open={inviteOpen}
        title={inviteSent ? 'Invite sent' : 'Send invite'}
        onClose={() => setInviteOpen(false)}
        footer={
          inviteSent ? (
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => setInviteOpen(false)}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={sendInvite}>
                Send invite
              </button>
            </>
          )
        }
      >
        {inviteSent ? (
          <p>
            An invite has been sent to <strong>{profile.email}</strong> to download the Panacea app.
          </p>
        ) : (
          <p>
            Send an invite to <strong>{profile.email}</strong> so they can download the Panacea app and access their
            account.
          </p>
        )}
      </Modal>
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/loading';
import { staff } from '@/lib/moduleData';
import { APP_MODULES } from '@/lib/modules';
import '@/components/ui/module.css';

const sectionLoading = () => <PageLoader context="app" inset />;

const SettingsProgramSection = dynamic(
  () =>
    import('@/components/modules/SettingsProgramSection').then((m) => m.SettingsProgramSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsAccessControlSection = dynamic(
  () =>
    import('@/components/modules/SettingsAccessControlSection').then(
      (m) => m.SettingsAccessControlSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsActivityPostSection = dynamic(
  () =>
    import('@/components/modules/SettingsActivityPostSection').then(
      (m) => m.SettingsActivityPostSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsAttendanceSection = dynamic(
  () =>
    import('@/components/modules/SettingsAttendanceSection').then(
      (m) => m.SettingsAttendanceSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsBillingSection = dynamic(
  () =>
    import('@/components/modules/SettingsBillingSection').then((m) => m.SettingsBillingSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsBusTrackingSection = dynamic(
  () =>
    import('@/components/modules/SettingsBusTrackingSection').then(
      (m) => m.SettingsBusTrackingSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsCCTVSection = dynamic(
  () => import('@/components/modules/SettingsCCTVSection').then((m) => m.SettingsCCTVSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsFormsSection = dynamic(
  () => import('@/components/modules/SettingsFormsSection').then((m) => m.SettingsFormsSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsLessonSection = dynamic(
  () => import('@/components/modules/SettingsLessonSection').then((m) => m.SettingsLessonSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsRolesSection = dynamic(
  () => import('@/components/modules/SettingsRolesSection').then((m) => m.SettingsRolesSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsSchoolDetailsSection = dynamic(
  () =>
    import('@/components/modules/SettingsSchoolDetailsSection').then(
      (m) => m.SettingsSchoolDetailsSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsStaffLeaveSection = dynamic(
  () =>
    import('@/components/modules/SettingsStaffLeaveSection').then(
      (m) => m.SettingsStaffLeaveSection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsVaccineLibrarySection = dynamic(
  () =>
    import('@/components/modules/SettingsVaccineLibrarySection').then(
      (m) => m.SettingsVaccineLibrarySection,
    ),
  { ssr: false, loading: sectionLoading },
);
const SettingsOtherSection = dynamic(
  () => import('@/components/modules/SettingsOtherSection').then((m) => m.SettingsOtherSection),
  { ssr: false, loading: sectionLoading },
);
const SettingsEmailTemplatesSection = dynamic(
  () =>
    import('@/components/modules/SettingsEmailTemplatesSection').then(
      (m) => m.SettingsEmailTemplatesSection,
    ),
  { ssr: false, loading: sectionLoading },
);

const SETTINGS_CHILDREN = APP_MODULES.find((m) => m.id === 'settings')?.children ?? [];

function sectionIdFromHref(href: string): string {
  const q = href.split('?')[1] ?? '';
  return new URLSearchParams(q).get('section') ?? 'programs';
}

const DEFAULT_SECTION = SETTINGS_CHILDREN[0]
  ? sectionIdFromHref(SETTINGS_CHILDREN[0].href)
  : 'programs';

function sectionFromParam(raw: string | null): string {
  if (!raw) return DEFAULT_SECTION;
  const match = SETTINGS_CHILDREN.find((c) => sectionIdFromHref(c.href) === raw);
  return match ? raw : DEFAULT_SECTION;
}

function labelForSection(section: string): string {
  const match = SETTINGS_CHILDREN.find((c) => sectionIdFromHref(c.href) === section);
  return match?.label ?? 'Settings';
}

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section = sectionFromParam(searchParams.get('section'));
  const sectionLabel = labelForSection(section);

  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState(staff);
  const [modal, setModal] = useState(false);
  const [toggles, setToggles] = useState({
    email: true,
    push: true,
    weekly: false,
    autopay: false,
    twoFactor: true,
  });
  const [form, setForm] = useState({ name: '', email: '', role: 'Teacher' });

  useEffect(() => {
    if (!searchParams.get('section') && SETTINGS_CHILDREN[0]) {
      router.replace(SETTINGS_CHILDREN[0].href);
    }
  }, [router, searchParams]);

  const toggle = (key: keyof typeof toggles) => setToggles((p) => ({ ...p, [key]: !p[key] }));
  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };
  const addUser = () => {
    if (!form.name || !form.email) return;
    setUsers((p) => [
      {
        id: `s${Date.now()}`,
        name: form.name,
        role: form.role,
        email: form.email,
        phone: '—',
        status: 'Active',
      },
      ...p,
    ]);
    setModal(false);
  };

  const Switch = ({ id }: { id: keyof typeof toggles }) => (
    <button
      type="button"
      aria-pressed={toggles[id]}
      className={`mod-switch ${toggles[id] ? 'is-on' : ''}`}
      onClick={() => toggle(id)}
    />
  );

  const navItems = useMemo(
    () =>
      SETTINGS_CHILDREN.map((c) => ({
        id: sectionIdFromHref(c.href),
        label: c.label,
        href: c.href,
      })),
    [],
  );

  const isPrograms = section === 'programs';
  const isAccessControl = section === 'access-control';
  const isActivityPosts = section === 'activity-posts';
  const isAttendance = section === 'attendance';
  const isRoles = section === 'roles';
  const isEmailTemplates = section === 'email-templates';
  const isBilling = section === 'billing';
  const isBusTracking = section === 'bus-tracking';
  const isCctv = section === 'cctv';
  const isForms = section === 'forms';
  const isLesson = section === 'lesson';
  const isSchoolDetails = section === 'school-details';
  const isStaffLeave = section === 'staff-leave-management';
  const isVaccineLibrary = section === 'vaccine-library';
  const isOtherSettings = section === 'other-settings';
  const isSecurity = false;
  const isGeneral = false;

  if (isPrograms) {
    return (
      <div className="mod-page">
        <SettingsProgramSection />
      </div>
    );
  }

  if (isAccessControl) {
    return (
      <div className="mod-page">
        <SettingsAccessControlSection />
      </div>
    );
  }

  if (isActivityPosts) {
    return <SettingsActivityPostSection />;
  }

  if (isAttendance) {
    return (
      <div className="mod-page">
        <SettingsAttendanceSection />
      </div>
    );
  }

  if (isBilling) {
    return <SettingsBillingSection />;
  }

  if (isBusTracking) {
    return (
      <div className="mod-page">
        <SettingsBusTrackingSection />
      </div>
    );
  }

  if (isCctv) {
    return (
      <div className="mod-page">
        <SettingsCCTVSection />
      </div>
    );
  }

  if (isForms) {
    return (
      <div className="mod-page">
        <SettingsFormsSection />
      </div>
    );
  }

  if (isLesson) {
    return (
      <div className="mod-page">
        <SettingsLessonSection />
      </div>
    );
  }

  if (isRoles) {
    return (
      <div className="mod-page">
        <SettingsRolesSection />
      </div>
    );
  }

  if (isSchoolDetails) {
    return (
      <div className="mod-page">
        <SettingsSchoolDetailsSection />
      </div>
    );
  }

  if (isStaffLeave) {
    return (
      <div className="mod-page">
        <SettingsStaffLeaveSection />
      </div>
    );
  }

  if (isVaccineLibrary) {
    return (
      <div className="mod-page">
        <SettingsVaccineLibrarySection />
      </div>
    );
  }

  if (isEmailTemplates) {
    return (
      <div className="mod-page">
        <SettingsEmailTemplatesSection />
      </div>
    );
  }

  if (isOtherSettings) {
    return (
      <div className="mod-page">
        <SettingsOtherSection />
      </div>
    );
  }

  return (
    <div className="mod-page">
      <PageHeader
        title="Settings"
        description="Manage center preferences, team access, communications, and account safeguards."
        crumbs={['Panacea', 'Settings', sectionLabel]}
        actions={
          <button className="ui-btn ui-btn-primary" onClick={save}>
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
        }
      />
      <StatCards
        stats={[
          { label: 'Active users', value: users.length, icon: '👥', tone: 'lavender' },
          { label: 'Roles', value: new Set(users.map((x) => x.role)).size, icon: '🔑', tone: 'mint' },
          {
            label: 'Notifications on',
            value: Object.values(toggles).filter(Boolean).length,
            icon: '🔔',
            tone: 'beige',
          },
          { label: 'Security', value: 'Strong', icon: '🛡', tone: 'blush' },
        ]}
      />
      <div className="mod-settings-layout">
        <nav className="mod-settings-nav" aria-label="Settings sections">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? 'is-active' : ''}
              onClick={() => {
                router.push(item.href);
                setSaved(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="mod-form-card">
            <h2>{sectionLabel}</h2>
            <p>Update the {sectionLabel.toLowerCase()} preferences for your childcare center.</p>
            {isGeneral ? (
              <>
                <div className="ui-field">
                  <label className="ui-label">Center name</label>
                  <input className="ui-input" defaultValue="Panacea Childcare Center" />
                </div>
                <div className="mod-grid-2">
                  <div className="ui-field">
                    <label className="ui-label">Time zone</label>
                    <select className="ui-input">
                      <option>Asia/Kolkata (IST)</option>
                    </select>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Contact phone</label>
                    <input className="ui-input" defaultValue="+91 98765 43210" />
                  </div>
                </div>
              </>
            ) : null}
            {false ? (
              <>
                <div className="mod-toggle-row">
                  <div>
                    <strong>Email notifications</strong>
                    <p>Center updates and alerts by email.</p>
                  </div>
                  <Switch id="email" />
                </div>
                <div className="mod-toggle-row">
                  <div>
                    <strong>Push notifications</strong>
                    <p>Timely updates on connected devices.</p>
                  </div>
                  <Switch id="push" />
                </div>
                <div className="mod-toggle-row">
                  <div>
                    <strong>Weekly digest</strong>
                    <p>A Monday summary for administrators.</p>
                  </div>
                  <Switch id="weekly" />
                </div>
              </>
            ) : null}
            {isBilling ? (
              <>
                <div className="ui-field">
                  <label className="ui-label">Invoice prefix</label>
                  <input className="ui-input" defaultValue="PAN-" />
                </div>
                <div className="mod-toggle-row">
                  <div>
                    <strong>Automatic payment reminders</strong>
                    <p>Notify families three days before due dates.</p>
                  </div>
                  <Switch id="autopay" />
                </div>
              </>
            ) : null}
            {isSecurity ? (
              <>
                <div className="mod-toggle-row">
                  <div>
                    <strong>Two-factor authentication</strong>
                    <p>Require an extra verification step for administrators.</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
                <div className="ui-field" style={{ marginTop: 16 }}>
                  <label className="ui-label">Session timeout</label>
                  <select className="ui-input">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </>
            ) : null}
            <button className="ui-btn ui-btn-primary" style={{ marginTop: 20 }} onClick={save}>
              {saved ? '✓ Saved' : 'Save changes'}
            </button>
          </section>
      </div>
      <Modal
        open={modal}
        title="Add user"
        onClose={() => setModal(false)}
        footer={
          <>
            <button className="ui-btn ui-btn-outline" onClick={() => setModal(false)}>
              Cancel
            </button>
            <button className="ui-btn ui-btn-primary" onClick={addUser}>
              Add user
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Full name</label>
          <input
            className="ui-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Email</label>
          <input
            className="ui-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Role</label>
          <select
            className="ui-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option>Teacher</option>
            <option>Admin</option>
            <option>Assistant</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}

export function SettingsPage() {
  return (
    <Suspense fallback={<PageLoader context="default" title="Loading settings…" />}>
      <SettingsPageInner />
    </Suspense>
  );
}
